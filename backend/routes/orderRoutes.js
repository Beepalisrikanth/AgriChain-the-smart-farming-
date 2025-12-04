const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Produce = require('../models/Produce');
const verifyToken = require('../middleware/authMiddleware');
const {
  placeOrder,
  getOrders,
  updateOrderStatus,
  getMyOrders
} = require('../controllers/orderController');


// Create an order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { produce, quantity } = req.body;

    const order = await Order.create({
      produce,
      quantity,
      buyer: req.user.id,
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error placing order', error: err.message });
  }
});

// Get all orders for a buyer
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).populate('produce');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Farmer: Get orders for their produce
// router.get('/farmer-orders',verifyToken, async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate({
//         path: 'produce',
//         match: { postedBy: req.user.id }
//       })
//       .populate('buyer', 'name email');

//     const filtered = orders.filter(o => o.produce !== null);
//     res.json(filtered);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching farmer orders' });
//   }
// });

router.get('/farmer-orders', verifyToken, async (req, res) => {
  try {
    const produceItems = await Produce.find({ postedBy: req.user.id });
    const produceIds = produceItems.map(p => p._id);

    const orders = await Order.find({ produce: { $in: produceIds } })
      .populate('produce')
      .populate('buyer', 'name email');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching farmer orders', error: error.message });
  }
});

// Update order status (accept/reject)
// router.put('/:id/status', verifyToken, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ message: 'Error updating order' });
//   }
// });

// Update order status (only farmer)
router.put('/update-status/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    // Valid statuses
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findById(req.params.id).populate('produce');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Check if logged-in user is the farmer who owns the produce
    if (order.produce.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    order.status = status;
    await order.save();
    res.json({ message: `Order ${status} successfully`, order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
});

router.post('/',verifyToken, placeOrder);
router.get('/', getOrders);
router.put('/update-status/:id', verifyToken, updateOrderStatus);
router.get('/orders/my', verifyToken, getMyOrders);

module.exports = router;
