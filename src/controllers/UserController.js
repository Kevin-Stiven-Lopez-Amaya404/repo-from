const { validationResult } = require('express-validator');
const userService = require('../services/UserService');
const { ValidationError } = require('../errors/AppError');

/**
 * Helper: valida los resultados de express-validator y lanza ValidationError si hay errores.
 */
function validateRequest(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Datos de entrada inválidos', errors.array());
  }
}

const UserController = {
  async getAll(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.json({ success: true, data: users, total: users.length });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      validateRequest(req);
      const user = await userService.createUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      validateRequest(req);
      const user = await userService.updateUser(req.params.id, req.body);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const result = await userService.deleteUser(req.params.id);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = UserController;
