function showFormError(message) {
  const el = document.getElementById('form-error');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
}

function clearFormError() {
  const el = document.getElementById('form-error');
  if (el) el.classList.remove('show');
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormError();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const { user, token } = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false
      });
      setToken(token);
      setUser(user);
      showToast(`Welcome back, ${user.name.split(' ')[0]}`);
      setTimeout(() => (window.location.href = 'index.html'), 500);
    } catch (err) {
      showFormError(err.message);
    }
  });
}

const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormError();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const { user, token } = await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password },
        auth: false
      });
      setToken(token);
      setUser(user);
      showToast(`Welcome, ${user.name.split(' ')[0]}!`);
      setTimeout(() => (window.location.href = 'index.html'), 500);
    } catch (err) {
      showFormError(err.message);
    }
  });
}
