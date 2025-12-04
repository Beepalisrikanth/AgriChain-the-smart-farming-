const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Produce = require('../models/Produce');
const Contract = require('../models/Contract');

const groupBySeller = async (items) => {
  const grouped = {};

  for (let item of items) {
    const produce = await Produce.findById(item.produce).populate('postedBy');
    const seller = produce.postedBy;

    if (!grouped[seller._id]) {
      grouped[seller._id] = {
        seller,
        items: []
      };
    }

    grouped[seller._id].items.push({
      name: produce.name,
      quantity: item.quantity,
      price: produce.price
    });
  }

  return grouped;
};

const generatePDF = async ({ seller, buyer, items }) => {
  const doc = new PDFDocument();
  const filename = `Contract_${seller.name}_${Date.now()}.pdf`;
  const contractDir = path.join(__dirname, '../contracts');
  if (!fs.existsSync(contractDir)) fs.mkdirSync(contractDir);
  const filePath = path.join(contractDir, filename);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(12).text(`
Seller's Name: ${seller.name}
Seller's Address: ${seller.address || 'N/A'}

Buyer's Name: ${buyer.name}
Buyer's Address: ${buyer.address || 'N/A'}

This agreement is made on ${new Date().toDateString()}.

Crop Details:
${items.map(i => `- ${i.name} | Qty: ${i.quantity} | Price: ₹${i.price}`).join('\n')}

Total Amount: ₹${totalAmount}

Terms:
- As per Indian Contract Act, 1872
- Seller guarantees crops are in good condition
- Buyer has verified the quality
- Disputes subject to Indian courts

Signatures:
Seller: __________________
Buyer: __________________
Date: ${new Date().toDateString()}
  `);
  doc.end();

  return { filePath, totalAmount };
};

exports.createContracts = async (req, res) => {
  try {
    const { orderId, buyerId, items } = req.body;

    const buyer = await User.findById(buyerId);
    const sellersData = await groupBySeller(items);
    const contractPaths = [];

    for (let sellerId in sellersData) {
      const { seller, items } = sellersData[sellerId];
      const { filePath, totalAmount } = await generatePDF({ seller, buyer, items });

      const contract = new Contract({
        buyer: buyer._id,
        seller: seller._id,
        items,
        totalAmount,
        filePath
      });

      await contract.save();
      contractPaths.push({ seller: seller.name, path: filePath });
    }

    res.status(200).json({ message: 'Contracts created successfully', contracts: contractPaths });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating contracts' });
  }
};
