const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// const PORT = process.env.PORT || 5000;

dotenv.config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const produceRoutes = require('./routes/produceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const cartRoutes = require('./routes/cartRoutes');
const contractRoutes = require('./routes/contractRoutes');

const app = express();

app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Connect DB
connectDB();

// Allow CORS
// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true
// }));

// 👇 Move this BELOW webhook
//  app.use(express.json()); // ✅ correct placement

// ✅ Use normal middleware only
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/user', profileRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/contracts', contractRoutes);




// Dummy Route
app.get('/', (req, res) => {
  res.send('Welcome to AGRICHAIN API');
});

// Start server
const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
