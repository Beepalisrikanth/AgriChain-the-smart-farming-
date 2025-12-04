const Order = require('../models/Order');

// Place a new order
const placeOrder = async (req, res) => {
  try {
    const { produceId, quantity } = req.body;
    const newOrder = new Order({
      produce: produceId, 
      buyer: req.user.id,
      quantity,
      status: 'accepted'
    });
    const savedOrder = await newOrder.save();
    await savedOrder.populate('produce','buyer', 'name email'); // ✅ populate produce
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error placing order', error: error.message });
  }
};

// Get all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('produce')
      .populate('buyer', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('produce');
    res.json({ message: `Order ${status} successfully`, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

const getMyOrders = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  try {
    const query = role === 'buyer'
      ? { buyer: userId }
      : role === 'farmer'
      ? { seller: userId }
      : {}; // Admin could see all
    const orders = await Order.find(query)
      .populate('produce')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};


module.exports = {
  placeOrder,
  getOrders,
  updateOrderStatus,
  getMyOrders
};
