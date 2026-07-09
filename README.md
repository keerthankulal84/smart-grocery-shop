# Smart Grocery Shop — Full Stack

Node.js + Express + MongoDB backend, vanilla HTML/CSS/JS frontend, JWT auth, admin panel, Razorpay test-mode checkout.

## Structure
```
smart-grocery-shop/
  backend/     -> Express API (Node.js + MongoDB)
  frontend/    -> Static site (HTML/CSS/JS, no build step)
```

---

## 1. Backend setup (local)

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — get this from MongoDB Atlas (see below)
- `JWT_SECRET` — any long random string
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from Razorpay dashboard, **test mode keys**
- `CLIENT_ORIGIN` — where your frontend runs, e.g. `http://127.0.0.1:5500` if using VS Code Live Server

Run it:
```bash
npm run dev      # with nodemon, auto-restarts
# or
npm start
```

Server runs on `http://localhost:5000`. Check `http://localhost:5000/api/health` — should return `{"status":"ok"}`.

### Load sample products (optional but recommended)
```bash
node seed.js
```
This wipes and repopulates the `products` collection with 12 sample grocery items.

### Important: first registered user becomes admin
The **very first account you sign up** through the app automatically gets `role: admin`. Every account after that is a normal `user`. This is a deliberate shortcut for getting started — in a real production app you would not want anonymous signup to ever grant admin, so if you ever open this up publicly, disable that logic in `backend/controllers/authController.js` (`register` function) and instead manually promote an admin via the database.

---

## 2. MongoDB Atlas setup (free tier)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a free M0 cluster.
3. Under **Database Access**, create a database user with a username/password.
4. Under **Network Access**, add `0.0.0.0/0` (allow from anywhere) — fine for a project like this.
5. Click **Connect > Drivers**, copy the connection string, and paste it into `MONGO_URI` in your `.env`, replacing `<username>`, `<password>`, and adding your database name (e.g. `/smart-grocery`).

---

## 3. Razorpay test mode setup

1. Sign up at https://dashboard.razorpay.com/signup
2. You don't need to complete KYC to use **test mode**. Go to **Settings > API Keys** and generate a test key pair.
3. Put `key_id` and `key_secret` into your `.env`.
4. Test mode card for payments: card number `4111 1111 1111 1111`, any future expiry, any CVV, any OTP.
5. Going live (real money) requires Razorpay to approve your business KYC — that's on you to do later, not a code change.

---

## 4. Frontend setup (local)

The frontend is plain static files — no build step. Two options:

**Option A — VS Code Live Server extension**
Open `frontend/` folder, right-click `index.html`, "Open with Live Server."

**Option B — any static server**
```bash
cd frontend
npx serve .
```

Before running, open `frontend/js/api.js` and confirm the local API URL matches your backend port (default `http://localhost:5000/api`).

Make sure `CLIENT_ORIGIN` in the backend `.env` matches whatever port your frontend runs on, or the browser will block requests (CORS).

---

## 5. Deployment

### Backend → Render
1. Push the `backend/` folder to a GitHub repo.
2. On https://render.com, create a **New Web Service**, connect the repo.
3. Build command: `npm install`. Start command: `npm start`.
4. Add all your `.env` variables under Render's **Environment** tab (never commit `.env` to GitHub).
5. Once deployed, note your Render URL, e.g. `https://smart-grocery-api.onrender.com`.

### Frontend → Vercel
1. Push the `frontend/` folder to a GitHub repo (or a subfolder of the same repo).
2. In `frontend/js/api.js`, replace `YOUR-BACKEND-URL.onrender.com` with your actual Render backend URL.
3. On https://vercel.com, import the repo, set root directory to `frontend/`, deploy (no build step needed — static site).
4. Add your Vercel URL (e.g. `https://smart-grocery.vercel.app`) to `CLIENT_ORIGIN` in Render's environment variables, then redeploy the backend so CORS allows it.

### Free tier note
Render's free web services spin down after 15 minutes of inactivity and take ~30–50 seconds to wake up on the next request. That's normal — not a bug — for a free-tier demo.

---

## 6. What's actually implemented

- JWT auth (register/login), bcrypt password hashing
- Role-based access: first user = admin, rest = regular users
- Product catalog with categories, search, pagination
- Admin panel: add/edit/soft-delete products, view all orders, update order status
- Server-side cart (per logged-in user, stored in MongoDB — not localStorage)
- Order placement with stock validation and decrement
- Razorpay test-mode checkout with signature verification server-side
- Order history per user

## 7. What this does NOT include (be aware)

- Email notifications (order confirmation emails, password reset)
- Refunds/cancellation-triggered stock restoration
- Image upload (product images are URL strings — you paste a link, no file upload handling)
- Rate limiting / brute-force login protection
- Automated tests

These are reasonable next steps if you take this further, but weren't in your stated requirements.
