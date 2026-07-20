// Tourist Guide Marketplace - Node.js/Express Backend
// Install dependencies: npm install express mongoose bcryptjs jsonwebtoken dotenv cors multer express-validator

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tourguide-marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('connected', () => console.log('MongoDB connected'));
db.on('error', (err) => console.log('MongoDB error:', err));

// ==================== SCHEMAS ====================

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  userType: { type: String, enum: ['tourist', 'guide', 'admin'] },
  profileImage: String,
  location: String,
  bio: String,
  languages: [String],
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Guide Schema
const guideSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  email: String,
  location: String,
  languages: [String],
  description: String,
  profileImage: String,
  photos: [String],
  tours: [mongoose.Schema.Types.ObjectId],
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  availability: String,
  verified: { type: Boolean, default: false },
  certifications: [String],
  yearsExperience: Number,
  socialLinks: {
    instagram: String,
    facebook: String,
    website: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Tour Schema
const tourSchema = new mongoose.Schema({
  guideId: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  price: Number,
  currency: { type: String, default: 'USD' },
  duration: String,
  maxParticipants: Number,
  availability: [String],
  photos: [String],
  highlights: [String],
  included: [String],
  notIncluded: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
  touristId: mongoose.Schema.Types.ObjectId,
  guideId: mongoose.Schema.Types.ObjectId,
  tourId: mongoose.Schema.Types.ObjectId,
  date: Date,
  participants: Number,
  totalPrice: Number,
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'] },
  specialRequests: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  guideId: mongoose.Schema.Types.ObjectId,
  touristId: mongoose.Schema.Types.ObjectId,
  bookingId: mongoose.Schema.Types.ObjectId,
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  photos: [String],
  verified: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Guide = mongoose.model('Guide', guideSchema);
const Tour = mongoose.model('Tour', tourSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Review = mongoose.model('Review', reviewSchema);

// ==================== AUTHENTICATION MIDDLEWARE ====================

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key_change_in_production', (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    req.userType = decoded.userType;
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
  body('userType').isIn(['tourist', 'guide'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, name, userType } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      userType
    });

    await user.save();

    // If guide, create guide profile
    if (userType === 'guide') {
      const guide = new Guide({
        userId: user._id,
        email,
        name
      });
      await guide.save();
    }

    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'secret_key_change_in_production',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== GUIDE ROUTES ====================

// Get all guides with filters
app.get('/api/guides', async (req, res) => {
  try {
    const { location, language, minRating, maxPrice } = req.query;
    let query = { verified: true };

    if (location) query.location = { $regex: location, $options: 'i' };
    if (language) query.languages = language;

    let guides = await Guide.find(query).populate('tours');

    if (minRating) guides = guides.filter(g => g.rating >= minRating);

    res.json(guides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get guide by ID
app.get('/api/guides/:id', async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id).populate('tours');
    if (!guide) return res.status(404).json({ error: 'Guide not found' });
    res.json(guide);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update guide profile
app.put('/api/guides/:id', verifyToken, [
  body('name').optional().notEmpty(),
  body('location').optional().notEmpty(),
  body('description').optional().notEmpty(),
  body('languages').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    res.json(guide);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload guide photos
app.post('/api/guides/:id/photos', verifyToken, upload.array('photos', 10), async (req, res) => {
  try {
    const filePaths = req.files.map(f => f.path);
    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      { $push: { photos: { $each: filePaths } } },
      { new: true }
    );
    res.json(guide);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TOUR ROUTES ====================

// Create tour
app.post('/api/tours', verifyToken, [
  body('name').notEmpty(),
  body('price').isNumeric(),
  body('duration').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const guide = await Guide.findOne({ userId: req.userId });
    if (!guide) return res.status(404).json({ error: 'Guide not found' });

    const tour = new Tour({
      guideId: guide._id,
      ...req.body
    });

    await tour.save();

    // Add tour to guide's tours array
    guide.tours.push(tour._id);
    await guide.save();

    res.status(201).json(tour);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tour by ID
app.get('/api/tours/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ error: 'Tour not found' });
    res.json(tour);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update tour
app.put('/api/tours/:id', verifyToken, async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json(tour);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete tour
app.delete('/api/tours/:id', verifyToken, async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    
    // Remove from guide's tours array
    await Guide.findByIdAndUpdate(tour.guideId, { $pull: { tours: tour._id } });

    res.json({ message: 'Tour deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== BOOKING ROUTES ====================

// Create booking
app.post('/api/bookings', verifyToken, [
  body('guideId').notEmpty(),
  body('tourId').notEmpty(),
  body('date').isISO8601(),
  body('participants').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const tour = await Tour.findById(req.body.tourId);
    if (!tour) return res.status(404).json({ error: 'Tour not found' });

    const booking = new Booking({
      touristId: req.userId,
      ...req.body,
      totalPrice: tour.price * req.body.participants,
      status: 'pending'
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tourist's bookings
app.get('/api/bookings/tourist/:touristId', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ touristId: req.params.touristId })
      .populate('tourId')
      .populate('guideId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get guide's bookings
app.get('/api/bookings/guide/:guideId', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ guideId: req.params.guideId })
      .populate('touristId')
      .populate('tourId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking status
app.put('/api/bookings/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== REVIEW ROUTES ====================

// Create review
app.post('/api/reviews', verifyToken, [
  body('guideId').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const review = new Review({
      touristId: req.userId,
      ...req.body
    });

    await review.save();

    // Update guide's rating
    const reviews = await Review.find({ guideId: req.body.guideId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Guide.findByIdAndUpdate(
      req.body.guideId,
      { rating: avgRating, reviews: reviews.length }
    );

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get guide reviews
app.get('/api/reviews/guide/:guideId', async (req, res) => {
  try {
    const reviews = await Review.find({ guideId: req.params.guideId })
      .populate('touristId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update review
app.put('/api/reviews/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete review
app.delete('/api/reviews/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// Get all users
app.get('/api/admin/users', verifyToken, async (req, res) => {
  try {
    if (req.userType !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify guide
app.put('/api/admin/guides/:id/verify', verifyToken, async (req, res) => {
  try {
    if (req.userType !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      { verified: true, updatedAt: new Date() },
      { new: true }
    );
    res.json(guide);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove user
app.delete('/api/admin/users/:id', verifyToken, async (req, res) => {
  try {
    if (req.userType !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get platform statistics
app.get('/api/admin/stats', verifyToken, async (req, res) => {
  try {
    if (req.userType !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    const totalUsers = await User.countDocuments();
    const totalGuides = await Guide.countDocuments({ verified: true });
    const totalBookings = await Booking.countDocuments();
    const totalReviews = await Review.countDocuments();

    res.json({
      totalUsers,
      totalGuides,
      totalBookings,
      totalReviews
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
