// Import required dependencies
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db.config');

/**
 * Content Controller
 * Handles content creation, feed management, and user relationships
 */
const contentController = {
    /**
     * Create New Content
     * Adds a new post to the user's content collection
     * @param {Object} req - Express request object with content data and user session
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async createContent(req, res) {
        try {
            const { content, type } = req.body;
            const userId = req.session.userId;
            const db = getDB();

            // Create new content document with initial data
            const result = await db.collection('contents').insertOne({
                userId: new ObjectId(userId),
                content,
                type,
                createdAt: new Date(),
                likes: [],
                comments: []
            });

            res.status(201).json({ message: 'Content created successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error creating content' });
        }
    },

    /**
     * Get User Feed
     * Retrieves content from users that the current user follows
     * @param {Object} req - Express request object with user session
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getFeed(req, res) {
        try {
            const userId = req.session.userId;
            const db = getDB();

            // Retrieve user document to get following list
            const user = await db.collection('users').findOne(
                { _id: new ObjectId(userId) }
            );

            // Fetch content from followed users, sorted by creation date
            const contents = await db.collection('contents')
                .find({
                    userId: { $in: user.following.map(id => new ObjectId(id)) }
                })
                .sort({ createdAt: -1 })
                .toArray();

            res.json(contents);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching feed' });
        }
    },

    /**
     * Follow User
     * Creates a bidirectional following relationship between users
     * @param {Object} req - Express request object with target user ID
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async followUser(req, res) {
        try {
            const followerId = req.session.userId;
            const { userToFollowId } = req.body;
            const db = getDB();

            // Add target user to follower's following list
            await db.collection('users').updateOne(
                { _id: new ObjectId(followerId) },
                { $addToSet: { following: new ObjectId(userToFollowId) } }
            );

            // Add follower to target user's followers list
            await db.collection('users').updateOne(
                { _id: new ObjectId(userToFollowId) },
                { $addToSet: { followers: new ObjectId(followerId) } }
            );

            res.json({ message: 'Successfully followed user' });
        } catch (error) {
            res.status(500).json({ message: 'Error following user' });
        }
    },

    /**
     * Unfollow User
     * Removes the bidirectional following relationship between users
     * @param {Object} req - Express request object with target user ID
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async unfollowUser(req, res) {
        try {
            const followerId = req.session.userId;
            const { userToUnfollowId } = req.body;
            const db = getDB();

            // Remove target user from follower's following list
            await db.collection('users').updateOne(
                { _id: new ObjectId(followerId) },
                { $pull: { following: new ObjectId(userToUnfollowId) } }
            );

            // Remove follower from target user's followers list
            await db.collection('users').updateOne(
                { _id: new ObjectId(userToUnfollowId) },
                { $pull: { followers: new ObjectId(followerId) } }
            );

            res.json({ message: 'Successfully unfollowed user' });
        } catch (error) {
            res.status(500).json({ message: 'Error unfollowing user' });
        }
    }
};

module.exports = contentController;
