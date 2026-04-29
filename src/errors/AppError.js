/**
 * Clases de error personalizadas para la aplicación.
 * Permiten manejo centralizado y respuestas HTTP semánticas.
 */

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // Errores operacionales vs de programación
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 - Solicitud malformada o datos inválidos */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/** 401 - No autenticado */
class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/** 403 - Sin permisos */
class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403, 'FORBIDDEN');
  }
}

/** 404 - Recurso no encontrado */
class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
  }
}

/** 409 - Conflicto (e.g. duplicado) */
class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual del recurso') {
    super(message, 409, 'CONFLICT');
  }
}

/** 422 - Entidad no procesable */
class UnprocessableError extends AppError {
  constructor(message, details = null) {
    super(message, 422, 'UNPROCESSABLE_ENTITY', details);
  }
}

/** 500 - Error de base de datos */
class DatabaseError extends AppError {
  constructor(message = 'Error en la base de datos', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableError,
  DatabaseError,
};
