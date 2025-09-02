const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Minimal server working!' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB error:', error);
});

// DON'T IMPORT ROUTES YET - TEST THIS FIRST
// const apiRoutes = require('./routes/api');
// app.use('/api', apiRoutes);

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
  console.log('If this works, the problem is in routes/api.js');
});

module.exports = app;