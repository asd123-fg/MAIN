const supabase = require('../config/supabaseClient');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all products
 */
const getProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching products',
        data: error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
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
 * Get product by ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product fetched successfully',
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
 * Create product (merchant only)
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, image } = req.body;
    const merchantId = req.user.id;

    // Validation
    if (!name || !description || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and price are required',
        data: null
      });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          id: uuidv4(),
          merchant_id: merchantId,
          name,
          description,
          price: parseFloat(price),
          image: image || null,
          created_at: new Date()
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error creating product',
        data: error
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
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

/**
 * Update product (merchant only, own products)
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image } = req.body;
    const merchantId = req.user.id;

    // Check if product exists and belongs to merchant
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    if (product.merchant_id !== merchantId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own products',
        data: null
      });
    }

    // Update product
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (image) updateData.image = image;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating product',
        data: error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
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

/**
 * Delete product (merchant only, own products)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    // Check if product exists and belongs to merchant
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    if (product.merchant_id !== merchantId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own products',
        data: null
      });
    }

    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting product',
        data: error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
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
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
