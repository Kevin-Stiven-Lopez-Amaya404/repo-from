const { AppError, DatabaseError } = require('../errors/AppError');

/**
 * Formatea errores de PostgreSQL a DatabaseError legibles.
 */
function parsePgError(err) {
  // Violación de unicidad
  if (err.code === '23505') {
    return new DatabaseError(`Registro duplicado: ${err.detail || err.message}`, err);
  }
  // Violación de FK
  if (err.code === '23503') {
    return new DatabaseError(`Referencia inválida: ${err.detail || err.message}`, err);
  }
  // Violación de NOT NULL
  if (err.code === '23502') {
    return new DatabaseError(`Campo requerido nulo: ${err.column || err.message}`, err);
  }
  // Timeout de conexión
  if (err.code === 'ECONNREFUSED' || err.message?.includes('timeout')) {
    return new DatabaseError('No se pudo conectar a la base de datos', err);
  }
  return new DatabaseError(err.message, err);
}

/**
 * Middleware global de manejo de errores.
 * Debe registrarse DESPUÉS de todas las rutas.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let error = err;

  // Convertir errores de pg a DatabaseError
  if (err.severity || err.code?.match(/^\d{5}$/) || err.code === 'ECONNREFUSED') {
    error = parsePgError(err);
  }

  // Loguear errores no operacionales (bugs de programación)
  if (!error.isOperational) {
    console.error('[ERROR NO OPERACIONAL]', {
      message: err.message,
      stack:   err.stack,
      url:     req.originalUrl,
      method:  req.method,
    });
  } else {
    console.warn('[ERROR OPERACIONAL]', {
      code:    error.code,
      status:  error.statusCode,
      message: error.message,
      url:     req.originalUrl,
      method:  req.method,
    });
  }

  const statusCode = error.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  return res.status(statusCode).json({
    success: false,
    error: {
      code:    error.code    || 'INTERNAL_ERROR',
      message: error.message || 'Error interno del servidor',
      ...(error.details && { details: error.details }),
      ...((!isProd && !error.isOperational) && { stack: err.stack }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      path:      req.originalUrl,
      method:    req.method,
    },
  });
}

/**
 * Middleware para rutas no encontradas (404).
 */
function notFoundHandler(req, res, next) {
  const { NotFoundError } = require('../errors/AppError');
  next(new NotFoundError(`Ruta ${req.method} ${req.originalUrl}`));
}

module.exports = { errorHandler, notFoundHandler };
