const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "clave-secreta");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido" });
  }
}

function verificarTokenYRender(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
const decoded = jwt.verify(token, process.env.JWT_SECRET || "clave-secreta");
console.log("✅ Token verificado:", decoded); // 👈 Aquí verás el contenido del token
req.user = decoded;

  } catch (error) {
    return res.redirect("/login");
  }
}

function obtenerUsuarioDesdeToken(req, res) {
  const token = req.cookies.token;
  console.log("token actual",token)
  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "clave-secreta");
    return res.json(decoded); // Devuelve { id, nombre, rol, etc. }
  } catch (error) {
    return res.status(403).json({ message: "Token inválido" });
  }
}



module.exports = {
  verificarToken,
  verificarTokenYRender,
  obtenerUsuarioDesdeToken
};
