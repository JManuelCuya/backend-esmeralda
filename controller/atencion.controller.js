const {
  guardarAtencion,
  listarAtenciones,
  listarAtencionesPorEmpleado,
  obtenerDetalleAtencion,
  actualizarEstado,
  obtenerAtencionPorId,
  guardarNotificacion,
  obtenerNombreEstado,
  listarNotificacionesPorEmpleado,
  listarAtencionesFinalizadas,
  atencionesPorArea,
  listarAreas,
  marcarNotificacionesComoLeidas,
} = require("../services/atencion.service");

const {
  registrarPrediccion,
  aplicarAjuste,
} = require("../services/costeo.service");
const pool = require("../config/db");

const registrarAtencion = async (req, res) => {
  let cn;
  try {
    cn = await pool.getConnection();
    await cn.beginTransaction();

    const {
      centro_costos_id,
      tipo_atencion_id,
      fecha_atencion,
      fecha_atencion_fin,
      hora_inicio,
      hora_fin,
      motivo,
      observacion,
      costo_estimado, // predicho (puede venir null)
    } = req.body;

    const empleado_id = req.user.empleado_id || null; // dueño de la atención
    const usuario_id = req.user.id || null;          // id de usuarios (si lo tienes)

    // 1) prioridad por centro de costos (simple)
    const [ccRows] = await cn.query(
      "SELECT descripcion FROM centro_costos WHERE id = ?",
      [centro_costos_id]
    );
    const descripcionCentro = (ccRows[0]?.descripcion || "").toLowerCase();
    let id_prioridad = 2; // Media
    if (descripcionCentro.includes("gerencia")) id_prioridad = 1; // Alta

    // 2) estados
    const estadoAtencion = "creado";
    const estadoCodigo = 1;

    // 3) insertar atención
    const [insAt] = await cn.query(
      `INSERT INTO atencion
         (id_tipo_atencion, id_empleado, id_centro_costos,
          fecha_atencion, fecha_atencion_fin, hora_inicio, hora_fin,
          motivo, observacion, estado, costo_estimado, id_prioridad, id_estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tipo_atencion_id, empleado_id, centro_costos_id,
        fecha_atencion, fecha_atencion_fin, hora_inicio, hora_fin,
        motivo, observacion, estadoAtencion, (costo_estimado ?? null),
        id_prioridad, estadoCodigo
      ]
    );
    const idAtencion = insAt.insertId;

    // 4) historial de costeo: NO insertar columnas generadas (error_abs/error_pct)
    //    y NO usar 'fuente_prediccion' (no existe en tu tabla actual).
    if (costo_estimado != null) {
      await cn.query(
        `INSERT INTO atencion_costeo_hist
           (id_atencion, costo_predicho, costo_real, error_rel, aplicado,
            modelo_id, modelo_version, usuario_id)
         VALUES (?, ?, NULL, NULL, 0, ?, ?, ?)`,
        [
          idAtencion,
          costo_estimado,
          'ml',                                 // modelo_id (ajústalo a tu necesidad)
          process.env.MODEL_VERSION || 'v1',    // modelo_version
          usuario_id
        ]
      );
    }

    await cn.commit();
    res.status(201).json({ message: "Atención registrada correctamente", id: idAtencion });
  } catch (err) {
    if (cn) try { await cn.rollback(); } catch { }
    console.error("Error al registrar atención:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  } finally {
    if (cn) cn.release();
  }
};

const obtenerAtenciones = async (req, res) => {
  try {
    const { rol, empleado_id } = req.user;
    const data = (rol === "Administrador")
      ? await listarAtenciones()
      : await listarAtencionesPorEmpleado(empleado_id);
    res.json(data);
  } catch (err) {
    console.error("Error al listar atenciones:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const obtenerAtencionesFinalizadas = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 50);
    const data = await listarAtencionesFinalizadas({ page, limit });
    res.json(data);
  } catch (err) {
    console.error("Error al listar atenciones finalizadas:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const renderDetalleAtencion = async (req, res) => {
  try {
    const { id } = req.query;
    const detalle = await obtenerDetalleAtencion(id);
    if (!detalle) return res.status(404).json({ mensaje: "Atención no encontrada" });
    res.json(detalle);
  } catch (error) {
    console.error("Error al obtener detalle de atención:", error);
    res.status(500).json({ mensaje: "Error al procesar la solicitud" });
  }
};

const actualizarEstadoAtencion = async (req, res) => {
  const { id } = req.params;
  const { id_estado } = req.body;

  try {
    await actualizarEstado(id_estado, id);
    const atencion = await obtenerAtencionPorId(id);

    const mensaje = `Tu atención #${id} ha sido actualizada a "${atencion.descripcion}"`;
    await guardarNotificacion(atencion.id_empleado, mensaje);

    const io = req.app.get("io");
    io.emit("estadoActualizado", {
      id_atencion: parseInt(id, 10),
      nuevo_estado: id_estado,
      id_estado,
      id_empleado: atencion.id_empleado,
      estado: await obtenerNombreEstado(id_estado)
    });

    res.json({ message: "Estado actualizado correctamente" });
  } catch (err) {
    console.error("Error en actualizarEstadoAtencion:", err);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
};

const obtenerNotificaciones = async (req, res) => {
  const id_empleado = req.user.empleado_id;
  if (!id_empleado) return res.status(400).json({ error: "Empleado no identificado" });

  try {
    const notificaciones = await listarNotificacionesPorEmpleado(id_empleado);
    res.json(notificaciones);
  } catch (error) {
    console.error("❌ Error al obtener notificaciones:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

const marcarNotificacionesLeidas = async (req, res) => {
  const id_empleado = req.user.empleado_id;
  try {
    await marcarNotificacionesComoLeidas(id_empleado);
    res.json({ ok: true });
  } catch (error) {
    console.error("❌ Error al marcar notificaciones:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

const getAtencionesPorArea = async (req, res) => {
  try {
    const data = await atencionesPorArea(req.query);
    res.json(data);
  } catch (err) {
    console.error("getAtencionesPorArea error:", err);
    res.status(400).json({ message: err.message || "Error en métrica" });
  }
};

const getAreas = async (req, res) => {
  try {
    const rows = await listarAreas();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error listando áreas" });
  }
};

// ——— endpoints opcionales (si usas la tabla de costeo) ———
async function postCostoReal(req, res) {
  try {
    const id_atencion = Number(req.params.id);
    const { costo_real } = req.body;
    const usuario_id = req.user?.empleado_id || null;

    const result = await registrarCostoReal({
      id_atencion,
      costo_real: Number(costo_real),
      usuario_id
    });

    res.json({ ok: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

async function postAplicarAjuste(req, res) {
  try {
    const id_hist = Number(req.params.id_hist);
    const r = await aplicarAjuste({ id_hist });
    res.json({ ok: true, ...r });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

module.exports = {
  registrarAtencion,
  obtenerAtenciones,
  renderDetalleAtencion,
  actualizarEstadoAtencion,
  obtenerNotificaciones,
  marcarNotificacionesLeidas,
  obtenerAtencionesFinalizadas,
  getAtencionesPorArea,
  getAreas,
  postCostoReal,
  postAplicarAjuste,
};
