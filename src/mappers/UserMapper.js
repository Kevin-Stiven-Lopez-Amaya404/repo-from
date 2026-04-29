const User = require('../models/User');

/**
 * UserMapper
 *
 * Centraliza todas las transformaciones de datos del recurso Usuario:
 *   - Fila de BD (snake_case)  →  Dominio (camelCase)
 *   - Dominio                  →  DTO de respuesta HTTP (solo campos públicos)
 *   - Body HTTP (camelCase)    →  Parámetros de BD (snake_case)
 */
class UserMapper {
  /**
   * Convierte una fila cruda de PostgreSQL al modelo de dominio.
   * @param {Object} row - fila de la tabla `users`
   * @returns {User}
   */
  static fromRow(row) {
    if (!row) return null;
    return new User({
      id:        row.id,
      name:      row.name,
      email:     row.email,
      role:      row.role,
      isActive:  row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /**
   * Convierte una lista de filas al modelo de dominio.
   * @param {Object[]} rows
   * @returns {User[]}
   */
  static fromRows(rows) {
    return (rows || []).map(UserMapper.fromRow);
  }

  /**
   * Convierte el modelo de dominio a DTO de respuesta HTTP.
   * Excluye campos sensibles (e.g. password_hash).
   * @param {User} user
   * @returns {Object}
   */
  static toDTO(user) {
    if (!user) return null;
    return {
      id:        user.id,
      name:      user.name,
      email:     user.email,
      role:      user.role,
      isActive:  user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Convierte una lista de modelos a DTOs.
   * @param {User[]} users
   * @returns {Object[]}
   */
  static toDTOList(users) {
    return (users || []).map(UserMapper.toDTO);
  }

  /**
   * Convierte body HTTP (camelCase) a columnas de BD (snake_case)
   * para operaciones INSERT / UPDATE.
   * Solo incluye los campos que realmente llegaron en el body.
   * @param {Object} body
   * @returns {Object}
   */
  static toDbParams(body) {
    const params = {};
    if (body.name      !== undefined) params.name      = body.name;
    if (body.email     !== undefined) params.email      = body.email;
    if (body.role      !== undefined) params.role       = body.role;
    if (body.isActive  !== undefined) params.is_active  = body.isActive;
    return params;
  }
}

module.exports = UserMapper;
