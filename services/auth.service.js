const pool = require("../config/db");

const validarCredenciales = async (usuario, password) => {
  const [rows] = await pool.query(`
    SELECT 
      u.id, 
      u.username, 
      u.empleado_id, 
      r.nombre AS rol
    FROM usuarios u
    JOIN usuario_rol ur ON ur.usuario_id = u.id
    JOIN roles r ON r.id = ur.rol_id
    WHERE u.username = ? AND u.password = ?
  `, [usuario, password]);

  return rows[0]; // devuelve el usuario con id_empleado y rol
};

module.exports = {
  validarCredenciales
};
