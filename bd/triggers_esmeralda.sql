DELIMITER $$
CREATE TRIGGER trg_costeo_hist_after_insert
AFTER INSERT ON atencion_costeo_hist
FOR EACH ROW
BEGIN
  UPDATE atencion
  SET
    costo_real     = NEW.costo_real,
    error_abs      = IF(NEW.costo_real IS NULL, NULL, ABS(NEW.costo_real - NEW.costo_predicho)),
    error_pct      = IF(NEW.costo_real IS NULL OR NEW.costo_predicho = 0,
                        NULL, (NEW.costo_real - NEW.costo_predicho) / NEW.costo_predicho),
    accion_recom   = NEW.accion_recom,
    costo_ajustado = NEW.costo_ajustado,
    estado_costeo  = CASE
                       WHEN NEW.aplicado = 1 THEN 'AJUSTADO'
                       WHEN NEW.costo_real IS NOT NULL THEN 'COMPARADO'
                       ELSE 'PENDIENTE'
                     END
  WHERE id = NEW.id_atencion;
END$$
DELIMITER ;
