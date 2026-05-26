# E-Commerce Backend API Documentation

## Overview
This is a complete REST API backend for a mobile-based e-commerce application built with Node.js, Express, and Supabase PostgreSQL. The API supports three user roles with different permissions: Admin, Merchant, and Customer.

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv
- **Cross-Origin Resource Sharing**: CORS enabled

## Project Structure

```
backend/
├── config/
│   └── supabaseClient.js       # Supabase configuration
├── controllers/
│   ├── authController.js       # Authentication logic
│   ├── productController.js    # Product CRUD operations
│   ├── cartController.js       # Shopping cart logic
│   ├── orderController.js      # Order management
│   └── adminController.js      # Admin operations
├── routes/
│   ├── authRoutes.js           # Auth endpoints
│   ├── productRoutes.js        # Product endpoints
│   ├── cartRoutes.js           # Cart endpoints
│   ├── orderRoutes.js          # Order endpoints
│   └── adminRoutes.js          # Admin endpoints
├── middleware/
│   └── auth.js                 # JWT verification & role authorization
├── database/
│   └── schema.sql              # Database schema
├── server.js                   # Main application entry
├── package.json                # Dependencies
└── .env.example                # Environment variables template
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

### Step 1: Clone & Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Set Up Environment Variables
1. Create a `.env` file in the root directory
2. Copy the content from `.env.example`
3. Add your Supabase credentials:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
FRONTEND_URL=http://localhost:3000
```

### Step 3: Set Up Supabase Database
1. Log into your Supabase project
2. Navigate to SQL Editor
3. Create a new query
4. Copy the entire content from `database/schema.sql`
5. Execute the SQL to create all tables, indexes, and policies

### Step 4: Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Response Format
All endpoints return JSON in the following format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "role": "customer"  // Optional: "customer" (default), "merchant", "admin"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

### POST /api/auth/login
Login and receive JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secure_password"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

---

## Product Endpoints

### GET /api/products
Get all products (public)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [
    {
      "id": "uuid",
      "merchant_id": "uuid",
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "image": "image_url",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET /api/products/:id
Get product by ID (public)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product fetched successfully",
  "data": {
    "id": "uuid",
    "merchant_id": "uuid",
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "image": "image_url",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### POST /api/products
Create a new product (merchant only)

**Headers:**
```
Authorization: Bearer your_jwt_token
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Amazing product",
  "price": 49.99,
  "image": "https://example.com/image.jpg"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "uuid",
    "merchant_id": "uuid",
    "name": "New Product",
    "description": "Amazing product",
    "price": 49.99,
    "image": "https://example.com/image.jpg",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### PUT /api/products/:id
Update product (merchant only, own products)

**Headers:**
```
Authorization: Bearer your_jwt_token
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Product",
  "description": "Updated description",
  "price": 59.99,
  "image": "https://example.com/new-image.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { /* updated product */ }
}
```

---

### DELETE /api/products/:id
Delete product (merchant only, own products)

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```

---

## Cart Endpoints

### GET /api/cart
Get user's cart (customer only)

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart fetched successfully",
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "product_id": "uuid",
      "quantity": 2,
      "products": {
        "id": "uuid",
        "name": "Product Name",
        "price": 99.99
      }
    }
  ]
}
```

---

### POST /api/cart
Add item to cart (customer only)

**Headers:**
```
Authorization: Bearer your_jwt_token
Content-Type: application/json
```

**Request Body:**
```json
{
  "product_id": "uuid",
  "quantity": 2
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "product_id": "uuid",
    "quantity": 2
  }
}
```

---

### DELETE /api/cart/:id
Remove item from cart (customer only)

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": null
}
```

---

### DELETE /api/cart
Clear entire cart (customer only)

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": null
}
```

---

## Order Endpoints

### GET /api/orders
Get orders (role-based visibility)

**Headers:**
```
Authorization: Bearer your_jwt_token
```

- **Customer**: See only own orders
- **Merchant**: See orders for their products
- **Admin**: See all orders

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "product_id": "uuid",
      "quantity": 1,
      "status": "pending",
      "user": { "id": "uuid", "name": "John", "email": "john@example.com" },
      "product": { "id": "uuid", "name": "Product", "price": 99.99 }
    }
  ]
}
```

---

### POST /api/orders
Create order(s) (customer only)

**Headers:**
```
Authorization: Bearer your_jwt_token
Content-Type: application/json
```

**Request Body:**
```json
[
  {
    "product_id": "uuid",
    "quantity": 2
  },
  {
    "product_id": "uuid",
    "quantity": 1
  }
]
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Order(s) created successfully",
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "product_id": "uuid",
      "quantity": 2,
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### PUT /api/orders/:id
Update order status (merchant/admin only)

**Headers:**
```
Authorization: Bearer your_jwt_token
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Valid statuses**: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": { /* updated order */ }
}
```

---

## Admin Endpoints

### GET /api/admin/users
Get all users (admin only)

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### DELETE /api/admin/users/:id
Delete a user (admin only)

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

---

### GET /api/admin/orders
Get all orders (admin only)

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "data": [ /* all orders */ ]
}
```

---

### GET /api/admin/stats
Get dashboard statistics (admin only)

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Dashboard statistics fetched successfully",
  "data": {
    "totalUsers": 50,
    "admins": 2,
    "merchants": 5,
    "customers": 43,
    "totalProducts": 150,
    "totalOrders": 500,
    "pendingOrders": 15,
    "totalRevenue": 25000.00
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Name, email, and password are required",
  "data": null
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "data": null
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Required role: merchant",
  "data": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found",
  "data": null
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Email already registered",
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error",
  "data": "error message"
}
```

---

## User Roles & Permissions

| Endpoint | Admin | Merchant | Customer |
|----------|-------|----------|----------|
| POST /api/auth/register | ✓ | ✓ | ✓ |
| POST /api/auth/login | ✓ | ✓ | ✓ |
| GET /api/products | ✓ | ✓ | ✓ |
| POST /api/products | ✓ | ✓ | ✗ |
| PUT /api/products/:id | ✓ | ✓* | ✗ |
| DELETE /api/products/:id | ✓ | ✓* | ✗ |
| GET /api/cart | ✗ | ✗ | ✓ |
| POST /api/cart | ✗ | ✗ | ✓ |
| DELETE /api/cart/:id | ✗ | ✗ | ✓ |
| GET /api/orders | ✓ | ✓** | ✓*** |
| POST /api/orders | ✗ | ✗ | ✓ |
| PUT /api/orders/:id | ✓ | ✓** | ✗ |
| GET /api/admin/users | ✓ | ✗ | ✗ |
| DELETE /api/admin/users/:id | ✓ | ✗ | ✗ |
| GET /api/admin/stats | ✓ | ✗ | ✗ |

*Own products only
**Products they own
***Own orders only

---

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Three-tier permission system
- **CORS Enabled**: Configurable cross-origin requests
- **Input Validation**: All inputs are validated before processing
- **Foreign Key Constraints**: Database integrity enforced
- **Row Level Security**: PostgreSQL RLS policies for additional security
