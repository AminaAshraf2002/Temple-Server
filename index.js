// WORKING Backend with Direct Cashfree HTTP API - index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios'); // Add this for HTTP requests
require('dotenv').config();

// Import models
const Pooja = require('./models/Pooja');
const Booking = require('./models/Booking');
const Star = require('./models/Star');

const app = express();

// Cashfree configuration
const CASHFREE_CONFIG = {
  clientId: process.env.CASHFREE_APP_ID,
  clientSecret: process.env.CASHFREE_CLIENT_SECRET,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  apiVersion: '2023-08-01'
};

// Cashfree API URLs
const CASHFREE_BASE_URL = CASHFREE_CONFIG.environment === 'production' 
  ? 'https://api.cashfree.com/pg' 
  : 'https://sandbox.cashfree.com/pg';

console.log('Cashfree Configuration:');
console.log('Environment:', CASHFREE_CONFIG.environment);
console.log('Client ID:', CASHFREE_CONFIG.clientId ? `${CASHFREE_CONFIG.clientId.substring(0, 10)}...` : 'Missing');
console.log('Client Secret:', CASHFREE_CONFIG.clientSecret ? 'Configured' : 'Missing');
console.log('API Base URL:', CASHFREE_BASE_URL);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS Origin Request:', origin);
    
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5173',
      'https://sreevarahitemple.com',
      'https://www.sreevarahitemple.com',
      'https://varahi-temple.vercel.app'
    ];
    
    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Origin allowed:', origin);
      return callback(null, true);
    }
    
    console.log('CORS: Origin blocked:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

console.log('Starting temple server with Direct Cashfree HTTP API...');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(error => console.error('MongoDB error:', error));

// Helper functions
const generateReceiptNumber = () => {
  return 'VST' + Date.now().toString().slice(-6);
};

const generateOrderId = () => {
  return 'ORDER_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const getBookingCount = async (poojaId, poojaDate = null) => {
  try {
    let query = { 
      $or: [
        { poojaId: parseInt(poojaId) },
        { poojaId: poojaId.toString() }
      ],
      paymentStatus: 'completed'
    };
    
    if (poojaDate) {
      query.poojaDate = poojaDate;
    }
    
    const count = await Booking.countDocuments(query);
    console.log(`Found ${count} completed bookings for pooja ${poojaId}`);
    
    return count;
  } catch (error) {
    console.error('Error getting booking count:', error);
    return 0;
  }
};

// Direct Cashfree API function
const createCashfreeOrder = async (orderData) => {
  try {
    const url = `${CASHFREE_BASE_URL}/orders`;
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-client-id': CASHFREE_CONFIG.clientId,
      'x-client-secret': CASHFREE_CONFIG.clientSecret,
      'x-api-version': CASHFREE_CONFIG.apiVersion
    };

    console.log('Making direct API call to Cashfree...');
    console.log('URL:', url);
    console.log('Headers:', { ...headers, 'x-client-secret': '[HIDDEN]' });
    console.log('Order Data:', JSON.stringify(orderData, null, 2));

    const response = await axios.post(url, orderData, { headers });
    
    console.log('Cashfree API Response Status:', response.status);
    console.log('Cashfree API Response Data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Direct Cashfree API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Temple Booking API with Direct Cashfree HTTP Integration',
    status: 'Running successfully',
    paymentGateway: 'Cashfree (Direct HTTP API)',
    environment: CASHFREE_CONFIG.environment,
    timestamp: new Date().toISOString(),
    version: '3.0.0'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    cashfree: {
      configured: !!(CASHFREE_CONFIG.clientId && CASHFREE_CONFIG.clientSecret),
      environment: CASHFREE_CONFIG.environment,
      apiUrl: CASHFREE_BASE_URL
    },
    timestamp: new Date().toISOString()
  });
});

// GET /api/poojas
app.get('/api/poojas', async (req, res) => {
  try {
    const poojas = await Pooja.find({}).sort({ date: 1 });
    
    const poojaWithCounts = await Promise.all(
      poojas.map(async (pooja) => {
        const bookedCount = await getBookingCount(pooja.id);
        const availableSlots = pooja.maxParticipants - bookedCount;
        
        return {
          id: pooja.id,
          poojaEnglish: pooja.poojaEnglish,
          pooja: pooja.pooja,
          malayalamDate: pooja.malayalamDate,
          day: pooja.day,
          date: pooja.date,
          amount: pooja.amount,
          category: pooja.category,
          special: pooja.special,
          bookedCount: bookedCount,
          availableSlots: availableSlots,
          available: availableSlots > 0,
          maxParticipants: pooja.maxParticipants
        };
      })
    );
    
    res.json({
      status: 'success',
      data: poojaWithCounts
    });
  } catch (error) {
    console.error('Error fetching poojas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch poojas',
      error: error.message
    });
  }
});

// GET /api/stars
app.get('/api/stars', async (req, res) => {
  try {
    const stars = await Star.find({}).sort({ name: 1 });
    res.json({
      status: 'success',
      data: stars.map(star => star.name)
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stars',
      error: error.message
    });
  }
});

// FIXED: POST /api/bookings - With Sequential Participant Numbering
app.post('/api/bookings', async (req, res) => {
  try {
    const { devoteName, star, paymentMethod, poojaDate, poojaId } = req.body;
    
    if (!devoteName || !star || !paymentMethod || !poojaDate || !poojaId) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    }

    const pooja = await Pooja.findOne({ id: poojaId });
    if (!pooja) {
      return res.status(404).json({
        status: 'error',
        message: 'Pooja not found'
      });
    }
    
    const currentBookings = await getBookingCount(poojaId, poojaDate);
    
    if (currentBookings >= pooja.maxParticipants) {
      return res.status(400).json({
        status: 'error',
        message: `Sorry, this pooja is fully booked (${currentBookings}/${pooja.maxParticipants} participants)`
      });
    }
    
    // FIXED: Get the next sequential participant number based on completed bookings count
    const participantNumber = currentBookings + 1;
    
    console.log(`Assigning participant number ${participantNumber} for pooja ${poojaId}`);
    
    const receiptNumber = generateReceiptNumber();
    const orderId = generateOrderId();
    const customerId = 'CUSTOMER_' + Date.now();
    
    // Create booking record
    const booking = new Booking({
      receiptNumber,
      devoteName: devoteName.trim(),
      star,
      paymentMethod,
      poojaDate,
      poojaId: pooja.id,
      poojaEnglish: pooja.poojaEnglish,
      pooja: pooja.pooja,
      amount: pooja.amount,
      participantNumber,
      paymentStatus: 'pending',
      orderId: orderId,
      customerId: customerId,
      transactionId: null
    });
    
    await booking.save();
    
    // Check if Cashfree is configured
    if (!CASHFREE_CONFIG.clientId || !CASHFREE_CONFIG.clientSecret) {
      console.log('Cashfree not configured, using manual mode');
      return res.status(201).json({
        status: 'success',
        message: 'Booking created. Manual payment mode.',
        bookingId: booking._id.toString(),
        orderId: orderId,
        receiptNumber: booking.receiptNumber,
        amount: pooja.amount,
        customerId: customerId,
        paymentMode: 'manual'
      });
    }

    try {
      // Create Cashfree order using direct HTTP API
      const orderRequest = {
        order_id: orderId,
        order_amount: pooja.amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerId,
          customer_name: devoteName.trim(),
          customer_email: 'devotee@temple.com',
          customer_phone: '9999999999'
        },
        order_meta: {
          return_url: `${req.protocol}://${req.get('host')}/payment-return?order_id={order_id}`,
          notify_url: `${req.protocol}://${req.get('host')}/api/webhooks/cashfree`
        },
        order_note: `Pooja booking: ${pooja.poojaEnglish} for ${devoteName.trim()}`
      };
      
      const cashfreeResponse = await createCashfreeOrder(orderRequest);
      
      // Update booking with Cashfree details
      booking.cashfreeOrderId = cashfreeResponse.cf_order_id;
      booking.paymentSessionId = cashfreeResponse.payment_session_id;
      await booking.save();
      
      console.log('Cashfree order created successfully');
      
      res.status(201).json({
        status: 'success',
        message: 'Booking created. Please complete payment.',
        bookingId: booking._id.toString(),
        orderId: orderId,
        cashfreeOrderId: cashfreeResponse.cf_order_id,
        paymentSessionId: cashfreeResponse.payment_session_id,
        receiptNumber: booking.receiptNumber,
        amount: pooja.amount,
        customerId: customerId,
        paymentMode: 'cashfree'
      });
      
    } catch (cashfreeError) {
      console.error('Cashfree order creation failed:', cashfreeError.message);
      
      res.status(201).json({
        status: 'success',
        message: 'Booking created. Manual payment mode due to gateway error.',
        bookingId: booking._id.toString(),
        orderId: orderId,
        receiptNumber: booking.receiptNumber,
        amount: pooja.amount,
        customerId: customerId,
        paymentMode: 'manual',
        error: cashfreeError.message
      });
    }
    
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// POST /api/bookings/payment-complete
app.post('/api/bookings/payment-complete', async (req, res) => {
  try {
    const { bookingId, cashfreePaymentId, orderId, paymentStatus } = req.body;
    
    if (!bookingId) {
      return res.status(400).json({
        status: 'error',
        message: 'Booking ID is required'
      });
    }
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }
    
    // Update booking status
    booking.paymentStatus = 'completed';
    booking.transactionId = cashfreePaymentId || `manual_${Date.now()}`;
    booking.paymentCompletedAt = new Date();
    await booking.save();
    
    console.log(`Payment completed for booking ${booking._id}`);
    
    // Prepare receipt data
    const receiptData = {
      receiptNumber: booking.receiptNumber,
      date: new Date().toLocaleDateString('en-IN'),
      devotee: {
        devoteName: booking.devoteName,
        star: booking.star
      },
      pooja: {
        poojaEnglish: booking.poojaEnglish,
        malayalam: booking.pooja,
        date: booking.poojaDate,
        amount: booking.amount
      },
      temple: {
        name: "AALUMTHAZHAM SREE VARAHI TEMPLE",
        address: "Aalumthazham, Pathanamthitta District, Kerala - 689645",
        phone: "+91 8304091400",
        website: "https://sreevarahitemple.com"
      },
      booking: {
        paymentMethod: booking.paymentMethod,
        participantNumber: booking.participantNumber,
        transactionId: booking.transactionId,
        orderId: booking.orderId,
        bookingId: booking._id.toString()
      }
    };
    
    res.json({
      status: 'success',
      message: 'Payment completed successfully',
      receiptData: receiptData
    });
    
  } catch (error) {
    console.error('Payment completion error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete payment',
      error: error.message
    });
  }
});

// Cashfree Webhook endpoint
app.post('/api/webhooks/cashfree', async (req, res) => {
  try {
    console.log('Cashfree webhook received:', req.body);
    
    const { orderId, paymentStatus, cashfreePaymentId } = req.body;
    
    if (paymentStatus === 'SUCCESS') {
      const booking = await Booking.findOne({ orderId: orderId });
      
      if (booking && booking.paymentStatus === 'pending') {
        booking.paymentStatus = 'completed';
        booking.transactionId = cashfreePaymentId;
        booking.paymentCompletedAt = new Date();
        await booking.save();
        
        console.log(`Payment completed for booking ${booking._id} via webhook`);
      }
    }
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ status: 'error', message: error.message });
  }
});

// GET /api/bookings/:id
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }
    
    res.json({
      status: 'success',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
});

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'temple123') {
    res.json({
      status: 'success',
      message: 'Login successful',
      token: 'admin_token_' + Date.now(),
      admin: { username: 'admin', role: 'admin' }
    });
  } else {
    res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }
});

// GET /api/admin/dashboard
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const totalPoojas = await Pooja.countDocuments({});
    const totalBookings = await Booking.countDocuments({ paymentStatus: 'completed' });
    const pendingBookings = await Booking.countDocuments({ paymentStatus: 'pending' });
    
    const completedBookings = await Booking.find({ paymentStatus: 'completed' });
    const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.amount, 0);
    
    const recentBookings = await Booking.find({ paymentStatus: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10);
    
    const poojas = await Pooja.find({}).sort({ date: 1 });
    const poojaStats = await Promise.all(
      poojas.map(async (pooja) => {
        const bookedCount = await getBookingCount(pooja.id);
        const revenue = bookedCount * pooja.amount;
        
        return {
          id: pooja.id,
          name: pooja.poojaEnglish,
          malayalam: pooja.pooja,
          date: pooja.date,
          category: pooja.category,
          amount: pooja.amount,
          bookedCount,
          maxParticipants: pooja.maxParticipants,
          availableSlots: pooja.maxParticipants - bookedCount,
          revenue,
          isFullyBooked: bookedCount >= pooja.maxParticipants
        };
      })
    );
    
    res.json({
      status: 'success',
      data: {
        overview: {
          totalPoojas,
          totalBookings,
          pendingBookings,
          totalRevenue
        },
        recentBookings: recentBookings.map(booking => ({
          id: booking._id,
          receiptNumber: booking.receiptNumber,
          devoteName: booking.devoteName,
          star: booking.star,
          poojaEnglish: booking.poojaEnglish,
          amount: booking.amount,
          date: booking.createdAt,
          participantNumber: booking.participantNumber,
          transactionId: booking.transactionId
        })),
        poojaStats
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// FIXED: GET /api/admin/bookings/pooja/:poojaId - Get participants for a specific pooja
app.get('/api/admin/bookings/pooja/:poojaId', async (req, res) => {
  try {
    const { poojaId } = req.params;
    
    console.log(`Fetching participants for pooja ID: ${poojaId}`);
    
    // Find the pooja details first
    const pooja = await Pooja.findOne({ id: parseInt(poojaId) });
    if (!pooja) {
      return res.status(404).json({
        status: 'error',
        message: 'Pooja not found'
      });
    }
    
    // Get all completed bookings for this pooja, sorted by creation date
    const bookings = await Booking.find({ 
      $or: [
        { poojaId: parseInt(poojaId) },
        { poojaId: poojaId.toString() }
      ],
      paymentStatus: 'completed'
    }).sort({ createdAt: 1 }); // Sort by creation date, earliest first
    
    console.log(`Found ${bookings.length} completed bookings for pooja ${poojaId}`);
    console.log('Booking participant numbers:', bookings.map(b => ({ id: b._id, participantNumber: b.participantNumber, devoteName: b.devoteName })));
    
    // Create participant slots array (1 to maxParticipants)
    const participants = [];
    
    for (let slotNumber = 1; slotNumber <= pooja.maxParticipants; slotNumber++) {
      // Get booking for this slot (sequential by creation order)
      const booking = bookings[slotNumber - 1]; // Array is 0-indexed, slots are 1-indexed
      
      if (booking) {
        // Slot is booked
        participants.push({
          slotNumber: slotNumber,
          status: 'booked',
          devoteName: booking.devoteName,
          star: booking.star,
          bookingDate: booking.createdAt,
          receiptNumber: booking.receiptNumber,
          transactionId: booking.transactionId,
          paymentMethod: booking.paymentMethod,
          amount: booking.amount,
          bookingId: booking._id,
          originalParticipantNumber: booking.participantNumber
        });
      } else {
        // Slot is available
        participants.push({
          slotNumber: slotNumber,
          status: 'available',
          devoteName: null,
          star: null,
          bookingDate: null,
          receiptNumber: null,
          transactionId: null,
          paymentMethod: null,
          amount: null,
          bookingId: null,
          originalParticipantNumber: null
        });
      }
    }
    
    // Calculate statistics
    const bookedCount = bookings.length;
    const availableCount = pooja.maxParticipants - bookedCount;
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.amount, 0);
    
    const statistics = {
      totalSlots: pooja.maxParticipants,
      bookedSlots: bookedCount,
      availableSlots: availableCount,
      totalRevenue: totalRevenue,
      averageAmount: bookedCount > 0 ? totalRevenue / bookedCount : 0,
      fillPercentage: Math.round((bookedCount / pooja.maxParticipants) * 100)
    };
    
    res.json({
      status: 'success',
      data: {
        poojaId: parseInt(poojaId),
        poojaName: pooja.poojaEnglish,
        poojaDate: pooja.date,
        participants: participants,
        statistics: statistics,
        debug: {
          totalBookingsFound: bookings.length,
          bookingDetails: bookings.map(b => ({
            id: b._id,
            participantNumber: b.participantNumber,
            devoteName: b.devoteName,
            createdAt: b.createdAt
          }))
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching pooja participants:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch participants',
      error: error.message
    });
  }
});

// Debug endpoint to check participant numbering
app.get('/api/debug/pooja/:poojaId', async (req, res) => {
  try {
    const { poojaId } = req.params;
    
    const bookings = await Booking.find({ 
      $or: [
        { poojaId: parseInt(poojaId) },
        { poojaId: poojaId.toString() }
      ],
      paymentStatus: 'completed'
    }).sort({ createdAt: 1 });
    
    res.json({
      status: 'success',
      data: {
        totalBookings: bookings.length,
        bookings: bookings.map(b => ({
          id: b._id,
          devoteName: b.devoteName,
          participantNumber: b.participantNumber,
          createdAt: b.createdAt,
          paymentStatus: b.paymentStatus
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Debug failed',
      error: error.message
    });
  }
});

// GET /api/admin/bookings - Enhanced to get all bookings with filtering
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const { 
      poojaId, 
      status = 'completed', 
      page = 1, 
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build query
    let query = {};
    
    if (poojaId && poojaId !== 'all') {
      query.$or = [
        { poojaId: parseInt(poojaId) },
        { poojaId: poojaId.toString() }
      ];
    }
    
    if (status && status !== 'all') {
      query.paymentStatus = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortObj = {};
    sortObj[sortBy] = sortDirection;
    
    // Get bookings with pagination
    const bookings = await Booking.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / parseInt(limit));
    
    console.log(`Fetched ${bookings.length} bookings (page ${page} of ${totalPages})`);
    
    res.json({
      status: 'success',
      data: {
        bookings: bookings,
        pagination: {
          current: parseInt(page),
          total: totalPages,
          count: totalBookings,
          limit: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\nSREE VARAHI TEMPLE SERVER STARTED`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Payment Gateway: Cashfree (Direct HTTP API)`);
  console.log(`Environment: ${CASHFREE_CONFIG.environment}`);
  console.log(`Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API docs: http://localhost:${PORT}/`);
});