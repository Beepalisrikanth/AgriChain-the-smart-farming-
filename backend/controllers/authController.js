const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// glts mqyw wrgq whoj

// Register a new user
const register = async (req, res) => {
  const { name, email, phone, password, role, location } = req.body;
  if (!name || !email || !phone || !password || !role || !location) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already exists' });
    // ✅ Create user object (DON’T manually hash password)
    const newUser = new User({
      name,
      email,
      phone,
      role,
      location,
      password, // raw password — will be hashed by pre-save hook
    });
    // ✅ Save (this triggers userSchema.pre("save"))
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid password' });
    const token = jwt.sign({ id: user._id , role: user.role}, process.env.JWT_SECRET, { expiresIn: '5h' });
    // const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    //   expiresIn: '3d',
    // });
    res.status(200).json({ message: 'Login success', token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Generate token + send email
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
    // const resetLink = `${FRONTEND_URL}/reset_password.html?token=${resetToken}`;

    const resetLink = `http://localhost:3000/reset_password.html?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "beepalisrikanth@gmail.com", // replace
        pass: "glts mqyw wrgq whoj" // replace
      }
    });

    await transporter.sendMail({
      from: "AgriChain <your-email@gmail.com>",
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click the link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
    });

    res.json({ message: "Reset link sent to your email." });
  } catch (err) {
    res.status(500).json({ message: "Error sending reset link", error: err.message });
  }
};


exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  console.log("Received token:", token);
  console.log("Token from URL:", token);

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) {
    console.log("No user found with valid token");
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  // Hash the new password before saving!
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
};

module.exports = {
  register,
  login,
  forgotPassword: exports.forgotPassword,
  resetPassword: exports.resetPassword
};

