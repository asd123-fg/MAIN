# API Examples - Real-World Usage

## 1. Complete User Registration & Login Flow

### Frontend Code Example
```javascript
// config/api.js
const API_BASE_URL = 'http://localhost:3000/api';

export const auth = {
  register: async (name, email, password, role = 'customer') => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Usage
async function handleRegister(e) {
  e.preventDefault();
  const result = await auth.register('John Doe', 'john@example.com', 'pass123', 'customer');
  if (result.success) {
    alert('Registration successful!');
  } else {
    alert('Error: ' + result.message);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const result = await auth.login('john@example.com', 'pass123');
  if (result.success) {
    window.location.href = '/dashboard';
  }
}
```

---

## 2. Product Management Flow

### Create Product (Merchant)
```javascript
const createProduct = async (productData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.price),
      image: productData.imageUrl
    })
  });
  return res.json();
};

// Usage
const newProduct = await createProduct({
  name: 'iPhone 15 Pro',
  description: 'Latest Apple smartphone',
  price: 999.99,
  imageUrl: 'https://example.com/iphone.jpg'
});
```

### Update Product (Own Products Only)
```javascript
const updateProduct = async (productId, updates) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  return res.json();
};

// Usage
await updateProduct('product-uuid', {
  price: 899.99,
  description: 'Sale: Now 10% off!'
});
```

### Delete Product
```javascript
const deleteProduct = async (productId) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};

// Usage
const result = await deleteProduct('product-uuid');
if (result.success) {
  console.log('Product deleted');
}
```

---

## 3. Shopping Cart Flow

### Fetch Products (No Auth Required)
```javascript
const getProducts = async () => {
  const res = await fetch(`${API_BASE_URL}/products`);
  const data = await res.json();
  return data.data; // Array of products
};

// Usage
const products = await getProducts();
products.forEach(p => {
  console.log(`${p.name}: $${p.price}`);
});
```

### Add to Cart
```javascript
const addToCart = async (productId, quantity = 1) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ product_id: productId, quantity })
  });
  return res.json();
};

// Usage
await addToCart('product-uuid-1', 2);
await addToCart('product-uuid-2', 1);
```

### View Cart
```javascript
const getCart = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/cart`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  return data.data; // Array of cart items
};

// Usage
const cartItems = await getCart();
let total = 0;
cartItems.forEach(item => {
  const itemTotal = item.products.price * item.quantity;
  total += itemTotal;
  console.log(`${item.products.name} x${item.quantity} = $${itemTotal}`);
});
console.log(`Total: $${total}`);
```

### Remove from Cart
```javascript
const removeFromCart = async (cartItemId) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};

// Usage
await removeFromCart('cart-item-uuid');
```

### Clear Cart
```javascript
const clearCart = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/cart`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};

// Usage
await clearCart();
```

---

## 4. Order Management Flow

### Create Order (Checkout)
```javascript
const createOrder = async () => {
  // Get cart items
  const cartItems = await getCart();

  // Prepare order data
  const orderData = cartItems.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity
  }));

  // Send order
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });

  const result = await res.json();
  if (result.success) {
    // Cart is automatically cleared
    console.log('Order created successfully!');
    console.log('Order IDs:', result.data.map(o => o.id));
  }
  return result;
};

// Usage
const orderResult = await createOrder();
if (orderResult.success) {
  alert(`Order placed! Tracking ID: ${orderResult.data[0].id}`);
}
```

### View Orders (Customer)
```javascript
const getMyOrders = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  return data.data; // Array of user's orders
};

// Usage
const myOrders = await getMyOrders();
myOrders.forEach(order => {
  console.log(`Order ${order.id}: ${order.product.name} x${order.quantity} - ${order.status}`);
});
```

### Update Order Status (Merchant)
```javascript
const updateOrderStatus = async (orderId, newStatus) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: newStatus })
  });
  return res.json();
};

// Valid statuses: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
// Usage (Merchant)
await updateOrderStatus('order-uuid', 'processing');
await updateOrderStatus('order-uuid', 'shipped');
await updateOrderStatus('order-uuid', 'delivered');
```

---

## 5. Admin Dashboard Flow

### Get Dashboard Stats
```javascript
const getDashboardStats = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  return data.data; // Stats object
};

// Usage
const stats = await getDashboardStats();
console.log(`Total Revenue: $${stats.totalRevenue}`);
console.log(`Total Orders: ${stats.totalOrders}`);
console.log(`Pending Orders: ${stats.pendingOrders}`);
console.log(`Total Users: ${stats.totalUsers}`);
console.log(`  - Admins: ${stats.admins}`);
console.log(`  - Merchants: ${stats.merchants}`);
console.log(`  - Customers: ${stats.customers}`);
```

### Get All Users (Admin)
```javascript
const getAllUsers = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  return data.data; // Array of all users
};

// Usage
const users = await getAllUsers();
users.forEach(u => {
  console.log(`${u.name} (${u.email}) - Role: ${u.role}`);
});
```

### Delete User (Admin)
```javascript
const deleteUserAdmin = async (userId) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};

// Usage
const result = await deleteUserAdmin('user-uuid');
if (result.success) {
  console.log('User deleted successfully');
}
```

### Get All Orders (Admin)
```javascript
const getAllOrders = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/admin/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  return data.data; // Array of all orders
};

// Usage
const allOrders = await getAllOrders();
allOrders.forEach(order => {
  const customer = order.user;
  const product = order.product;
  console.log(`${customer.name} ordered ${product.name} (Order: ${order.status})`);
});
```

---

## 6. Error Handling Best Practices

```javascript
// Helper function with error handling
async function apiRequest(endpoint, options = {}) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    });

    const data = await response.json();

    // Check for API-level success
    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data;
  } catch (error) {
    console.error('API Error:', error.message);
    // Handle specific errors
    if (error.message === 'Invalid or expired token') {
      // Redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error;
  }
}

// Usage with try-catch
try {
  const products = await apiRequest('/products');
  displayProducts(products);
} catch (error) {
  showErrorMessage(error.message);
}
```

---

## 7. React Component Example

```javascript
import React, { useState, useEffect } from 'react';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });
      const data = await res.json();
      if (data.success) {
        alert('Added to cart!');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="products">
      {products.map(product => (
        <div key={product.id} className="product-card">
          <img src={product.image} alt={product.name} />
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <p className="price">${product.price}</p>
          <button onClick={() => handleAddToCart(product.id)}>
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
```

---

## 8. Testing with Jest

```javascript
// __tests__/api.test.js
import { auth, getProducts, addToCart } from '../api';

describe('Auth API', () => {
  test('register new user', async () => {
    const result = await auth.register(
      'Test User',
      'test@example.com',
      'password123',
      'customer'
    );
    expect(result.success).toBe(true);
    expect(result.data.email).toBe('test@example.com');
  });

  test('login with valid credentials', async () => {
    const result = await auth.login('test@example.com', 'password123');
    expect(result.success).toBe(true);
    expect(result.data.token).toBeDefined();
  });

  test('login with invalid credentials', async () => {
    const result = await auth.login('test@example.com', 'wrongpassword');
    expect(result.success).toBe(false);
  });
});

describe('Products API', () => {
  test('fetch all products', async () => {
    const products = await getProducts();
    expect(Array.isArray(products)).toBe(true);
  });
});
```

---

This comprehensive guide covers all real-world usage scenarios for your API!
