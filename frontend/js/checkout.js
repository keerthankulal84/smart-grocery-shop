let checkoutTotal = 0;

async function loadCheckoutSummary() {
  const summaryEl = document.getElementById('checkout-summary');
  try {
    const { cart } = await apiRequest('/cart');
    if (cart.items.length === 0) {
      summaryEl.innerHTML = '<p>Your cart is empty.</p>';
      document.getElementById('place-order-btn').disabled = true;
      return;
    }

    const total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const deliveryFee = total > 500 ? 0 : 30;
    checkoutTotal = total + deliveryFee;

    summaryEl.innerHTML = cart.items.map((i) => `
      <div class="summary-row"><span>${i.product.name} &times; ${i.quantity}</span><span>${formatPrice(i.product.price * i.quantity)}</span></div>
    `).join('') + `
      <div class="summary-row"><span>Delivery</span><span>${deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${formatPrice(checkoutTotal)}</span></div>
    `;
  } catch (err) {
    summaryEl.innerHTML = `<p>Could not load cart: ${err.message}</p>`;
  }

  // Prefill address if the user has one saved
  try {
    const { user } = await apiRequest('/auth/me');
    if (user.address) {
      document.getElementById('line1').value = user.address.line1 || '';
      document.getElementById('city').value = user.address.city || '';
      document.getElementById('state').value = user.address.state || '';
      document.getElementById('pincode').value = user.address.pincode || '';
      document.getElementById('phone').value = user.address.phone || '';
    }
  } catch (err) {
    // non-fatal
  }
}

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('form-error');
  errorEl.classList.remove('show');

  const shippingAddress = {
    line1: document.getElementById('line1').value.trim(),
    city: document.getElementById('city').value.trim(),
    state: document.getElementById('state').value.trim(),
    pincode: document.getElementById('pincode').value.trim(),
    phone: document.getElementById('phone').value.trim()
  };

  const placeOrderBtn = document.getElementById('place-order-btn');
  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = 'Placing order...';

  try {
    // Step 1: create the order in our DB (stock is reserved, cart is cleared)
    const { order } = await apiRequest('/orders', { method: 'POST', body: { shippingAddress } });

    // Step 2: create a Razorpay order for that amount
    const { razorpayOrderId, amount, currency, keyId } = await apiRequest('/payment/create-order', {
      method: 'POST',
      body: { orderId: order._id }
    });

    // Step 3: open Razorpay checkout widget (test mode)
    const options = {
      key: keyId,
      amount,
      currency,
      name: 'FreshCart',
      description: `Order #${order._id.slice(-6)}`,
      order_id: razorpayOrderId,
      handler: async function (response) {
        try {
          await apiRequest('/payment/verify', {
            method: 'POST',
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            }
          });
          showToast('Payment successful! Order confirmed.');
          setTimeout(() => (window.location.href = 'orders.html'), 800);
        } catch (err) {
          showToast('Payment verification failed: ' + err.message, 'error');
        }
      },
      prefill: {
        name: getUser()?.name || '',
        email: getUser()?.email || '',
        contact: shippingAddress.phone
      },
      theme: { color: '#2F6B4F' },
      modal: {
        ondismiss: function () {
          showToast('Payment cancelled. You can retry from My Orders.', 'error');
          setTimeout(() => (window.location.href = 'orders.html'), 1200);
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    document.getElementById('form-error').textContent = err.message;
    document.getElementById('form-error').classList.add('show');
  } finally {
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = 'Place Order & Pay';
  }
});
