const { pool } = require('../config/database');
const UserMapper = require('../mappers/UserMapper');
const { DatabaseError, NotFoundError } = require('../errors/AppError');

/**
 * UserRepository
 * Encapsula todos los accesos a la tabla `users`.
 */
class UserRepository {
  async findAll() {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM users ORDER BY created_at DESC'
      );
      return UserMapper.fromRows(rows);
    } catch (err) {
      throw new DatabaseError('Error al obtener usuarios', err);
    }
  }

  async findById(id) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return UserMapper.fromRow(rows[0] || null);
    } catch (err) {
      throw new DatabaseError(`Error al buscar usuario con id=${id}`, err);
    }
  }

  async findByEmail(email) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return UserMapper.fromRow(rows[0] || null);
    } catch (err) {
      throw new DatabaseError('Error al buscar usuario por email', err);
    }
  }

  async create(data) {
    const { name, email, role = 'user' } = data;
    try {
      const { rows } = await pool.query(
        `INSERT INTO users (name, email, role)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, email, role]
      );
      return UserMapper.fromRow(rows[0]);
    } catch (err) {
      // pg error 23505 = unique_violation
      if (err.code === '23505') {
        const { ConflictError } = require('../errors/AppError');
        throw new ConflictError(`Ya existe un usuario con el email ${email}`);
      }
      throw new DatabaseError('Error al crear usuario', err);
    }
  }

  async update(id, data) {
    const dbParams = UserMapper.toDbParams(data);
    const keys = Object.keys(dbParams);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = [...Object.values(dbParams), id];

    try {
      const { rows } = await pool.query(
        `UPDATE users SET ${setClauses}, updated_at = NOW()
         WHERE id = $${values.length}
         RETURNING *`,
        values
      );
      if (!rows.length) throw new NotFoundError('Usuario');
      return UserMapper.fromRow(rows[0]);
    } catch (err) {
      if (err.isOperational) throw err;
      throw new DatabaseError(`Error al actualizar usuario id=${id}`, err);
    }
  }

  async delete(id) {
    try {
      const { rowCount } = await pool.query(
        'DELETE FROM users WHERE id = $1',
        [id]
      );
      if (!rowCount) throw new NotFoundError('Usuario');
      return true;
    } catch (err) {
      if (err.isOperational) throw err;
      throw new DatabaseError(`Error al eliminar usuario id=${id}`, err);
    }
  }
}

module.exports = new UserRepository();
