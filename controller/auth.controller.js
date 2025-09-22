const jwt = require("jsonwebtoken");
const { validarCredenciales } = require("../services/auth.service");

const login = async (req, res) => {
  const { usuario, password } = req.body;
  console.log("credenciales",usuario,password)
  try {
    const user = await validarCredenciales(usuario, password);

    if (user) {
      const payload = {
        id: user.id,
        username: user.username,
        rol: user.rol,
        empleado_id: user.empleado_id
      };
      
  console.log("ENTRO")

      const token = jwt.sign(payload, process.env.JWT_SECRET || "clave-secreta", {
        expiresIn: "8h"
      });
      console.log("ENTRO",token)
      return res.status(200).json({ message: "Login exitoso", token });
     
    }
      
    return res.status(401).json({ message: "Credenciales inválidas" });
  } catch (error) {
    console.log("SALIO")
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};

module.exports = {
  login,
  logout
};
