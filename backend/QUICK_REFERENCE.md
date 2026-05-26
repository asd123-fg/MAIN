# API QUICK REFERENCE CARD

## 🔑 Authentication

### Register
```
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer|merchant|admin"
}
Response: 201 { id, name, email, role }
```

### Login
```
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
Response: 200 { token, user: { id, name, email, role } }
```

---

## 📦 Products (Public Read)

### Get All
```
GET /api/products
Response: 200 [ { id, merchant_id, name, description, price, image } ]
```

### Get One
```
GET /api/products/UUID
Response: 200 { id, merchant_id, name, description, price, image }
```

### Create (Merchant)
```
POST /api/products
Header: Authorization: Bearer TOKEN
{
  "name": "Product",
  "description": "desc",
  "price": 99.99,
  "image": "url"
}
Response: 201 { id, merchant_id, name, ... }
```

### Update (Own Only)
```
PUT /api/products/UUID
Header: Authorization: Bearer TOKEN
{ "name": "...", "price": 99.99 }
Response: 200 { updated product }
```

### Delete (Own Only)
```
DELETE /api/products/UUID
Header: Authorization: Bearer TOKEN
Response: 200 null
```

---

## 🛒 Cart (Customer Only)

### View
```
GET /api/cart
Header: Authorization: Bearer TOKEN
Response: 200 [ { id, product_id, quantity, products: {} } ]
```

### Add Item
```
POST /api/cart
Header: Authorization: Bearer TOKEN
{ "product_id": "UUID", "quantity": 2 }
Response: 201 { cart item }
```

### Remove Item
```
DELETE /api/cart/CART_ID
Header: Authorization: Bearer TOKEN
Response: 200 null
```

### Clear Cart
```
DELETE /api/cart
Header: Authorization: Bearer TOKEN
Response: 200 null
```

---

## 📦 Orders

### Create (Customer)
```
POST /api/orders
Header: Authorization: Bearer TOKEN
[
  { "product_id": "UUID", "quantity": 2 },
  { "product_id": "UUID", "quantity": 1 }
]
Response: 201 [ { id, status: "pending", ... } ]
Cart is auto-cleared!
```

### View
```
GET /api/orders
Header: Authorization: Bearer TOKEN
Response: 200 [ orders ]
Customer: sees own only
Merchant: sees related only
Admin: sees all
```

### Update Status (Merchant/Admin)
```
PUT /api/orders/UUID
Header: Authorization: Bearer TOKEN
{ "status": "pending|processing|shipped|delivered|cancelled" }
Response: 200 { updated order }
```

---

## 👨‍💼 Admin Only

### Users
```
GET /api/admin/users
DELETE /api/admin/users/UUID
Header: Authorization: Bearer ADMIN_TOKEN
Response: 200 [ users ] or null
```

### Orders
```
GET /api/admin/orders
Header: Authorization: Bearer ADMIN_TOKEN
Response: 200 [ all orders ]
```

### Stats
```
GET /api/admin/stats
Header: Authorization: Bearer ADMIN_TOKEN
Response: 200 {
  totalUsers, admins, merchants, customers,
  totalProducts, totalOrders, pendingOrders,
  totalRevenue
}
```

---

## 🔍 Common Errors

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request body format |
| 401 | Unauthorized | Add valid JWT token |
| 403 | Forbidden | Wrong role or own resource only |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Email already registered |
| 500 | Server Error | Check backend logs |

---

## ⚙️ Setup

```bash
# 1. Install
npm install

# 2. Env
cp .env.example .env
# Fill in Supabase credentials

# 3. Database
# Run database/schema.sql in Supabase

# 4. Start
npm run dev
# http://localhost:3000
```

---

## 📱 Frontend Example

```javascript
const API = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

// Fetch with auth
async function fetchAPI(url, options = {}) {
  return fetch(`${API}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }).then(r => r.json());
}

// Login
const res = await fetchAPI('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email: '...', password: '...' })
});
localStorage.setItem('token', res.data.token);

// Get products
const products = await fetchAPI('/products');

// Add to cart
await fetchAPI('/cart', {
  method: 'POST',
  body: JSON.stringify({ product_id: 'UUID', quantity: 1 })
});

// Create order
await fetchAPI('/orders', {
  method: 'POST',
  body: JSON.stringify([{ product_id: 'UUID', quantity: 1 }])
});
```

---

## 🚀 Deployment (Render)

1. Push code to GitHub
2. Create Web Service on Render
3. Build: `npm install`
4. Start: `npm start`
5. Add environment variables
6. Deploy
7. Update frontend URL

**Your API URL**: `https://your-service.onrender.com/api`

---

## 📋 User Roles

| Role | Products | Cart | Orders | Admin |
|------|----------|------|--------|-------|
| Customer | View | ✓ | Create, view own | ✗ |
| Merchant | CRUD own | ✗ | View related, update status | ✗ |
| Admin | CRUD all | ✗ | View all, update | ✓ |

---

## 📚 Documentation

- **README.md** - Full API reference
- **QUICKSTART.md** - Setup guide
- **DEPLOYMENT.md** - Render instructions
- **TESTING_GUIDE.md** - Test scenarios
- **API_EXAMPLES.md** - Code examples
- **POSTMAN_COLLECTION.json** - Ready-to-import tests

---

**Last Updated**: May 26, 2026
**Status**: ✅ Production Ready
