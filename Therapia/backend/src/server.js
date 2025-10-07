require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
const { connectDB } = require('./config/db');

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
const healthRouter = require('./routes/health.routes');
const productRouter = require('./routes/product.routes');
const uploadRouter = require('./routes/upload.routes');
const userRouter = require('./routes/user.routes');
const authRouter = require('./routes/auth.routes');
const adminAuthRouter = require('./routes/adminAuth.routes');
app.use('/api/health', healthRouter);
app.use('/api/products', productRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin/auth', adminAuthRouter);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 8080;

// Attempt DB connection then start server (even if DB fails)
connectDB().finally(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});
