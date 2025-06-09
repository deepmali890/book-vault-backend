const express = require('express');
const protect = require('../middlewares/authMiddleware');
const addToCartController = require('../controllers/cart.controller');

const router = express.Router();

router.post('/add', protect, addToCartController.addToCart)
router.get('/', protect, addToCartController.getCart)
router.put('/update', protect, addToCartController.updateCartItem)
router.delete('/remove/:bookId', protect, addToCartController.removeCartItem)
router.delete('/clear', protect, addToCartController.clearCart)

module.exports = router;