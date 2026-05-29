const supabase = require('../config/supabaseClient');
const { v4: uuidv4 } = require('uuid');

const SAMPLE_PRODUCTS = [
  {
    name: 'Organic Coffee Beans',
    description: 'Freshly roasted Arabica beans with a smooth, rich flavor.',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    location: 'Downtown Market'
  },
  {
    name: 'Handmade Ceramic Mug',
    description: 'A handcrafted mug perfect for daily coffee rituals.',
    price: 24.5,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    location: 'Artisan District'
  },
  {
    name: 'Aromatherapy Candle Set',
    description: 'A calming blend of lavender and vanilla for your evenings.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1602872029708-84d970d3382b?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    location: 'Wellness Plaza'
  },
  {
    name: 'Wireless Headphones',
    description: 'Premium noise-canceling headphones built for long listening sessions.',
    price: 89.0,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    location: 'Electronics Hub'
  },
  {
    name: 'Minimalist Backpack',
    description: 'A lightweight everyday backpack for commuting and travel.',
    price: 54.99,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    location: 'Urban Loft'
  }
];

const seedProducts = async () => {
  try {
    const { data: existingProducts, error: existingError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (existingError) {
      console.error('Failed to check existing products:', existingError.message);
      process.exit(1);
    }

    if (existingProducts.length > 0) {
      console.log('Sample products already exist. Skipping seed.');
      return;
    }

    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1);

    if (userError) {
      console.error('Failed to fetch user records:', userError.message);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.log('No users found. Seed skipped. Create a user first.');
      return;
    }

    const merchantId = users[0].id;
    const productRows = SAMPLE_PRODUCTS.map((product) => ({
      id: uuidv4(),
      merchant_id: merchantId,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      created_at: new Date().toISOString()
    }));

    const { error: insertError } = await supabase
      .from('products')
      .insert(productRows);

    if (insertError) {
      console.error('Failed to seed products:', insertError.message);
      process.exit(1);
    }

    console.log(`Seeded ${productRows.length} sample products successfully.`);
  } catch (error) {
    console.error('Unexpected seeding error:', error.message);
    process.exit(1);
  }
};

seedProducts();
