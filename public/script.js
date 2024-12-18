// IIFE to avoid global scope pollution
(function() {
    // Define a simple search function
    function userSearch2() {
        console.log('Search function called');
        const searchInput = document.querySelector('.search-container input');
        const postsContainer = document.querySelector('.postsContainer');
        
        console.log('Elements found:', {
            searchInput: searchInput?.value,
            postsContainer: postsContainer ? 'Found' : 'Not found'
        });

        if (!searchInput || !postsContainer) {
            console.error('Required elements not found');
            return;
        }

        const searchTerm = searchInput.value.trim();
        console.log('Searching for:', searchTerm);
        
        postsContainer.innerHTML = '<div>Searching...</div>';

        fetch(`/M00986611/contents/search?username=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(data => {
                console.log('Search results:', data);
                if (data.success && data.data && data.data.length > 0) {
                    postsContainer.innerHTML = '';
                    data.data.forEach(post => displayPost(post, postsContainer));
                } else {
                    postsContainer.innerHTML = '<div class="no-results">No posts found</div>';
                }
            })
            .catch(error => {
                console.error('Search error:', error);
                postsContainer.innerHTML = '<div class="error">Search failed</div>';
            });
    }

    function displayPost(post, container) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.innerHTML = `
            <div class="post-header">
                <span class="post-username">@${post.username}</span>
            </div>
            <div class="post-content">${post.content}</div>
        `;
        container.appendChild(postDiv);
    }

    // Add event listeners when the page loads
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Setting up search functionality');
        
        const searchButton = document.querySelector('.search-container button');
        console.log('Search button found:', !!searchButton);
        
        if (searchButton) {
            // Remove the inline onclick attribute
            searchButton.removeAttribute('onclick');
            
            // Add click event listener
            searchButton.addEventListener('click', function(e) {
                console.log('Search button clicked');
                e.preventDefault();
                userSearch2();
            });
            
            console.log('Click handler attached');
        }
    });

    // Log that the script is loaded
    console.log('Search script loaded');
})();

// Global function declaration


// User search
let currentUser = null;

/**
 * Displays temporary success/error messages to the user
 * Automatically hides after 3 seconds
 */
function showMessage(text, isSuccess) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + (isSuccess ? 'success' : 'error');
    messageDiv.style.display = 'block';
    setTimeout(() => messageDiv.style.display = 'none', 3000);
}

/**
 * Shows main application interface after successful login
 * Hides login section and displays post feed
 */
function showPostSection() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('postSection').style.display = 'block';
    document.getElementById('topNav').style.display = 'flex';
    document.getElementById('leftPanel').style.display = 'block';
    document.getElementById('rightPanel').style.display = 'block';
    loadPosts();
}

/**
 * Creates a new post with user content
 * Validates input and handles server communication
 */
async function createPost() {
    try {
        const content = document.getElementById('postContent').value;
        if (!content.trim()) {
            showMessage('Post content cannot be empty', false);
            return;
        }

        const response = await fetch('/M00986611/contents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                content: content,
                username: currentUser,
                likes: []
            })
        });

        const data = await response.json();
        if (data.success) {
            document.getElementById('postContent').value = '';
            showMessage('Post created successfully', true);
            loadPosts();
        } else {
            showMessage(data.message || 'Failed to create post', false);
        }
    } catch (error) {
        showMessage('Error creating post', false);
    }
}

/**
 * Fetches and displays all posts in the feed
 * Creates HTML elements for each post with user avatars
 */
async function loadPosts() {
    try {
        const response = await fetch('/M00986611/contents');
        const data = await response.json();
        
        const postsContainer = document.getElementById('postsContainer');
        postsContainer.innerHTML = '';
        
        if (data.success && data.data) {
            data.data.forEach(post => {
                const postElement = createPostElement(post);
                postsContainer.appendChild(postElement);
            });
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    const date = new Date(post.createdAt).toLocaleString();
    
    const likes = post.likes || [];
    const isLiked = currentUser && likes.includes(currentUser);
    const likeCount = likes.length;
    
    postElement.innerHTML = `
        <div class="post-header">
            <div class="post-user-info">
                <img src="${getDefaultAvatar(post.username)}" class="post-avatar" onclick="showUserProfile('${post.username}')">
                <span class="post-username">@${post.username || 'anonymous'}</span>
            </div>
            <small class="post-date">Posted on: ${date}</small>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
        </div>
        <div class="post-footer">
            <button 
                onclick="toggleLike('${post._id}')" 
                class="like-button ${isLiked ? 'liked' : ''}"
            >
                ${isLiked ? '❤️ Liked' : '🤍 Like'}
            </button>
            <span class="like-count">${likeCount} ${likeCount === 1 ? 'like' : 'likes'}</span>
        </div>
    `;
    
    return postElement;
}

function getDefaultAvatar(username = '') {
    const canvas = document.createElement('canvas');
    const size = 400; // Large size for quality
    canvas.width = size;
    canvas.height = size;
    
    const context = canvas.getContext('2d');
    
    // Background circle
    context.fillStyle = '#007bff';
    context.beginPath();
    context.arc(size/2, size/2, size/2, 0, Math.PI * 2, true);
    context.fill();
    
    // Text
    const initials = username ? username.substring(0, 2).toUpperCase() : '?';
    context.fillStyle = '#FFFFFF';
    context.font = `bold ${size/2}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(initials, size/2, size/2);
    
    return canvas.toDataURL('image/png', 1.0);
}

function getUserAvatar(username) {
    // In a real application, you would fetch the user's avatar from your database
    // For now, generate a default avatar with user's initials
    return getDefaultAvatar(username);
}

async function handleLoginSuccess(username) {
    currentUser = username;
    const avatarUrl = getDefaultAvatar(username);
    
    document.getElementById('currentUsername').textContent = username;
    document.getElementById('leftProfileUsername').textContent = username;
    document.getElementById('leftProfileImage').src = avatarUrl;
    document.getElementById('profileImage').src = avatarUrl;
    
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('topNav').style.display = 'flex';
    document.getElementById('postSection').style.display = 'block';
    document.getElementById('leftPanel').style.display = 'block';
    document.getElementById('rightPanel').style.display = 'block';
    loadPosts();
}

function logout() {
    currentUser = null;
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('topNav').style.display = 'none';
    document.getElementById('postSection').style.display = 'none';
    document.getElementById('leftPanel').style.display = 'none';
    document.getElementById('rightPanel').style.display = 'none';
    document.getElementById('profileSection').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

async function toggleLike(postId) {
    if (!currentUser) {
        showMessage('Please login to like posts', false);
        return;
    }

    try {
        const response = await fetch(`/M00986611/contents/${postId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser })
        });

        const data = await response.json();
        if (data.success) {
            loadPosts();
        } else {
            showMessage(data.message || 'Failed to update like', false);
        }
    } catch (error) {
        showMessage('Error updating like', false);
    }
}

function showUserProfile(username) {
    document.getElementById('postSection').style.display = 'none';
    document.getElementById('profileSection').style.display = 'block';
    document.getElementById('profileUsername').textContent = username;
    document.getElementById('profileUsernamePosts').textContent = username;
    document.getElementById('profileImage').src = getUserAvatar(username);
    loadUserPosts(username);
}

async function loadUserPosts(username) {
    try {
        const response = await fetch(`/M00986611/contents/search?username=${encodeURIComponent(username)}`);
        const data = await response.json();

        const profilePostsContainer = document.getElementById('profilePostsContainer');
        profilePostsContainer.innerHTML = '';

        if (!data.success || data.data.length === 0) {
            profilePostsContainer.innerHTML = '<div class="no-results">No posts found for this user</div>';
            return;
        }

        data.data.forEach(post => {
            const postElement = createPostElement(post);
            profilePostsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading user posts:', error);
    }
}

function customizeProfile() {
    const customizeSection = document.getElementById('customizeProfileSection');
    if (!customizeSection) {
        // Create customize section if it doesn't exist
        const section = document.createElement('div');
        section.id = 'customizeProfileSection';
        section.className = 'customize-section';
        section.innerHTML = `
            <div class="customize-content">
                <h3>Customize Profile</h3>
                <div class="form-group">
                    <label>Upload Profile Picture</label>
                    <input type="file" id="uploadProfileImage" accept="image/*">
                </div>
                <div class="button-group">
                    <button id="saveProfileBtn" class="save-button">Save Changes</button>
                    <button id="cancelCustomizeBtn" class="cancel-button">Cancel</button>
                </div>
            </div>
        `;
        document.querySelector('.profile-header').appendChild(section);
        
        // Add event listeners for the new buttons
        document.getElementById('saveProfileBtn').addEventListener('click', saveProfileChanges);
        document.getElementById('cancelCustomizeBtn').addEventListener('click', cancelCustomization);
    } else {
        customizeSection.style.display = customizeSection.style.display === 'none' ? 'block' : 'none';
    }
}

function cancelCustomization() {
    const customizeSection = document.getElementById('customizeProfileSection');
    if (customizeSection) {
        customizeSection.style.display = 'none';
    }
}

async function saveProfileChanges() {
    const fileInput = document.getElementById('uploadProfileImage');
    const file = fileInput.files[0];
    
    if (file) {
        try {
            const reader = new FileReader();
            reader.onload = function(e) {
                const avatarUrl = e.target.result;
                // Update all instances of the user's avatar
                document.getElementById('leftProfileImage').src = avatarUrl;
                document.getElementById('profileImage').src = avatarUrl;
                
                // Store the avatar in localStorage for persistence
                localStorage.setItem(`avatar_${currentUser}`, avatarUrl);
                
                showMessage('Profile updated successfully!', true);
                cancelCustomization();
            };
            reader.readAsDataURL(file);
        } catch (error) {
            showMessage('Failed to update profile', false);
            console.error('Error updating profile:', error);
        }
    } else {
        showMessage('Please select an image file', false);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Register form submission
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/M00986611/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: document.getElementById('regUsername').value,
                    password: document.getElementById('regPassword').value
                })
            });
            const data = await response.json();
            showMessage(data.message, data.success);
        } catch (error) {
            showMessage('Registration failed', false);
        }
    });
    function setProfileImage(imageUrl) {
        const profileImage = document.getElementById('leftProfileImage');
        profileImage.src = imageUrl || 'images/default-avatar.png';
    }
    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            const response = await fetch('/M00986611/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (data.success) {
                showMessage('Login successful', true);
                handleLoginSuccess(username);
            } else {
                showMessage(data.message || 'Login failed', false);
            }
        } catch (error) {
            showMessage('Login failed', false);
        }
    });
    // Add event listener for customize profile button
    const customizeBtn = document.getElementById('customizeProfileBtn');
    if (customizeBtn) {
        customizeBtn.addEventListener('click', customizeProfile);
    }
    
    // Add search button event listener
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', userSearch2);
    }
    
    // Add search input event listener
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
        searchInput.addEventListener('input', userSearch2);
    }
});

// Update the left panel avatar
function updateLeftPanelAvatar() {
    const leftProfileImage = document.getElementById('leftProfileImage');
    if (leftProfileImage && currentUser) {
        leftProfileImage.src = getDefaultAvatar(currentUser);
    }
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', function() {
    updateLeftPanelAvatar();
    loadPosts();
});

function showPostFeed() {
    hideAllSections();
    document.getElementById('postFeed').style.display = 'block';
    loadPosts();
}

function hideAllSections() {
    const sections = ['postFeed', 'profileSection', 'editProfileSection'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// Add this event listener for the Customize Profile button
document.getElementById('customizeProfileBtn').addEventListener('click', function() {
    const customizeSection = document.getElementById('customizeProfileSection');
    customizeSection.style.display = customizeSection.style.display === 'none' ? 'block' : 'none';
});

// Function to save profile changes
async function saveProfileChanges() {
    const fileInput = document.getElementById('uploadProfileImage');
    const formData = new FormData();

    if (fileInput.files.length > 0) {
        formData.append('profileImage', fileInput.files[0]);
    }

    try {
        const response = await fetch('/M00986611/updateProfile', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (data.success) {
            showMessage('Profile updated successfully', true);
            // Update the avatar in the navbar and profile section
            const avatarUrl = getUserAvatar(currentUser); // Update this to fetch the new avatar if needed
            document.getElementById('leftProfileImage').src = avatarUrl;
            document.getElementById('profileImage').src = avatarUrl;
        } else {
            showMessage(data.message || 'Failed to update profile', false);
        }
    } catch (error) {
        showMessage('Error updating profile', false);
    }
}



// Update event listeners
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', userSearch2);
    }
    
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
        searchInput.addEventListener('input', userSearch2);
    }
});

// Global search function
window.userSearch2 = function() {
    console.log('userSearch2 called');
    const searchInput = document.querySelector('.search-container input');
    const postsContainer = document.querySelector('.postsContainer');
    
    console.log('Elements:', {
        searchInput: searchInput?.value,
        postsContainer: postsContainer ? 'Found' : 'Not found'
    });

    if (!searchInput || !postsContainer) {
        console.error('Required elements not found');
        return;
    }

    const searchTerm = searchInput.value.trim();
    console.log('Searching for:', searchTerm);
    
    postsContainer.innerHTML = '<div>Searching...</div>';

    fetch(`/M00986611/contents/search?username=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            console.log('Search results:', data);
            if (data.success && data.data && data.data.length > 0) {
                postsContainer.innerHTML = '';
                data.data.forEach(post => displayPost(post, postsContainer));
            } else {
                postsContainer.innerHTML = '<div class="no-results">No posts found</div>';
            }
        })
        .catch(error => {
            console.error('Search error:', error);
            postsContainer.innerHTML = '<div class="error">Search failed</div>';
        });
};

// Helper function to display posts
function displayPost(post, container) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.innerHTML = `
        <div class="post-header">
            <span class="post-username">@${post.username}</span>
        </div>
        <div class="post-content">${post.content}</div>
    `;
    container.appendChild(postDiv);
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up search');
    
    // Find the search button
    const searchButton = document.querySelector('.search-container button');
    console.log('Search button found:', !!searchButton);
    
    if (searchButton) {
        // Remove any existing onclick handlers
        searchButton.onclick = null;
        
        // Add our new click handler
        searchButton.addEventListener('click', function(e) {
            console.log('Search button clicked');
            e.preventDefault();
            window.userSearch2();
        });
        
        console.log('Click handler attached to search button');
    }
});

// Log that script is loaded
console.log('Search script loaded');

// Make the function globally available
window.userSearch2 = userSearch2;

// Log that the script is loaded
console.log('Search script loaded, userSearch2 function is available globally');