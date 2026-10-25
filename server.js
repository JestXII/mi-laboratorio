
const express = require("express");

const app = express();

app.get("/api/saludo", (req, res) => {
  res.json({
    mensaje: process.env.MENSAJE_PERSONALIZADO || "Hola desde mi backend",
    funciona: true
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
