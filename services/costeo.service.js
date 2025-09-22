// services/costeo.service.js
const pool = require("../config/db");

// === 1) Registrar predicción del modelo al crear la atención ===
async function registrarPrediccion({ id_atencion, costo_predicho, modelo_id=null, modelo_version=null, usuario_id=null }) {
  await pool.query(
    `INSERT INTO atencion_costeo_hist
       (id_atencion, costo_predicho, modelo_id, modelo_version, usuario_id)
     VALUES (?,?,?,?,?)`,
    [id_atencion, costo_predicho, modelo_id, modelo_version, usuario_id]
  );

  // cache rápido en atencion (puedes omitir si usas el trigger)
  await pool.query(
    `UPDATE atencion
       SET costo_estimado = ?,
           estado_costeo = 'PENDIENTE'
     WHERE id = ?`,
    [costo_predicho, id_atencion]
  );
}

// === 2) Cerrar comparación con costo real ===
/**
 * Politica simple:
 *  - umbral % para recomendar: 10% por defecto
 *  - accion:
 *      error_pct > +umbral  -> SUBIR_COBRO
 *      error_pct < -umbral  -> BAJAR_COBRO
 *      en otro caso          -> SIN_CAMBIO
 *  - costo_ajustado por defecto = costo_real (puedes personalizar)
 */
async function registrarCostoReal({ id_atencion, costo_real, usuario_id=null, umbralPct = 0.10 }) {
  // Traer última predicción de esa atención
  const [predRows] = await pool.query(
    `SELECT costo_predicho
       FROM atencion_costeo_hist
      WHERE id_atencion = ?
      ORDER BY created_at DESC
      LIMIT 1`,
    [id_atencion]
  );
  if (!predRows.length) throw new Error("No hay predicción previa para esta atención.");
  const costo_predicho = Number(predRows[0].costo_predicho);

  // calcular diferencias
  const error_abs = Math.abs(costo_real - costo_predicho);
  const error_pct = (costo_predicho === 0) ? 0 : (costo_real - costo_predicho) / costo_predicho;

  let accion_recom = 'SIN_CAMBIO';
  if (error_pct > umbralPct) accion_recom = 'SUBIR_COBRO';
  else if (error_pct < -umbralPct) accion_recom = 'BAJAR_COBRO';

  // propuesta simple (ajustar a costo real)
  const costo_ajustado = costo_real;

  // Insertar evento de costeo (comparación)
  const [ins] = await pool.query(
    `INSERT INTO atencion_costeo_hist
       (id_atencion, costo_predicho, costo_real, accion_recom, costo_ajustado, usuario_id)
     VALUES (?,?,?,?,?,?)`,
    [id_atencion, costo_predicho, costo_real, accion_recom, costo_ajustado, usuario_id]
  );

  // cache rápido en atencion (si usas trigger esto es redundante)
  await pool.query(
    `UPDATE atencion
       SET costo_real     = ?,
           error_abs      = ?,
           error_pct      = ?,
           accion_recom   = ?,
           costo_ajustado = ?,
           estado_costeo  = 'COMPARADO'
     WHERE id = ?`,
    [costo_real, error_abs, error_pct, accion_recom, costo_ajustado, id_atencion]
  );

  return { id_hist: ins.insertId, costo_predicho, costo_real, error_abs, error_pct, accion_recom, costo_ajustado };
}

// === 3) Aplicar ajuste recomendado (opcional) ===
async function aplicarAjuste({ id_hist }) {
  // obtiene el evento
  const [rows] = await pool.query(
    `SELECT id_atencion, costo_ajustado
       FROM atencion_costeo_hist
      WHERE id = ?`,
    [id_hist]
  );
  if (!rows.length) throw new Error("Evento de costeo no encontrado.");

  const { id_atencion, costo_ajustado } = rows[0];

  // marca aplicado
  await pool.query(
    `UPDATE atencion_costeo_hist
        SET aplicado = 1, applied_at = NOW()
      WHERE id = ?`,
    [id_hist]
  );

  // aplica (tu política: aquí solo dejamos el cache marcado)
  await pool.query(
    `UPDATE atencion
       SET estado_costeo = 'AJUSTADO'
     WHERE id = ?`,
    [id_atencion]
  );

  // si quieres reescribir el costo de referencia, hazlo aquí:
  // await pool.query(`UPDATE atencion SET costo_estimado = ? WHERE id = ?`, [costo_ajustado, id_atencion]);

  return { id_atencion, costo_ajustado };
}

module.exports = {
  registrarPrediccion,
  registrarCostoReal,
  aplicarAjuste
};
