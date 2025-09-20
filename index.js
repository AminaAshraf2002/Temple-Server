// COMPLETE Enhanced Backend with Direct Cashfree HTTP API + Enhanced Poojas Support - index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
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
      'http://localhost:5174',
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

console.log('Starting enhanced temple server with Direct Cashfree HTTP API...');

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
    message: 'Enhanced Temple Booking API with Direct Cashfree HTTP Integration',
    status: 'Running successfully',
    paymentGateway: 'Cashfree (Direct HTTP API)',
    environment: CASHFREE_CONFIG.environment,
    timestamp: new Date().toISOString(),
    version: '4.0.0 - Enhanced with Descriptions',
    features: [
      'Original 39 Temple Poojas',
      'Enhanced Poojas with Descriptions',
      'Daily Worship Schedule',
      'Nakshatra Pooja',
      'Special Festival Offerings with 6 Subcategories',
      'Malayalam & English Descriptions',
      'Advanced Booking Requirements'
    ]
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

// ENHANCED: GET /api/poojas - Support for enhanced poojas with descriptions
app.get('/api/poojas', async (req, res) => {
  try {
    const poojas = await Pooja.find({}).sort({ date: 1, id: 1 });

    const poojaWithCounts = await Promise.all(
      poojas.map(async (pooja) => {
        let bookedCount = 0;
        let availableSlots = 0;
        let available = true;

        // Only calculate booking counts for poojas that can be booked
        bookedCount = await getBookingCount(pooja.id);
        if (pooja.maxParticipants) {
          availableSlots = pooja.maxParticipants - bookedCount;
          available = availableSlots > 0;
        } else {
          // Unlimited participants
          availableSlots = 999999; // or some large number
          available = true;
        }

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
          available: available,
          maxParticipants: pooja.maxParticipants || null, // Change from || 0 to || null

          // NEW ENHANCED FIELDS
          description: pooja.description || null,
          descriptionEnglish: pooja.descriptionEnglish || null,
          parentCategory: pooja.parentCategory || null,
          hasSubcategories: pooja.hasSubcategories || false,
          bookingRequirements: pooja.getBookingRequirements ? pooja.getBookingRequirements() : [],

          // Booking requirement flags
          requiresAdvanceBooking: pooja.requiresAdvanceBooking || false,
          requiresDirectVisit: pooja.requiresDirectVisit || false,
          requiresNotification: pooja.requiresNotification || false,
          requiresBooking: pooja.requiresBooking || false,
          isComprehensiveRitual: pooja.isComprehensiveRitual || false,
          onlineBookingAvailable: pooja.onlineBookingAvailable || false
        };
      })
    );

    res.json({
      status: 'success',
      data: poojaWithCounts,
      meta: {
        totalPoojas: poojaWithCounts.length,
        categories: {
          regular: poojaWithCounts.filter(p => p.category === 'regular').length,
          special: poojaWithCounts.filter(p => p.category === 'special').length,
          festival: poojaWithCounts.filter(p => p.category === 'festival').length,
          premium: poojaWithCounts.filter(p => p.category === 'premium').length,
          parent: poojaWithCounts.filter(p => p.category === 'parent').length,
          subcategory: poojaWithCounts.filter(p => p.category === 'subcategory').length
        }
      }
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

// NEW: GET /api/poojas/categories - Get poojas organized by categories
app.get('/api/poojas/categories', async (req, res) => {
  try {
    const regularPoojas = await Pooja.find({ category: 'regular' });
    const specialPoojas = await Pooja.find({ category: 'special' });
    const festivalPoojas = await Pooja.find({ category: 'festival' });
    const premiumPoojas = await Pooja.find({ category: 'premium' });
    const parentCategories = await Pooja.find({ hasSubcategories: true });

    // Get subcategories for each parent
    const enhancedParentCategories = await Promise.all(
      parentCategories.map(async (parent) => {
        const subcategories = await Pooja.find({ parentCategory: parent.pooja });
        return {
          ...parent.toObject(),
          subcategories: subcategories
        };
      })
    );

    res.json({
      status: 'success',
      data: {
        regular: regularPoojas,
        special: specialPoojas,
        festival: festivalPoojas,
        premium: premiumPoojas,
        specialOfferingCategories: enhancedParentCategories
      }
    });
  } catch (error) {
    console.error('Error fetching categorized poojas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch categorized poojas',
      error: error.message
    });
  }
});

// NEW: GET /api/poojas/subcategories/:parentName - Get subcategories for a parent
app.get('/api/poojas/subcategories/:parentName', async (req, res) => {
  try {
    const { parentName } = req.params;
    const decodedParentName = decodeURIComponent(parentName);

    const subcategories = await Pooja.find({ parentCategory: decodedParentName });

    if (subcategories.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No subcategories found for this parent category'
      });
    }

    res.json({
      status: 'success',
      data: {
        parentCategory: decodedParentName,
        subcategories: subcategories
      }
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subcategories',
      error: error.message
    });
  }
});

// NEW: GET /api/poojas/available/:date - Get poojas available on a specific date
app.get('/api/poojas/available/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const availablePoojas = await Pooja.find({
      $or: [
        { date: date },
        { date: null }
      ]
    });

    res.json({
      status: 'success',
      data: {
        date: date,
        availablePoojas: availablePoojas
      }
    });
  } catch (error) {
    console.error('Error fetching available poojas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch available poojas',
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

// FIXED: ENHANCED POST /api/bookings - Support for enhanced poojas with proper validation
app.post('/api/bookings', async (req, res) => {
  try {
    const { devoteName, star, paymentMethod, poojaDate, poojaId } = req.body;

    if (!devoteName || !star || !paymentMethod || !poojaId) {
      return res.status(400).json({
        status: 'error',
        message: 'All required fields must be provided'
      });
    }

    const pooja = await Pooja.findOne({ id: poojaId });
    if (!pooja) {
      return res.status(404).json({
        status: 'error',
        message: 'Pooja not found'
      });
    }

    console.log(`Booking request for pooja: ${pooja.poojaEnglish} (Category: ${pooja.category})`);
    console.log(`Online booking available: ${pooja.onlineBookingAvailable}`);
    console.log(`Requires direct visit: ${pooja.requiresDirectVisit}`);
    console.log(`Max participants: ${pooja.maxParticipants}`);

    // Check if this pooja can be booked
    if (pooja.category === 'parent') {
      const subcategories = await Pooja.find({ parentCategory: pooja.pooja });
      return res.status(400).json({
        status: 'error',
        message: 'Cannot book parent category. Please select a specific pooja from subcategories.',
        availableSubcategories: subcategories
      });
    }

    if (!pooja.amount) {
      return res.status(400).json({
        status: 'error',
        message: 'This pooja is not available for online booking.'
      });
    }

    // FIXED: Check online booking availability FIRST
    if (pooja.onlineBookingAvailable === false) {
      return res.status(400).json({
        status: 'error',
        message: 'This pooja is not available for online booking. Please visit the temple directly.',
        requirements: pooja.getBookingRequirements ? pooja.getBookingRequirements() : []
      });
    }

    // FIXED: For poojas that require direct visit BUT have online booking enabled
    if (pooja.requiresDirectVisit && pooja.onlineBookingAvailable !== true) {
      return res.status(400).json({
        status: 'error',
        message: 'This pooja requires direct visit to the temple. Online booking not available.',
        requirements: pooja.getBookingRequirements ? pooja.getBookingRequirements() : []
      });
    }

    // For poojas that require notification but allow online booking
    if (pooja.requiresNotification && pooja.onlineBookingAvailable !== true) {
      return res.status(400).json({
        status: 'error',
        message: 'This pooja requires prior notification to temple authorities.',
        requirements: pooja.getBookingRequirements ? pooja.getBookingRequirements() : []
      });
    }

    // Check if poojaDate is required and provided for date-specific poojas
    if (pooja.date && !poojaDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Pooja date is required for this booking',
        requiredDate: pooja.date
      });
    }

    // For date-specific poojas, validate the date
    if (pooja.date && poojaDate && pooja.date !== poojaDate) {
      return res.status(400).json({
        status: 'error',
        message: `This pooja can only be booked for ${pooja.date}`,
        requiredDate: pooja.date
      });
    }

    // FIXED: Check availability for poojas with participant limits (handle null properly)
    let participantNumber = 1;
    if (pooja.maxParticipants && pooja.maxParticipants > 0) {
      const currentBookings = await getBookingCount(poojaId, poojaDate);

      if (currentBookings >= pooja.maxParticipants) {
        return res.status(400).json({
          status: 'error',
          message: `Sorry, this pooja is fully booked (${currentBookings}/${pooja.maxParticipants} participants)`
        });
      }

      participantNumber = currentBookings + 1;
    } else {
      // For unlimited participant poojas, still get a sequential number
      participantNumber = (await getBookingCount(poojaId, poojaDate)) + 1;
    }

    console.log(`Creating booking for enhanced pooja ${poojaId} - ${pooja.poojaEnglish}`);
    console.log(`Participant limits: ${pooja.maxParticipants || 'UNLIMITED'}`);
    console.log(`Participant number: ${participantNumber}`);

    const receiptNumber = generateReceiptNumber();
    const orderId = generateOrderId();
    const customerId = 'CUSTOMER_' + Date.now();

    // Create booking record
    const booking = new Booking({
      receiptNumber,
      devoteName: devoteName.trim(),
      star,
      paymentMethod,
      poojaDate: poojaDate || null,
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
        paymentMode: 'manual',
        poojaCategory: pooja.category,
        bookingRequirements: pooja.getBookingRequirements ? pooja.getBookingRequirements() : [],
        participantLimit: pooja.maxParticipants || 'unlimited'
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
        order_note: `Enhanced Pooja booking: ${pooja.poojaEnglish} for ${devoteName.trim()}`
      };

      const cashfreeResponse = await createCashfreeOrder(orderRequest);

      // Update booking with Cashfree details
      booking.cashfreeOrderId = cashfreeResponse.cf_order_id;
      booking.paymentSessionId = cashfreeResponse.payment_session_id;
      await booking.save();

      console.log('Cashfree order created successfully for enhanced pooja');

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
        paymentMode: 'cashfree',
        poojaType: pooja.category,
        bookingRequirements: pooja.getBookingRequirements ? pooja.getBookingRequirements() : [],
        participantLimit: pooja.maxParticipants || 'unlimited'
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
        error: cashfreeError.message,
        poojaCategory: pooja.category,
        participantLimit: pooja.maxParticipants || 'unlimited'
      });
    }

  } catch (error) {
    console.error('Enhanced booking creation error:', error);
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

    // Get enhanced pooja details for receipt
    const pooja = await Pooja.findOne({ id: booking.poojaId });

    // Prepare enhanced receipt data
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
        amount: booking.amount,
        category: pooja?.category || 'regular',
        description: pooja?.descriptionEnglish || null,
        bookingRequirements: pooja?.getBookingRequirements ? pooja.getBookingRequirements() : []
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

// ENHANCED: GET /api/admin/dashboard - Support enhanced poojas
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
        let bookedCount = 0;
        let revenue = 0;

        // Only calculate for bookable poojas
        if (pooja.category !== 'parent' && pooja.amount) {
          bookedCount = await getBookingCount(pooja.id);
          revenue = bookedCount * pooja.amount;
        }

        return {
          id: pooja.id,
          name: pooja.poojaEnglish,
          malayalam: pooja.pooja,
          date: pooja.date,
          category: pooja.category,
          amount: pooja.amount,
          bookedCount,
          maxParticipants: pooja.maxParticipants || null, // FIXED: Changed from 0 to null
          availableSlots: pooja.maxParticipants ? Math.max(0, pooja.maxParticipants - bookedCount) : 'unlimited',
          revenue,
          isFullyBooked: pooja.maxParticipants ? bookedCount >= pooja.maxParticipants : false,

          // Enhanced fields
          hasSubcategories: pooja.hasSubcategories || false,
          parentCategory: pooja.parentCategory || null,
          isBookable: pooja.category !== 'parent' && !!pooja.amount
        };
      })
    );

    // Enhanced statistics
    const categoryStats = {
      regular: poojaStats.filter(p => p.category === 'regular').length,
      special: poojaStats.filter(p => p.category === 'special').length,
      festival: poojaStats.filter(p => p.category === 'festival').length,
      premium: poojaStats.filter(p => p.category === 'premium').length,
      parent: poojaStats.filter(p => p.category === 'parent').length,
      subcategory: poojaStats.filter(p => p.category === 'subcategory').length
    };

    res.json({
      status: 'success',
      data: {
        overview: {
          totalPoojas,
          totalBookings,
          pendingBookings,
          totalRevenue,
          categoryBreakdown: categoryStats
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
        poojaStats,
        enhancedFeatures: {
          totalEnhancedPoojas: poojaStats.filter(p => ['premium', 'parent', 'subcategory'].includes(p.category)).length,
          totalBookablePoojas: poojaStats.filter(p => p.isBookable).length,
          totalParentCategories: categoryStats.parent
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// ENHANCED: GET /api/admin/bookings/pooja/:poojaId - Get participants for enhanced poojas
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

    // Check if this pooja can have bookings
    if (pooja.category === 'parent') {
      const subcategories = await Pooja.find({ parentCategory: pooja.pooja });
      return res.status(400).json({
        status: 'error',
        message: 'Parent categories cannot have direct bookings',
        subcategories: subcategories
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

    // FIXED: Handle unlimited participant poojas properly
    const participants = [];
    const maxParticipants = pooja.maxParticipants;

    if (maxParticipants && maxParticipants > 0) {
      // Limited participants - create slots
      for (let slotNumber = 1; slotNumber <= maxParticipants; slotNumber++) {
        const booking = bookings[slotNumber - 1];

        if (booking) {
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
    } else {
      // Unlimited participants - show all bookings as sequential list
      bookings.forEach((booking, index) => {
        participants.push({
          slotNumber: index + 1,
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
      });
    }

    // Calculate statistics
    const bookedCount = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.amount, 0);

    const statistics = {
      totalSlots: maxParticipants || 'unlimited',
      bookedSlots: bookedCount,
      availableSlots: maxParticipants ? Math.max(0, maxParticipants - bookedCount) : 'unlimited',
      totalRevenue: totalRevenue,
      averageAmount: bookedCount > 0 ? totalRevenue / bookedCount : 0,
      fillPercentage: maxParticipants ? Math.round((bookedCount / maxParticipants) * 100) : null,
      hasParticipantLimit: !!(maxParticipants && maxParticipants > 0)
    };

    res.json({
      status: 'success',
      data: {
        poojaId: parseInt(poojaId),
        poojaName: pooja.poojaEnglish,
        poojaDate: pooja.date,
        category: pooja.category,
        participants: participants,
        statistics: statistics,
        poojaDetails: {
          description: pooja.description,
          descriptionEnglish: pooja.descriptionEnglish,
          bookingRequirements: pooja.getBookingRequirements ? pooja.getBookingRequirements() : [],
          parentCategory: pooja.parentCategory,
          isComprehensiveRitual: pooja.isComprehensiveRitual || false,
          maxParticipants: pooja.maxParticipants,
          onlineBookingAvailable: pooja.onlineBookingAvailable
        },
        debug: {
          totalBookingsFound: bookings.length,
          maxParticipants: maxParticipants,
          isUnlimited: !maxParticipants
        }
      }
    });

  } catch (error) {
    console.error('Error fetching enhanced pooja participants:', error);
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

    const pooja = await Pooja.findOne({ id: parseInt(poojaId) });

    res.json({
      status: 'success',
      data: {
        totalBookings: bookings.length,
        poojaDetails: pooja ? {
          name: pooja.poojaEnglish,
          category: pooja.category,
          maxParticipants: pooja.maxParticipants,
          amount: pooja.amount,
          onlineBookingAvailable: pooja.onlineBookingAvailable
        } : null,
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
      sortOrder = 'desc',
      category
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

    // Filter by pooja category if requested
    if (category && category !== 'all') {
      const categoryPoojas = await Pooja.find({ category: category });
      const poojaIds = categoryPoojas.map(p => p.id);
      query.poojaId = { $in: poojaIds };
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
        },
        filters: {
          poojaId: poojaId || 'all',
          status: status,
          category: category || 'all'
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

// NEW: GET /api/admin/analytics - Enhanced analytics for admin
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    // Build date query if provided
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get all completed bookings
    const bookings = await Booking.find({
      paymentStatus: 'completed',
      ...dateQuery
    });

    // Get pooja details for analytics
    const poojas = await Pooja.find({});
    const poojaMap = {};
    poojas.forEach(pooja => {
      poojaMap[pooja.id] = pooja;
    });

    // Analyze bookings by category
    const categoryAnalytics = {};
    const revenueByCategory = {};
    const bookingsByPooja = {};

    bookings.forEach(booking => {
      const pooja = poojaMap[booking.poojaId];
      if (pooja) {
        const cat = pooja.category;

        if (!categoryAnalytics[cat]) {
          categoryAnalytics[cat] = { count: 0, revenue: 0 };
          revenueByCategory[cat] = 0;
        }

        categoryAnalytics[cat].count += 1;
        categoryAnalytics[cat].revenue += booking.amount;
        revenueByCategory[cat] += booking.amount;

        if (!bookingsByPooja[booking.poojaId]) {
          bookingsByPooja[booking.poojaId] = {
            poojaName: pooja.poojaEnglish,
            category: pooja.category,
            count: 0,
            revenue: 0
          };
        }
        bookingsByPooja[booking.poojaId].count += 1;
        bookingsByPooja[booking.poojaId].revenue += booking.amount;
      }
    });

    // Top performing poojas
    const topPoojas = Object.entries(bookingsByPooja)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10);

    // Monthly revenue trend (last 12 months)
    const monthlyRevenue = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format
      monthlyRevenue[monthKey] = 0;
    }

    bookings.forEach(booking => {
      const monthKey = booking.createdAt.toISOString().substring(0, 7);
      if (monthlyRevenue.hasOwnProperty(monthKey)) {
        monthlyRevenue[monthKey] += booking.amount;
      }
    });

    res.json({
      status: 'success',
      data: {
        overview: {
          totalBookings: bookings.length,
          totalRevenue: bookings.reduce((sum, b) => sum + b.amount, 0),
          averageBookingValue: bookings.length > 0 ? bookings.reduce((sum, b) => sum + b.amount, 0) / bookings.length : 0,
          dateRange: startDate && endDate ? { startDate, endDate } : 'All time'
        },
        categoryAnalytics,
        revenueByCategory,
        topPerformingPoojas: topPoojas,
        monthlyRevenueTrend: monthlyRevenue,
        poojaWiseBookings: bookingsByPooja
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api/poojas',
      'GET /api/poojas/categories',
      'GET /api/poojas/subcategories/:parentName',
      'GET /api/poojas/available/:date',
      'GET /api/stars',
      'POST /api/bookings',
      'POST /api/bookings/payment-complete',
      'GET /api/bookings/:id',
      'POST /api/admin/login',
      'GET /api/admin/dashboard',
      'GET /api/admin/bookings',
      'GET /api/admin/bookings/pooja/:poojaId',
      'GET /api/admin/analytics',
      'POST /api/webhooks/cashfree'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🕉️  ENHANCED SREE VARAHI TEMPLE SERVER STARTED`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Payment Gateway: Cashfree (Direct HTTP API)`);
  console.log(`Environment: ${CASHFREE_CONFIG.environment}`);
  console.log(`Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API docs: http://localhost:${PORT}/`);
  console.log(`\n✨ Enhanced Features:`);
  console.log(`   📋 Original 39 Temple Poojas`);
  console.log(`   🌟 Enhanced Poojas with Descriptions`);
  console.log(`   🏛️  Daily Worship Schedule (Premium)`);
  console.log(`   ⭐ Nakshatra Pooja`);
  console.log(`   🎯 Special Festival Offerings with 6 Subcategories`);
  console.log(`   🌐 Malayalam & English Descriptions`);
  console.log(`   📋 Advanced Booking Requirements & Validation`);
  console.log(`   📊 Enhanced Admin Analytics`);
  console.log(`\n✅ FIXED: Kalappa Samarpanam Online Booking Support`);
  console.log(`✅ FIXED: Unlimited Participant Support for Enhanced Poojas`);
  console.log(`✅ FIXED: Proper Validation Logic for Online Booking`);
  console.log(`\nReady to serve devotees! 🙏`);
});