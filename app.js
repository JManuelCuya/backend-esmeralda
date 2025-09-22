const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// 🧠 Configurar Socket.IO con CORS
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // tu frontend
    credentials: true,
  },
});

// 📌 Hacer disponible `io` en `req.app.get("io")` para los controladores
app.set("io", io);

// 🔐 Middlewares generales
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// 🖼️ Configuración de vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// 📦 Rutas
app.use("/auth", require("./routes/auth.routes"));
app.use("/api", require("./routes/atencion.routes"));
app.use("/api/combos", require("./routes/combo.routes"));
app.use("/", require("./routes/contenido.routes"));

// 🔁 Evento de conexión de WebSocket
io.on("connection", (socket) => {
  console.log("🟢 Cliente WebSocket conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Cliente WebSocket desconectado:", socket.id);
  });
});

// ▶️ Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
