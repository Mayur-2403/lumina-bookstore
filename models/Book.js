// models/Book.js
const mongoose = require('mongoose');

// 1. EMBEDDED SCHEMA: Reviews live directly inside the Book document
// Why Embed? Because reviews are read alongside the book 99% of the time.
const reviewSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 2. MAIN BOOK SCHEMA
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { 
    type: String, 
    required: true,
    enum: ['Technology', 'Sci-Fi', 'Fiction', 'Business', 'Self-Help', 'History']
  },
  stock: { type: Number, required: true, min: 0, default: 10 },
  coverImage: { type: String, required: true },
  // Pre-computed average rating for fast sorting without re-aggregating every time
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema] // Array of embedded review sub-documents
}, { timestamps: true });

// Create a text index for fast search on title and author
bookSchema.index({ title: 'text', author: 'text' });

module.exports = mongoose.model('Book', bookSchema);