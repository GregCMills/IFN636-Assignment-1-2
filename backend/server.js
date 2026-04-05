require('dotenv').config(); // must be first so env vars are available to all modules

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { clerkMiddleware } = require('@clerk/express');

const app = express();

app.use(clerkMiddleware());
app.use(cors());
app.use(express.json());
app.use('/api/auth',   require('./routes/authRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/types',  require('./routes/typeRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));

if (require.main === module) {
    connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
