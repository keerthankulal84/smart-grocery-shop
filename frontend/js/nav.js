// Renders the shared header into #site-header on every page, and keeps
// cart count / login state in sync.
function renderHeader(activePage = '') {
  const header = document.getElementById('site-header');
  if (!header) return;

  const user = getUser();
  const loggedIn = isLoggedIn();

  header.innerHTML = `
    <div class="nav-wrap">
      <a href="index.html" class="brand">
        <span class="brand-mark">🌿</span> FreshCart
      </a>
      <nav class="nav-links">
        <a href="index.html" class="${activePage === 'home' ? 'active' : ''}">Shop</a>
        ${loggedIn ? `<a href="orders.html" class="${activePage === 'orders' ? 'active' : ''}">My Orders</a>` : ''}
        ${loggedIn && user?.role === 'admin' ? `<a href="admin.html" class="${activePage === 'admin' ? 'active' : ''}">Admin</a>` : ''}
      </nav>
      <div class="nav-actions">
        <a href="cart.html" class="cart-link ${activePage === 'cart' ? 'active' : ''}">
          🛒 <span id="cart-badge" class="cart-badge" style="display:none">0</span>
        </a>
        ${loggedIn
          ? `<span class="nav-user">Hi, ${user?.name?.split(' ')[0] || 'there'}</span>
             <button id="logout-btn" class="btn btn-ghost btn-sm">Log out</button>`
          : `<a href="login.html" class="btn btn-primary btn-sm">Log in</a>`
        }
      </div>
    </div>
  `;

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearToken();
      showToast('Logged out');
      setTimeout(() => (window.location.href = 'index.html'), 500);
    });
  }

  if (loggedIn) updateCartBadge();
}

async function updateCartBadge() {
  try {
    const { cart } = await apiRequest('/cart');
    const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (err) {
    // silent fail (e.g. not logged in) - badge just stays hidden
  }
}

// Guards a page so only logged-in users can view it
function requireLogin() {
  if (!isLoggedIn()) {
    showToast('Please log in first', 'error');
    setTimeout(() => (window.location.href = 'login.html'), 800);
    return false;
  }
  return true;
}

function requireAdmin() {
  if (!isLoggedIn() || !isAdmin()) {
    showToast('Admin access required', 'error');
    setTimeout(() => (window.location.href = 'index.html'), 800);
    return false;
  }
  return true;
}
