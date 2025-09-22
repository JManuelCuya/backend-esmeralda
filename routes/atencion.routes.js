const express = require("express");
const router = express.Router();
const { 
    registrarAtencion,
    obtenerAtenciones,
    renderDetalleAtencion,
    actualizarEstadoAtencion,
    marcarNotificacionesLeidas,
    obtenerAtencionesFinalizadas,
    obtenerNotificaciones} = require("../controller/atencion.controller");
const {verificarToken} = require("../middleware/verificarToken");

router.post("/atenciones", verificarToken, registrarAtencion);
router.get("/listar_atenciones", verificarToken, obtenerAtenciones);
router.get("/detalle_atencion", verificarToken, renderDetalleAtencion); // <-- para JSON
router.patch("/atencion/:id", verificarToken, actualizarEstadoAtencion);
router.get("/notificaciones", verificarToken, obtenerNotificaciones);
router.patch("/notificaciones/leidas", verificarToken, marcarNotificacionesLeidas);
router.get('/atenciones/finalizadas', verificarToken, obtenerAtencionesFinalizadas);

module.exports = router;
