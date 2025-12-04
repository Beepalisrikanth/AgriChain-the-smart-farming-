const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getProfile } = require('../controllers/profileController');
const isAdmin = require('../middleware/authMiddleware')

router.get('/profile', verifyToken, getProfile);    //verified


router.put('/users/:id/verify', verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User verified', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify user', error: error.message });
  }
});



router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});




module.exports = router;
