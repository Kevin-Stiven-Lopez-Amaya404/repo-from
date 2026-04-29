require('dotenv').config();
const express = require('express');
const morgan  = require('morgan');
const { testConnection } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globales ──────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await testConnection();
    res.json({ status: 'ok', db: 'connected', timestamp: new Date() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/users', userRoutes);

// ── Error handlers (siempre al final) ────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Inicio del servidor ───────────────────────────────────────────────────────
async function startServer() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`   Modo: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health: http://localhost:${PORT}/health\n`);
    });
  } catch (err) {
    console.error('❌ No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app; // export para tests
