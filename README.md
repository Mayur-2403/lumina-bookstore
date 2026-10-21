# 📚 Lumina Bookstore

A full-stack online bookstore built with Node.js, Express.js, MongoDB, Mongoose, HTML, CSS, and JavaScript.

## Features

- Book search, filtering, and sorting
- Embedded reviews stored within book documents
- Customer and administrator records
- Order management and stock updates
- Book CRUD operations
- Analytics dashboard using MongoDB aggregation and Chart.js

## Technologies

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js and Express.js
- Database: MongoDB
- ODM: Mongoose
- Charts: Chart.js

## Project Structure

```text
lumina-bookstore/
├── models/
│   ├── Book.js
│   ├── User.js
│   └── Order.js
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── server.js
├── seed.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Requirements

Install Node.js, npm, and MongoDB Community Server. MongoDB Compass is optional for viewing database collections.

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Mayur-2403/lumina-bookstore.git
cd lumina-bookstore
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start MongoDB

Make sure your local MongoDB server is running. The default local connection URI is:

`mongodb://127.0.0.1:27017`

### 4. Seed the database

```bash
node seed.js
```

This inserts the sample data defined in the seed script.

### 5. Start the application

```bash
node server.js
```

Open http://localhost:3000 in your browser.

## Database Design

The database is named `lumina_bookstore`.

- **Books:** Book details and embedded reviews.
- **Users:** Customer and administrator records.
- **Orders:** References to users and books using MongoDB ObjectIds.

## Testing

- Search for a book or author.
- Filter books and sort by price.
- Add a review and inspect the book document in MongoDB Compass.
- Place an order and verify stock updates.
- View the analytics dashboard.
- Add, edit, or delete a book.

## Security

Never commit database passwords, API keys, or private credentials. Keep `.env` files excluded from Git.

## Author

Mayur

NoSQL College Project — Lumina Bookstore.
