const supabase = require('../config/supabaseClient');

/**
 * Get all users (admin only)
 */
const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching users',
        data: error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
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
 * Delete user (admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Prevent self-deletion
    if (id === adminId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
        data: null
      });
    }

    // Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    // Delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting user',
        data: error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: null
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
 * Get all orders (admin only)
 */
const getAllOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:user_id (id, name, email),
        product:product_id (id, name, price, merchant:merchant_id (name, email))
      `)
      .order('created_at', { ascending: false });

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
 * Get dashboard statistics (admin only)
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get user counts
    const { data: users } = await supabase
      .from('users')
      .select('role');

    // Get product count
    const { data: products } = await supabase
      .from('products')
      .select('id');

    // Get order count and stats
    const { data: orders } = await supabase
      .from('orders')
      .select('id, status, quantity, product:product_id (price)');

    const stats = {
      totalUsers: users?.length || 0,
      admins: users?.filter(u => u.role === 'admin').length || 0,
      merchants: users?.filter(u => u.role === 'merchant').length || 0,
      customers: users?.filter(u => u.role === 'customer').length || 0,
      totalProducts: products?.length || 0,
      totalOrders: orders?.length || 0,
      pendingOrders: orders?.filter(o => o.status === 'pending').length || 0,
      totalRevenue: orders?.reduce((sum, o) => {
        return sum + (o.product?.price * o.quantity || 0);
      }, 0) || 0
    };

    return res.status(200).json({
      success: true,
      message: 'Dashboard statistics fetched successfully',
      data: stats
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
  getUsers,
  deleteUser,
  getAllOrders,
  getDashboardStats
};
