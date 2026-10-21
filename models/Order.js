// models/Order.js
const mongoose = require('mongoose');

// Order Schema using REFERENCING (ObjectId) to link Users and Books
const orderSchema = new mongoose.Schema({
  // Reference to the User who placed the order
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [
    {
      // Reference to the Book document
      bookId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Book', 
        required: true 
      },
      // Snapshot fields: kept so historical receipts don't change if book price changes later
      title: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      priceAtPurchase: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Completed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);