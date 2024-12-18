const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const contentController = require('../controllers/content.controller');
const searchController = require('../controllers/search.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { getDB } = require('../database/db');

// Auth routes
router.post('/users', authController.register);
router.get('/login', authController.checkLoginStatus);
router.post('/login', authController.login);
router.delete('/login', authController.logout);

// Content routes
router.post('/contents', authMiddleware.verifyToken, contentController.createContent);
router.get('/contents', authMiddleware.verifyToken, contentController.getFeed);

// Social routes
router.post('/follow', authMiddleware.verifyToken, contentController.followUser);
router.delete('/follow', authMiddleware.verifyToken, contentController.unfollowUser);

// Search routes
router.get('/users/search', searchController.searchUsers);
router.get('/contents/search', searchController.searchContents);

// Add this to your existing routes
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
