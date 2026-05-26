# E-Commerce Backend API - Complete Setup Summary

## 🎯 Project Overview

Your e-commerce backend is a production-ready REST API built with:
- **Framework**: Express.js on Node.js
- **Database**: Supabase PostgreSQL
- **Authentication**: JWT with bcrypt password hashing
- **Authorization**: Role-based access control (Admin, Merchant, Customer)
- **Deployment**: Ready for Render.com

---

## 📁 Project Structure

```
backend/
├── config/
│   └── supabaseClient.js          # Supabase configuration and connection
├── controllers/                    # Business logic for each feature
│   ├── authController.js          # Register and login logic
│   ├── productController.js       # Product CRUD operations
│   ├── cartController.js          # Shopping cart management
│   ├── orderController.js         # Order processing
│   └── adminController.js         # Admin dashboard operations
├── routes/                         # API endpoint definitions
│   ├── authRoutes.js              # /api/auth/* endpoints
│   ├── productRoutes.js           # /api/products/* endpoints
│   ├── cartRoutes.js              # /api/cart/* endpoints
│   ├── orderRoutes.js             # /api/orders/* endpoints
│   └── adminRoutes.js             # /api/admin/* endpoints
├── middleware/
│   └── auth.js                    # JWT verification and role authorization
├── database/
│   └── schema.sql                 # PostgreSQL schema with tables and policies
├── server.js                      # Main application entry point
├── package.json                   # Dependencies (Express, JWT, bcryptjs, etc.)
├── .env.example                   # Environment variables template
├── .gitignore                     # Git exclusions
├── README.md                      # Full API documentation
├── QUICKSTART.md                  # Setup and testing quick reference
├── DEPLOYMENT.md                  # Render deployment guide
├── TESTING_GUIDE.md               # Comprehensive testing scenarios
└── POSTMAN_COLLECTION.json        # Postman API collection for testing
```

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Create .env File
```bash
cp .env.example .env
```

Then fill in your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
FRONTEND_URL=http://localhost:3000
```

### Step 3: Set Up Database
1. Go to your Supabase project dashboard
2. Open **SQL Editor**
3. Create a new query
4. Copy the entire content from `database/schema.sql`
5. Execute the SQL

### Step 4: Start Server
```bash
npm run dev
```

Server runs on: **http://localhost:3000**

### Step 5: Test the API
```bash
# Health check
curl http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123","role":"customer"}'
```

---

## 📋 Database Schema

### Users Table
- `id` (UUID) - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed with bcryptjs
- `role` - 'admin', 'merchant', or 'customer'
- `created_at` - Timestamp

### Products Table
- `id` (UUID) - Primary key
- `merchant_id` (UUID) - Foreign key to users
- `name` - Product name
- `description` - Product details
- `price` - Product price (decimal)
- `image` - Image URL
- `created_at` - Timestamp

### Cart Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `product_id` (UUID) - Foreign key to products
- `quantity` - Item quantity (> 0)
- `created_at` - Timestamp

### Orders Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `product_id` (UUID) - Foreign key to products
- `quantity` - Order quantity
- `status` - 'pending', 'processing', 'shipped', 'delivered', or 'cancelled'
- `created_at` - Timestamp

---

## 🔐 Authentication & Authorization

### How JWT Works
1. User logs in with email/password
2. Server returns JWT token (valid for 24 hours)
3. Client stores token (localStorage, sessionStorage, etc.)
4. Client sends token in Authorization header for protected routes
5. Server verifies token before processing request

### Using JWT in Requests
```javascript
// Browser/Frontend Example
const token = localStorage.getItem('token');
fetch('http://localhost:3000/api/cart', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});
```

### Role-Based Access

| Role | Can Do |
|------|--------|
| **Admin** | Everything - manage all users, products, orders |
| **Merchant** | Create/edit/delete own products, update order status for own products |
| **Customer** | View products, manage cart, create orders, view own orders |

---

## 🔌 API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Get JWT token

### Products (Public Read, Auth Write)
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create (merchant only)
- `PUT /api/products/:id` - Update (merchant's own only)
- `DELETE /api/products/:id` - Delete (merchant's own only)

### Cart (Auth Required - Customer Only)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

### Orders (Auth Required)
- `GET /api/orders` - Get orders (role-based visibility)
- `POST /api/orders` - Create order (customer only)
- `PUT /api/orders/:id` - Update status (merchant/admin only)

### Admin (Auth Required - Admin Only)
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/stats` - Dashboard statistics

---

## 📊 Response Format

All endpoints return JSON in this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "uuid",
    "name": "Product Name",
    ...
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

---

## 🧪 Testing

### With Postman
1. Open Postman
2. Import `POSTMAN_COLLECTION.json`
3. Set environment variables: `base_url` and `token`
4. Run requests

### With cURL
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123","role":"customer"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# Get products (public - no auth needed)
curl http://localhost:3000/api/products

# Get cart (requires token)
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3000/api/cart
```

### With JavaScript
```javascript
// See QUICKSTART.md for complete fetch examples
```

---

## 🌐 Frontend Integration

### Step 1: Store the Deployed URL
```javascript
// Save this in your frontend config
const API_BASE_URL = 'https://your-backend.onrender.com/api';
```

### Step 2: Typical Request Pattern
```javascript
async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  });

  return response.json();
}

// Usage
const products = await apiCall('/products');
const cart = await apiCall('/cart', 'GET');
await apiCall('/cart', 'POST', { product_id: 'uuid', quantity: 1 });
```

---

## 🚀 Deployment on Render

### Prerequisites
- Push code to GitHub
- Supabase project created and configured
- Render account created

### Deployment Steps
1. Go to https://render.com
2. Create new **Web Service**
3. Connect GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables (see DEPLOYMENT.md)
7. Deploy

### Get Your API URL
After successful deployment, Render provides a URL like:
```
https://ecommerce-backend-xxxxx.onrender.com
```

Use this in your frontend:
```javascript
const API_BASE_URL = 'https://ecommerce-backend-xxxxx.onrender.com/api';
```

---

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong (32+ characters) and unique
- [ ] .env file is in .gitignore (never commit secrets)
- [ ] CORS is configured with your frontend URL
- [ ] Passwords are hashed with bcryptjs
- [ ] Database schema includes foreign key constraints
- [ ] Row Level Security (RLS) policies are enabled
- [ ] All inputs are validated before database operations
- [ ] SQL injection is prevented (using parameterized queries)
- [ ] Rate limiting is implemented (recommended for production)
- [ ] HTTPS is used (automatic on Render)

---

## 📝 Documentation Files

- **README.md** - Complete API reference with all endpoints
- **QUICKSTART.md** - Setup instructions and common patterns
- **DEPLOYMENT.md** - Step-by-step Render deployment guide
- **TESTING_GUIDE.md** - Comprehensive testing scenarios
- **POSTMAN_COLLECTION.json** - Ready-to-import Postman tests

---

## 🐛 Common Issues & Solutions

### "CORS error from frontend"
**Solution**: Ensure FRONTEND_URL in .env matches your frontend domain exactly

### "Database connection failed"
**Solution**: Verify Supabase URL and keys are correct; check schema.sql has been executed

### "Invalid token error"
**Solution**: Ensure JWT_SECRET is the same across all deployments; tokens expire in 24h

### "Can't create product as merchant"
**Solution**: Make sure you're logged in as a merchant, not customer; use merchant token in header

### "Port already in use"
**Solution**: Change PORT in .env or kill process using port 3000

---

## 🎓 Next Steps

1. **Test all endpoints** using Postman collection
2. **Integrate with frontend** using API_BASE_URL
3. **Deploy to Render** following DEPLOYMENT.md
4. **Monitor logs** in Render dashboard
5. **Consider adding**:
   - Email verification
   - Password reset
   - Payment processing (Stripe)
   - Product reviews
   - Search and filtering
   - Real-time notifications

---

## 📞 Support Resources

- [Express.js Documentation](https://expressjs.com/)
- [Supabase Documentation](https://supabase.io/docs)
- [JWT Introduction](https://jwt.io/introduction)
- [Render Documentation](https://render.com/docs)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

---

## ✅ Checklist for Production

- [ ] Environment variables are set securely
- [ ] Database backups are configured
- [ ] Error logging is implemented
- [ ] API rate limiting is in place
- [ ] HTTPS/SSL is enabled
- [ ] CORS is properly configured
- [ ] Sensitive data is not logged
- [ ] All dependencies are pinned to versions
- [ ] Performance testing is done
- [ ] Security testing is completed

---

**You're all set! Your backend is ready for development and deployment.** 🎉
