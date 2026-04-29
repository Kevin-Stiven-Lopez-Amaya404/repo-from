/**
 * Modelo de dominio: Usuario.
 * Representa la entidad pura del negocio, sin acoplamiento a BD o HTTP.
 */
class User {
  constructor({ id, name, email, role, isActive, createdAt, updatedAt }) {
    this.id        = id;
    this.name      = name;
    this.email     = email;
    this.role      = role      || 'user';
    this.isActive  = isActive  !== undefined ? isActive : true;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }
}

module.exports = User;
