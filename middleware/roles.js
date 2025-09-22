function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).send("Acceso denegado");
    }
    next();
  };
}

module.exports = { verificarRol };
