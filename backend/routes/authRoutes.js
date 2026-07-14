const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerValidator, loginValidator, googleLoginValidator,
  forgotPasswordValidator, resetPasswordValidator, changePasswordValidator, refreshTokenValidator,
} = require('../validators/authValidator');

const router = express.Router();

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/google', googleLoginValidator, validate, authController.googleLogin);
router.post('/refresh', refreshTokenValidator, validate, authController.refresh);
router.post('/logout', authenticate, authController.logout);

router.get('/me', authenticate, authController.getProfile);
router.patch('/me', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, changePasswordValidator, validate, authController.changePassword);

router.post('/forgot-password', forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword);

module.exports = router;
