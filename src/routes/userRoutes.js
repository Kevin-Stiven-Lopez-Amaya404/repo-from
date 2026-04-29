const { Router } = require('express');
const { body, param } = require('express-validator');
const UserController = require('../controllers/UserController');

const router = Router();

// Validaciones reutilizables
const idParam = param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo');

const userBody = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('email').isEmail().withMessage('El email no es válido').normalizeEmail(),
  body('role').optional().isIn(['user', 'admin']).withMessage('Rol inválido'),
];

const updateBody = [
  body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío').isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('email').optional().isEmail().withMessage('El email no es válido').normalizeEmail(),
  body('role').optional().isIn(['user', 'admin']).withMessage('Rol inválido'),
  body('isActive').optional().isBoolean().withMessage('isActive debe ser booleano'),
];

router.get('/',               UserController.getAll);
router.get('/:id', idParam,   UserController.getById);
router.post('/', userBody,    UserController.create);
router.patch('/:id', [idParam, ...updateBody], UserController.update);
router.delete('/:id', idParam, UserController.remove);

module.exports = router;
