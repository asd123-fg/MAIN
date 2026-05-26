# Quick Start Guide

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```

### 3. Set Up Supabase Database
1. Go to your Supabase project
2. Open SQL Editor
3. Run the SQL from `database/schema.sql`
4. This will create all tables, indexes, and security policies

### 4. Run Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

## Testing with Postman

### Import Collection
1. Open Postman
2. Click **Import** button
3. Select `POSTMAN_COLLECTION.json`
4. Collection will be imported with all endpoints

### Set Environment Variables
1. Create new environment in Postman
2. Add variables:
   - `base_url`: `http://localhost:3000`
   - `token`: (leave empty, will be set after login)
   - `admin_token`: (leave empty, for admin testing)

### Test Flow
1. **Register a customer**: POST `/api/auth/register`
2. **Login**: POST `/api/auth/login`
3. **Copy token** from response to `{{token}}` variable
4. **Create a merchant account** and test product creation
5. **Test product endpoints**
6. **Test cart** with customer token
7. **Create orders**
8. **Update order status** with merchant/admin token

## API Endpoints Summary

```
POST   /api/auth/register           - Register new user
POST   /api/auth/login              - Login and get JWT token

GET    /api/products                - Get all products
GET    /api/products/:id            - Get product by ID
POST   /api/products                - Create product (merchant)
PUT    /api/products/:id            - Update product (merchant)
DELETE /api/products/:id            - Delete product (merchant)

GET    /api/cart                    - Get user cart (customer)
POST   /api/cart                    - Add to cart (customer)
DELETE /api/cart/:id                - Remove from cart (customer)
DELETE /api/cart                    - Clear cart (customer)

GET    /api/orders                  - Get orders (role-based)
POST   /api/orders                  - Create order (customer)
PUT    /api/orders/:id              - Update order status (merchant/admin)

GET    /api/admin/users             - Get all users (admin)
DELETE /api/admin/users/:id         - Delete user (admin)
GET    /api/admin/orders            - Get all orders (admin)
GET    /api/admin/stats             - Get dashboard stats (admin)

GET    /api/health                  - Health check
```

## Frontend Integration

### Example Fetch Code

```javascript
// Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Register
async function register(name, email, password, role = 'customer') {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });
  return response.json();
}

// Login
async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  return data;
}

// Fetch with auth header
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  return response.json();
}

// Get products
async function getProducts() {
  return fetchWithAuth('/products');
}

// Add to cart
async function addToCart(product_id, quantity) {
  return fetchWithAuth('/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id, quantity })
  });
}

// Create order
async function createOrder(items) {
  return fetchWithAuth('/orders', {
    method: 'POST',
    body: JSON.stringify(items)
  });
}
```

## Environment Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase project URL |
| `SUPABASE_KEY` | `eyJhbG...` | Supabase anon key |
| `JWT_SECRET` | `your-secret` | Secret for JWT signing |
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment |
| `FRONTEND_URL` | `http://localhost:3000` | CORS origin |

## Common Issues

**Q: Getting CORS error?**
- Check `FRONTEND_URL` matches your frontend URL
- Ensure server.js CORS configuration includes your URL
- Redeploy if using Render

**Q: Database connection error?**
- Verify Supabase URL and keys are correct
- Check that schema.sql has been executed
- Ensure Supabase project is active

**Q: JWT token not working?**
- Make sure token is in `Authorization: Bearer <token>` format
- Check token hasn't expired (expires in 24h)
- Verify JWT_SECRET is same in both .env files

**Q: Can't login after registration?**
- Verify password matches what you registered with
- Check email is spelled correctly
- Ensure user exists in database (check Supabase UI)

## Next Steps

1. Customize response format if needed
2. Add email verification
3. Implement password reset
4. Add product reviews/ratings
5. Add payment processing (Stripe, PayPal)
6. Add order tracking
7. Add real-time notifications
8. Add image upload to cloud storage
