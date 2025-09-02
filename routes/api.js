const express = require('express');
const router = express.Router();

// Import models
const Pooja = require('../models/Pooja');
const Booking = require('../models/Booking');
const Star = require('../models/Star');

// Helper function to generate receipt number
const generateReceiptNumber = () => {
  return 'VST' + Date.now().toString().slice(-6);
};

// Helper function to get booking count
const getBookingCount = async (poojaId, date) => {
  try {
    const count = await Booking.countDocuments({ 
      poojaId: poojaId, 
      poojaDate: date,
      paymentStatus: 'completed'
    });
    return count;
  } catch (error) {
    console.error('Error getting booking count:', error);
    return 0;
  }
};

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'API routes are working!',
    timestamp: new Date().toISOString()
  });
});

// GET /api/poojas - Get all poojas with booking counts
router.get('/poojas', async (req, res) => {
  try {
    const poojas = await Pooja.find({}).sort({ date: 1 });
    
    // Add booking counts for each pooja
    const poojaWithCounts = await Promise.all(
      poojas.map(async (pooja) => {
        const bookedCount = await getBookingCount(pooja.id, pooja.date);
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
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch poojas',
      error: error.message
    });
  }
});

// GET /api/stars - Get all stars
router.get('/stars', async (req, res) => {
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

// POST /api/bookings - Create new booking
router.post('/bookings', async (req, res) => {
  try {
    const { devoteName, star, paymentMethod, poojaDate, poojaId } = req.body;
    
    // Validate required fields
    if (!devoteName || !star || !paymentMethod || !poojaDate || !poojaId) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    }

    // Validate devotee name
    if (devoteName.trim().length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Devotee name must be at least 2 characters'
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
    
    // Check availability
    const currentBookings = await getBookingCount(poojaId, poojaDate);
    if (currentBookings >= pooja.maxParticipants) {
      return res.status(400).json({
        status: 'error',
        message: 'Sorry, this pooja is fully booked (100/100 participants)'
      });
    }
    
    // Generate receipt number and participant number
    const receiptNumber = generateReceiptNumber();
    const participantNumber = currentBookings + 1;
    
    // Create booking
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
    
    // Generate Razorpay order for payment
    const razorpayOrderId = 'razorpay_order_' + receiptNumber;
    
    // Return booking details for payment
    res.status(201).json({
      status: 'success',
      message: 'Booking created. Please complete payment.',
      bookingId: booking._id,
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrderId,
      amount: pooja.amount,
      receiptData: null
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

// POST /api/bookings/payment-complete - Mark payment as completed
router.post('/bookings/payment-complete', async (req, res) => {
  try {
    const { bookingId, razorpayPaymentId, razorpayOrderId } = req.body;
    
    // Validate input
    if (!bookingId || !razorpayPaymentId || !razorpayOrderId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing payment details'
      });
    }
    
    // Find and update booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if payment already completed
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Payment already completed for this booking'
      });
    }
    
    // Update payment status
    booking.paymentStatus = 'completed';
    booking.transactionId = razorpayPaymentId;
    await booking.save();
    
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
    console.error('Payment completion error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete payment',
      error: error.message
    });
  }
});

// GET /api/bookings/:id - Get booking for receipt
router.get('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }
    
    // Only return receipt data if payment is completed
    if (booking.paymentStatus !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Receipt not available. Payment not completed.'
      });
    }
    
    const receiptData = {
      receiptNumber: booking.receiptNumber,
      date: booking.createdAt.toLocaleDateString('en-IN'),
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
      receiptData: receiptData
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch receipt',
      error: error.message
    });
  }
});

// POST /api/admin/login - Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple hardcoded admin check
    if (username === 'admin' && password === 'temple123') {
      res.json({
        status: 'success',
        message: 'Login successful',
        token: 'admin_token_' + Date.now(),
        admin: {
          username: 'admin',
          role: 'admin'
        }
      });
    } else {
      res.status(401).json({
        status: 'error',
        message: 'Invalid username or password'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error.message
    });
  }
});

// GET /api/admin/dashboard - Basic dashboard
router.get('/admin/dashboard', async (req, res) => {
  try {
    const totalPoojas = await Pooja.countDocuments({});
    const totalBookings = await Booking.countDocuments({ paymentStatus: 'completed' });
    const completedBookings = await Booking.find({ paymentStatus: 'completed' });
    const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.amount, 0);
    
    res.json({
      status: 'success',
      data: {
        overview: {
          totalPoojas,
          totalBookings,
          totalRevenue
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

module.exports = router;