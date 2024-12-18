const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Configure multer for file uploads
const axios = require('axios');
const cheerio = require('cheerio');

// Enable CORS and JSON parsing
router.use(express.json());

// Debug middleware to log all requests
router.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Request Body:', req.body);
    next();
});

router.post('/users', (req, res) => {
    console.log('⭐ Registration endpoint hit');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    try {
        const { username, password } = req.body;
        
        // Input validation
        if (!username || !password) {
            console.log('❌ Missing username or password');
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }
        
        // Check for existing user
        if (users.find(u => u.username === username)) {
            console.log('❌ Username already exists:', username);
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }
        
        // Create new user
        const newUser = {
            username,
            password,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        console.log('✅ User registered successfully:', username);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                username: newUser.username,
                createdAt: newUser.createdAt
            }
        });
        
    } catch (error) {
        console.error('💥 Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user'
        });
    }
});

// Make sure these are at the top of your file
let posts = [
    {
        _id: '1',
        content: 'Just started learning about cybersecurity fundamentals! #cybersecurity',
        username: 'm',
        tags: ['cybersecurity'],
        createdAt: new Date().toISOString(),
        likes: []
    },
    {
        _id: '2',
        content: 'Working on a new React project with TypeScript! #webdev #typescript',
        username: 'w',
        tags: ['webdev'],
        createdAt: new Date().toISOString(),
        likes: []
    },
    {
        _id: '3',
        content: 'Exploring AWS Lambda functions today. #cloud #devops',
        username: 'm',
        tags: ['cloud', 'devops'],
        createdAt: new Date().toISOString(),
        likes: []
    }
];

// Serve the main page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Add your login logic here
        res.json({ success: true, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Add your registration logic here
        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

/**
 * Create New Post
 * Adds post to beginning of feed with tags
 * @route POST /contents
 */
router.post('/contents', async (req, res) => {
    try {
        const { content, username } = req.body;
        const newPost = {
            _id: Date.now().toString(), // Unique ID based on timestamp
            content,
            username,
            createdAt: new Date().toISOString(), // Store as ISO string for consistent sorting
            likes: []
        };
        posts.unshift(newPost); // Add to beginning of array instead of push
        res.json({ 
            success: true, 
            message: 'Post created successfully',
            data: newPost
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create post' });
    }
});

/**
 * Fetch Posts
 * Retrieves posts with optional filtering
 * @route GET /contents
 */
router.get('/contents', (req, res) => {
    try {
        console.log('Fetching posts'); // Debug log
        res.json({
            success: true,
            data: posts // Ensure this is an array of posts
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching posts'
        });
    }
});

// Like/Unlike post
router.post('/contents/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.body;
        
        const post = posts.find(p => p._id === id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(username);
        if (likeIndex === -1) {
            post.likes.push(username); // Add like
        } else {
            post.likes.splice(likeIndex, 1); // Remove like
        }

        res.json({ success: true, message: 'Like updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update like' });
    }
});

// Search posts - also sort by newest first
router.get('/contents/search', async (req, res) => {
    try {
        const searchUsername = req.query.username.toLowerCase();
        const filteredPosts = posts
            .filter(post => post.username.toLowerCase().includes(searchUsername))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
        res.json({
            success: true,
            data: filteredPosts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to search posts' });
    }
});

// Add at the top with other data storage
let userProfiles = {};

/**
 * Profile Update
 * Handles profile image uploads and updates
 * @route POST /updateProfile
 * @param {File} profileImage - User's profile image
 */
router.post('/updateProfile', upload.single('profileImage'), async (req, res) => {
    try {
        const { username } = req.body;
        const profileImage = req.file ? 
            `/uploads/${req.file.filename}` : 
            (userProfiles[username]?.profileImage || getUserAvatar(username));
        
        // Update profile data
        userProfiles[username] = {
            ...userProfiles[username],
            profileImage,
            lastUpdated: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: userProfiles[username]
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

// Get profile
router.get('/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const profile = userProfiles[username] || {
            profileImage: getUserAvatar(username)
        };

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get profile'
        });
    }
});

/**
 * Default Avatar Generator
 * Creates a default avatar for users without profile images
 * @param {string} username - User's username
 * @returns {string} Data URL of generated avatar
 */
function getUserAvatar(username = '') {
    const canvas = document.createElement('canvas');
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    
    const context = canvas.getContext('2d');
    
    // Create circular background
    context.fillStyle = '#007bff';
    context.beginPath();
    context.arc(size/2, size/2, size/2, 0, Math.PI * 2, true);
    context.fill();
    
    // Add user initials
    const initials = username ? username.substring(0, 2).toUpperCase() : '?';
    context.fillStyle = '#FFFFFF';
    context.font = `bold ${size/2}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(initials, size/2, size/2);
    
    return canvas.toDataURL('image/png', 1.0);
}

// Add at the top with other data storage
let userFollows = {}; // { username: [followers] }

// Add new follow/unfollow route
router.post('/follow/:username', async (req, res) => {
    try {
        const { username } = req.params; // User to follow
        const { follower } = req.body;   // Current user
        
        // Initialize arrays if they don't exist
        if (!userFollows[username]) userFollows[username] = [];
        
        // Check if already following
        const isFollowing = userFollows[username].includes(follower);
        
        if (isFollowing) {
            // Unfollow
            userFollows[username] = userFollows[username].filter(f => f !== follower);
        } else {
            // Follow
            userFollows[username].push(follower);
        }
        
        res.json({
            success: true,
            isFollowing: !isFollowing,
            followers: userFollows[username].length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update follow status' });
    }
});

// Add route to get follow status
router.get('/follow/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { currentUser } = req.query;
        
        const followers = userFollows[username] || [];
        const isFollowing = followers.includes(currentUser);
        
        res.json({
            success: true,
            isFollowing,
            followers: followers.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get follow status' });
    }
});

let friendRequests = {}; // { username: [{ requester, status, timestamp }] }
let friendships = {}; // { username: [friends] }

router.post('/friend-request/:username', (req, res) => {
    const targetUser = req.params.username;     // The person being followed
    const currentUser = req.body.requester;     // The person clicking follow

    // Store request in TARGET user's requests
    if (!friendRequests[targetUser]) {
        friendRequests[targetUser] = [];
    }

    // Add request with status and timestamp
    if (!friendRequests[targetUser].find(r => r.requester === currentUser)) {
        friendRequests[targetUser].push({
            requester: currentUser,        // Person who clicked follow
            recipient: targetUser,         // Person receiving the request
            status: 'pending',
            timestamp: new Date().toISOString()
        });
    }

    res.json({ 
        success: true, 
        message: `Request sent to ${targetUser}`,
        debug: friendRequests
    });
});

router.post('/accept-friend/:username', (req, res) => {
    const { username } = req.params;
    const { requester } = req.body;

    // Update request status
    if (friendRequests[username]) {
        const request = friendRequests[username].find(r => r.requester === requester);
        if (request) {
            request.status = 'accepted';
            
            // Add to friendships
            if (!friendships[username]) friendships[username] = [];
            if (!friendships[requester]) friendships[requester] = [];
            
            friendships[username].push(requester);
            friendships[requester].push(username);
        }
    }

    res.json({ success: true, message: 'Friend request accepted' });
});

router.post('/decline-friend/:username', (req, res) => {
    const { username } = req.params;
    const { requester } = req.body;

    if (friendRequests[username]) {
        const request = friendRequests[username].find(r => r.requester === requester);
        if (request) {
            request.status = 'declined';
        }
    }

    res.json({ success: true, message: 'Friend request declined' });
});

router.get('/friend-requests', (req, res) => {
    const { username } = req.query;
    const requests = friendRequests[username] || [];
    
    // Format requests to show "@requester wants to connect"
    const formattedRequests = requests.map(req => ({
        ...req,
        message: `@${req.requester} wants to connect`
    }));

    res.json({ 
        success: true, 
        requests: formattedRequests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });
});

// New endpoint to check friendship status
router.get('/friendship-status/:username', (req, res) => {
    const { username } = req.params;
    const { currentUser } = req.query;
    
    const isFriend = friendships[username]?.includes(currentUser);
    const pendingRequest = friendRequests[username]?.find(r => r.requester === currentUser);
    
    res.json({
        success: true,
        isFriend,
        requestStatus: pendingRequest?.status || null
    });
});

/**
 * User Recommendations
 * Generates personalized user recommendations based on connections
 * @route GET /recommendations
 * @param {string} user - Current user's username
 */
router.get('/recommendations', (req, res) => {
    const { user } = req.query;
    const following = friendships[user] || [];
    
    // Get all unique users
    const allUsers = [...new Set(posts.map(post => post.username))];
    
    // Filter and sort recommendations
    let recommendations = allUsers
        .filter(u => u !== user && !following.includes(u))
        .sort((a, b) => {
            // Sort by mutual connections
            const aConnections = friendships[a]?.filter(f => following.includes(f)).length || 0;
            const bConnections = friendships[b]?.filter(f => following.includes(f)).length || 0;
            return bConnections - aConnections;
        })
        .slice(0, 5); // Top 5 recommendations
    
    res.json({ 
        success: true, 
        recommendations
    });
});

// Update the content POST route to handle tags
router.post('/content', (req, res) => {
    console.log('Received new post request:', req.body); // Debug log
    
    try {
        const { content, username, tags } = req.body;
        
        const newPost = {
            _id: Date.now().toString(),
            content,
            username,
            tags: tags || [],
            createdAt: new Date().toISOString(),
            likes: []
        };
        
        posts.unshift(newPost);
        console.log('Added new post, total posts:', posts.length); // Debug log
        
        res.json({
            success: true,
            message: 'Post created successfully',
            data: newPost
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating post'
        });
    }
});

/**
 * Content Feed with Filters
 * Retrieves and filters posts based on various criteria
 * @route GET /contents
 * @param {string} filter - Filter type (trending, tags, etc.)
 */
router.get('/contents', (req, res) => {
    try {
        const { filter } = req.query;
        let filteredPosts = [...posts];

        // Apply specific filters
        switch(filter) {
            case 'trending':
                // Sort by popularity (likes count)
                filteredPosts = filteredPosts.sort((a, b) => 
                    (b.likes?.length || 0) - (a.likes?.length || 0)
                );
                break;
            
            case 'cybersecurity':
            case 'webdev':
            case 'ai':
            case 'cloud':
                // Filter by technical category
                filteredPosts = filteredPosts.filter(post => 
                    post.tags && post.tags.includes(filter)
                );
                break;
                
            case 'jobs':
            case 'events':
            case 'projects':
                // Filter by content type
                filteredPosts = filteredPosts.filter(post => 
                    post.tags?.includes(filter) || 
                    post.content.toLowerCase().includes(filter)
                );
                break;
        }

        res.json({
            success: true,
            data: filteredPosts
        });
    } catch (error) {
        console.error('Error fetching filtered content:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching content'
        });
    }
});

// Add these routes for tech news
router.get('/tech-news', async (req, res) => {
    try {
        // Scrape from multiple sources concurrently
        const [techCrunch, theVerge, hackernews] = await Promise.all([
            scrapeTechCrunch(),
            scrapeTheVerge(),
            scrapeHackerNews()
        ]);
        
        const news = [...techCrunch, ...theVerge, ...hackernews]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8); // Get latest 8 news items

        res.json({ success: true, news });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching news' });
    }
});

/**
 * TechCrunch News Scraper
 * Fetches latest tech news from TechCrunch
 * @returns {Promise<Array>} Array of news articles
 */
async function scrapeTechCrunch() {
    const response = await axios.get('https://techcrunch.com');
    const $ = cheerio.load(response.data);
    const news = [];

    $('article').slice(0, 3).each((i, element) => {
        news.push({
            title: $(element).find('h2').text().trim(),
            link: $(element).find('a').attr('href'),
            source: 'TechCrunch',
            date: new Date().toISOString()
        });
    });

    return news;
}

/**
 * The Verge News Scraper
 * Fetches latest tech news from The Verge
 * @returns {Promise<Array>} Array of news articles
 */
async function scrapeTheVerge() {
    const response = await axios.get('https://www.theverge.com/tech');
    const $ = cheerio.load(response.data);
    const news = [];

    $('article').slice(0, 3).each((i, element) => {
        news.push({
            title: $(element).find('h2').text().trim(),
            link: $(element).find('a').attr('href'),
            source: 'The Verge',
            date: new Date().toISOString()
        });
    });

    return news;
}

// Add Hacker News scraping
async function scrapeHackerNews() {
    try {
        const response = await axios.get('https://news.ycombinator.com');
        const $ = cheerio.load(response.data);
        const news = [];

        $('.athing').slice(0, 3).each((i, element) => {
            news.push({
                title: $(element).find('.titleline > a').text().trim(),
                link: $(element).find('.titleline > a').attr('href'),
                source: 'Hacker News',
                date: new Date().toISOString()
            });
        });

        return news;
    } catch (error) {
        console.error('Error scraping Hacker News:', error);
        return [];
    }
}

// Add search route
router.get('/search', (req, res) => {
    try {
        const { username } = req.query;
        
        if (!username) {
            return res.json({ success: false, users: [] });
        }

        // Search for users in posts array
        const matchedUsers = [...new Set(posts
            .filter(post => post.username.toLowerCase().includes(username.toLowerCase()))
            .map(post => post.username)
        )];

        // Get posts for matched users
        const userPosts = posts.filter(post => 
            matchedUsers.includes(post.username)
        );

        res.json({
            success: true,
            users: matchedUsers,
            posts: userPosts
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching users'
        });
    }
});

router.get('/product-launches', async (req, res) => {
    try {
        const response = await axios.get('https://www.producthunt.com/');
        const $ = cheerio.load(response.data);
        const products = [];

        $('.post-item').each((i, element) => {
            products.push({
                name: $(element).find('.post-name').text().trim(),
                description: $(element).find('.post-tagline').text().trim(),
                upvotes: $(element).find('.post-votes-count').text().trim(),
                link: 'https://www.producthunt.com' + $(element).find('a').attr('href')
            });
        });

        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching products' });
    }
});

router.get('/hot-questions', async (req, res) => {
    try {
        const response = await axios.get('https://stackoverflow.com/questions?tab=hot');
        const $ = cheerio.load(response.data);
        const questions = [];

        $('.question-summary').each((i, element) => {
            questions.push({
                title: $(element).find('.question-hyperlink').text().trim(),
                votes: $(element).find('.vote-count-post').text().trim(),
                views: $(element).find('.views').attr('title'),
                link: 'https://stackoverflow.com' + $(element).find('.question-hyperlink').attr('href')
            });
        });
        res.json({ success: true, questions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching questions' });
    }
});

router.get('/tech-events', async (req, res) => {
    try {
        const response = await axios.get('https://confs.tech/');
        const $ = cheerio.load(response.data);
        const events = [];

        $('.conference-item').each((i, element) => {
            events.push({
                name: $(element).find('.conference-name').text().trim(),
                date: $(element).find('.conference-date').text().trim(),
                location: $(element).find('.conference-location').text().trim(),
                link: $(element).find('a').attr('href')
            });
        });

        res.json({ success: true, events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching events' });
    }
});

// Registration - 5 marks
router.post('/users', (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user already exists
        if (users.find(u => u.username === username)) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }
        
        // Create new user
        const newUser = {
            username,
            password, // Note: In production, this should be hashed
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        
        res.json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error registering user'
        });
    }
});

// Follow/Unfollow - 2.5 marks each
router.post('/follow', (req, res) => {
    try {
        const { follower, following } = req.body;
        // Implementation for following users
        res.json({
            success: true,
            message: 'Successfully followed user'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error following user' });
    }
});

// Search functionality - 2.5 marks each
router.get('/users/search', (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.json({ 
                success: true, 
                data: [] 
            });
        }

        // Ensure users array exists
        const users = global.users || [];
        
        const searchResults = users.filter(user => 
            user.username.toLowerCase().includes(q.toLowerCase())
        );

        console.log('Search query:', q);
        console.log('Search results:', searchResults);

        res.json({ 
            success: true, 
            data: searchResults 
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error searching users',
            error: error.message 
        });
    }
});

router.get('/contents/search', (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.json({ 
                success: true, 
                data: [] 
            });
        }

        // Ensure posts array exists
        const posts = global.posts || [];

        const searchResults = posts.filter(post => 
            post.content.toLowerCase().includes(q.toLowerCase()) ||
            post.username.toLowerCase().includes(q.toLowerCase()) ||
            (post.tags && post.tags.some(tag => 
                tag.toLowerCase().includes(q.toLowerCase())
            ))
        );

        console.log('Search query:', q);
        console.log('Search results:', searchResults);

        res.json({ 
            success: true, 
            data: searchResults 
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error searching contents',
            error: error.message 
        });
    }
});

// Add bookmarks functionality
router.post('/bookmarks', (req, res) => {
    try {
        const { userId, postId } = req.body;
        // Store bookmark
        if (!bookmarks[userId]) {
            bookmarks[userId] = [];
        }
        bookmarks[userId].push(postId);
        res.json({ success: true, message: 'Post bookmarked' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error bookmarking post' });
    }
});

// Add notifications system
router.get('/notifications', (req, res) => {
    try {
        const { userId } = req.query;
        // Get user notifications (likes, follows, mentions)
        const userNotifications = notifications[userId] || [];
        res.json({ success: true, data: userNotifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching notifications' });
    }
});

// Add code snippet sharing
router.post('/snippets', (req, res) => {
    try {
        const { code, language, title, userId } = req.body;
        const snippet = {
            id: Date.now().toString(),
            code,
            language,
            title,
            userId,
            createdAt: new Date().toISOString()
        };
        snippets.push(snippet);
        res.json({ success: true, data: snippet });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving snippet' });
    }
});

// Add trending repos endpoint
router.get('/trending-repos', async (req, res) => {
    try {
        // Simulate some trending repos data
        const trendingRepos = [
            {
                name: 'tensorflow/tensorflow',
                description: 'An open-source machine learning framework',
                language: 'Python',
                stars: '12.5k',
                link: 'https://github.com/tensorflow/tensorflow'
            },
            {
                name: 'facebook/react',
                description: 'A JavaScript library for building user interfaces',
                language: 'JavaScript',
                stars: '10.2k',
                link: 'https://github.com/facebook/react'
            },
            {
                name: 'microsoft/vscode',
                description: 'Code editing. Redefined.',
                language: 'TypeScript',
                stars: '8.7k',
                link: 'https://github.com/microsoft/vscode'
            }
        ];

        res.json({
            success: true,
            repos: trendingRepos
        });
    } catch (error) {
        console.error('Error fetching trending repos:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching trending repos'
        });
    }
});

// Add tech news endpoint
router.get('/tech-news', async (req, res) => {
    try {
        // Simulate tech news data
        const techNews = [
            {
                title: 'Latest AI Developments',
                link: 'https://example.com/ai-news',
                source: 'Tech Daily',
                date: new Date().toISOString()
            },
            {
                title: 'New JavaScript Framework Released',
                link: 'https://example.com/js-news',
                source: 'Dev Weekly',
                date: new Date().toISOString()
            }
        ];

        res.json({
            success: true,
            news: techNews
        });
    } catch (error) {
        console.error('Error fetching tech news:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tech news'
        });
    }
});

/**
 * Global Error Handler
 * Catches and processes all unhandled errors
 */
router.use((error, req, res, next) => {
    console.error('Unhandled Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

/**
 * 404 Handler
 * Handles requests to undefined routes
 */
router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Get all users route
router.get('/users', (req, res) => {
    try {
        // Ensure users array exists
        const users = global.users || [];
        
        // Return all users (excluding sensitive info)
        const safeUsers = users.map(user => ({
            username: user.username,
            _id: user._id
        }));

        res.json({ 
            success: true, 
            data: safeUsers 
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error retrieving users',
            error: error.message 
        });
    }
});

// Add these routes right after your existing routes
// Get all users
router.get('/users', (req, res) => {
    try {
        // Get users from global state
        const users = global.users || [];
        console.log('Current users:', users); // Debug log
        
        res.json({ 
            success: true, 
            data: users.map(user => ({
                username: user.username,
                _id: user._id
            }))
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error retrieving users' 
        });
    }
});

// Search users - update existing route
router.get('/users/search', (req, res) => {
    try {
        const { q } = req.query;
        const users = global.users || [];
        
        const searchResults = users.filter(user => 
            user.username.toLowerCase().includes((q || '').toLowerCase())
        );
        
        console.log('Search query:', q);
        console.log('Search results:', searchResults);
        
        res.json({ 
            success: true, 
            data: searchResults 
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error searching users' 
        });
    }
});

// Make sure this is at the end of the file
module.exports = router;


