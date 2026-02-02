const { verifyToken } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No autorizado. Token no proporcionado.",
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: "Token inválido o expirado.",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error en autenticación:", error);
    res.status(401).json({ error: "No autorizado." });
  }
};

module.exports = authMiddleware;
