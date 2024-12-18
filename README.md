# Social Networking Web Application

A dynamic single-page social media application focused on tech community engagement and real-time interactions. Built as part of CST2120 Web Applications and Databases coursework.

## 🚀 Features

### Core Social Features
- User authentication and profile management
- Real-time friend request system
- Content posting and interaction
- Follow/unfollow functionality

### Advanced Features
- Tech news integration
- GitHub trending repositories feed
- Smart content filtering and sorting
- Progressive feed loading with pagination
- Real-time activity center
- User recommendations engine

## 🛠️ Technical Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **APIs:** GitHub API, Tech News Integration
- **Security:** bcrypt, session management
- **Additional:** WebSockets, REST APIs

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/18aint/Web-app.git
cd Web-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with:
```env
PORT=8080
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
```

4. Start the application:
```bash
npm start
```

## 🔌 API Endpoints

### Authentication
```http
POST /M00986611/login         # User login
POST /M00986611/users         # User registration
DELETE /M00986611/login       # User logout
```

### Content Management
```http
POST /M00986611/contents      # Create content
GET /M00986611/contents       # Retrieve content
PUT /M00986611/contents/:id   # Update content
```

### Social Interactions
```http
POST /M00986611/follow        # Follow user
DELETE /M00986611/follow      # Unfollow user
GET /M00986611/users/search?q=query  # Search users
```

## 🔐 Security Features

- Password encryption using bcrypt
- Session-based authentication
- CORS protection
- Request validation
- XSS protection

## 📱 Responsive Design

The application is built with a mobile-first approach, ensuring optimal viewing experience across:
- Desktop computers
- Tablets
- Mobile devices

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📦 Project Structure

```plaintext
Web-app/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── server/
│   ├── controllers/
│   ├── routes/
│   └── server.js
├── routes/
│   └── M00986611.routes.js
└── package.json
```

## 👥 Contributing

1. Fork the repository
2. Create your feature branch:
```bash
git checkout -b feature/AmazingFeature
```

3. Commit your changes:
```bash
git commit -m 'Add some AmazingFeature'
```

4. Push to the branch:
```bash
git push origin feature/AmazingFeature
```

5. Open a Pull Request

## 📄 License

This project is part of academic coursework for CST2120 at Middlesex University.

## 🎓 Academic Information

- **Student ID:** M00986611
- **Course:** Web Applications and Databases
- **Module Code:** CST2120

## 📞 Contact

For any queries regarding this project, please contact:
- GitHub: [@18aint](https://github.com/18aint)
