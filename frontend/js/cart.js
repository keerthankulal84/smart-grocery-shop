async function loadCart() {
  const layout = document.getElementById('cart-layout');
  try {
    const { cart } = await apiRequest('/cart');

    if (cart.items.length === 0) {
      layout.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="icon">🛒</div>
          <p>Your cart is empty.</p>
          <a href="index.html" class="btn btn-primary" style="margin-top:12px;">Start shopping</a>
        </div>`;
      return;
    }

    const itemsHtml = cart.items.map((item) => {
      const p = item.product;
      return `
        <div class="cart-item" data-id="${p._id}">
          <img src="${p.image || ''}" alt="${p.name}">
          <div class="cart-item-info">
            <div class="cart-item-name">${p.name}</div>
            <div class="cart-item-price">${formatPrice(p.price)} &times; ${item.quantity}</div>
            <span class="remove-link" onclick="removeItem('${p._id}')">Remove</span>
          </div>
          <div class="qty-stepper">
            <button onclick="changeQty('${p._id}', ${item.quantity - 1})">&minus;</button>
            <span>${item.quantity}</span>
            <button onclick="changeQty('${p._id}', ${item.quantity + 1})">+</button>
          </div>
        </div>
      `;
    }).join('');

    const total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const deliveryFee = total > 500 ? 0 : 30;

    layout.innerHTML = `
      <div id="cart-items">${itemsHtml}</div>
      <div class="summary-card">
        <h3 style="margin-top:0;">Order Summary</h3>
        <div class="summary-row"><span>Subtotal</span><span>${formatPrice(total)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>${deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${formatPrice(total + deliveryFee)}</span></div>
        <a href="checkout.html" class="btn btn-accent btn-block" style="margin-top:16px;">Proceed to Checkout</a>
      </div>
    `;
  } catch (err) {
    layout.innerHTML = `<p>Could not load cart: ${err.message}</p>`;
  }
}

async function changeQty(productId, newQty) {
  try {
    await apiRequest(`/cart/${productId}`, { method: 'PUT', body: { quantity: newQty } });
    loadCart();
    updateCartBadge();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function removeItem(productId) {
  try {
    await apiRequest(`/cart/${productId}`, { method: 'DELETE' });
    showToast('Item removed');
    loadCart();
    updateCartBadge();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
