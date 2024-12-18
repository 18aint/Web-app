// Required dependencies
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { connectDB, getDB } = require('./config/db.config');

/**
 * Express Application Setup
 * Configures main server instance with middleware and routes
 */

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 8080;

/**
 * Middleware Configuration
 */
// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Configure session middleware
app.use(session({
    secret: 'cst-222-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

/**
 * Route Handlers
 */
const router = express.Router();

/**
 * User Registration
 * Creates new user account
 * @route POST /users
 */
router.post('/users', async (req, res) => {
    try {
        const db = getDB();
        const { username, password } = req.body;
        
        // Check for existing user
        const existingUser = await db.collection('users').findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Create new user
        await db.collection('users').insertOne({ username, password });
        res.json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * User Login
 * Authenticates user and creates session
 * @route POST /login
 */
router.post('/login', async (req, res) => {
    try {
        const db = getDB();
        const { username, password } = req.body;
        
        // Verify credentials
        const user = await db.collection('users').findOne({ username, password });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Set session data
        req.session.username = username;
        req.session.loggedIn = true;
        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Check Login Status
 * Returns current session status
 * @route GET /login
 */
router.get('/login', (req, res) => {
    res.json({ 
        loggedIn: !!req.session.loggedIn,
        username: req.session.username 
    });
});

/**
 * User Logout
 * Destroys current session
 * @route DELETE /login
 */
router.delete('/login', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Mount router with prefix
app.use('/M00986611', router);

/**
 * Error Handling Middleware
 * Catches and processes unhandled errors
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

/**
 * Server Initialization
 * Connects to MongoDB and starts Express server
 */
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
});
