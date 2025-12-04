// const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
// const storage = require("../config/firebase");
// const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const Produce = require('../models/Produce');

// Setup multer
const upload = multer({ storage: multer.memoryStorage() });

// Middleware export
exports.uploadMiddleware = upload.single("image");

// Create a new produce
const createProduce = async (req, res) => {
  try {
    const { title, quantity, pricePerKg, location } = req.body;
    // const image = req.file ? req.file.path : null;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const newProduce = new Produce({
      title,
      quantity,
      pricePerKg,
      location,
      image, // this will store relative path
      postedBy: req.user.id
    });
    const savedProduce = await newProduce.save();
    res.status(201).json(savedProduce);
  } catch (error) {
    res.status(500).json({ message: 'Error posting produce', error: error.message });
  }
};


const getAllProduces = async (req, res) => {
  try {
    const produceList = await Produce.find() 
    .select('title quantity pricePerKg location image isApproved isRejected rejectionReason')
    .populate('postedBy', 'name email phone');
    res.json(produceList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all produce', error: error.message });
  }
};

const getAllProduceAdmin = async (req, res) => {
  try {
    const produceList = await Produce.find() 
    .select('title quantity pricePerKg location image isApproved isRejected rejectionReason')
    .populate('postedBy', 'name email phone');
    res.json(produceList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all produce', error: error.message });
  }
};


const getMyProduce = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Missing user ID." });
    }
    const userId = req.user.id;
    const produce = await Produce.find({ postedBy: userId })
    .select('title quantity pricePerKg location image isApproved isRejected rejectionReason')
    .populate('postedBy', 'name email');
    return res.status(200).json(produce);
  } catch (error) {
    console.error("🔥 Error fetching produce:", error);
    return res.status(500).json({
      message: "Error fetching produce details",
      error: error.message
    });
  }
};

const updateProduceStatus = async (req, res) => {
  try {
    const { isApproved, isRejected, rejectionReason } = req.body;
    const produceId = req.params.id;
    const updateData = {
      isApproved,
      isRejected,
      rejectionReason: isRejected ? rejectionReason : ""
    };
    const updatedProduce = await Produce.findByIdAndUpdate(
      produceId,
      updateData,
      { new: true }
    );
    if (!updatedProduce) {
      return res.status(404).json({ message: "Produce not found" });
    }
    res.json({ message: "Produce updated", produce: updatedProduce });
  } catch (error) {
    res.status(500).json({ message: "Error updating produce", error: error.message });
  }
};








module.exports = {
    createProduce,        //farmer
    getAllProduces,       //buyer
    getAllProduceAdmin,  //admin
    getMyProduce,         //farmer
    updateProduceStatus    // isApproved, isRejected, rejectionReason for produce
};
