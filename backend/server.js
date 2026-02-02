const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { generateToken } = require("./utils/jwt");
const { sendEmail, emailTemplates } = require("./utils/email");
const authMiddleware = require("./middleware/auth");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// RUTAS PÚBLICAS
// ============================================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Servidor funcionando correctamente" });
});

// Login de administrador
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son requeridos" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      role: user.role,
    });

    res.json({
      success: true,
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Registrar administrador (solo para setup inicial)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, nombre } = req.body;

    if (!email || !password || !nombre) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        role: "admin",
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Crear cita (público)
app.post("/api/citas", async (req, res) => {
  try {
    const { nombreCompleto, telefono, email, tipoServicio, fecha, hora } =
      req.body;

    if (
      !nombreCompleto ||
      !telefono ||
      !email ||
      !tipoServicio ||
      !fecha ||
      !hora
    ) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    // ===== VALIDACIONES DE FECHA Y HORA =====

    const fechaCita = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Validar que no sea una fecha pasada
    if (fechaCita < hoy) {
      return res.status(400).json({
        error: "No puedes agendar citas en fechas pasadas",
      });
    }

    // Validar que no sea domingo (0 = domingo)
    const diaSemana = fechaCita.getDay();
    if (diaSemana === 0) {
      return res.status(400).json({
        error: "No atendemos los domingos. Por favor selecciona lunes a sábado",
      });
    }

    // Validar horario (8:00 AM - 8:00 PM)
    const [hours, minutes] = hora.split(":").map(Number);
    const horaEnMinutos = hours * 60 + minutes;
    const horaInicio = 8 * 60; // 8:00 AM
    const horaFin = 20 * 60; // 8:00 PM

    if (horaEnMinutos < horaInicio || horaEnMinutos >= horaFin) {
      return res.status(400).json({
        error:
          "El horario de atención es de lunes a sábado de 8:00 AM a 8:00 PM",
      });
    }

    // Crear la cita si todas las validaciones pasaron
    const nuevaCita = await prisma.cita.create({
      data: {
        nombreCompleto,
        telefono,
        email,
        tipoServicio,
        fecha: new Date(fecha),
        hora,
        estado: "pendiente",
      },
    });

    // Enviar email de confirmación de registro
    await sendEmail({
      to: email,
      subject: "✓ Cita Registrada - CitasFácil",
      html: emailTemplates.citaCreada(nuevaCita),
    });

    res.status(201).json({
      success: true,
      message: "¡Cita confirmada exitosamente!",
      data: nuevaCita,
    });
  } catch (error) {
    console.error("Error al crear cita:", error);
    res
      .status(500)
      .json({ error: "Hubo un error. Por favor intenta nuevamente." });
  }
});

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

// Obtener todas las citas (admin)
app.get("/api/admin/citas", authMiddleware, async (req, res) => {
  try {
    const citas = await prisma.cita.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(citas);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al obtener las citas" });
  }
});

// Obtener estadísticas (admin)
app.get("/api/admin/stats", authMiddleware, async (req, res) => {
  try {
    const total = await prisma.cita.count();
    const pendientes = await prisma.cita.count({
      where: { estado: "pendiente" },
    });
    const confirmadas = await prisma.cita.count({
      where: { estado: "confirmada" },
    });
    const rechazadas = await prisma.cita.count({
      where: { estado: "rechazada" },
    });

    res.json({
      total,
      pendientes,
      confirmadas,
      rechazadas,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// Confirmar cita (admin)
app.patch(
  "/api/admin/citas/:id/confirmar",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;

      const cita = await prisma.cita.update({
        where: { id: parseInt(id) },
        data: { estado: "confirmada" },
      });

      // Enviar email de confirmación
      await sendEmail({
        to: cita.email,
        subject: "✓ ¡Cita Confirmada! - CitasFácil",
        html: emailTemplates.citaConfirmada(cita),
      });

      res.json({
        success: true,
        message: "Cita confirmada y email enviado",
        data: cita,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Error al confirmar cita" });
    }
  },
);

// Rechazar cita (admin)
app.patch("/api/admin/citas/:id/rechazar", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { motivoRechazo } = req.body;

    const cita = await prisma.cita.update({
      where: { id: parseInt(id) },
      data: {
        estado: "rechazada",
        motivoRechazo: motivoRechazo || "No especificado",
      },
    });

    // Enviar email de rechazo
    await sendEmail({
      to: cita.email,
      subject: "Actualización de tu Cita - CitasFácil",
      html: emailTemplates.citaRechazada(cita),
    });

    res.json({
      success: true,
      message: "Cita rechazada y email enviado",
      data: cita,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al rechazar cita" });
  }
});

// Eliminar cita (admin)
app.delete("/api/admin/citas/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.cita.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Cita eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al eliminar cita" });
  }
});

// Verificar token (admin)
app.get("/api/auth/verify", authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 API disponible en http://localhost:${PORT}/api`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
