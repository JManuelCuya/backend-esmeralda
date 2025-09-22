const { guardarAtencion,
  listarAtenciones,
  listarAtencionesPorEmpleado,
  obtenerDetalleAtencion,
  actualizarEstado,
  obtenerAtencionPorId,
  guardarNotificacion,
  obtenerNombreEstado,
  listarNotificacionesPorEmpleado,
  listarAtencionesFinalizadas,
  marcarNotificacionesComoLeidas} = require("../services/atencion.service");
const pool = require("../config/db");

const registrarAtencion = async (req, res) => {
  try {
    const { centro_costos_id, tipo_atencion_id, fecha_atencion, fecha_atencion_fin, hora_inicio, hora_fin, motivo, observacion, costo_estimado } = req.body;
    const empleado_id = req.user.empleado_id;

        // Obtener el nombre del centro de costos
    const [rows] = await pool.query(
      "SELECT descripcion FROM centro_costos WHERE id = ?",
      [centro_costos_id]
    );

    const descripcionCentro = rows[0]?.descripcion?.toLowerCase() || "";

    // Determinar la prioridad (1: Alta, 2: Media, 3: Baja)
    let id_prioridad = 2; // Media por defecto
    if (descripcionCentro.includes("gerencia")) {
      id_prioridad = 1; // Alta
    }
    let estadoAtencion = "creado";
    let estadoCodigo = 1;
    // Llamamos a la función guardarAtencion y guardamos el ID de la atención
    const idAtencion = await guardarAtencion({
      centro_costos_id,
      tipo_atencion_id,
      fecha_atencion,
      fecha_atencion_fin,
      hora_inicio,
      hora_fin,
      motivo,
      observacion,
      costo_estimado,
      empleado_id,
      estado:estadoAtencion,
      id_prioridad,
      id_estado:estadoCodigo
    });

    // Enviamos el ID generado al frontend
    res.status(201).json({ message: "Atención registrada correctamente", id: idAtencion });

  } catch (err) {
    console.error("Error al registrar atención:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const obtenerAtenciones = async (req, res) => {
  try {
    const { rol, empleado_id } = req.user;

    const data = rol === "Administrador"
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
    const page  = Number(req.query.page  || 1);
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

    if (!detalle) {
      return res.status(404).json({ mensaje: "Atención no encontrada" });
    }

    res.json(detalle);
  } catch (error) {
    console.error("Error al obtener detalle de atención:", error);
    res.status(500).json({ mensaje: "Error al procesar la solicitud" });
  }
};

const actualizarEstadoAtencion = async (req, res) => {
  const { id } = req.params;
  const { id_estado } = req.body;
  const { id_atencion } = req.body;

  console.log("mis id son ",id,id_estado,id_atencion)

  try {
    await actualizarEstado(id_estado,id);

    // Aquí debes obtener los datos de la atención
    const atencion = await obtenerAtencionPorId(id); // 👈 Esta línea nueva

    console.log("mi atencion es" ,atencion)

    const mensaje = `Tu atención #${id} ha sido actualizada a "${atencion.descripcion}"`;

    await guardarNotificacion(atencion.id_empleado, mensaje);


     const io = req.app.get("io");


    console.log("atencion obtenida",atencion);

    io.emit("estadoActualizado", {
      id_atencion: parseInt(id),
      nuevo_estado: id_estado,
      id_estado,
      id_empleado: atencion.id_empleado, // 👈 importante para filtrar en frontend
      estado: await obtenerNombreEstado(id_estado) // opcional para mostrar nombre
    });

    res.json({ message: "Estado actualizado correctamente" });
  } catch (err) {
    console.error("Error en actualizarEstadoAtencion:", err);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
};

const obtenerNotificaciones = async (req, res) => {
  const id_empleado = req.user.empleado_id
  console.log("🔔 Obteniendo notificaciones para empleado ID:", id_empleado);

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
  const id_empleado = req.user.empleado_id
  try {
    await marcarNotificacionesComoLeidas(id_empleado);
    res.json({ ok: true });
  } catch (error) {
    console.error("❌ Error al marcar notificaciones:", error);
    res.status(500).json({ error: "Error interno" });
  }
};



module.exports = { 
  registrarAtencion,
  obtenerAtenciones,
  renderDetalleAtencion,
  actualizarEstadoAtencion,
  obtenerNotificaciones,
  marcarNotificacionesLeidas,
  obtenerAtencionesFinalizadas
};
