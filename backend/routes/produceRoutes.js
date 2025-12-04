const express = require('express');
const router = express.Router();
const Produce = require('../models/Produce');
const verifyToken = require('../middleware/authMiddleware');
const {isAdmin} = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // ✅

const { createProduce, getAllProduces,getMyProduce, getAllProduceAdmin,updateProduceStatus} = require('../controllers/produceController');

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const deleted = await Produce.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Produce not found" });
    res.status(200).json({ message: "Produce deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
});




router.get('/my', verifyToken, getMyProduce);

router.post('/', verifyToken, upload.single('image'), createProduce);

// 🔍 Get specific produce
router.get('/:id', async (req, res) => {
  try {
    const produce = await Produce.findById(req.params.id).populate('postedBy', 'name email');
    if (!produce) return res.status(404).json({ message: 'Produce not found' });
    res.json(produce);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching produce details' });
  }
});

router.get('/', verifyToken, getAllProduceAdmin);

// In produceRoutes.js
router.get("/all",verifyToken, getAllProduces);

router.put('/admin/update/:id', verifyToken, updateProduceStatus);


module.exports = router;
