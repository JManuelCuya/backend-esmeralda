DELIMITER $$

CREATE PROCEDURE sp_detalle_atencion(IN p_id INT)
BEGIN
  SELECT 
    a.id AS id_atencion,
    ta.descripcion AS tipo_atencion,
    CONCAT(e.nombre, ' ', e.apellido_paterno, ' ', e.apellido_materno) AS empleado,
    cc.descripcion AS centro_costo,
    a.fecha_atencion,
    a.fecha_atencion_fin,
    a.hora_inicio,
    a.hora_fin,
    a.motivo,
    a.observacion,
    a.costo_estimado,
    /*a.estado*/
    a.fecha_registro,
    a.id_estado
    a.fecha_ultima_actualizacion
  FROM atencion a
  INNER JOIN tipo_atencion ta ON a.id_tipo_atencion = ta.id
  INNER JOIN empleado e ON a.id_empleado = e.id
  INNER JOIN centro_costos cc ON a.id_centro_costos = cc.id
  WHERE a.id = p_id;
END$$

DELIMITER ;


 SELECT 
      a.id_empleado, 
      ta.descripcion,
      DATE_FORMAT(a.fecha_ultima_actualizacion, '%d/%m/%Y %H:%i:%s') AS fecha_actualizacion_formateada
    FROM atencion a
    INNER JOIN estado_atencion ta ON ta.id = a.id_tipo_atencion 
    WHERE a.id = 3

call sp_detalle_atencion(1)
