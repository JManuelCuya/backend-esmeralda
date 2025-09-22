const pool = require("../config/db");

const guardarAtencion = async ({ empleado_id, tipo_atencion_id, centro_costos_id, fecha_atencion, fecha_atencion_fin, hora_inicio, hora_fin, motivo, observacion, estado,costo_estimado,id_prioridad,id_estado }) => {
  // Realizar la inserción
  const result = await pool.query(
    `INSERT INTO atencion (id_tipo_atencion, id_empleado, id_centro_costos, fecha_atencion, fecha_atencion_fin, hora_inicio, hora_fin, motivo, observacion, estado,costo_estimado,id_prioridad,id_estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)`,
    [tipo_atencion_id, empleado_id, centro_costos_id, fecha_atencion, fecha_atencion_fin, hora_inicio, hora_fin, motivo, observacion,estado ,costo_estimado,id_prioridad,id_estado]
  );

  // Obtener el id autoincrementado generado
  const [rows] = await pool.query("SELECT LAST_INSERT_ID() AS id");
  console.log(rows)
  return rows[0].id;  // Devuelve el id autogenerado
};

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
           a.fecha_ultima_actualizacion
    FROM atencion a
    JOIN empleado e ON e.id = a.id_empleado
    JOIN centro_costos cc ON cc.id = a.id_centro_costos
    JOIN tipo_atencion ta ON ta.id = a.id_tipo_atencion
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
            a.fecha_ultima_actualizacion
    FROM atencion a
    JOIN empleado e ON e.id = a.id_empleado
    JOIN centro_costos cc ON cc.id = a.id_centro_costos
    JOIN tipo_atencion ta ON ta.id = a.id_tipo_atencion
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
    [id,id_estado]
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
  console.log("atencion ultima",rows[0]) 
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


// ===== MÉTRICAS: Atenciones por área =====
/** rango para un mes 'YYYY-MM' -> [start, end) */
function monthRange(yyyymm) {
  if (!/^\d{4}-\d{2}$/.test(yyyymm)) return null;
  const start = `${yyyymm}-01`;
  const [y, m] = yyyymm.split('-').map(Number);
  const end = new Date(y, m, 1).toISOString().slice(0,10); // 1° del mes siguiente
  return { start, end };
}

/** últimos N días terminando hoy -> [start, end) */
function lastNDaysRange(days = 30) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - Number(days));
  return {
    start: start.toISOString().slice(0,10),
    end:   end.toISOString().slice(0,10)
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
    end   = today.toISOString().slice(0, 10);
  } else {
    const mm = mes || new Date().toISOString().slice(0, 7); // por defecto mes actual
    const [y, m] = mm.split('-').map(Number);
    if (!y || !m) throw new Error("Parámetro 'mes' inválido (YYYY-MM)");
    const first = new Date(Date.UTC(y, m - 1, 1));
    const next  = new Date(Date.UTC(y, m, 1));
    const last  = new Date(next.getTime() - 86400000); // último día del mes
    start = first.toISOString().slice(0, 10);
    end   = last.toISOString().slice(0, 10);
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

  // 5) Respuesta en el formato que usa tu front
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
  listarAreas

};
