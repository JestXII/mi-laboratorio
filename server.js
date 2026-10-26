
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 3
});

// 1. Saludo personalizado
app.get("/api/saludo", (req, res) => {
  res.json({
    mensaje:
      process.env.MENSAJE_PERSONALIZADO || "Hola desde mi backend",
    funciona: true
  });
});

// 2. Presentación mediante GET
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

// 3. Saludo mediante POST
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

// 4. Crear tarea en PostgreSQL
app.post("/api/tareas", async (req, res) => {
  const nombre = req.body.nombre;

  if (typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({
      error: "Debes enviar un nombre de tarea válido"
    });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO public.tareas_api (nombre)
       VALUES ($1)
       RETURNING id, nombre, completada, creada_en`,
      [nombre.trim()]
    );

    res.status(201).json({
      mensaje: "Tarea creada",
      tarea: resultado.rows[0]
    });
  } catch (error) {
    console.error("Error al crear tarea:", error.message);
    res.status(500).json({
      error: "No se pudo crear la tarea"
    });
  }
});

// 5. Consultar tareas desde PostgreSQL
app.get("/api/tareas", async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nombre, completada, creada_en
       FROM public.tareas_api
       ORDER BY id ASC`
    );

    res.json({
      total: resultado.rowCount,
      tareas: resultado.rows
    });
  } catch (error) {
    console.error("Error al consultar tareas:", error.message);
    res.status(500).json({
      error: "No se pudieron consultar las tareas"
    });
  }
});

// 6. Actualizar estado de una tarea
app.patch("/api/tareas/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      error: "ID inválido"
    });
  }

  if (typeof req.body.completada !== "boolean") {
    return res.status(400).json({
      error: "completada debe ser true o false"
    });
  }

  try {
    const resultado = await pool.query(
      `UPDATE public.tareas_api
       SET completada = $1
       WHERE id = $2
       RETURNING id, nombre, completada, creada_en`,
      [req.body.completada, id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        error: "Tarea no encontrada"
      });
    }

    res.json({
      mensaje: "Tarea actualizada",
      tarea: resultado.rows[0]
    });
  } catch (error) {
    console.error("Error al actualizar tarea:", error.message);
    res.status(500).json({
      error: "No se pudo actualizar la tarea"
    });
  }
});

// 7. Probar conexión a PostgreSQL
app.get("/api/db-test", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT NOW() AS hora"
    );

    res.json({
      conectado: true,
      mensaje: "Conexión a PostgreSQL exitosa",
      horaServidorBD: resultado.rows[0].hora
    });
  } catch (error) {
    console.error(
      "Error de conexión a la base de datos:",
      error.message
    );

    res.status(500).json({
      conectado: false,
      mensaje: "No se pudo conectar a PostgreSQL"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
