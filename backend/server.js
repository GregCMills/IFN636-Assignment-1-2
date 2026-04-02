const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { clerkMiddleware } = require('@clerk/express');

dotenv.config();

const app = express();

app.use(clerkMiddleware());
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));

if (require.main === module) {
    connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
