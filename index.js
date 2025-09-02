// FIXED Backend Code - Update your index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import models
const Pooja = require('./models/Pooja');
const Booking = require('./models/Booking');
const Star = require('./models/Star');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

console.log('Starting temple server with FIXED booking count logic...');

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

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Temple Booking API with FIXED Counting!',
    status: 'Fixed booking count logic',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    models: ['Pooja', 'Booking', 'Star'],
    fixed: 'Booking count logic updated'
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

// GET /api/stars - Get all stars
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

// POST /api/bookings - Create new booking (unchanged)
app.post('/api/bookings', async (req, res) => {
  try {
    const { devoteName, star, paymentMethod, poojaDate, poojaId } = req.body;
    
    // Validate required fields
    if (!devoteName || !star || !paymentMethod || !poojaDate || !poojaId) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
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
        message: `Sorry, this pooja is fully booked (${currentBookings}/${pooja.maxParticipants} participants)`
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
      razorpayOrderId: 'razorpay_order_' + receiptNumber,
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

// POST /api/bookings/payment-complete - Complete payment (unchanged)
app.post('/api/bookings/payment-complete', async (req, res) => {
  try {
    const { bookingId, razorpayPaymentId, razorpayOrderId } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }
    
    // Update payment status
    booking.paymentStatus = 'completed';
    booking.transactionId = razorpayPaymentId;
    await booking.save();
    
    console.log(`Payment completed for booking: ${booking.receiptNumber}`);
    
    // Generate receipt data
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

// POST /api/admin/login - Admin login
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

// FIXED: GET /api/admin/dashboard - Admin dashboard with ACCURATE statistics
app.get('/api/admin/dashboard', async (req, res) => {
  try {
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
          category: pooja.category
        },
        participants,
        statistics: {
          totalSlots: pooja.maxParticipants,
          bookedSlots: bookings.length, // Accurate count
          availableSlots: pooja.maxParticipants - bookings.length,
          revenue: bookings.length * pooja.amount
        }
      }
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pooja participants',
      error: error.message
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
      totalBookings: allBookings.length,
      completedBookings: allBookings.filter(b => b.paymentStatus === 'completed').length,
      pendingBookings: allBookings.filter(b => b.paymentStatus === 'pending').length,
      bookings: allBookings
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('\n🔧 TEMPLE BOOKING SERVER - FIXED COUNT LOGIC!');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Fixed booking count calculations`);
  console.log(`✅ Enhanced logging for debugging`);
  console.log(`✅ Debug endpoint: GET /api/debug/bookings/:poojaId`);
  console.log(`✅ Visit: http://localhost:${PORT}`);
  console.log('\n📊 Booking counts should now be accurate!');
});