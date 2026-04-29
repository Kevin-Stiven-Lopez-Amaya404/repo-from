iconst userRepository = require('../db/UserRepository');
const UserMapper = require('../mappers/UserMapper');
const { NotFoundError, ConflictError } = require('../errors/AppError');

/**
 * UserService
 * Lógica de negocio para el recurso Usuario.
 */
class UserService {
  async getAllUsers() {
    const users = await userRepository.findAll();
    return UserMapper.toDTOList(users);
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('Usuario');
    return UserMapper.toDTO(user);
  }

  async createUser(data) {
    // Verificar email duplicado a nivel de servicio (además de la constraint de BD)
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new ConflictError(`El email ${data.email} ya está registrado`);

    const created = await userRepository.create(data);
    return UserMapper.toDTO(created);
  }

  async updateUser(id, data) {
    // Verificar que existe
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('Usuario');

    // Si cambia el email, verificar que no esté tomado
    if (data.email && data.email !== user.email) {
      const conflict = await userRepository.findByEmail(data.email);
      if (conflict) throw new ConflictError(`El email ${data.email} ya está registrado`);
    }

    const updated = await userRepository.update(id, data);
    return UserMapper.toDTO(updated);
  }

  async deleteUser(id) {
    await userRepository.delete(id);
    return { message: 'Usuario eliminado correctamente' };
  }
}

module.exports = new UserService();
