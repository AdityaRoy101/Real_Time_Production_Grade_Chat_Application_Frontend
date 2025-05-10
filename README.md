# Real-Time Production Grade Chat Application Frontend
A modern, real-time chat application built with React, TypeScript, and Chakra UI. This frontend application provides a rich user experience with real-time messaging, online status indicators, typing notifications, and read receipts.

🚀 Features
💬 Real-Time Messaging - Instant message delivery using Socket.IO
🔐 User Authentication - Secure JWT-based authentication
👥 User Presence Detection - See when users are online or offline
✓✓ Read Receipts - Know when your messages have been read
⌨️ Typing Indicators - See when someone is typing a message
📱 Responsive Design - Works seamlessly on desktop and mobile devices
♾️ Infinite Scrolling - Load conversation history as you scroll
🌙 Dark Mode - Choose between light and dark themes
🔍 User Search - Find and start conversations with other users

🛠️ Technology Stack
React 18 - Modern UI library for building user interfaces
TypeScript - Type-safe JavaScript
Chakra UI - Component library for building accessible UI
Socket.IO - Real-time bidirectional event-based communication
Axios - HTTP client for API requests
React Router - Navigation and routing
date-fns - Modern JavaScript date utility library

💻 Installation and Setup
Prerequisites
Node.js (v14 or newer)
npm or yarn
Backend API running (see backend repository)

Getting Started
Clone the repository
Install dependencies -> npm i
Set up environment variables
Create a .env file in the root directory:

Start the development server -> npm start
Build for production -> npm run build

🏗️ Project Structure
🔒 Authentication Flow
User registers or logs in
Backend returns a JWT token
Token is stored in localStorage
Frontend includes the token in API requests via Authorization header
Socket.IO connection uses the token for authentication
Protected routes check for valid authentication
🌐 API Integration
The application connects to a Node.js/Express backend API. The frontend communicates with the backend through:

RESTful API calls for CRUD operations
Socket.IO for real-time events (messages, typing indicators, user status)
⚙️ Environment Variables
Variable	Description
REACT_APP_API_URL	URL of the backend API server
REACT_APP_SOCKET_URL	URL of the WebSocket server (often same as API)
PORT	Port to run the development server
🧪 Future Improvements
Group chat support
File sharing
Message reactions/emoji
End-to-end encryption
Voice/video calls
📜 License
This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.

Made with ❤️ using React, TypeScript, and Socket.IO