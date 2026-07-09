// ===== Tab switching =====
document.querySelectorAll('.admin-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-products').style.display = tab.dataset.tab === 'products' ? 'block' : 'none';
    document.getElementById('tab-orders').style.display = tab.dataset.tab === 'orders' ? 'block' : 'none';
    if (tab.dataset.tab === 'orders') loadAdminOrders();
  });
});

// ===== Products =====
async function loadAdminProducts() {
  const tbody = document.getElementById('products-tbody');
  try {
    const { products } = await apiRequest('/products?limit=200');
    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">No products yet. Add your first one.</td></tr>';
      return;
    }
    tbody.innerHTML = products.map((p) => `
      <tr>
        <td>${p.image ? `<img src="${p.image}" alt="${p.name}">` : '—'}</td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>${formatPrice(p.price)}</td>
        <td>${p.stock}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick='openEditModal(${JSON.stringify(p).replace(/'/g, "&#39;")})'>Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p._id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">Failed to load: ${err.message}</td></tr>`;
  }
}

const productModal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');

document.getElementById('add-product-btn').addEventListener('click', () => {
  document.getElementById('modal-title').textContent = 'Add Product';
  productForm.reset();
  document.getElementById('product-id').value = '';
  productModal.classList.add('show');
});

document.getElementById('modal-close-btn').addEventListener('click', () => {
  productModal.classList.remove('show');
});

function openEditModal(product) {
  document.getElementById('modal-title').textContent = 'Edit Product';
  document.getElementById('product-id').value = product._id;
  document.getElementById('p-name').value = product.name;
  document.getElementById('p-category').value = product.category;
  document.getElementById('p-price').value = product.price;
  document.getElementById('p-unit').value = product.unit || '';
  document.getElementById('p-stock').value = product.stock;
  document.getElementById('p-image').value = product.image || '';
  document.getElementById('p-description').value = product.description || '';
  productModal.classList.add('show');
}

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const payload = {
    name: document.getElementById('p-name').value.trim(),
    category: document.getElementById('p-category').value.trim(),
    price: Number(document.getElementById('p-price').value),
    unit: document.getElementById('p-unit').value.trim() || '1 pc',
    stock: Number(document.getElementById('p-stock').value),
    image: document.getElementById('p-image').value.trim(),
    description: document.getElementById('p-description').value.trim()
  };

  try {
    if (id) {
      await apiRequest(`/products/${id}`, { method: 'PUT', body: payload });
      showToast('Product updated');
    } else {
      await apiRequest('/products', { method: 'POST', body: payload });
      showToast('Product added');
    }
    productModal.classList.remove('show');
    loadAdminProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

async function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try {
    await apiRequest(`/products/${id}`, { method: 'DELETE' });
    showToast('Product deleted');
    loadAdminProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===== Orders =====
async function loadAdminOrders() {
  const tbody = document.getElementById('orders-tbody');
  try {
    const { orders } = await apiRequest('/orders/admin/all');
    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">No orders yet.</td></tr>';
      return;
    }
    const statuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];
    tbody.innerHTML = orders.map((o) => `
      <tr>
        <td>#${o._id.slice(-6).toUpperCase()}</td>
        <td>${o.user?.name || 'Unknown'}<br><span style="color:var(--text-muted); font-size:0.8rem;">${o.user?.email || ''}</span></td>
        <td>${formatPrice(o.totalAmount)}</td>
        <td><span class="badge badge-${o.paymentStatus}">${o.paymentStatus}</span></td>
        <td><span class="badge badge-${o.orderStatus}">${o.orderStatus}</span></td>
        <td>
          <select onchange="updateOrderStatus('${o._id}', this.value)">
            ${statuses.map((s) => `<option value="${s}" ${s === o.orderStatus ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">Failed to load: ${err.message}</td></tr>`;
  }
}

async function updateOrderStatus(orderId, orderStatus) {
  try {
    await apiRequest(`/orders/${orderId}/status`, { method: 'PUT', body: { orderStatus } });
    showToast('Order status updated');
  } catch (err) {
    showToast(err.message, 'error');
  }
}
