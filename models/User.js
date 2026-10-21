// models/User.js
const mongoose = require('mongoose');

// Standalone collection for Users. Referenced in Orders.
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  city: { type: String, default: 'Bengaluru' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);