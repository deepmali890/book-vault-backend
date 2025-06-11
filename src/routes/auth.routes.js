const express = require('express');
const authController = require('../controllers/auth.controller');
const protect = require('../middlewares/authMiddleware');
const fileHandle = require('../middlewares/multer');
const User = require('../models/auth.model');

const router = express.Router();

// PUBLIC ROUTES
// Register routes
router.post('/public-register', authController.register);
router.get('/verify-email', authController.verifyEmail);

// Auth routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Token verification route - PUBLIC (no protect middleware needed)
router.get('/verify', authController.verifyToken);

// Password reset routes
router.post('/verify-reset-otp', authController.verifyResetOTP);
router.post('/reset-password', authController.resetPassword);

// PROTECTED ROUTES (require authentication)
// Admin register route - PROTECTED
router.post('/admin-register', protect, authController.register);

// Password reset - PROTECTED (user must be logged in to request OTP)
router.post('/send-reset-otp', protect, authController.sendResetOtp);

// Profile management - PROTECTED
router.put('/edit-profile', protect, fileHandle, authController.updateProfile);

// User data - PROTECTED
router.get('/user/:id', protect, authController.getUserById);

// Optional: Get current user info - PROTECTED
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found', 
                success: false 
            });
        }
        
        res.status(200).json({
            message: 'User data retrieved successfully',
            user: {
                userId: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                isVerified: user.isVerified
            },
            success: true
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            success: false 
        });
    }
});

module.exports = router;