const supabase = require('../config/supabaseClient');
const { v4: uuidv4 } = require('uuid');

/**
 * Get cart items for customer
 */
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('cart')
      .select(`
        *,
        products:product_id (*)
      `)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching cart',
        data: error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cart fetched successfully',
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
 * Add item to cart
 */
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Validation
    if (!product_id || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity (>0) are required',
        data: null
      });
    }

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    // Check if item already in cart
    const { data: existingCart } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .single();

    if (existingCart) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart')
        .update({ quantity: existingCart.quantity + quantity })
        .eq('id', existingCart.id)
        .select();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error updating cart',
          data: error
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Item quantity updated in cart',
        data: data[0]
      });
    } else {
      // Insert new cart item
      const { data, error } = await supabase
        .from('cart')
        .insert([
          {
            id: uuidv4(),
            user_id: userId,
            product_id,
            quantity
          }
        ])
        .select();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error adding to cart',
          data: error
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Item added to cart',
        data: data[0]
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      data: error.message
    });
  }
};

/**
 * Remove item from cart
 */
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if cart item exists and belongs to user
    const { data: cartItem, error: fetchError } = await supabase
      .from('cart')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
        data: null
      });
    }

    if (cartItem.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own cart items',
        data: null
      });
    }

    // Delete cart item
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error removing from cart',
        data: error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
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
 * Clear entire cart
 */
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error clearing cart',
        data: error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
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

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};
