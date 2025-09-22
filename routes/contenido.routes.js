const express = require("express");
const router = express.Router();
const {verificarToken,verificarTokenYRender} = require("../middleware/verificarToken");

const { mostrarPanel } = require("../controller/panel.controller");



router.get("/listado", verificarToken, (req, res) => {
  res.render("listado", { rol: req.user.rol });
});

router.get("/solicitud", verificarToken, (req, res) => {
  res.render("solicitud", { rol: req.user.rol });
});

router.get("/consulta", verificarToken, (req, res) => {
  res.render("consulta", { rol: req.user.rol });
});

router.get("/cotizacion", verificarToken, (req, res) => {
  res.render("cotizacion", { rol: req.user.rol });
});

router.get("/atenciones_cotizadas", verificarToken, (req, res) => {

  res.render("atenciones_cotizadas", { rol: req.user.rol });
});



module.exports = router;
