// Required dependencies
const express = require('express');
const app = express();
const path = require('path');
const M00986611Routes = require('./routes/M00986611.routes');

/**
 * Middleware Configuration
 */

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies (forms)
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount main application routes
app.use('/M00986611', M00986611Routes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

/**
 * Server Initialization
 * Starts the Express server and logs access information
 */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`View website at: http://localhost:${PORT}/M00986611/`);
}); 