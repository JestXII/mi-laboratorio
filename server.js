
const express = require("express");

const app = express();
app.use(express.json());


app.get("/api/presentacion", (req, res) => {
  const nombre = req.query.nombre ?? "invitado";

  if (typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({
      error: "El nombre no puede estar vacío",
      funciona: false
    });
  }

  if (nombre.length > 30) {
    return res.status(400).json({
      error: "El nombre no puede superar 30 caracteres",
      funciona: false
    });
  }

  res.json({
    mensaje: `Hola, ${nombre.trim()}`,
    funciona: true
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
