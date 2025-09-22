const jwt = require("jsonwebtoken");
const { obtenerCentrosCostosPorEmpleado, obtenerTiposAtencion, obtenerAreas, obtenerEmpleados,obtenerEmpresas ,obtenerAreasxCoti,obtenerCentrosCostosPorArea,obtenerEmpleadosPorCentroCostos,obtenerCategorias,buscarProductos,obtenerEstados} = require("../services/combo.service");

const listarCentrosCostos = async (req, res) => {
  try {
    const token = req.cookies.token; // 👉 obtener desde cookies
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "clave-secreta");

    const data = await obtenerCentrosCostosPorEmpleado(decoded.empleado_id);
    res.json(data);
  } catch (err) {
    console.error("Error al obtener centros de costos filtrados:", err);
    res.status(500).json({ message: "Error al obtener centros de costos" });
  }
};

const listarAreas = async (req, res) => {
  try {
    const data = await obtenerAreas();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener áreas" });
  }
};


const listarEmpleados = async (req, res) => {
  try {
    const data = await obtenerEmpleados();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener empleados" });
  }
};


const listarTiposAtencion = async (req, res) => {
  try {
    const data = await obtenerTiposAtencion();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener tipos de atención" });
  }
};

const listarEmpresas = async (req, res) => {
  try {
    const data = await obtenerEmpresas();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener tipos de Empresas" });
  }
};

const listarAreaCoti = async (req, res) => {
  try {
    const { id_empresa } = req.params;  // Extraemos el id_empresa de la URL
    const data = await obtenerAreasxCoti(id_empresa);  // Pasamos id_empresa al servicio
    res.json(data);
  } catch (err) {
    console.error("Error al obtener tipos de Areas por empleado:", err);
    res.status(500).json({ message: "Error al obtener tipos de Areas por empleado" });
  }
};

const listarCentrosCostosPorArea = async (req, res) => {
  try {
    const { areaId } = req.params; // Cambio aquí
    console.log("area es, ", areaId)
    const data = await obtenerCentrosCostosPorArea(areaId);
    res.json(data);
  } catch (err) {
    console.error("Error al listar centros de costos por área:", err);
    res.status(500).json({ message: "Error al obtener centros de costos" });
  }
};

const listarEmpleadosPorCentroCostos = async (req, res) => {
  try {
    const { centro_costos_id } = req.query;
    console.log("centro es",centro_costos_id)
    const data = await obtenerEmpleadosPorCentroCostos(centro_costos_id);
    res.json(data);
  } catch (err) {
    console.error("Error al obtener empleados:", err);
    res.status(500).json({ message: "Error al listar empleados por centro de costos" });
  }
};

const listarCategorias = async (req, res) => {
  try {
    const data = await obtenerCategorias();
    res.json(data);
    console.log(data)
  } catch (err) {
    res.status(500).json({ message: "Error al obtener categorías" });
  }
};


const listarProductos = async (req, res) => {
  try {
    const {id_categoria } = req.query;
    console.log("contenido",id_categoria)
    if (!id_categoria) {
      return res.status(400).json({ message: "Se requiere el ID de categoría" });
    }

    const data = await buscarProductos(id_categoria);
    res.json(data);
    console.log("dataaa",data)
  } catch (err) {
    console.error("Error al listar productos:", err);
    res.status(500).json({ message: "Error al buscar productos" });
  }
};

const listarEstadoAtencion = async (req, res) => {
  try {
    console.log("ESTADOS")
    const estados = await obtenerEstados();
    res.json(estados);
  } catch (err) {
     console.error("Error al listar estado:", err);
    res.status(500).json({ message: "Error al listar estados" });
  }
};
module.exports = { 
  listarCentrosCostos, 
  listarAreas, 
  listarEmpleados,
  listarTiposAtencion,
  listarEmpresas,
  listarAreaCoti,
  listarCentrosCostosPorArea,
  listarEmpleadosPorCentroCostos,
  listarCategorias,
  listarProductos,
  listarEstadoAtencion
};
