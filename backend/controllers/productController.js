const supabase = require('../config/supabaseClient');
const { v4: uuidv4 } = require('uuid');

const DEFAULT_RATING = 4.5;
const DEFAULT_LOCATION = 'Unknown location';

const removeUndefinedValues = (record = {}) => Object.fromEntries(
  Object.entries(record).filter(([, value]) => value !== undefined)
);

const normalizeProduct = (product = {}) => {
  const imageUrl = product.imageUrl || product.image || null;
  const parsedRating = Number.parseFloat(product.rating);
  const rating = Number.isFinite(parsedRating) ? parsedRating : DEFAULT_RATING;

  return {
    ...product,
    id: product.id,
    name: product.name,
    description: product.description ?? '',
    price: Number.parseFloat(product.price ?? 0),
    image: imageUrl,
    imageUrl,
    rating,
    location: product.location || DEFAULT_LOCATION,
    ownerId: product.ownerId || product.merchant_id || null,
    merchant_id: product.merchant_id || product.ownerId || null,
    created_at: product.created_at || null,
    updated_at: product.updated_at || null
  };
};

const parsePrice = (price) => {
  const parsed = Number.parseFloat(price);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
};

const parseRating = (rating) => {
  if (rating === undefined || rating === null || rating === '') {
    return DEFAULT_RATING;
  }

  const parsed = Number.parseFloat(rating);
  if (Number.isNaN(parsed)) {
    return DEFAULT_RATING;
  }

  return parsed;
};

const executeProductInsert = async (payload) => {
  const sanitizedPayload = removeUndefinedValues(payload);
  const firstAttempt = await supabase
    .from('products')
    .insert([sanitizedPayload])
    .select();

  if (!firstAttempt.error) {
    return firstAttempt;
  }

  const schemaFallbackMessage = firstAttempt.error.message || '';
  if (!/Could not find the 'rating' column|Could not find the 'location' column/.test(schemaFallbackMessage)) {
    return firstAttempt;
  }

  const fallbackPayload = removeUndefinedValues({
    ...sanitizedPayload,
    rating: undefined,
    location: undefined
  });

  return supabase
    .from('products')
    .insert([fallbackPayload])
    .select();
};

const executeProductUpdate = async (id, updateData) => {
  const sanitizedUpdate = removeUndefinedValues(updateData);
  const firstAttempt = await supabase
    .from('products')
    .update(sanitizedUpdate)
    .eq('id', id)
    .select();

  if (!firstAttempt.error) {
    return firstAttempt;
  }

  const schemaFallbackMessage = firstAttempt.error.message || '';
  if (!/Could not find the 'rating' column|Could not find the 'location' column/.test(schemaFallbackMessage)) {
    return firstAttempt;
  }

  const fallbackUpdate = removeUndefinedValues({
    ...sanitizedUpdate,
    rating: undefined,
    location: undefined
  });

  return supabase
    .from('products')
    .update(fallbackUpdate)
    .eq('id', id)
    .select();
};

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
        data: null
      });
    }

    const products = Array.isArray(data) ? data.map(normalizeProduct) : [];

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data: products
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
      data: normalizeProduct(data)
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
    const merchantId = req.user.id;
    const {
      name: rawName,
      description = '',
      price,
      imageUrl: rawImageUrl,
      image: rawImage,
      rating,
      location
    } = req.body;

    const name = typeof rawName === 'string' ? rawName.trim() : '';
    const imageUrl = typeof rawImageUrl === 'string' ? rawImageUrl.trim() : '';
    const image = typeof rawImage === 'string' ? rawImage.trim() : '';
    const resolvedImageUrl = imageUrl || image;
    const parsedPrice = parsePrice(price);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required',
        data: null
      });
    }

    if (parsedPrice === null) {
      return res.status(400).json({
        success: false,
        message: 'A valid product price is required',
        data: null
      });
    }

    if (!resolvedImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'imageUrl is required',
        data: null
      });
    }

    const productPayload = {
      id: uuidv4(),
      merchant_id: merchantId,
      name,
      description,
      price: parsedPrice,
      image: resolvedImageUrl,
      rating: parseRating(rating),
      location: location || DEFAULT_LOCATION,
      created_at: new Date().toISOString()
    };

    const { data, error } = await executeProductInsert(productPayload);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error creating product',
        data: null
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: normalizeProduct(data[0])
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
    const merchantId = req.user.id;
    const {
      name: rawName,
      description,
      price,
      imageUrl: rawImageUrl,
      image: rawImage,
      rating,
      location
    } = req.body;

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

    const updateData = {};
    if (typeof rawName === 'string') {
      const trimmedName = rawName.trim();
      if (trimmedName) {
        updateData.name = trimmedName;
      }
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (price !== undefined) {
      const parsedPrice = parsePrice(price);
      if (parsedPrice === null) {
        return res.status(400).json({
          success: false,
          message: 'A valid product price is required',
          data: null
        });
      }
      updateData.price = parsedPrice;
    }

    if (typeof rawImageUrl === 'string' || typeof rawImage === 'string') {
      const imageUrl = typeof rawImageUrl === 'string' ? rawImageUrl.trim() : '';
      const image = typeof rawImage === 'string' ? rawImage.trim() : '';
      updateData.image = imageUrl || image || product.image || null;
    }

    if (rating !== undefined) {
      updateData.rating = parseRating(rating);
    }

    if (location !== undefined) {
      updateData.location = location || DEFAULT_LOCATION;
    }

    const { data, error } = await executeProductUpdate(id, updateData);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating product',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: normalizeProduct(data[0])
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

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting product',
        data: null
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
