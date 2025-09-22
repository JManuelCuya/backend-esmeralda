const express = require("express");
const router = express.Router();
const { login,logout } = require("../controller/auth.controller");
const { obtenerUsuarioDesdeToken } = require("../middleware/verificarToken");

router.post("/login", login);
router.post("/logout", logout);
router.get("/usuario", obtenerUsuarioDesdeToken, (req, res) => {
  res.json(req.usuario); // o req.session.usuario, según tu auth
});

module.exports = router;
