// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const Book = require('./models/Book');
const User = require('./models/User');
const Order = require('./models/Order');

const app = express();
const PORT = 3000;
const MONGO_URI = 'mongodb://127.0.0.1:27017/lumina_bookstore';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to local MongoDB Community Server
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB: lumina_bookstore'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

/* =========================================================
   1. BOOK CRUD, SEARCH, FILTER & SORT ROUTES
   ========================================================= */

// GET all books (Supports Search, Category Filter, and Sort by Price/Rating)
app.get('/api/books', async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = {};

    // Search by title or author using case-insensitive Regex
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search,$options: 'i' } },
        { author: { $regex: search,$options: 'i' } }
      ];
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Sort configuration
    let sortOption = { createdAt: -1 }; // Default: Newest first
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating_desc') sortOption = { rating: -1 };

    const books = await Book.find(query).sort(sortOption);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single book by ID (includes embedded reviews)
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new book
app.post('/api/books', async (req, res) => {
  try {
    const newBook = new Book(req.body);
    const saved = await newBook.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update an existing book
app.put('/api/books/:id', async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Book not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a book
app.delete('/api/books/:id', async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================
   2. EMBEDDED REVIEWS ROUTE
   ========================================================= */

// POST add an embedded review to a book & recalculate average rating
app.post('/api/books/:id/reviews', async (req, res) => {
  try {
    const { userName, rating, comment } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    // Push new review into the embedded array
    book.reviews.push({ userName, rating: Number(rating), comment });

    // Recalculate book rating and review count dynamically
    book.numReviews = book.reviews.length;
    const totalRating = book.reviews.reduce((acc, item) => acc + item.rating, 0);
    book.rating = Number((totalRating / book.numReviews).toFixed(1));

    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* =========================================================
   3. USERS & ORDERS ROUTES (REFERENCING)
   ========================================================= */

// GET all sample users (for checkout dropdown)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST place an order and decrement book stock
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Validate stock and decrement for each purchased book
    for (const item of items) {
      const book = await Book.findById(item.bookId);
      if (!book) {
        return res.status(404).json({ error: `Book not found: ${item.title}` });
      }
      if (book.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for "${book.title}". Only ${book.stock} left.` });
      }

      // Decrement stock in MongoDB
      book.stock -= item.quantity;
      await book.save();

      totalAmount += book.price * item.quantity;
      orderItems.push({
        bookId: book._id,
        title: book.title,
        quantity: item.quantity,
        priceAtPurchase: book.price
      });
    }

    const order = await Order.create({
      userId,
      items: orderItems,
      totalAmount: Number(totalAmount.toFixed(2))
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* =========================================================
   4. MONGODB AGGREGATION PIPELINE DASHBOARD ROUTE
   ========================================================= */

app.get('/api/dashboard', async (req, res) => {
  try {
    // PIPELINE 1: Total Revenue & Total Orders Count
    const overallSales = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // PIPELINE 2: Sales & Units Sold Per Book Category (Uses $unwind and$lookup)
    const salesByCategory = await Order.aggregate([
      { $unwind: '$items' }, // Deconstruct items array into individual documents
      {
        $lookup: {           // Join with 'books' collection to get book category
          from: 'books',
          localField: 'items.bookId',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      { $unwind: '$bookDetails' },
      {
        $group: {
          _id: '$bookDetails.category',
          categoryRevenue: {
            $sum: {$multiply: ['$items.quantity', '$items.priceAtPurchase'] }
          },
          unitsSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { categoryRevenue: -1 } }
    ]);

    // PIPELINE 3: Top 5 Highest Rated Books
    const topRatedBooks = await Book.aggregate([
      { $match: { rating: { $gte: 4.0 } } }, {$sort: { rating: -1, numReviews: -1 } },
      { $limit: 5 }, {$project: {
          title: 1,
          author: 1,
          category: 1,
          rating: 1,
          numReviews: 1,
          price: 1
        }
      }
    ]);

    // PIPELINE 4: Low Stock Alerts (Stock <= 5)
    const lowStockBooks = await Book.aggregate([
      { $match: { stock: {$lte: 5 } } },
      { $sort: { stock: 1 } }, {$project: {
          title: 1,
          category: 1,
          stock: 1,
          price: 1
        }
      }
    ]);

    res.json({
      totalRevenue: overallSales[0]?.totalRevenue || 0,
      totalOrders: overallSales[0]?.totalOrders || 0,
      salesByCategory,
      topRatedBooks,
      lowStockBooks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Lumina Books running at http://localhost:${PORT}`);
});