const supabase = require('../config/supabaseClient');
const { v4: uuidv4 } = require('uuid');

/**
 * Get orders based on user role
 */
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = supabase
      .from('orders')
      .select(`
        *,
        user:user_id (id, name, email),
        product:product_id (id, name, price)
      `)
      .order('created_at', { ascending: false });

    // Role-based filtering
    if (userRole === 'customer') {
      // Customers see only their own orders
      query = query.eq('user_id', userId);
    } else if (userRole === 'merchant') {
      // Merchants see orders of their products
      const { data: merchantProducts, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('merchant_id', userId);

      if (productError) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching merchant products',
          data: productError
        });
      }

      const productIds = merchantProducts.map(p => p.id);
      query = query.in('product_id', productIds);
    }
    // Admin sees all orders (no filter)

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching orders',
        data: error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      data: data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      data: error.message
    });
  }
};

/**
 * Create order (customer only)
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = req.body; // Array of { product_id, quantity }

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of products to order',
        data: null
      });
    }

    const createdOrders = [];

    for (const order of orders) {
      const { product_id, quantity = 1 } = order;

      // Validate
      if (!product_id || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Each order must have product_id and quantity > 0',
          data: null
        });
      }

      // Check product exists
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', product_id)
        .single();

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${product_id} not found`,
          data: null
        });
      }

      // Create order
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            id: uuidv4(),
            user_id: userId,
            product_id,
            quantity,
            status: 'pending',
            created_at: new Date()
          }
        ])
        .select();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error creating order',
          data: error
        });
      }

      createdOrders.push(data[0]);
    }

    // Clear cart after order
    await supabase.from('cart').delete().eq('user_id', userId);

    return res.status(201).json({
      success: true,
      message: 'Order(s) created successfully',
      data: createdOrders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      data: error.message
    });
  }
};

/**
 * Update order status (merchant/admin only)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        data: null
      });
    }

    // Check if order exists
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*, product:product_id (merchant_id)')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null
      });
    }

    // Check authorization (merchant can only update their products)
    if (userRole === 'merchant' && order.product.merchant_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update orders for your own products',
        data: null
      });
    }

    // Update order status
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating order',
        data: error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: data[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      data: error.message
    });
  }
};

module.exports = {
  getOrders,
  createOrder,
  updateOrderStatus
};
