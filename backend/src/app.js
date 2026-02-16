const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/servers', require('./routes/serverRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));

// Basic Route
app.get('/api', (req, res) => {
    res.send('API is running...');
});

app.get('/api/debug-env', (req, res) => {
    res.json({
        message: 'Environment Debug',
        hasUrl: !!process.env.DATABASE_URL,
        urlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + '...' : 'N/A',
        nodeEnv: process.env.NODE_ENV,
        hasJwtSecret: !!process.env.JWT_SECRET
    });
});

module.exports = app;
