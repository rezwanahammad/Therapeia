require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const { connectDB } = require('./config/db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
const healthRouter = require('./routes/health.routes');
const productRouter = require('./routes/product.routes');
const uploadRouter = require('./routes/upload.routes');
const userRouter = require('./routes/user.routes');
app.use('/api/health', healthRouter);
app.use('/api/products', productRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/users', userRouter);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

// Attempt DB connection then start server (even if DB fails)
connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
