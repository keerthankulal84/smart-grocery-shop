let currentCategory = '';

async function loadCategories() {
  try {
    const { categories } = await apiRequest('/products/categories', { auth: false });
    const wrap = document.getElementById('category-chips');
    if (!wrap) return;
    wrap.innerHTML = `<div class="chip active" data-cat="">All</div>` +
      categories.map((c) => `<div class="chip" data-cat="${c}">${c}</div>`).join('');

    wrap.querySelectorAll('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        wrap.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        currentCategory = chip.dataset.cat;
        loadProducts();
      });
    });
  } catch (err) {
    console.error('Failed to load categories', err);
  }
}

async function loadProducts() {
  const grid = document.getElementById('product-grid');
  const search = document.getElementById('search-input')?.value.trim() || '';
  grid.innerHTML = '<p>Loading products...</p>';

  try {
    const params = new URLSearchParams();
    if (currentCategory) params.set('category', currentCategory);
    if (search) params.set('search', search);

    const { products } = await apiRequest(`/products?${params.toString()}`, { auth: false });

    if (products.length === 0) {
      grid.innerHTML = `<div class="empty-state"><div class="icon">🔍</div><p>No products found.</p></div>`;
      return;
    }

    grid.innerHTML = products.map(renderProductCard).join('');

    grid.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
      btn.addEventListener('click', () => addProductToCart(btn.dataset.id));
    });
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><p>Could not load products. Is the backend running?</p></div>`;
    console.error(err);
  }
}

function renderProductCard(p) {
  const stockNote = p.stock === 0
    ? '<span class="stock-out">Out of stock</span>'
    : p.stock <= 5
      ? `<span class="stock-low">Only ${p.stock} left</span>`
      : '';

  return `
    <div class="product-card">
      <div class="product-image">
        ${p.image ? `<img src="${p.image}" alt="${p.name}" loading="lazy">` : '🛒'}
      </div>
      <div class="product-body">
        <span class="product-category">${p.category}</span>
        <span class="product-name">${p.name}</span>
        <span class="product-unit">${p.unit}</span>
        ${stockNote}
        <div class="product-footer">
          <span class="product-price">${formatPrice(p.price)}</span>
          <button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${p._id}" ${p.stock === 0 ? 'disabled' : ''}>
            + Add
          </button>
        </div>
      </div>
    </div>
  `;
}

async function addProductToCart(productId) {
  if (!isLoggedIn()) {
    showToast('Please log in to add items to your cart', 'error');
    setTimeout(() => (window.location.href = 'login.html'), 800);
    return;
  }
  try {
    await apiRequest('/cart', { method: 'POST', body: { productId, quantity: 1 } });
    showToast('Added to cart');
    updateCartBadge();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Debounced search-as-you-type
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search-input');
  if (input) {
    let timeout;
    input.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(loadProducts, 400);
    });
  }
});
