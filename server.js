/**
 * BACKEND SERVER - UPSC AI APPLICATION
 * 
 * This is the Node.js/Express backend server that handles:
 * 1. User authentication (login, register, JWT tokens)
 * 2. Database operations (notes, articles storage)
 * 3. API endpoints that the frontend calls
 * 
 * To run: node server.js
 * Listens on http://localhost:5000
 * 
 * Stack:
 * - Express.js: HTTP server framework
 * - MongoDB: Database (with in-memory fallback)
 * - JWT: Token-based authentication
 * - CORS: Allow requests from frontend
 */

// Load environment variables from .env file
import 'dotenv/config';
// Express framework for creating HTTP API
import express from 'express';
// MongoDB database driver
import mongoose from 'mongoose';
// Enable CORS so frontend can call backend
import cors from 'cors';
// JSON Web Tokens for secure authentication
import jwt from 'jsonwebtoken';
// Password hashing for security
import bcrypt from 'bcryptjs';

// Create Express app instance
const app = express();
// Middleware: Parse JSON request bodies
app.use(express.json());
// Middleware: Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

// --- CONFIGURATION ---
// Get port from environment or use default 5000
const PORT = process.env.PORT || 5000;
// Get MongoDB connection string from .env
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/upsc-ai';
// Get JWT secret key from .env (used to sign tokens)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// --- DATABASE CONNECTION ---
// Try to connect to MongoDB
let dbConnected = false; // Track if database connection is successful

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    dbConnected = true;
  })
  .catch(err => {
    // If MongoDB connection fails, use in-memory storage instead
    console.warn('⚠️ MongoDB Connection Error - using memory storage fallback:', err.message);
    dbConnected = false;
  });

// In-memory storage fallback (if MongoDB is not available)
const memoryStorage = {
  users: [],
  notes: [],
  articles: []
};

// --- Models ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const NoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  articleId: String,
  title: String,
  source: String,
  gsPaper: String,
  tags: [String],
  summary: String,
  content: String,
  mcqs: Array,
  mainsQuestion: Object,
  createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', NoteSchema);

const ArticleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id: String,
  title: String,
  source: String,
  url: String,
  summary: String,
  publishedDate: String,
  scrapedAt: { type: Date, default: Date.now }
});
const Article = mongoose.model('Article', ArticleSchema);

// --- Middleware ---
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    // Allow mock tokens for development
    if (token.startsWith('mock-token-')) {
      req.user = { _id: 'mock-id', email: 'dev@test.com' };
      next();
      return;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// --- Routes: Auth ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ _id: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ _id: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Routes: Notes ---
app.get('/api/notes', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notes', authMiddleware, async (req, res) => {
  try {
    const note = new Note({ ...req.body, userId: req.user._id });
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notes/:id', authMiddleware, async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Routes: Articles (History) ---
app.get('/api/articles', authMiddleware, async (req, res) => {
  try {
    if (dbConnected) {
      const articles = await Article.find({ userId: req.user._id }).sort({ scrapedAt: -1 }).limit(50);
      res.json(articles);
    } else {
      // Return from memory storage
      const articles = memoryStorage.articles.filter(a => a.userId === req.user._id).slice(0, 50);
      res.json(articles);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/articles', authMiddleware, async (req, res) => {
  try {
    if (dbConnected) {
      const existing = await Article.findOne({ userId: req.user._id, title: req.body.title });
      if (existing) return res.status(400).json({ error: 'Article already saved' });

      const article = new Article({ ...req.body, userId: req.user._id });
      await article.save();
      res.json(article);
    } else {
      // Use memory storage fallback
      const article = { ...req.body, userId: req.user._id, _id: Date.now().toString(), createdAt: new Date() };
      memoryStorage.articles.push(article);
      res.json(article);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: dbConnected ? 'connected' : 'disconnected' });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));