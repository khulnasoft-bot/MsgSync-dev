const express = require('express');
const dotenv = require('dotenv');
const messageRoutes = require('./routes/messages');
const analyticsRoutes = require('./routes/analytics');
const otpRoutes = require('./routes/otp');
const bulkRoutes = require('./routes/bulk');
const requestLogger = require('./middleware/logger');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // Default to 3001 to avoid conflict with aggregator

const path = require('path');

app.use(requestLogger);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Dashboard Route
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API Routes
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/bulk', bulkRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', component: 'platform' });
});

// Start server
if (require.main === module) {
    app.listen(port, () => {
        console.log(`MsgSync Platform listening at http://localhost:${port}`);
    });
}

module.exports = app;
