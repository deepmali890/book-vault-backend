const express = require('express');
const authController = require('../controllers/auth.controller');
const protect = require('../middlewares/authMiddleware');
const fileHandle = require('../middlewares/multer');

const router = express.Router();

// PUBLIC REGISTER ROUTE — PUBLIC
router.post('/public-register', authController.register);

// PROTECTED ADMIN REGISTER ROUTE — PROTECTED
router.post('/admin-register', protect, authController.register);


router.get('/verify-email', authController.verifyEmail)
router.post('/login', authController.login)
router.post('/logout', authController.logout)

// reset password
router.post('/send-reset-otp', protect, authController.sendResetOtp)
router.post('/verify-reset-otp', authController.verifyResetOTP)
router.post('/reset-password', authController.resetPassword)

// update user
router.put('/edit-profile', protect, fileHandle, authController.updateProfile)

// get user
router.get('/user/:id', protect, authController.getUserById)

// In auth.routes.js
router.get('/me', protect, (req, res) => {
    res.status(200).json({
        status: 'success',
        user: {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role,
        }
    });
});

module.exports = router;