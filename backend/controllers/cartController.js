const Cart = require('../models/Cart');

// Add to cart
const addToCart = async (req, res) => {
  try {
    const { produceId, quantity } = req.body;
    const buyerId = req.user.id;
    const cartItem = new Cart({
      buyer: buyerId,
      produce: produceId,
      quantity
    });
    await cartItem.save();
    res.status(201).json({ message: 'Added to cart', cartItem });
  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart', error: err.message });
  }
};

// Get user's cart
const getCartItems = async (req, res) => {
  try {
    const items = await Cart.find({ buyer: req.user.id }).populate('produce');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart items', error: err.message });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const itemId = req.params.id;
    await Cart.findByIdAndDelete(itemId);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing item', error: err.message });
  }
};

module.exports = {
  addToCart,
  getCartItems,
  removeFromCart
};
