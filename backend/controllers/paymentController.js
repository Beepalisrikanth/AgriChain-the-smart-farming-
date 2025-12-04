const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Only works if .env is loaded properly
const Order = require('../models/Order'); 
// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;


const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");




const createCheckoutSession = async (req, res) => {
  const { title, price, quantity, produce, buyer  } = req.body;

  console.log("🚀 Checkout request body:", req.body); // Add this log
  
//   if (!produceId || !buyerId) {
//   console.error("❌ Missing buyerId or produceId in request body");
//   return res.status(400).json({ error: "Missing buyerId or produceId" });
// }


  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: { name: title },
            unit_amount: (price + 20 + 30) * 100, // in paise
          },
          quantity,
        },
      ],
      metadata: {
          produce: String(produce),
          buyer: String(buyer),
          quantity: String(quantity)
      },
      success_url: `${process.env.FRONTEND_URL}/buyers/success.html`,
      cancel_url: `${process.env.FRONTEND_URL}/buyers/cancel.html`
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe Session Error:", err.message);
    res.status(500).json({ error: 'Failed to create session' });
  }

};




const stripeWebhook = async (req, res) => {
  console.log("👉 Stripe webhook triggered");
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("✅ Webhook verified");
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata;
    console.log("📦 Metadata:", metadata); 

    try {
      await Order.create({
        produce: metadata.produce,
        buyer: metadata.buyer,
        quantity: metadata.quantity,
        amount: session.amount_total / 100,
        currency: session.currency,
        paymentMethod: session.payment_method_types?.[0] || 'card',
        receiptUrl: session.receipt_url || '',
        status: 'pending',
      });
      console.log("✅ Order created successfully");
    } catch (err) {
      console.error("❌ Error saving order:", err.message);
    }
  }

  res.status(200).json({ received: true });
};



const generateInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId)
      .populate("buyer")
      .populate("produce");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `../invoices/invoice_${orderId}.pdf`);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text("🧾 AgriChain Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.text(`Buyer: ${order.buyer.name} (${order.buyer.email})`);
    doc.moveDown();

    // Produce Info
    doc.fontSize(14).text("Produce Purchased:");
    doc.fontSize(12).text(`• Title: ${order.produce.title}`);
    doc.text(`• Quantity: ${order.quantity} kg`);
    doc.text(`• Price per Kg: ₹${order.produce.pricePerKg}`);
    const quantityNumber = parseFloat(order.quantity);
    const total = quantityNumber * order.produce.pricePerKg;
    doc.text(`• Total: ₹${total}`);
    doc.moveDown();
    doc.text(`Payment Method: ${order.paymentMethod || "Card"}`);
    doc.text(`Status: Paid`);

    doc.end();

    stream.on("finish", () => {
      res.download(filePath, `invoice_${orderId}.pdf`);
    });

  } catch (err) {
    console.error("Invoice error:", err);
    res.status(500).json({ message: "Could not generate invoice" });
  }
};




module.exports = { 
    createCheckoutSession,
    stripeWebhook,
    generateInvoice
};
