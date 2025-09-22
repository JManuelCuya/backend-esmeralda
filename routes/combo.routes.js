const express = require("express");
const router = express.Router();
const { listarCentrosCostos, listarAreas, listarEmpleados,listarTiposAtencion,listarEmpresas,listarAreaCoti,listarCentrosCostosPorArea,listarEmpleadosPorCentroCostos,listarCategorias,listarProductos,listarEstadoAtencion} = require("../controller/combo.controller");

router.get("/centros-costos", listarCentrosCostos);
router.get("/areas", listarAreas);
router.get("/empleados", listarEmpleados);
router.get("/tipos-atencion", listarTiposAtencion);
router.get("/empresas", listarEmpresas);
router.get("/areaCoti/:id_empresa", listarAreaCoti);
router.get("/centros-costos/area/:areaId", listarCentrosCostosPorArea);
router.get("/empleados-por-centro-costos", listarEmpleadosPorCentroCostos);
router.get("/categorias", listarCategorias);
router.get("/productos", listarProductos);
router.get("/estadosAtencion", listarEstadoAtencion);
module.exports = router;
