// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/feedback', require('./routes/feedbackRoutes'));
// app.use('/api/comments', require('./routes/commentRoutes'));
// app.use('/api/admin', require('./routes/adminRoutes'));

// const path = require('path');

// // Root Endpoint
// app.get('/', (req, res) => {
//   res.send('Product Feedback API Running');
// });

// // Configure static path for uploads
// app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// const PORT = process.env.PORT || 5000;

// mongoose
//   .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/product_feedback', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log('MongoDB Connected');
//     app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
//   })
//   .catch((err) => {
//     console.error('Database connection error:', err);
//   });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ✅ CORS FIX (Required for frontend <-> backend communication on Render)
app.use(
  cors({
    origin: "https://product-feedback-app-frontend-po90.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Allow preflight requests
app.options("*", cors());

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.send('Product Feedback API Running');
});

// Static folder for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

const PORT = process.env.PORT || 5000;

// DB Connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/product_feedback', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
