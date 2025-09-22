const express = require("express");
const router = express.Router();
const { 
    registrarAtencion,
    obtenerAtenciones,
    renderDetalleAtencion,
    actualizarEstadoAtencion,
    marcarNotificacionesLeidas,
    obtenerAtencionesFinalizadas,
    obtenerNotificaciones,
    getAtencionesPorArea,
    postCostoReal,
    postAplicarAjuste,
    getAreas
} = require("../controller/atencion.controller");
const {verificarToken} = require("../middleware/verificarToken");

router.post("/atenciones", verificarToken, registrarAtencion);
router.get("/listar_atenciones", verificarToken, obtenerAtenciones);
router.get("/detalle_atencion", verificarToken, renderDetalleAtencion); // <-- para JSON
router.patch("/atencion/:id", verificarToken, actualizarEstadoAtencion);
router.get("/notificaciones", verificarToken, obtenerNotificaciones);
router.patch("/notificaciones/leidas", verificarToken, marcarNotificacionesLeidas);
router.get('/atenciones/finalizadas', verificarToken, obtenerAtencionesFinalizadas);
router.get('/areas', getAreas);
router.get('/atenciones-por-area', getAtencionesPorArea);
router.post('/atencion/:id/costo-real', verificarToken, postCostoReal);
router.post('/atencion/costeo/:id_hist/aplicar', verificarToken, postAplicarAjuste);

module.exports = router;
