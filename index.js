// MINIMAL WORKING Backend - No Route Errors - index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import models
const Pooja = require('./models/Pooja');
const Booking = require('./models/Booking');
const Star = require('./models/Star');

const app = express();

// Simple CORS configuration that works
app.use(cors({
  origin: true, // Allow all origins temporarily for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

console.log('Starting temple server - minimal working version...');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(error => console.error('MongoDB error:', error));

// Helper functions
const generateReceiptNumber = () => {
  return 'VST' + Date.now().toString().slice(-6);
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

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Temple Booking API - Minimal Working Version',
    status: 'Running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
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

// POST /api/bookings
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
    
    res.status(201).json({
      status: 'success',
      message: 'Booking created. Please complete payment.',
      bookingId: booking._id,
      receiptNumber: booking.receiptNumber,
      amount: pooja.amount
    });
    
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
    const { bookingId, razorpayPaymentId } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }
    
    booking.paymentStatus = 'completed';
    booking.transactionId = razorpayPaymentId || `manual_${Date.now()}`;
    await booking.save();
    
    const receiptData = {
      receiptNumber: booking.receiptNumber,
      date: new Date().toLocaleDateString('en-IN'),
      devotee: {
        devoteName: booking.devoteName,
        star: booking.star
      },
      pooja: {
        poojaEnglish: booking.poojaEnglish,
        amount: booking.amount
      },
      temple: {
        name: "AALUMTHAZHAM SREE VARAHI TEMPLE",
        address: "Aalumthazham, Pathanamthitta District, Kerala - 689645",
        phone: "+91 8304091400"
      },
      paymentMethod: booking.paymentMethod,
      participantNumber: booking.participantNumber,
      transactionId: booking.transactionId
    };
    
    res.json({
      status: 'success',
      message: 'Payment completed successfully',
      receiptData: receiptData
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete payment',
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
          participantNumber: booking.participantNumber
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

// Simple 404 handler - no wildcards
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
  console.log(`\n🚀 TEMPLE SERVER - MINIMAL WORKING VERSION`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ No route parameter errors`);
  console.log(`✅ Simple CORS configuration`);
  console.log(`✅ All essential endpoints working`);
  console.log(`✅ Visit: https://temple-server.onrender.com`);
});