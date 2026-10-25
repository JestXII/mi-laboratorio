
const express = require("express");

const app = express();
app.use(express.json());
let tareas = [];
let siguienteId = 1;

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
app.post("/api/saludar", (req, res) => {
  const nombre = req.body.nombre;

  if (typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({
      error: "Debes enviar un nombre válido"
    });
  }

  res.json({
    mensaje: `Hola, ${nombre.trim()}`,
    funciona: true
  });
});
app.post("/api/tareas", (req, res) => {
  const nombre = req.body.nombre;

  if (typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({
      error: "Debes enviar un nombre de tarea válido"
    });
  }

  const tarea = {
    id: siguienteId++,
    nombre: nombre.trim(),
    completada: false
  };

  tareas.push(tarea);

  res.status(201).json({
    mensaje: "Tarea creada",
    tarea: tarea
  });
});
app.get("/api/tareas", (req, res) => {
  res.json({
    total: tareas.length,
    tareas: tareas
  });
});
app.patch("/api/tareas/:id", (req, res) => {
  const id = Number(req.params.id);
  const tarea = tareas.find((t) => t.id === id);

  if (!tarea) {
    return res.status(404).json({
      error: "Tarea no encontrada"
    });
  }

  if (typeof req.body.completada !== "boolean") {
    return res.status(400).json({
      error: "completada debe ser true o false"
    });
  }

  tarea.completada = req.body.completada;

  res.json({
    mensaje: "Tarea actualizada",
    tarea: tarea
  });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
