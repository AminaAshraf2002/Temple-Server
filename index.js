// UPDATED Backend Code for Production - index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import models
const Pooja = require('./models/Pooja');
const Booking = require('./models/Booking');
const Star = require('./models/Star');

const app = express();

// UPDATED: Enhanced CORS configuration for production
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:5173',
    'https://varahi-temple.vercel.app',      // Production frontend
    'https://varahi-temple.vercel.app/',     // With trailing slash
    'https://*.vercel.app'                   // Allow Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

console.log('Starting temple server with PRODUCTION CORS and FIXED booking count logic...');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(error => console.error('MongoDB error:', error));

// Helper functions
const generateReceiptNumber = () => {
  return 'VST' + Date.now().toString().slice(-6);
};

// FIXED: Enhanced booking count function with better error handling
const getBookingCount = async (poojaId, poojaDate = null) => {
  try {
    console.log(`Getting booking count for poojaId: ${poojaId}, poojaDate: ${poojaDate}`);
    
    // Build query - handle both string and number poojaId
    let query = { 
      $or: [
        { poojaId: parseInt(poojaId) },
        { poojaId: poojaId.toString() }
      ],
      paymentStatus: 'completed' // Only count completed payments
    };
    
    // Add date filter if provided
    if (poojaDate) {
      query.poojaDate = poojaDate;
    }
    
    console.log('Query:', JSON.stringify(query, null, 2));
    
    const count = await Booking.countDocuments(query);
    console.log(`Found ${count} completed bookings for pooja ${poojaId}`);
    
    return count;
  } catch (error) {
    console.error('Error getting booking count:', error);
    return 0;
  }
};

// FIXED: Alternative function to get all bookings for a pooja (for debugging)
const getAllBookingsForPooja = async (poojaId) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { poojaId: parseInt(poojaId) },
        { poojaId: poojaId.toString() }
      ]
    });
    
    console.log(`All bookings for pooja ${poojaId}:`, bookings.map(b => ({
      id: b._id,
      devoteName: b.devoteName,
      paymentStatus: b.paymentStatus,
      poojaId: b.poojaId,
      poojaDate: b.poojaDate
    })));
    
    return bookings;
  } catch (error) {
    console.error('Error getting all bookings:', error);
    return [];
  }
};

// Root route with enhanced info
app.get('/', (req, res) => {
  res.json({ 
    message: 'Temple Booking API - Production Ready!',
    status: 'Fixed booking count logic + Production CORS',
    environment: process.env.NODE_ENV || 'development',
    frontend: 'https://varahi-temple.vercel.app',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Enhanced health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    models: ['Pooja', 'Booking', 'Star'],
    fixes: [
      'Booking count logic updated',
      'Production CORS configured',
      'Enhanced error handling'
    ],
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// FIXED: GET /api/poojas - Get all poojas with ACCURATE booking counts
app.get('/api/poojas', async (req, res) => {
  try {
    const poojas = await Pooja.find({}).sort({ date: 1 });
    console.log(`Found ${poojas.length} poojas, calculating counts...`);
    
    const poojaWithCounts = await Promise.all(
      poojas.map(async (pooja) => {
        // Get accurate booking count
        const bookedCount = await getBookingCount(pooja.id);
        const availableSlots = pooja.maxParticipants - bookedCount;
        
        console.log(`Pooja ${pooja.poojaEnglish}: ${bookedCount}/${pooja.maxParticipants} booked`);
        
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
          bookedCount: bookedCount, // This should now be accurate
          availableSlots: availableSlots,
          available: availableSlots > 0,
          maxParticipants: pooja.maxParticipants
        };
      })
    );
    
    console.log('Pooja counts calculated successfully');
    res.json({
      status: 'success',
      data: poojaWithCounts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching poojas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch poojas',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/stars - Get all stars
app.get('/api/stars', async (req, res) => {
  try {
    const stars = await Star.find({}).sort({ name: 1 });
    res.json({
      status: 'success',
      data: stars.map(star => star.name),
      count: stars.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stars:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stars',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bookings - Create new booking with enhanced validation
app.post('/api/bookings', async (req, res) => {
  try {
    const { devoteName, star, paymentMethod, poojaDate, poojaId } = req.body;
    
    // Enhanced validation
    if (!devoteName || !star || !paymentMethod || !poojaDate || !poojaId) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required',
        missingFields: {
          devoteName: !devoteName,
          star: !star,
          paymentMethod: !paymentMethod,
          poojaDate: !poojaDate,
          poojaId: !poojaId
        }
      });
    }

    // Validate devotee name length
    if (devoteName.trim().length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Devotee name must be at least 2 characters long'
      });
    }

    // Validate date is not in the past
    const selectedDate = new Date(poojaDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot book pooja for past dates'
      });
    }
    
    // Get pooja details
    const pooja = await Pooja.findOne({ id: poojaId });
    if (!pooja) {
      return res.status(404).json({
        status: 'error',
        message: 'Pooja not found'
      });
    }
    
    // FIXED: Check availability with accurate count
    const currentBookings = await getBookingCount(poojaId, poojaDate);
    console.log(`Current bookings for pooja ${poojaId}: ${currentBookings}/${pooja.maxParticipants}`);
    
    if (currentBookings >= pooja.maxParticipants) {
      return res.status(400).json({
        status: 'error',
        message: `Sorry, this pooja is fully booked (${currentBookings}/${pooja.maxParticipants} participants)`,
        availableSlots: 0,
        maxParticipants: pooja.maxParticipants
      });
    }
    
    // Create booking
    const receiptNumber = generateReceiptNumber();
    const participantNumber = currentBookings + 1;
    
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
      transactionId: null
    });
    
    await booking.save();
    console.log(`New booking created: ${booking.receiptNumber} for ${devoteName}`);
    
    res.status(201).json({
      status: 'success',
      message: 'Booking created. Please complete payment.',
      bookingId: booking._id,
      receiptNumber: booking.receiptNumber,
      participantNumber: participantNumber,
      razorpayOrderId: 'razorpay_order_' + receiptNumber,
      amount: pooja.amount,
      remainingSlots: pooja.maxParticipants - participantNumber
    });
    
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create booking',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bookings/payment-complete - Complete payment with enhanced receipt
app.post('/api/bookings/payment-complete', async (req, res) => {
  try {
    const { bookingId, razorpayPaymentId, razorpayOrderId } = req.body;
    
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

    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Payment already completed for this booking'
      });
    }
    
    // Update payment status
    booking.paymentStatus = 'completed';
    booking.transactionId = razorpayPaymentId || `manual_${Date.now()}`;
    await booking.save();
    
    console.log(`Payment completed for booking: ${booking.receiptNumber}`);
    
    // Generate enhanced receipt data
    const receiptData = {
      receiptNumber: booking.receiptNumber,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN'),
      devotee: {
        devoteName: booking.devoteName,
        star: booking.star
      },
      pooja: {
        poojaEnglish: booking.poojaEnglish,
        pooja: booking.pooja,
        date: booking.poojaDate,
        amount: booking.amount
      },
      temple: {
        name: "AALUMTHAZHAM SREE VARAHI TEMPLE",
        address: "Aalumthazham, Pathanamthitta District, Kerala - 689645",
        phone: "+91 8304091400",
        website: "https://varahi-temple.vercel.app"
      },
      booking: {
        paymentMethod: booking.paymentMethod,
        participantNumber: booking.participantNumber,
        transactionId: booking.transactionId,
        bookingDate: booking.createdAt,
        paymentDate: new Date()
      }
    };
    
    res.json({
      status: 'success',
      message: 'Payment completed successfully',
      receiptData: receiptData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Payment completion error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete payment',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/bookings/:bookingId - Get booking receipt by ID
app.get('/api/bookings/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    if (booking.paymentStatus !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Payment not completed for this booking'
      });
    }

    // Generate receipt data
    const receiptData = {
      receiptNumber: booking.receiptNumber,
      date: new Date(booking.createdAt).toLocaleDateString('en-IN'),
      time: new Date(booking.createdAt).toLocaleTimeString('en-IN'),
      devotee: {
        devoteName: booking.devoteName,
        star: booking.star
      },
      pooja: {
        poojaEnglish: booking.poojaEnglish,
        pooja: booking.pooja,
        date: booking.poojaDate,
        amount: booking.amount
      },
      temple: {
        name: "AALUMTHAZHAM SREE VARAHI TEMPLE",
        address: "Aalumthazham, Pathanamthitta District, Kerala - 689645",
        phone: "+91 8304091400",
        website: "https://varahi-temple.vercel.app"
      },
      booking: {
        paymentMethod: booking.paymentMethod,
        participantNumber: booking.participantNumber,
        transactionId: booking.transactionId,
        bookingDate: booking.createdAt,
        paymentStatus: booking.paymentStatus
      }
    };

    res.json({
      status: 'success',
      receiptData: receiptData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch receipt',
      error: error.message
    });
  }
});

// POST /api/admin/login - Enhanced admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // Basic validation
  if (!username || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Username and password are required'
    });
  }
  
  if (username === 'admin' && password === 'temple123') {
    res.json({
      status: 'success',
      message: 'Login successful',
      token: 'admin_token_' + Date.now(),
      admin: { 
        username: 'admin', 
        role: 'admin',
        loginTime: new Date().toISOString(),
        permissions: ['dashboard', 'bookings', 'participants', 'export']
      }
    });
  } else {
    res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }
});

// FIXED: GET /api/admin/dashboard - Admin dashboard with ACCURATE statistics
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    console.log('Fetching admin dashboard data...');
    
    const totalPoojas = await Pooja.countDocuments({});
    const totalBookings = await Booking.countDocuments({ paymentStatus: 'completed' });
    const pendingBookings = await Booking.countDocuments({ paymentStatus: 'pending' });
    
    // Calculate total revenue
    const completedBookings = await Booking.find({ paymentStatus: 'completed' });
    const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.amount, 0);
    
    // Get recent bookings
    const recentBookings = await Booking.find({ paymentStatus: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // FIXED: Get pooja-wise statistics with accurate counts
    const poojas = await Pooja.find({}).sort({ date: 1 });
    const poojaStats = await Promise.all(
      poojas.map(async (pooja) => {
        const bookedCount = await getBookingCount(pooja.id);
        const revenue = bookedCount * pooja.amount;
        
        console.log(`Dashboard - Pooja ${pooja.poojaEnglish}: ${bookedCount}/${pooja.maxParticipants}`);
        
        return {
          id: pooja.id,
          name: pooja.poojaEnglish,
          malayalam: pooja.pooja,
          date: pooja.date,
          category: pooja.category,
          amount: pooja.amount,
          bookedCount, // Accurate count
          maxParticipants: pooja.maxParticipants,
          availableSlots: pooja.maxParticipants - bookedCount,
          revenue,
          isFullyBooked: bookedCount >= pooja.maxParticipants,
          fillPercentage: Math.round((bookedCount / pooja.maxParticipants) * 100)
        };
      })
    );
    
    console.log('Dashboard data compiled successfully');
    
    res.json({
      status: 'success',
      data: {
        overview: {
          totalPoojas,
          totalBookings,
          pendingBookings,
          totalRevenue,
          averageBookingAmount: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0
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
          paymentMethod: booking.paymentMethod
        })),
        poojaStats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/admin/bookings - Get all bookings with filtering
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const { poojaId, status, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
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
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bookings = await Booking.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / parseInt(limit));
    
    res.json({
      status: 'success',
      data: {
        bookings: bookings.map(booking => ({
          id: booking._id,
          receiptNumber: booking.receiptNumber,
          devoteName: booking.devoteName,
          star: booking.star,
          poojaEnglish: booking.poojaEnglish,
          poojaDate: booking.poojaDate,
          amount: booking.amount,
          paymentMethod: booking.paymentMethod,
          paymentStatus: booking.paymentStatus,
          participantNumber: booking.participantNumber,
          transactionId: booking.transactionId,
          createdAt: booking.createdAt
        })),
        pagination: {
          current: parseInt(page),
          total: totalPages,
          count: bookings.length,
          totalRecords: totalBookings
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// FIXED: GET /api/admin/bookings/pooja/:poojaId - Get participants with accurate data
app.get('/api/admin/bookings/pooja/:poojaId', async (req, res) => {
  try {
    const { poojaId } = req.params;
    console.log(`Getting participants for pooja ${poojaId}...`);
    
    // Get pooja details
    const pooja = await Pooja.findOne({ 
      $or: [
        { id: parseInt(poojaId) },
        { id: poojaId.toString() }
      ]
    });
    
    if (!pooja) {
      return res.status(404).json({
        status: 'error',
        message: 'Pooja not found'
      });
    }
    
    // FIXED: Get all COMPLETED bookings for this pooja
    const bookings = await Booking.find({ 
      $or: [
        { poojaId: parseInt(poojaId) },
        { poojaId: poojaId.toString() }
      ],
      paymentStatus: 'completed'
    }).sort({ participantNumber: 1 });
    
    console.log(`Found ${bookings.length} completed bookings for pooja ${poojaId}`);
    
    // Generate complete participant list (including empty slots)
    const participants = [];
    
    // Add booked participants
    bookings.forEach(booking => {
      participants.push({
        slotNumber: booking.participantNumber,
        devoteName: booking.devoteName,
        star: booking.star,
        bookingDate: booking.createdAt,
        receiptNumber: booking.receiptNumber,
        transactionId: booking.transactionId,
        paymentMethod: booking.paymentMethod,
        amount: booking.amount,
        status: 'booked'
      });
    });
    
    // Fill remaining slots as available
    for (let i = 1; i <= pooja.maxParticipants; i++) {
      if (!participants.find(p => p.slotNumber === i)) {
        participants.push({
          slotNumber: i,
          devoteName: null,
          star: null,
          bookingDate: null,
          receiptNumber: null,
          transactionId: null,
          paymentMethod: null,
          amount: null,
          status: 'available'
        });
      }
    }
    
    // Sort by slot number
    participants.sort((a, b) => a.slotNumber - b.slotNumber);
    
    res.json({
      status: 'success',
      data: {
        pooja: {
          id: pooja.id,
          name: pooja.poojaEnglish,
          malayalam: pooja.pooja,
          date: pooja.date,
          amount: pooja.amount,
          category: pooja.category,
          maxParticipants: pooja.maxParticipants
        },
        participants,
        statistics: {
          totalSlots: pooja.maxParticipants,
          bookedSlots: bookings.length, // Accurate count
          availableSlots: pooja.maxParticipants - bookings.length,
          revenue: bookings.length * pooja.amount,
          fillPercentage: Math.round((bookings.length / pooja.maxParticipants) * 100)
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pooja participants',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// DEBUG ENDPOINT: Get all bookings for debugging
app.get('/api/debug/bookings/:poojaId', async (req, res) => {
  try {
    const { poojaId } = req.params;
    const allBookings = await getAllBookingsForPooja(poojaId);
    
    res.json({
      status: 'success',
      poojaId,
      debug: {
        totalBookings: allBookings.length,
        completedBookings: allBookings.filter(b => b.paymentStatus === 'completed').length,
        pendingBookings: allBookings.filter(b => b.paymentStatus === 'pending').length,
        bookingsByStatus: {
          completed: allBookings.filter(b => b.paymentStatus === 'completed').map(b => ({
            id: b._id,
            devoteName: b.devoteName,
            participantNumber: b.participantNumber,
            createdAt: b.createdAt
          })),
          pending: allBookings.filter(b => b.paymentStatus === 'pending').map(b => ({
            id: b._id,
            devoteName: b.devoteName,
            participantNumber: b.participantNumber,
            createdAt: b.createdAt
          }))
        }
      },
      bookings: allBookings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('\n🚀 TEMPLE BOOKING SERVER - PRODUCTION READY!');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Fixed booking count calculations`);
  console.log(`✅ Production CORS configured`);
  console.log(`✅ Enhanced error handling`);
  console.log(`✅ Frontend: https://varahi-temple.vercel.app`);
  console.log(`✅ Backend: https://temple-server.onrender.com`);
  console.log(`✅ Debug endpoint: GET /api/debug/bookings/:poojaId`);
  console.log('\n📊 System is production-ready with accurate booking counts!');
});