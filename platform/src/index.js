const express = require('express');
const dotenv = require('dotenv');
const messageRoutes = require('./routes/messages');
const analyticsRoutes = require('./routes/analytics');
const otpRoutes = require('./routes/otp');
const bulkRoutes = require('./routes/bulk');
const organizationRoutes = require('./routes/organizations');
const bundleRoutes = require('./routes/bundles');
const requestLogger = require('./middleware/logger');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // Default to 3001 to avoid conflict with aggregator

const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

app.use(requestLogger);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Dashboard Route
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Campaigns Route
app.get('/campaigns', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'campaigns.html'));
});

// Clients & Resellers Route
app.get('/clients', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'clients.html'));
});

// Billing & Payments Route
app.get('/billing', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'billing.html'));
});

// Bundles & Packages Route
app.get('/bundles', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bundles.html'));
});

// API Routes
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/bulk', bulkRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/bundles', bundleRoutes);

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
