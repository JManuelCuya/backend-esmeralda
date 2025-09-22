const pool = require("../config/db");

const obtenerCentrosCostosPorEmpleado = async (empleadoId) => {
  const [rows] = await pool.query(
    `SELECT cc2.id, cc2.descripcion
     FROM asignar_empleado ae
     JOIN centro_costos cc1 ON ae.id_centro_costos = cc1.id
     JOIN area a ON cc1.id_area = a.id
     JOIN centro_costos cc2 ON cc2.id_area = a.id
     WHERE ae.id_empleado = ?`,
    [empleadoId]
  );
  return rows;
};

const obtenerAreas = async () => {
  const [rows] = await pool.query("SELECT id, descripcion FROM area");
  return rows;
};

const obtenerEmpleados = async () => {
  const [rows] = await pool.query("SELECT id, CONCAT(nombre, ' ', apellido_paterno) AS nombre FROM empleado");
  return rows;
};
const obtenerTiposAtencion = async () => {
  const [rows] = await pool.query("SELECT id, descripcion FROM tipo_atencion");
  console.log("atenciones",rows)
  return rows;
};
const obtenerEmpresas = async () => {
  const [rows] = await pool.query("SELECT id, descripcion FROM empresa");
  console.log("Empresas",rows)
  return rows;
};
const obtenerAreasxCoti =  async (id_empresa) => {
  const [rows] = await pool.query(
    "SELECT id, descripcion FROM area where id_empresa = ?",
    [id_empresa]
  );
  console.log("Area empleado",rows)
  return rows;
};

const obtenerCentrosCostosPorArea = async (id_area) => {
  const [rows] = await pool.query(
    "SELECT id, descripcion FROM centro_costos WHERE id_area = ?",
    [id_area]
  );
  console.log("Centros de costos del área", rows);
  return rows;
};

const obtenerEmpleadosPorCentroCostos = async (centroCostosId) => {
  const [rows] = await pool.query(`
    SELECT e.id, CONCAT(e.nombre, ' ', e.apellido_paterno, ' ', e.apellido_materno) AS nombre
    FROM asignar_empleado ae
    JOIN empleado e ON ae.id_empleado = e.id
    WHERE ae.id_centro_costos = ?
  `, [centroCostosId]);

  return rows;
};


const obtenerCategorias = async () => {
  const [rows] = await pool.query("SELECT id, descripcion FROM tb_categoria");
  return rows;
};

const buscarProductos = async (id_categoria) => {
  console.log("Filtrando productos")
  const [rows] = await pool.query(`
    SELECT id, codigo_producto, descripcion, precio_actual FROM stock WHERE id_categoria = ? 
      `,[id_categoria]);
  return rows;
};

const obtenerEstados = async () => {
  console.log("ESTADOS SERVICE")
  const [rows] = await pool.query("SELECT id, descripcion FROM estado_atencion");
   console.log("Estado de atenciones", rows);
  return rows;
};

module.exports = {
   obtenerCentrosCostosPorEmpleado, 
   obtenerAreas, 
   obtenerEmpleados,
   obtenerTiposAtencion,
   obtenerEmpresas,
   obtenerAreasxCoti,
   obtenerCentrosCostosPorArea,
   obtenerEmpleadosPorCentroCostos,
   obtenerCategorias,
   buscarProductos,
   obtenerEstados
  };
