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
  listarAtencionesFinalizadas
};
