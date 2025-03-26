const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const {
  validateRegister,
  validateLogin
} = require('../middlewares/validate');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

module.exports = router;