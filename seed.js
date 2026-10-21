// seed.js
const mongoose = require('mongoose');
const Book = require('./models/Book');
const User = require('./models/User');
const Order = require('./models/Order');

const MONGO_URI = 'mongodb://127.0.0.1:27017/lumina_bookstore';

const sampleBooks = [
  // TECHNOLOGY (5)
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', price: 899, category: 'Technology', rating: 4.9, stock: 14, coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80' },
  { title: 'MongoDB: The Definitive Guide', author: 'Shannon Bradshaw', price: 650, category: 'Technology', rating: 4.8, stock: 3, coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80' },
  { title: 'Clean Code', author: 'Robert C. Martin', price: 599, category: 'Technology', rating: 4.7, stock: 18, coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80' },
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', price: 720, category: 'Technology', rating: 4.8, stock: 4, coverImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=500&q=80' },
  { title: 'Grokking Algorithms', author: 'Aditya Bhargava', price: 499, category: 'Technology', rating: 4.6, stock: 12, coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=80' },

  // SCI-FI (4)
  { title: 'Dune', author: 'Frank Herbert', price: 450, category: 'Sci-Fi', rating: 4.9, stock: 20, coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80' },
  { title: 'Project Hail Mary', author: 'Andy Weir', price: 499, category: 'Sci-Fi', rating: 4.9, stock: 2, coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80' },
  { title: 'The Three-Body Problem', author: 'Cixin Liu', price: 420, category: 'Sci-Fi', rating: 4.7, stock: 11, coverImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500&q=80' },
  { title: 'Neuromancer', author: 'William Gibson', price: 380, category: 'Sci-Fi', rating: 4.5, stock: 9, coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80' },

  // FICTION (4)
  { title: 'The Shadow of the Wind', author: 'Carlos Ruiz Zafón', price: 399, category: 'Fiction', rating: 4.8, stock: 8, coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&q=80' },
  { title: 'The Midnight Library', author: 'Matt Haig', price: 350, category: 'Fiction', rating: 4.4, stock: 15, coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80' },
  { title: 'Kafka on the Shore', author: 'Haruki Murakami', price: 460, category: 'Fiction', rating: 4.6, stock: 5, coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&q=80' },
  { title: 'The Alchemist', author: 'Paulo Coelho', price: 299, category: 'Fiction', rating: 4.7, stock: 25, coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&q=80' },

  // BUSINESS (3)
  { title: 'Zero to One', author: 'Peter Thiel', price: 420, category: 'Business', rating: 4.6, stock: 13, coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500&q=80' },
  { title: 'The Psychology of Money', author: 'Morgan Housel', price: 340, category: 'Business', rating: 4.8, stock: 3, coverImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=500&q=80' },
  { title: 'Shoe Dog', author: 'Phil Knight', price: 480, category: 'Business', rating: 4.8, stock: 10, coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&q=80' },

  // SELF-HELP (3)
  { title: 'Atomic Habits', author: 'James Clear', price: 450, category: 'Self-Help', rating: 4.9, stock: 19, coverImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&q=80' },
  { title: 'Deep Work', author: 'Cal Newport', price: 390, category: 'Self-Help', rating: 4.7, stock: 4, coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&q=80' },
  { title: 'Ikigai', author: 'Héctor García', price: 310, category: 'Self-Help', rating: 4.5, stock: 16, coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=500&q=80' },

  // HISTORY (3)
  { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', price: 550, category: 'History', rating: 4.8, stock: 11, coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&q=80' },
  { title: 'The Silk Roads', author: 'Peter Frankopan', price: 590, category: 'History', rating: 4.6, stock: 2, coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=80' },
  { title: 'The Anarchy', author: 'William Dalrymple', price: 620, category: 'History', rating: 4.7, stock: 7, coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&q=80' }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🌱 Connected to MongoDB for seeding...');

    // 1. Clear existing collections
    await Book.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});

    // 2. Attach sample embedded reviews to each book
    const booksWithReviews = sampleBooks.map(book => ({
      ...book,
      numReviews: 2,
      reviews: [
        { userName: 'Aarav Sharma', rating: 5, comment: 'Must-read! Super clear and insightful.' },
        { userName: 'Diya Nair', rating: Math.round(book.rating), comment: 'Great pacing and high quality edition.' }
      ]
    }));

    const insertedBooks = await Book.insertMany(booksWithReviews);
    console.log(`✅ Inserted ${insertedBooks.length} books with embedded reviews.`);

    // 3. Create Sample Users
    const users = await User.insertMany([
      { name: 'Rohan Verma', email: 'rohan@college.edu', role: 'customer', city: 'Bengaluru' },
      { name: 'Sneha Rao', email: 'sneha@college.edu', role: 'customer', city: 'Mysuru' },
      { name: 'Karthik Gowda', email: 'karthik@college.edu', role: 'admin', city: 'Bengaluru' }
    ]);
    console.log(`✅ Inserted ${users.length} users.`);

    // 4. Create Sample Orders referencing Users and Books (for Dashboard Charts)
    const sampleOrders = [
      {
        userId: users[0]._id,
        items: [
          { bookId: insertedBooks[0]._id, title: insertedBooks[0].title, quantity: 2, priceAtPurchase: insertedBooks[0].price },
          { bookId: insertedBooks[5]._id, title: insertedBooks[5].title, quantity: 1, priceAtPurchase: insertedBooks[5].price }
        ],
        totalAmount: (insertedBooks[0].price * 2) + insertedBooks[5].price
      },
      {
        userId: users[1]._id,
        items: [
          { bookId: insertedBooks[16]._id, title: insertedBooks[16].title, quantity: 3, priceAtPurchase: insertedBooks[16].price },
          { bookId: insertedBooks[14]._id, title: insertedBooks[14].title, quantity: 2, priceAtPurchase: insertedBooks[14].price }
        ],
        totalAmount: (insertedBooks[16].price * 3) + (insertedBooks[14].price * 2)
      },
      {
        userId: users[2]._id,
        items: [
          { bookId: insertedBooks[19]._id, title: insertedBooks[19].title, quantity: 2, priceAtPurchase: insertedBooks[19].price },
          { bookId: insertedBooks[1]._id, title: insertedBooks[1].title, quantity: 1, priceAtPurchase: insertedBooks[1].price }
        ],
        totalAmount: (insertedBooks[19].price * 2) + insertedBooks[1].price
      }
    ];

    await Order.insertMany(sampleOrders);
    console.log(`✅ Inserted ${sampleOrders.length} orders for analytics dashboard.`);

    console.log('🎉 Database seeding completed! Run "node server.js" to start.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedDatabase();