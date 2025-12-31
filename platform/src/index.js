const express = require('express');
const dotenv = require('dotenv');
const messageRoutes = require('./routes/messages');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // Default to 3001 to avoid conflict with aggregator

app.use(express.json());

// API Routes
app.use('/api/messages', messageRoutes);

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
