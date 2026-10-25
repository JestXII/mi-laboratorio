
const express = require("express");

const app = express();

app.get("/api/saludo", (req, res) => {
  res.json({
    mensaje: process.env.MENSAJE_PERSONALIZADO || "Hola desde mi backend",
    funciona: true
  });
});
app.get("/api/presentacion", (req, res) => {
  const nombre = req.query.nombre || "invitado";

  res.json({
    mensaje: `Hola, ${nombre}`,
    funciona: true
  });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
