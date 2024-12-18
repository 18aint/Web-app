/**
 * Authentication Middleware
 * Verifies user session token for protected routes
 * 
 * @param {Object} req - Express request object containing session data
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Usage in routes:
 * router.get('/protected-route', verifyToken, (req, res) => {
 *     // Only accessible to authenticated users
 * });
 */
function verifyToken(req, res, next) {
    // Check for valid user session
    if (!req.session.userId) {
        return res.status(401).json({ 
            message: 'Unauthorized - Please log in' 
        });
    }
    
    // Proceed to next middleware/route handler
    next();
}

// Export middleware function
module.exports = {
    verifyToken
};
