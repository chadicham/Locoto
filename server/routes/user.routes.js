const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Routes protégées
router.use(authMiddleware.protect);

// Route du profil
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.patch('/password', userController.updatePassword);

// Routes administrateur
router.use(authMiddleware.restrictTo('admin'));
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);

// Routes avec paramètres ID
router.get('/:id', userController.getUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;