// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));
app.use(express.json());
app.use(cookieParser());
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://pratyekpk3:<db_password>@cluster0.7hlp9.mongodb.net/vegetable_ordering_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Define Schemas and Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'admin'], default: 'buyer' }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: 'https://via.placeholder.com/150' }
});

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    products: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'In Progress', 'Delivered'], default: 'Pending' },
    deliveryDetails: {
      address: { type: String, required: true },
      phone: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now }
  });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin Authorization Middleware
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Routes

// Register
// Register with improved error messages
app.post('/api/register', async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
      console.log(req.body);
      
      // Check if username already exists
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ 
          message: 'Username already exists', 
          field: 'username' 
        });
      }
      
      // Check if email already exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ 
          message: 'Email already in use', 
          field: 'email' 
        });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: role || 'buyer'
      });
      
      await newUser.save();
      
      // Create and assign token
      const token = jwt.sign(
        { userId: newUser._id, role: newUser.role },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '1d' }
      );
      
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });
      
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

// Login
// Login with improved error messages
app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Find user
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'User not found', field: 'username' });
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password', field: 'password' });
      }
      
      // Create and assign token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '1d' }
      );
      
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });
      
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
});

// Get current user
app.get('/api/user', authenticate, (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Product Routes

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product (admin only)
app.post('/api/products', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, description, price, image } = req.body;
    
    const newProduct = new Product({
      name,
      description,
      price,
      image: image || 'https://via.placeholder.com/150'
    });
    
    await newProduct.save();
    
    res.status(201).json({
      message: 'Product added successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (admin only)
app.delete('/api/products/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Order Routes

// Create order
// Update to the Create Order endpoint in server.js

// Create order
app.post('/api/orders', authenticate, async (req, res) => {
    try {
      const { products, totalAmount, deliveryDetails } = req.body;
      
      // Validate delivery details
      if (!deliveryDetails || !deliveryDetails.address || !deliveryDetails.phone) {
        return res.status(400).json({ 
          message: 'Delivery address and phone number are required',
        });
      }
      
      // Generate unique order ID
      const orderId = 'ORD' + Date.now().toString().slice(-10);
      
      const newOrder = new Order({
        orderId,
        userId: req.user._id,
        username: req.user.username,
        products,
        totalAmount,
        deliveryDetails,
        status: 'Pending'
      });
      
      await newOrder.save();
      
      res.status(201).json({
        message: 'Order placed successfully',
        order: newOrder
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

// Get user orders
app.get('/api/orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (admin only)
app.get('/api/admin/orders', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin only)
// app.put('/api/orders/:id/status', authenticate, authorizeAdmin, async (req, res) => {
//   try {
//     const { status } = req.body;
    
//     if (!['Pending', 'In Progress', 'Delivered'].includes(status)) {
//       return res.status(400).json({ message: 'Invalid status' });
//     }
    
//     const order = await Order.findById(req.params.id);
    
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }
    
//     order.status = status;
//     await order.save();
    
//     res.status(200).json({
//       message: 'Order status updated successfully',
//       order
//     });
//   } catch (error) {
//     console.error('Error updating order status:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// Add 10 sample products if none exist
const addSampleProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const sampleProducts = [
        { name: 'Apples', description: 'Fresh red apples from local farms', price: 200 },
        { name: 'Bananas', description: 'Bunch of ripe yellow bananas', price: 100 },
        { name: 'Carrots', description: 'Organic carrots, perfect for salads', price: 100 },
        { name: 'Potatoes', description: 'Russet potatoes, great for baking or frying', price: 300 },
        { name: 'Tomatoes', description: 'Vine-ripened tomatoes', price: 200 },
        { name: 'Broccoli', description: 'Fresh green broccoli florets', price: 250 },
        { name: 'Spinach', description: 'Organic baby spinach leaves', price: 310 },
        { name: 'Bell Peppers', description: 'Assorted bell peppers, red, yellow, and green', price: 420 },
        { name: 'Onions', description: 'Yellow onions, essential for cooking', price: 130 },
        { name: 'Mangoes', description: 'Sweet and juicy mangoes', price: 550 }
      ];
      
      await Product.insertMany(sampleProducts);
      console.log('Sample products added');
    }
  } catch (error) {
    console.error('Error adding sample products:', error);
  }
};

// Step 1: Install the required package
// Run: npm install nodemailer

// Step 2: Add email configuration to server.js
// Import nodemailer at the top of your server.js file
const nodemailer = require('nodemailer');

// Create a transporter (add this after your MongoDB connection)
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like SendGrid, Mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password' // Use app password for Gmail
  }
});

// Step 3: Create a helper function to send emails
const sendOrderStatusEmail = async (email, username, orderId, status) => {
  try {
    // Status-specific message and subject
    let subject = '';
    let additionalMessage = '';
    
    switch(status) {
      case 'In Progress':
        subject = 'Your Order is Being Processed';
        additionalMessage = 'We are currently preparing your order and it will be delivered soon.';
        break;
      case 'Delivered':
        subject = 'Your Order Has Been Delivered';
        additionalMessage = 'Your order has been delivered. Thank you for shopping with us!';
        break;
      default:
        subject = 'Order Status Update';
        additionalMessage = 'Your order is now being reviewed.';
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Hello ${username}!</h2>
          <p>Your order <strong>#${orderId}</strong> has been updated to <strong>${status}</strong>.</p>
          <p>${additionalMessage}</p>
          <p>If you have any questions about your order, please contact our customer support.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #777; font-size: 14px;">Thank you for shopping with us!</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Step 4: Update the order status endpoint to include email notification
// Modify the existing route for updating order status:

app.put('/api/orders/:id/status', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'In Progress', 'Delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only send notification if status actually changed
    const statusChanged = order.status !== status;
    
    // Update order status
    order.status = status;
    await order.save();
    
    // If status changed, find user email and send notification
    if (statusChanged) {
      // Get user's email from database using username in the order
      const user = await User.findOne({ username: order.username });
      
      if (user && user.email) {
        // Send email notification
        await sendOrderStatusEmail(
          user.email,
          order.username,
          order.orderId,
          status
        );
      } else {
        console.log(`Could not find email for user: ${order.username}`);
      }
    }
    
    res.status(200).json({
      message: 'Order status updated successfully',
      order,
      emailSent: statusChanged
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  addSampleProducts();
});
