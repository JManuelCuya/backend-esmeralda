const pool = require("../config/db");
const { predecirCosto, calcTiempoMinutos } = require("../services/costos_ml.service");

const guardarAtencion = async ({ empleado_id, tipo_atencion_id, centro_costos_id, fecha_atencion, fecha_atencion_fin, hora_inicio, hora_fin, motivo, observacion, estado, costo_estimado, id_prioridad, id_estado }) => {
  // Realizar la inserción
  const result = await pool.query(
    `INSERT INTO atencion (id_tipo_atencion, id_empleado, id_centro_costos, fecha_atencion, fecha_atencion_fin, hora_inicio, hora_fin, motivo, observacion, estado,costo_estimado,id_prioridad,id_estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)`,
    [tipo_atencion_id, empleado_id, centro_costos_id, fecha_atencion, fecha_atencion_fin, hora_inicio, hora_fin, motivo, observacion, estado, costo_estimado, id_prioridad, id_estado]
  );

  // Obtener el id autoincrementado generado
  const [rows] = await pool.query("SELECT LAST_INSERT_ID() AS id");
  console.log(rows)
  return rows[0].id;  // Devuelve el id autogenerado
};


async function crearAtencionConDetalle({ payload, user }) {
  const cn = await pool.getConnection();
  try {
    await cn.beginTransaction();

    const {
      tipo_atencion_id,
      centro_costos_id,
      motivo,
      observacion,
      fecha_atencion,
      hora_inicio,
      fecha_atencion_fin = null,
      hora_fin = null,
      costo_estimado = null,
      detalles = [],
    } = payload;

    const empleado_id = user?.empleado_id || null;

    // prioridad simple por centro de costos (ajústalo si quieres)
    const [ccRows] = await cn.query("SELECT descripcion FROM centro_costos WHERE id = ?", [centro_costos_id]);
    const descCC = (ccRows?.[0]?.descripcion || "").toLowerCase();
    let id_prioridad = 2; // Media
    if (descCC.includes("gerencia")) id_prioridad = 1; // Alta

    const estado = "creado";
    const id_estado = 1;

    // 1) Insert atencion (cabecera)
    const [ins] = await cn.query(
      `INSERT INTO atencion(
         id_tipo_atencion, id_empleado, id_centro_costos,
         fecha_atencion, fecha_atencion_fin, hora_inicio, hora_fin,
         motivo, observacion, estado, costo_estimado, id_prioridad, id_estado
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tipo_atencion_id, empleado_id, centro_costos_id,
        fecha_atencion, fecha_atencion_fin, hora_inicio, hora_fin,
        motivo, observacion, estado, costo_estimado, id_prioridad, id_estado
      ]
    );
    const idAtencion = ins.insertId;

    // 2) Insert detalle (si llegó)
    if (Array.isArray(detalles) && detalles.length) {
      const values = detalles.map(d => [
        idAtencion,
        Number(d.id_stock),
        Number(d.cantidad),
        Number(d.precio_unitario),
        Number(d.cantidad) * Number(d.precio_unitario)
      ]);

      await cn.query(
        `INSERT INTO atencion_detalle
         (id_atencion, id_stock, cantidad, precio_unitario, total_linea)
         VALUES ?`,
        [values]
      );
      // (Opcional) actualiza stock aquí si lo deseas.
    }

    await cn.commit();
    return { id: idAtencion };
  } catch (err) {
    try { await cn.rollback(); } catch {}
    throw err;
  } finally {
    cn.release();
  }
}

const listarAtenciones = async () => {
  const [rows] = await pool.query(`
    SELECT a.id, 
           e.nombre AS empleado, 
           cc.descripcion AS centro_costo,
           ta.descripcion AS tipo_atencion,
           p.descripcion AS prioridad,
           a.motivo, 
           a.observacion,
           a.fecha_atencion,
           a.fecha_atencion_fin,
           a.hora_inicio,
           a.hora_fin,
           a.costo_estimado,
           a.fecha_ultima_actualizacion,
           ae.descripcion
    FROM atencion a
    JOIN empleado e ON e.id = a.id_empleado
    JOIN centro_costos cc ON cc.id = a.id_centro_costos
    JOIN tipo_atencion ta ON ta.id = a.id_tipo_atencion
    JOIN estado_atencion ae ON ae.id = a.id_estado
    JOIN prioridad p ON p.id = a.id_prioridad
    ORDER BY 
      CASE 
        WHEN p.descripcion = 'Alta' THEN 1
        WHEN p.descripcion = 'Media' THEN 2
        WHEN p.descripcion = 'Baja' THEN 3
        ELSE 4
      END,
      a.id DESC
  `);
  return rows;
};
const listarAtencionesPorEmpleado = async (empleado_id) => {
  const [rows] = await pool.query(`
    SELECT a.id, 
           e.nombre AS empleado, 
           cc.descripcion AS centro_costo,
           ta.descripcion AS tipo_atencion,
           p.descripcion AS prioridad,
           a.motivo, 
            a.observacion,
            a.fecha_atencion,
            a.fecha_atencion_fin,
            a.hora_inicio,
            a.hora_fin,
            a.costo_estimado,
            a.fecha_ultima_actualizacion,
            ae.descripcion
    FROM atencion a
    JOIN empleado e ON e.id = a.id_empleado
    JOIN centro_costos cc ON cc.id = a.id_centro_costos
    JOIN tipo_atencion ta ON ta.id = a.id_tipo_atencion
    JOIN estado_atencion ae ON ae.id = a.id_estado
    JOIN prioridad p ON p.id = a.id_prioridad
    WHERE a.id_empleado = ?
    ORDER BY a.id DESC
  `, [empleado_id]);
  return rows;
};
const listarAtencionesFinalizadas = async ({ page = 1, limit = 50 } = {}) => {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(`
    SELECT 
      a.id, 
      e.nombre AS empleado, 
      cc.descripcion AS centro_costo,
      ta.descripcion AS tipo_atencion,
      p.descripcion AS prioridad,
      a.motivo, 
      a.observacion,
      a.fecha_atencion,
      a.fecha_atencion_fin,
      a.hora_inicio,
      a.hora_fin,
      a.costo_estimado,
      a.fecha_ultima_actualizacion
    FROM atencion a
    JOIN empleado      e  ON e.id  = a.id_empleado
    JOIN centro_costos cc ON cc.id = a.id_centro_costos
    JOIN tipo_atencion ta ON ta.id = a.id_tipo_atencion
    JOIN prioridad     p  ON p.id  = a.id_prioridad
    WHERE a.id_estado = 4
    ORDER BY 
      CASE 
        WHEN p.descripcion = 'Alta'  THEN 1
        WHEN p.descripcion = 'Media' THEN 2
        WHEN p.descripcion = 'Baja'  THEN 3
        ELSE 4
      END,
      a.id DESC
    LIMIT ? OFFSET ?;
  `, [limit, offset]);

  return rows;
};
const obtenerDetalleAtencion = async (id) => {
  console.log("obtengo detalle", id)
  const [resultSets] = await pool.query("CALL sp_detalle_atencion(?)", [id]);
  console.log("registro encontrado", resultSets);
  return resultSets[0][0]; // primer resultado del primer recordset
};
const actualizarEstado = async (id, id_estado) => {
  const [result] = await pool.query(
    `UPDATE atencion 
     SET id_estado = ?, 
         fecha_ultima_actualizacion = NOW() 
     WHERE id = ?`,
    [id, id_estado]
  );
  return result;
};
const obtenerAtencionPorId = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      a.id_empleado, 
      ta.descripcion,
      DATE_FORMAT(a.fecha_ultima_actualizacion, '%d/%m/%Y %H:%i:%s') AS fecha_actualizacion_formateada
    FROM atencion a
    INNER JOIN estado_atencion ta ON ta.id = a.id_tipo_atencion 
    WHERE a.id = ?`, [id]);
  console.log("atencion ultima", rows[0])
  return rows[0];
};
const obtenerNombreEstado = async (id_estado) => {
  const [rows] = await pool.query("SELECT descripcion FROM estado_atencion WHERE id = ?", [id_estado]);
  return rows[0]?.descripcion || "";
};
//notificaciones
const guardarNotificacion = async (usuario_id, mensaje) => {
  const query = "INSERT INTO notificaciones (id_empleado, mensaje) VALUES (?, ?)";
  await pool.query(query, [usuario_id, mensaje]);
};
const listarNotificacionesPorEmpleado = async (id_empleado) => {
  const [rows] = await pool.query(
    "SELECT id, mensaje FROM notificaciones WHERE id_empleado = ? AND leido = 0 ORDER BY fecha_creacion DESC",
    [id_empleado]
  );
  return rows;
};
const marcarNotificacionesComoLeidas = async (id_empleado) => {
  await pool.query(
    "UPDATE notificaciones SET leido = 1 WHERE id_empleado = ?",
    [id_empleado]
  );
};

async function predecirCostoTotal({ seccion, sub_categoria, tipo_solicitud, proceso, minutos }) {
  const payload = {
    seccion: String(seccion ?? ""),
    sub_categoria: String(sub_categoria ?? ""),
    tipo_solicitud: String(tipo_solicitud ?? ""),
    proceso: String(proceso ?? ""),
    tiempo_promedio: Number(minutos),
  };
  const res = await fetch(ML_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data?.detail) && data.detail[0]?.msg ? data.detail[0].msg : JSON.stringify(data);
    throw new Error(`ML ${res.status}: ${msg}`);
  }
  const valor = data.costo_estimado ?? data.costo ?? data.prediccion ?? null;
  const num = Number(valor);
  if (valor == null || Number.isNaN(num)) throw new Error("La respuesta del modelo no es numérica.");
  return num; // TOTAL para esos minutos
}

// ===== MÉTRICAS: Atenciones por área =====
/** rango para un mes 'YYYY-MM' -> [start, end) */
function monthRange(yyyymm) {
  if (!/^\d{4}-\d{2}$/.test(yyyymm)) return null;
  const start = `${yyyymm}-01`;
  const [y, m] = yyyymm.split('-').map(Number);
  const end = new Date(y, m, 1).toISOString().slice(0, 10); // 1° del mes siguiente
  return { start, end };
}

/** últimos N días terminando hoy -> [start, end) */
function lastNDaysRange(days = 30) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - Number(days));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
}

/**
 * Métrica: atenciones por área (cuenta por área)
 * params:
 *  - range: 'mes' | 'ultimos'
 *  - mes: 'YYYY-MM' (si range='mes')
 *  - dias: number (si range='ultimos')
 *  - areaId: number (opcional: filtra una sola área)
 *  - soloFinalizadas: boolean (opcional: id_estado=4)
 *  - usarFechaCierre: boolean (opcional: usa fecha_atencion_fin para el rango)
 */
// ================== MÉTRICA: Atenciones por área ==================
const atencionesPorArea = async (query = {}) => {
  // 1) Normalización de parámetros (acepta ambos nombres)
  const q = query;
  // range: 'mes'|'ultimos' (front) o 'm'|'n' (legacy)
  const rangeIn = String(q.range || q.r || '').toLowerCase();
  const range = (rangeIn === 'ultimos' || rangeIn === 'n') ? 'ultimos' : 'mes';
  // mes / month: 'YYYY-MM'
  const mes = q.mes || q.month || '';
  // dias / days
  const dias = Number(q.dias || q.days || 30);
  // área: area_id (front) o areaId (legacy)
  const areaId = q.area_id || q.areaId || '';
  // solo finalizadas: soloFinalizadas=1 | onlyClosed=1
  const soloFinalizadas = (q.soloFinalizadas === '1') || (q.onlyClosed === '1') ||
    (q.soloFinalizadas === true) || (q.onlyClosed === true);
  // usar fecha de cierre: usarFechaCierre=1 | useClose=1
  const usarFechaCierre = (q.usarFechaCierre === '1') || (q.useClose === '1') ||
    (q.usarFechaCierre === true) || (q.useClose === true);
  // 2) Calcular rango de fechas (YYYY-MM-DD), INCLUYENDO el día final
  let start, end;

  if (range === 'ultimos') {
    const n = Math.max(1, dias || 30);
    const today = new Date();
    const startDate = new Date(today);

    // incluye hoy + (n - 1) días atrás
    startDate.setUTCDate(today.getUTCDate() - (n - 1));
    start = startDate.toISOString().slice(0, 10);
    end = today.toISOString().slice(0, 10);
  } else {
    const mm = mes || new Date().toISOString().slice(0, 7); // por defecto mes actual
    const [y, m] = mm.split('-').map(Number);

    if (!y || !m) throw new Error("Parámetro 'mes' inválido (YYYY-MM)");

    const first = new Date(Date.UTC(y, m - 1, 1));
    const next = new Date(Date.UTC(y, m, 1));
    const last = new Date(next.getTime() - 86400000); // último día del mes
    start = first.toISOString().slice(0, 10);
    end = last.toISOString().slice(0, 10);
  }
  // 3) WHERE dinámico
  const fechaCol = usarFechaCierre ? 'a.fecha_atencion_fin' : 'a.fecha_atencion';
  const where = [`${fechaCol} BETWEEN ? AND ?`];  // inclusivo
  const params = [start, end];

  if (soloFinalizadas) where.push(`a.id_estado = 4`);
  if (areaId) { where.push(`ar.id = ?`); params.push(areaId); }

  // 4) Consulta
  const [rows] = await pool.query(
    `
    SELECT
      ar.id          AS area_id,
      ar.descripcion AS area,
      COUNT(*)       AS total
    FROM atencion a
    JOIN centro_costos cc ON cc.id = a.id_centro_costos
    JOIN area         ar ON ar.id = cc.id_area
    WHERE ${where.join(' AND ')}
    GROUP BY ar.id, ar.descripcion
    ORDER BY total DESC
    `,
    params
  );
  // 5) Respuesta en el formato que usa el front
  return {
    rows,
    start,
    end,
    range,                 // 'mes' | 'ultimos'
    dias: range === 'ultimos' ? dias : undefined
  };
};

// (opcional) para llenar el combo Área
const listarAreas = async () => {
  const [rows] = await pool.query(`SELECT id, descripcion FROM area ORDER BY descripcion`);
  return rows;
};

async function predecirCostoML({ seccion, sub_categoria, tipo_solicitud, proceso, tiempo_promedio }) {
  const payload = {
    seccion: String(seccion ?? ""),
    sub_categoria: String(sub_categoria ?? ""),
    tipo_solicitud: String(tipo_solicitud ?? ""),
    proceso: String(proceso ?? ""),
    tiempo_promedio: Number(tiempo_promedio), // minutos
  };

  const res = await fetch("http://localhost:8000/predecir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    timeout: 8000,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data?.detail) && data.detail[0]?.msg ? data.detail[0].msg : JSON.stringify(data);
    throw new Error(`ML ${res.status}: ${msg}`);
  }
  const valor = data.costo_estimado ?? data.costo ?? data.prediccion;
  const num = Number(valor);
  if (valor == null || Number.isNaN(num)) throw new Error("ML retornó un costo no numérico");
  return num;
}

  function diffMinutes(hIni, hFin) {
    if (!hIni || !hFin) return null;
    const [hi, mi] = hIni.split(":").map(Number);
    const [hf, mf] = hFin.split(":").map(Number);
    if ([hi, mi, hf, mf].some(v => Number.isNaN(v))) return null;
    const start = hi * 60 + mi;
    const end = hf * 60 + mf;
    return end >= start ? end - start : 24 * 60 - start + end;
  }

  function minutosEntre(h1, h2) {
    const [H1, M1] = h1.split(":").map(Number);
    const [H2, M2] = h2.split(":").map(Number);
    return (H2 * 60 + M2) - (H1 * 60 + M1);
  }
// Si tienes tarifa por tipo, usa esto para calcular costo_real; si no, deja null
async function costoRealPorTarifa(cn, { id_tipo_atencion, minutos }) {
  // ejemplo: tarifa por HORA
  const [tRows] = await cn.query(
    "SELECT precio_hora FROM tarifa_tipo_atencion WHERE id_tipo_atencion = ? LIMIT 1",
    [id_tipo_atencion]
  );
  if (!tRows.length) return null;
  const horas = Math.max(minutos / 60, 1); // redondeo/mínimo según política
  return Number((tRows[0].precio_hora * horas).toFixed(2));
}
  async function finalizarAtencion({ id_atencion, fecha_atencion_fin, hora_fin }) {
  const cn = await pool.getConnection();
  try {
    await cn.beginTransaction();

    // 1) Traer atención
    const [aRows] = await cn.query(
      `SELECT a.id, a.id_tipo_atencion, a.id_empleado, a.id_centro_costos,
              a.fecha_atencion, a.hora_inicio, a.motivo, a.observacion, a.costo_estimado
         FROM atencion a
        WHERE a.id = ? FOR UPDATE`,
      [id_atencion]
    );
    if (!aRows.length) throw new Error("Atención no encontrada");
    const at = aRows[0];

    // 2) Duración real
    const minutos = diffMinutes(at.hora_inicio, hora_fin);
    if (minutos == null) throw new Error("No se pudo calcular la duración real");

    // 3) Obtener costo_predicho_unit (si ya existía) o calcularlo
    //    a) intento desde el historial más reciente
    const [hRows] = await cn.query(
      `SELECT costo_predicho_unit
         FROM atencion_costeo_hist
        WHERE id_atencion = ?
        ORDER BY created_at DESC LIMIT 1`,
      [id_atencion]
    );
    let unit = hRows[0]?.costo_predicho_unit ?? null;

    //    b) si no hay 'unit', deduce desde atencion.costo_estimado (si lo usabas como unitario)
    if (unit == null && at.costo_estimado != null) unit = Number(at.costo_estimado);

    //    c) si sigue null, pido al modelo por 60 min y lo asumo como unitario
    if (unit == null) {
      const total60 = await predecirCostoTotal({
        seccion: "CIBERSEGURIDAD",
        sub_categoria: "FIREWALL",
        tipo_solicitud: String(at.id_tipo_atencion),
        proceso: at.observacion || at.motivo || "",
        minutos: 60
      });
      unit = Number(total60);
    }

    // 4) Predicho TOTAL ajustado a la duración real
    const horas = Math.max(minutos / 60, 1); // si quieres mínimo 1h
    const costo_predicho_total = Number((unit * horas).toFixed(2));

    // 5) Costo REAL (tarifa * horas) si tienes tabla de tarifas; si no, lo puedes dejar null
    const costo_real = await costoRealPorTarifa(cn, {
      id_tipo_atencion: at.id_tipo_atencion,
      minutos
    });

    // 6) Insertar en histórico
    const accion_recom = recomendarAccion({ pred: costo_predicho_total, real: costo_real });
    await cn.query(
      `INSERT INTO atencion_costeo_hist
         (id_atencion, modelo_id, modelo_version, duracion_min,
          costo_predicho_unit, costo_predicho_total, costo_real,
          accion_recom, aplicado, usuario_id, fuente_prediccion)
       VALUES (?, 'ml', 'v1', ?, ?, ?, ?, ?, 1, ?, 'ml')`,
      [
        id_atencion,
        minutos,
        unit,
        costo_predicho_total,
        costo_real,
        accion_recom,
        at.id_empleado // o req.user.id
      ]
    );

    // 7) Actualizar la atención (fechas, estado, costo_real y costo_estimado con el TOTAL)
    await cn.query(
      `UPDATE atencion
          SET fecha_atencion_fin = ?,
              hora_fin            = ?,
              id_estado           = 4,
              costo_real          = ?,
              costo_estimado      = ?,         -- guardamos el total predicho final
              fecha_ultima_actualizacion = NOW()
        WHERE id = ?`,
      [fecha_atencion_fin, hora_fin, costo_real, costo_predicho_total, id_atencion]
    );

    await cn.commit();
    return {
      ok: true,
      id_atencion,
      minutos,
      costo_predicho_unit: unit,
      costo_predicho_total,
      costo_real,
      accion_recom
    };
  } catch (err) {
    try { await cn.rollback(); } catch {}
    throw err;
  } finally {
    cn.release();
  }
}

  async function finalizarAtencionAutoCosto({ id_atencion, fecha_atencion_fin, hora_fin, usuario_id }) {
    console.log("FINALIZANDO ATENCION...")
    console.log("RECALCULANDO COSTO....")
    const cn = await pool.getConnection();
    try {
      await cn.beginTransaction();

      // 1) Traer datos base de la atención
      const [rows] = await cn.query(
        `SELECT id, id_tipo_atencion, id_centro_costos, motivo, observacion,
              fecha_atencion, hora_inicio, costo_estimado
         FROM atencion
        WHERE id = ? FOR UPDATE`,
        [id_atencion]
      );
      if (!rows.length) throw new Error("Atención no encontrada");
      const at = rows[0];

      // 2) Calcular minutos reales (mínimo 60 si tu HU lo exige)
      const minutos = Math.max(diffMinutes(at.hora_inicio, hora_fin) ?? 60, 60);

      // 3) Llamar ML (manejar fallo sin tirar 500)
      let costo_real_ml = null;
      try {
        // ajusta seccion/sub/tipo/proceso a tu modelo
        costo_real_ml = await predecirCostoML({
          seccion: "CIBERSEGURIDAD",
          sub_categoria: "FIREWALL",
          tipo_solicitud: String(at.id_tipo_atencion),
          proceso: at.observacion ?? at.motivo ?? "",
          tiempo_promedio: minutos,
        });
      } catch (e) {
        console.warn("ML falló, cerrando sin costo_real:", e.message);
        // Si prefieres abortar, lanza el error: throw e;
        // Si prefieres cerrar sin costo, deja costo_real_ml = null.
      }

      // 4) Actualizar la atención (fin + estado finalizada)
      await cn.query(
        `UPDATE atencion
          SET fecha_atencion_fin = ?, hora_fin = ?,
              fecha_ultima_actualizacion = NOW(),
              id_estado = 4
        WHERE id = ?`,
        [fecha_atencion_fin, hora_fin, id_atencion]
      );

      // 5) Tomar "costo_predicho" desde hist o desde la propia atención
      let costo_predicho = at.costo_estimado ?? null;
      if (costo_predicho == null) {
        const [h] = await cn.query(
          `SELECT costo_predicho
           FROM atencion_costeo_hist
          WHERE id_atencion = ?
          ORDER BY created_at DESC
          LIMIT 1`,
          [id_atencion]
        );
        if (h.length) costo_predicho = h[0].costo_predicho;
      }

      // 6) Insertar histórico
      await cn.query(
        `INSERT INTO atencion_costeo_hist
         (id_atencion, costo_predicho, costo_real, error_rel, aplicado,
          modelo_id, modelo_version, usuario_id)
       VALUES (?, ?, ?, NULL, 1, ?, ?, ?)`,
        [
          id_atencion,
          costo_predicho,
          costo_real_ml,                       // puede ir null si ML falló
          "ml",
          process.env.MODEL_VERSION || "v1",
          usuario_id,
        ]
      );

      await cn.commit();

      // 7) Respuesta amigable (con recomendación simple)
      let accion_recom = "SIN_CAMBIO";
      if (costo_predicho != null && costo_real_ml != null) {
        const delta = costo_real_ml - costo_predicho;
        if (delta > 0.01) accion_recom = "SUBIR_COBRO";
        else if (delta < -0.01) accion_recom = "BAJAR_COBRO";
      }

      return {
        ok: true,
        id_atencion,
        minutos,
        costo_predicho,
        costo_real: costo_real_ml,
        accion_recom,
      };
    } catch (err) {
      try { await cn.rollback(); } catch { }
      throw err;
    } finally {
      cn.release();
    }
  }

  module.exports = {
    guardarAtencion,
    listarAtenciones,
    obtenerDetalleAtencion,
    listarAtencionesPorEmpleado,
    actualizarEstado,
    obtenerAtencionPorId,
    obtenerNombreEstado,
    guardarNotificacion,
    listarNotificacionesPorEmpleado,
    marcarNotificacionesComoLeidas,
    listarAtencionesFinalizadas,
    atencionesPorArea,
    listarAreas,
    finalizarAtencion,
    finalizarAtencionAutoCosto,
    crearAtencionConDetalle
  };
