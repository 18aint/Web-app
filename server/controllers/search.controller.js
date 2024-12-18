// Import database configuration
const { getDB } = require('../config/db.config');

/**
 * Search Controller
 * Handles user and content search functionality
 */
const searchController = {
    /**
     * Search Users
     * Performs case-insensitive search on usernames
     * @param {Object} req - Express request object with search query
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async searchUsers(req, res) {
        try {
            const { q } = req.query;
            const db = getDB();

            // Return empty array if no search query
            if (!q) {
                return res.json({ success: true, data: [] });
            }

            // Search users collection with case-insensitive regex
            const users = await db.collection('users')
                .find({
                    username: { $regex: q, $options: 'i' }
                })
                .project({ password: 0 }) // Exclude password from results
                .toArray();

            console.log('User search results:', users);
            res.json({ success: true, data: users });

        } catch (error) {
            console.error('User search error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error searching users',
                error: error.message 
            });
        }
    },

    /**
     * Search Contents
     * Performs case-insensitive search on content, usernames, and tags
     * @param {Object} req - Express request object with search query
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async searchContents(req, res) {
        try {
            const { q } = req.query;
            const db = getDB();

            // Return empty array if no search query
            if (!q) {
                return res.json({ success: true, data: [] });
            }

            // Search contents collection across multiple fields
            const contents = await db.collection('contents')
                .find({
                    $or: [
                        { content: { $regex: q, $options: 'i' } },  // Match content text
                        { username: { $regex: q, $options: 'i' } }, // Match username
                        { tags: { $regex: q, $options: 'i' } }      // Match tags
                    ]
                })
                .sort({ createdAt: -1 }) // Sort by newest first
                .toArray();

            console.log('Content search results:', contents);
            res.json({ success: true, data: contents });

        } catch (error) {
            console.error('Content search error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error searching contents',
                error: error.message 
            });
        }
    }
};

module.exports = searchController;
