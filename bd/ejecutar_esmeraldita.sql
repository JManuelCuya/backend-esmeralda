use esmeralda_corp_bd;

select * from empleado;
select * from asignar_empleado;
select * from usuarios;
select * from usuario_rol;
select * from departamentos;
select * from provincia;
select * from distrito;
select * from empresa;
select * from area;
select * from centro_costos;
select * from roles;

select * from tipo_atencion;
select * from estado_atencion;
select * from atencion;
select * from tb_categoria;
select * from stock;
select * from notificaciones;
drop table notificaciones;


SELECT ar.id            AS area_id,
       ar.descripcion   AS area,
       COUNT(*)         AS total
FROM atencion a
JOIN centro_costos cc ON cc.id = a.id_centro_costos
JOIN area ar          ON ar.id = cc.id_area
WHERE a.fecha_atencion >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
  AND a.fecha_atencion <  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')
-- AND a.id_estado = 4   -- descomenta si quieres solo "Finalizadas"
GROUP BY ar.id, ar.descripcion
ORDER BY total DESC;
