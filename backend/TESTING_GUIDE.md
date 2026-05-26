# Testing Guide

## Unit Testing Scenarios

### Authentication Tests

#### ✓ Successful Registration
```
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "customer"
}
Expected: 201 Created
Response: User object with id, name, email, role
```

#### ✓ Duplicate Email Registration
```
POST /api/auth/register
Body: {
  "name": "Jane Doe",
  "email": "john@example.com",
  "password": "anotherPassword"
}
Expected: 409 Conflict
Message: "Email already registered"
```

#### ✓ Missing Required Fields
```
POST /api/auth/register
Body: {
  "name": "John Doe"
}
Expected: 400 Bad Request
Message: "Name, email, and password are required"
```

#### ✓ Successful Login
```
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "securePassword123"
}
Expected: 200 OK
Response: {
  "token": "JWT_TOKEN_HERE",
  "user": { id, name, email, role }
}
```

#### ✓ Invalid Credentials
```
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "wrongPassword"
}
Expected: 401 Unauthorized
Message: "Invalid email or password"
```

### Product Tests

#### ✓ Get All Products (Public)
```
GET /api/products
Expected: 200 OK
Response: Array of products with all fields
```

#### ✓ Merchant Creates Product
```
POST /api/products
Headers: Authorization: Bearer {{merchant_token}}
Body: {
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "image": "https://example.com/laptop.jpg"
}
Expected: 201 Created
Response: Product object with id, merchant_id, created_at
```

#### ✓ Customer Tries to Create Product
```
POST /api/products
Headers: Authorization: Bearer {{customer_token}}
Body: { ... }
Expected: 403 Forbidden
Message: "Access denied. Required role: merchant"
```

#### ✓ Merchant Updates Own Product
```
PUT /api/products/{{product_id}}
Headers: Authorization: Bearer {{same_merchant_token}}
Body: { "name": "Gaming Laptop", "price": 1299.99 }
Expected: 200 OK
Response: Updated product object
```

#### ✓ Merchant Updates Others' Product
```
PUT /api/products/{{other_merchant_product}}
Headers: Authorization: Bearer {{different_merchant_token}}
Expected: 403 Forbidden
Message: "You can only update your own products"
```

#### ✓ Delete Product
```
DELETE /api/products/{{product_id}}
Headers: Authorization: Bearer {{merchant_token}}
Expected: 200 OK
Response: { success: true, message: "Product deleted successfully", data: null }
```

### Cart Tests

#### ✓ Add Item to Cart
```
POST /api/cart
Headers: Authorization: Bearer {{customer_token}}
Body: {
  "product_id": "product-uuid",
  "quantity": 2
}
Expected: 201 Created
Response: Cart item object
```

#### ✓ Add Duplicate Item (Update Quantity)
```
POST /api/cart
Headers: Authorization: Bearer {{same_customer_token}}
Body: {
  "product_id": "same-product-uuid",
  "quantity": 1
}
Expected: 200 OK
Response: Updated cart item (quantity = 3)
```

#### ✓ Get Cart
```
GET /api/cart
Headers: Authorization: Bearer {{customer_token}}
Expected: 200 OK
Response: Array of cart items with product details
```

#### ✓ Remove from Cart
```
DELETE /api/cart/{{cart_item_id}}
Headers: Authorization: Bearer {{customer_token}}
Expected: 200 OK
```

#### ✓ Clear Cart
```
DELETE /api/cart
Headers: Authorization: Bearer {{customer_token}}
Expected: 200 OK
```

#### ✓ Merchant Views Cart (Should Fail)
```
GET /api/cart
Headers: Authorization: Bearer {{merchant_token}}
Expected: 403 Forbidden
```

### Order Tests

#### ✓ Customer Creates Order
```
POST /api/orders
Headers: Authorization: Bearer {{customer_token}}
Body: [
  { "product_id": "uuid1", "quantity": 2 },
  { "product_id": "uuid2", "quantity": 1 }
]
Expected: 201 Created
Response: Array of created orders with status "pending"
Cart should be cleared after order
```

#### ✓ Customer Views Own Orders
```
GET /api/orders
Headers: Authorization: Bearer {{customer_token}}
Expected: 200 OK
Response: Array of orders belonging only to this customer
```

#### ✓ Merchant Views Related Orders
```
GET /api/orders
Headers: Authorization: Bearer {{merchant_token}}
Expected: 200 OK
Response: Array of orders for products they own
```

#### ✓ Admin Views All Orders
```
GET /api/orders
Headers: Authorization: Bearer {{admin_token}}
Expected: 200 OK
Response: Array of all orders in the system
```

#### ✓ Merchant Updates Order Status
```
PUT /api/orders/{{order_id}}
Headers: Authorization: Bearer {{merchant_token}}
Body: { "status": "shipped" }
Expected: 200 OK
Response: Updated order object
```

#### ✓ Invalid Status Update
```
PUT /api/orders/{{order_id}}
Headers: Authorization: Bearer {{merchant_token}}
Body: { "status": "invalid_status" }
Expected: 400 Bad Request
Message: "Status must be one of: ..."
```

### Admin Tests

#### ✓ Get All Users (Admin Only)
```
GET /api/admin/users
Headers: Authorization: Bearer {{admin_token}}
Expected: 200 OK
Response: Array of all users (without passwords)
```

#### ✓ Customer Tries Admin Endpoint
```
GET /api/admin/users
Headers: Authorization: Bearer {{customer_token}}
Expected: 403 Forbidden
```

#### ✓ Delete User
```
DELETE /api/admin/users/{{user_id}}
Headers: Authorization: Bearer {{admin_token}}
Expected: 200 OK
```

#### ✓ Admin Deletes Self
```
DELETE /api/admin/users/{{admin_own_id}}
Headers: Authorization: Bearer {{admin_token}}
Expected: 400 Bad Request
Message: "You cannot delete your own account"
```

#### ✓ Get Dashboard Stats
```
GET /api/admin/stats
Headers: Authorization: Bearer {{admin_token}}
Expected: 200 OK
Response: {
  "totalUsers": 50,
  "admins": 2,
  "merchants": 5,
  "customers": 43,
  "totalProducts": 150,
  "totalOrders": 500,
  "pendingOrders": 15,
  "totalRevenue": 25000.00
}
```

## Security Tests

### JWT Token Tests
```javascript
// Expired token
Authorization: Bearer eyJhbGc... (expired token)
Expected: 401 Unauthorized
Message: "Invalid or expired token"

// Malformed token
Authorization: Bearer not-a-valid-token
Expected: 401 Unauthorized

// No token
GET /api/cart
Expected: 401 Unauthorized
Message: "No token provided"

// Token with wrong role
Authorization: Bearer eyJhbGc... (merchant token)
PUT /api/orders/{{order_id}} (only admin endpoint)
Expected: 403 Forbidden
```

## Performance Tests

### Bulk Product Retrieval
```
GET /api/products?limit=1000
Expected: 200 OK
Response time: < 1 second
```

### Bulk Order Retrieval (Admin)
```
GET /api/admin/orders
Expected: Retrieve all orders
Response time: < 2 seconds
```

## Integration Test Flow

1. **Setup Phase**
   - Register test users (customer, merchant, admin)
   - Login each user and store tokens
   - Create test products

2. **Customer Flow**
   - View products
   - Add to cart
   - Create orders
   - View own orders

3. **Merchant Flow**
   - Create products
   - View orders for own products
   - Update order status

4. **Admin Flow**
   - View all users
   - View all orders
   - View dashboard stats

5. **Cleanup Phase**
   - Delete test users
   - Delete test products
   - Verify data integrity

## Load Testing Commands

Using Apache Bench:
```bash
# 100 requests with 10 concurrent
ab -n 100 -c 10 http://localhost:3000/api/health

# With authentication header
ab -n 100 -c 10 -H "Authorization: Bearer token" http://localhost:3000/api/products
```

Using wrk:
```bash
# 4 threads, 10 connections for 30 seconds
wrk -t4 -c10 -d30s http://localhost:3000/api/health
```

## Error Scenarios to Test

1. ✓ Database connection failures
2. ✓ Invalid UUID formats
3. ✓ SQL injection attempts
4. ✓ Missing authorization header
5. ✓ Expired JWT tokens
6. ✓ Invalid JSON payloads
7. ✓ Negative quantities
8. ✓ Duplicate cart items
9. ✓ Non-existent resources
10. ✓ Concurrent order creation

## Postman Test Scripts

Add these to request tests:

```javascript
// Check success response
pm.test("Response is successful", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});

// Check status code
pm.test("Status code is 200", function() {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

// Save token
pm.test("Token is received", function() {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.data.token);
});

// Validate response schema
pm.test("Response schema is valid", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("success");
    pm.expect(jsonData).to.have.property("message");
    pm.expect(jsonData).to.have.property("data");
});
```
