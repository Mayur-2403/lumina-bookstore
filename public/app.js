// public/app.js

let allBooks = [];
let cart = [];
let categoryChartInstance = null;
let ratingChartInstance = null;

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
  fetchBooks();
  fetchUsers();
  setupThemeToggle();
});

/* =========================================================
   1. NAVIGATION & DARK MODE TOGGLE
   ========================================================= */
function switchTab(tabName) {
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(`view-${tabName}`).classList.add('active');
  document.getElementById(`tab-${tabName}`).classList.add('active');

  if (tabName === 'dashboard') loadDashboardAnalytics();
  if (tabName === 'admin') fetchBooks();
}

function setupThemeToggle() {
  const btn = document.getElementById('themeToggle');
  btn.addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    btn.textContent = next === 'dark' ? '☀️' : '🌙';
  });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

/* =========================================================
   2. FETCH & RENDER BOOKS (STOREFRONT + ADMIN TABLE)
   ========================================================= */
async function fetchBooks() {
  const search = document.getElementById('searchInput').value;
  const category = document.getElementById('categoryFilter').value;
  const sort = document.getElementById('sortFilter').value;

  const params = new URLSearchParams({ search, category, sort });
  const res = await fetch(`/api/books?${params.toString()}`);
  allBooks = await res.json();

  renderStoreGrid(allBooks);
  renderAdminTable(allBooks);
}

function renderStoreGrid(books) {
  const grid = document.getElementById('booksGrid');
  if (books.length === 0) {
    grid.innerHTML = `<p>No books found matching your criteria.</p>`;
    return;
  }

  grid.innerHTML = books.map(book => `
    <div class="book-card">
      <div class="book-cover-wrap">
        <span class="category-tag">${book.category}</span>
        <img src="${book.coverImage}" alt="${book.title}" loading="lazy" />
      </div>
      <div class="book-body">
        <div class="book-title">${book.title}</div>
        <div class="book-author">by ${book.author}</div>
        <div style="font-size:0.8rem; color: ${book.stock <= 5 ? '#ef4444' : '#10b981'}; font-weight:600;">
          ${book.stock > 0 ? `${book.stock} in stock` : 'Out of Stock'}
        </div>
        <div class="book-meta">
          <span class="book-price">₹${book.price}</span>
          <span class="book-rating" onclick="openReviewModal('${book._id}')">
            ★ ${book.rating} (${book.numReviews})
          </span>
        </div>
        <div class="book-actions">
          <button class="btn-secondary" onclick="openReviewModal('${book._id}')">Reviews</button>
          <button class="btn-primary" ${book.stock === 0 ? 'disabled' : ''} onclick="addToCart('${book._id}')">
            ${book.stock === 0 ? 'Sold Out' : '+ Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/* =========================================================
   3. ADMIN CRUD OPERATIONS
   ========================================================= */
function renderAdminTable(books) {
  const tbody = document.getElementById('adminBooksTable');
  tbody.innerHTML = books.map(b => `
    <tr>
      <td><strong>${b.title}</strong><br><small>${b.author}</small></td>
      <td>${b.category}</td>
      <td>₹${b.price}</td>
      <td>${b.stock}</td>
      <td>
        <button class="btn-secondary" onclick="populateEditForm('${b._id}')">Edit</button>
        <button class="btn-danger" onclick="deleteBook('${b._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

async function handleBookSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('bookId').value;
  const payload = {
    title: document.getElementById('title').value,
    author: document.getElementById('author').value,
    price: Number(document.getElementById('price').value),
    stock: Number(document.getElementById('stock').value),
    category: document.getElementById('category').value,
    coverImage: document.getElementById('coverImage').value
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/books/${id}` : '/api/books';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    showToast(id ? 'Book updated in MongoDB!' : 'New book added to MongoDB!');
    resetBookForm();
    fetchBooks();
  }
}

function populateEditForm(bookId) {
  const book = allBooks.find(b => b._id === bookId);
  if (!book) return;
  document.getElementById('formTitle').textContent = 'Edit Book';
  document.getElementById('bookId').value = book._id;
  document.getElementById('title').value = book.title;
  document.getElementById('author').value = book.author;
  document.getElementById('price').value = book.price;
  document.getElementById('stock').value = book.stock;
  document.getElementById('category').value = book.category;
  document.getElementById('coverImage').value = book.coverImage;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetBookForm() {
  document.getElementById('formTitle').textContent = 'Add New Book';
  document.getElementById('bookId').value = '';
  document.getElementById('bookForm').reset();
}

async function deleteBook(bookId) {
  if (!confirm('Delete this book from MongoDB?')) return;
  const res = await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
  if (res.ok) {
    showToast('Book deleted!');
    fetchBooks();
  }
}

/* =========================================================
   4. EMBEDDED REVIEWS MODAL
   ========================================================= */
async function openReviewModal(bookId) {
  const res = await fetch(`/api/books/${bookId}`);
  const book = await res.json();

  document.getElementById('modalBookTitle').textContent = `${book.title} — Reviews`;
  document.getElementById('reviewBookId').value = book._id;

  const list = document.getElementById('modalReviewsList');
  if (!book.reviews || book.reviews.length === 0) {
    list.innerHTML = `<p>No reviews yet. Be the first to review!</p>`;
  } else {
    list.innerHTML = book.reviews.map(r => `
      <div class="review-item">
        <strong>${r.userName}</strong> — <span style="color:#f59e0b;">${'★'.repeat(r.rating)}</span>
        <p>${r.comment}</p>
      </div>
    `).join('');
  }

  document.getElementById('reviewModal').classList.add('open');
}

function closeReviewModal() {
  document.getElementById('reviewModal').classList.remove('open');
}

async function submitReview(e) {
  e.preventDefault();
  const bookId = document.getElementById('reviewBookId').value;
  const payload = {
    userName: document.getElementById('reviewUser').value,
    rating: Number(document.getElementById('reviewRating').value),
    comment: document.getElementById('reviewComment').value
  };

  const res = await fetch(`/api/books/${bookId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    document.getElementById('reviewForm').reset();
    showToast('Review embedded inside Book document!');
    openReviewModal(bookId);
    fetchBooks();
  }
}

/* =========================================================
   5. CART & ORDER CHECKOUT (REFERENCED USERS & BOOKS)
   ========================================================= */
async function fetchUsers() {
  const res = await fetch('/api/users');
  const users = await res.json();
  const select = document.getElementById('checkoutUserSelect');
  select.innerHTML = users.map(u => `<option value="${u._id}">${u.name} (${u.email})</option>`).join('');
}

function addToCart(bookId) {
  const book = allBooks.find(b => b._id === bookId);
  if (!book) return;

  const existing = cart.find(item => item.bookId === bookId);
  if (existing) {
    if (existing.quantity + 1 > book.stock) {
      showToast('Cannot exceed available stock!');
      return;
    }
    existing.quantity += 1;
  } else {
    cart.push({ bookId: book._id, title: book.title, price: book.price, quantity: 1 });
  }

  updateCartUI();
  showToast(`Added "${book.title}" to cart`);
}

function updateCartUI() {
  document.getElementById('cartCount').textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
  const container = document.getElementById('cartItemsContainer');
  if (cart.length === 0) {
    container.innerHTML = `<p>Your cart is empty.</p>`;
    document.getElementById('cartTotalAmount').textContent = '₹0';
    return;
  }

  let total = 0;
  container.innerHTML = cart.map((item, idx) => {
    total += item.price * item.quantity;
    return `
      <div class="cart-item">
        <div>
          <strong>${item.title}</strong><br/>
          <small>₹${item.price} × ${item.quantity}</small>
        </div>
        <button class="btn-danger" onclick="removeFromCart(${idx})">Remove</button>
      </div>
    `;
  }).join('');

  document.getElementById('cartTotalAmount').textContent = `₹${total}`;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function toggleCartModal() {
  document.getElementById('cartModal').classList.toggle('open');
  updateCartUI();
}

async function placeOrder() {
  if (cart.length === 0) return showToast('Your cart is empty!');
  const userId = document.getElementById('checkoutUserSelect').value;

  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, items: cart })
  });

  const data = await res.json();
  if (res.ok) {
    cart = [];
    updateCartUI();
    toggleCartModal();
    fetchBooks();
    showToast('Order placed! MongoDB stock updated.');
  } else {
    showToast(data.error || 'Order failed');
  }
}

/* =========================================================
   6. MONGODB AGGREGATION DASHBOARD & CHARTS
   ========================================================= */
async function loadDashboardAnalytics() {
  const res = await fetch('/api/dashboard');
  const data = await res.json();

  document.getElementById('kpiRevenue').textContent = `₹${data.totalRevenue.toLocaleString('en-IN')}`;
  document.getElementById('kpiOrders').textContent = data.totalOrders;
  document.getElementById('kpiLowStock').textContent = data.lowStockBooks.length;

  // Render Low Stock Table
  const lowBody = document.getElementById('lowStockTableBody');
  lowBody.innerHTML = data.lowStockBooks.map(b => `
    <tr>
      <td><strong>${b.title}</strong></td>
      <td>${b.category}</td>
      <td>₹${b.price}</td>
      <td><span style="color:#ef4444; font-weight:700;">${b.stock} left</span></td>
    </tr>
  `).join('');

  // Chart 1: Revenue by Category
  const catCtx = document.getElementById('categorySalesChart').getContext('2d');
  if (categoryChartInstance) categoryChartInstance.destroy();
  categoryChartInstance = new Chart(catCtx, {
    type: 'bar',
    data: {
      labels: data.salesByCategory.map(c => c._id),
      datasets: [{
        label: 'Revenue (₹)',
        data: data.salesByCategory.map(c => c.categoryRevenue),
        backgroundColor: ['#4f46e5', '#7c3aed', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'],
        borderRadius: 8
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  // Chart 2: Top Rated Books
  const rateCtx = document.getElementById('topRatedChart').getContext('2d');
  if (ratingChartInstance) ratingChartInstance.destroy();
  ratingChartInstance = new Chart(rateCtx, {
    type: 'bar',
    data: {
      labels: data.topRatedBooks.map(b => b.title.slice(0, 22)),
      datasets: [{
        label: 'Avg Rating ★',
        data: data.topRatedBooks.map(b => b.rating),
        backgroundColor: '#10b981',
        borderRadius: 8
      }]
    },
    options: {
      indexAxis: 'y',
      scales: { x: { min: 0, max: 5 } },
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}