const Cart = require("../models/cart.model");

exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookId, quantity } = req.body;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: [{ book: bookId, quantity }]
            })
        } else {
            const index = cart.items.findIndex(item => item.book.toString() == bookId);

            if (index > -1) {
                cart.items[index].quantity += quantity;
            } else {
                cart.items.push({ book: bookId, quantity });
            }
            await cart.save();
        }
        res.status(200).json({ message: "Book added to cart", success: true, data: cart });


    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({ message: "Server error while adding book to cart" });
    }
}

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.book");
        res.status(200).json({ success: true, cart });

    } catch (error) {
        res.status(500).json({ message: "Server error while getting cart" });
    }
}

exports.updateCartItem = async (req, res) => {
    try {
        const { bookId, quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user._id });

        const index = cart.items.findIndex(item => item.book.toString() === bookId);
        if (index === -1) return res.status(404).json({ message: "Book not in cart" });

        cart.items[index].quantity = quantity;
        await cart.save();

        res.status(200).json({ message: "Cart item updated", success: true, data: cart });

    } catch (error) {
        res.status(500).json({ message: "Error while updating cart item" });
    }
}

exports.removeCartItem = async (req, res) => {
    try {
        const { bookId } = req.params;
        const cart = await Cart.findOne({ user: req.user._id })

        cart.items = cart.items.filter(item => item.book.toString() !== bookId);
        await cart.save();
        res.status(200).json({ success: true, cart });

    } catch (error) {
        res.status(500).json({ message: "Error while removing book from cart" });
    }
}

exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        cart.items = [];
        await cart.save();
        res.status(200).json({ success: true, cart });

    } catch (error) {
        res.status(500).json({ message: "Error while clearing cart" });
        console.log(error)
    }
}