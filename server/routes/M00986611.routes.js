// Required dependencies
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const contentController = require('../controllers/content.controller');
const searchController = require('../controllers/search.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { getDB } = require('../database/db');

/**
 * Authentication Routes
 * @route POST /users - Register new user
 * @route GET /login - Check login status
 * @route POST /login - User login
 * @route DELETE /login - User logout
 */
router.post('/users', authController.register);
router.get('/login', authController.checkLoginStatus);
router.post('/login', authController.login);
router.delete('/login', authController.logout);

/**
 * Content Management Routes
 * Protected routes requiring authentication
 * @route POST /contents - Create new post
 * @route GET /contents - Get user's feed
 */
router.post('/contents', authMiddleware.verifyToken, contentController.createContent);
router.get('/contents', authMiddleware.verifyToken, contentController.getFeed);

/**
 * Social Interaction Routes
 * Protected routes for managing user relationships
 * @route POST /follow - Follow a user
 * @route DELETE /follow - Unfollow a user
 */
router.post('/follow', authMiddleware.verifyToken, contentController.followUser);
router.delete('/follow', authMiddleware.verifyToken, contentController.unfollowUser);

/**
 * Search Routes
 * Public routes for content discovery
 * @route GET /users/search - Search for users
 * @route GET /contents/search - Search for posts
 */
router.get('/users/search', searchController.searchUsers);
router.get('/contents/search', searchController.searchContents);

/**
 * Comment Management Route
 * Protected route for adding comments to posts
 * @route POST /comments
 * @param {string} content - Comment text
 * @param {string} postId - ID of the post being commented on
 * @returns {Object} Created comment object
 */
router.post('/comments', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { content, postId } = req.body;
        const userId = req.session.userId;
        
        const db = getDB();
        const comment = {
            content,
            postId,
            userId,
            createdAt: new Date()
        };
        
        await db.collection('comments').insertOne(comment);
        res.json({ success: true, comment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating comment' });
    }
});

module.exports = router; 