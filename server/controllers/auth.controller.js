// Import required dependencies
const { getDB } = require('../config/db.config');
const bcrypt = require('bcryptjs');

/**
 * Authentication Controller
 * Handles user registration, login, and session management
 */
const authController = {
    /**
     * User Registration
     * Creates a new user account with hashed password
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async register(req, res) {
        try {
            const { username, password, email } = req.body;
            
            // Validate required fields
            if (!username || !password || !email) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const db = getDB();
            
            // Check for existing username or email
            const existingUser = await db.collection('users').findOne({ 
                $or: [{ username }, { email }] 
            });
            
            if (existingUser) {
                return res.status(400).json({ 
                    message: 'Username or email already exists' 
                });
            }

            // Hash password for security
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user document with initial data
            const result = await db.collection('users').insertOne({
                username,
                password: hashedPassword,
                email,
                createdAt: new Date(),
                followers: [],
                following: []
            });

            res.status(201).json({ 
                message: 'User registered successfully',
                userId: result.insertedId
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Error registering user' });
        }
    },

    /**
     * User Login
     * Authenticates user credentials and creates session
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;

            // Validate required fields
            if (!username || !password) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const db = getDB();

            // Find user by username
            const user = await db.collection('users').findOne({ username });
            
            // Check if user exists
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Create user session
            req.session.userId = user._id;
            req.session.username = user.username;

            // Return user data (excluding password)
            res.json({ 
                message: 'Login successful',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Error during login' });
        }
    },

    /**
     * Check Login Status
     * Verifies if user has an active session
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    checkLoginStatus(req, res) {
        if (req.session.userId) {
            res.json({ 
                loggedIn: true, 
                userId: req.session.userId,
                username: req.session.username
            });
        } else {
            res.json({ loggedIn: false });
        }
    },

    /**
     * User Logout
     * Destroys the current session
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Error logging out' });
            }
            res.json({ message: 'Logged out successfully' });
        });
    }
};

module.exports = authController;
