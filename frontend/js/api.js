// ===== Central API configuration =====
// Change this to your deployed backend URL when you deploy (e.g. Render URL).
const API_BASE_URL = 'http://192.168.0.103:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function isLoggedIn() {
  return !!getToken();
}

function isAdmin() {
  const user = getUser();
  return user && user.role === 'admin';
}

// Core request helper. Automatically attaches JWT if present.
async function apiRequest(endpoint, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && getToken()) {
    headers['Authorization'] = `Bearer ${getToken()}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    // If token expired/invalid, force logout
    if (res.status === 401) {
      clearToken();
    }
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

// Simple toast notification used across all pages
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatPrice(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}
