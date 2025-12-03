# CampusConnect - Campus Community Platform

CampusConnect is a comprehensive React Native mobile application built with Expo, designed to facilitate campus community interactions through study groups and marketplace features. The application provides a secure, university-verified platform for students to connect, collaborate, and trade within their campus community.

## Features

### Completed Features

- **Secure Authentication System**

  - JWT-based authentication with automatic token management
  - Secure login/registration with bcrypt password hashing
  - Cross-platform token storage (AsyncStorage/localStorage)
  - Automatic session management and token expiry handling

- **Dynamic Study Space Management**

  - Personalized study groups based on education level (UG/PG)
  - Real-time group fetching with comprehensive filtering
  - Join/leave group functionality with capacity management
  - Group status tracking (joined/available/full)
  - Category-based filtering (CSE, ECE, etc.)

- **Real-time Chat System**

  - Socket.IO-based real-time messaging for study groups
  - Message persistence with MongoDB storage
  - Media attachments support (image sharing)
  - Professional WhatsApp-like chat interface
  - Auto-scroll to latest messages
  - Group-based chat rooms with member management

- **AI-Powered Chat Features**

  - **Chat Summarizer**: AI-powered conversation summaries using OpenRouter API with multiple free models
  - **Chat Moderator**: Real-time inappropriate content filtering with predefined word detection
  - **Smart Content Analysis**: Automatic message validation before sending
  - **Fallback Summary System**: Local summary generation when AI models are unavailable

- **Campus Marketplace**

  - Browse and search campus marketplace items
  - Category filtering (Books, Electronics, Appliances, etc.)
  - Item condition tracking and seller information
  - Image upload system with compression and optimization
  - Complete post creation workflow with media support

- **User Profile Management**

  - Complete profile editing functionality
  - Secure logout functionality with proper state cleanup
  - Authentication-protected profile access
  - User preference management
  - About page with comprehensive app information

- **Redux State Management**

  - Redux Toolkit integration for client-side state
  - Posts management with filtering and search
  - Study groups state management
  - Centralized state architecture ready for scaling

- **Navigation & Routing**
  - Tab-based navigation with Expo Router
  - Protected routes with authentication guards
  - Automatic redirects based on authentication state
  - Deep linking support

## Architecture

### Frontend Stack

- **Framework**: React Native with Expo (~54.0.4)
- **Language**: TypeScript with strict type checking
- **Navigation**: Expo Router (~6.0.2) with file-based routing
- **UI Library**: React Native Paper (Material Design)
- **State Management**:
  - Redux Toolkit for client state
  - TanStack Query for server state management
  - AsyncStorage for persistence
- **Real-time Communication**: Socket.IO Client (~4.7.5)
- **Icons**: Expo Vector Icons
- **Media**: Expo Image Picker (~15.0.7)

### Backend Stack

- **Runtime**: Node.js
- **Framework**: Express.js (^4.21.1)
- **Database**: MongoDB with Mongoose ODM (^8.8.0)
- **Authentication**: JWT (^9.0.2) with bcrypt (^5.1.1)
- **Real-time**: Socket.IO (~4.7.5)
- **AI Integration**: OpenRouter API for chat features
- **Environment**: dotenv (^16.4.5)

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- MongoDB (for backend)
- OpenRouter API key (for AI features)

### Frontend Setup

1. **Install dependencies**

   ```bash
   cd CampusConnectApp
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run start
   ```

3. **Run on different platforms**
   - Press `w` for web
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app

### Backend Setup

1. **Install backend dependencies**

   ```bash
   cd CampusConnectBackend
   npm install
   ```

2. **Set up environment variables**

   ```bash
   # Create .env file with:
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=3406
   ```

3. **Start the backend server**
   ```bash
   nodemon server.js 
   ```

The backend will run on `http://localhost:3406`

## Application Flow

### Authentication Flow

1. **Login/Registration**: Secure authentication with form validation
2. **Token Management**: Automatic JWT token storage and validation
3. **Route Protection**: AuthGuard component protects all authenticated routes
4. **Session Management**: Automatic logout on token expiry

### Study Space Flow

1. **Education Level Detection**: Automatic display based on user's UG/PG status
2. **Group Discovery**: Real-time fetching of relevant study groups
3. **Group Interaction**: Join groups with capacity management
4. **Real-time Chat**: Access group chat with Socket.IO integration
5. **AI Moderation**: Automated content filtering and chat summarization

### Marketplace Flow

1. **Item Browsing**: Search and filter campus marketplace items
2. **Category Filtering**: Books, Electronics, Appliances, etc.
3. **Item Details**: View seller information and item conditions
4. **Image Upload**: Add images to marketplace posts with compression
5. **Post Creation**: Complete workflow for creating marketplace listings

## API Endpoints

### Authentication Routes (`/api/user/`)

- `POST /login` - User authentication
- `POST /signup` - User registration
- `PUT /profile` - Update user profile

### Group Management Routes (`/api/groups/`)

- `GET /` - Fetch groups with filtering
  - Query params: `category`, `educationLevel`, `graduationYear`, `userId`
- `POST /:groupId/join` - Join a study group
- `POST /:groupId/leave` - Leave a study group

### Chat Routes (`/api/chat/`)

- `GET /:groupId/messages` - Fetch chat history for a group
- `POST /:groupId/messages` - Send a new message to a group

### Posts Routes (`/api/posts/`)

- `GET /` - Fetch marketplace posts with filtering
- `POST /` - Create new marketplace post with image support
- `PUT /:postId` - Update existing post
- `DELETE /:postId` - Delete post

### Socket.IO Events

- `join-group` - Join a chat room
- `leave-group` - Leave a chat room
- `new-message` - Send/receive real-time messages
- `typing` - Typing indicators

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Route Protection**: AuthGuard component prevents unauthorized access
- **Token Validation**: Automatic token expiry checking
- **Secure Storage**: Platform-appropriate secure storage
- **Input Validation**: Comprehensive form validation
- **Content Moderation**: AI-powered inappropriate content filtering
- **Socket Authentication**: JWT-based Socket.IO connection security

## AI-Powered Features

### Chat Summarizer

- **OpenRouter API Integration**: Uses multiple free AI models with automatic fallback
- **Model Redundancy**: Supports DeepSeek, Meta-Llama, Microsoft Phi-3, and Zephyr models
- **Smart Filtering**: Focuses on important announcements, assignments, and academic content
- **Fallback System**: Local summary generation when all AI models are unavailable
- **One-Line Summaries**: Concise summaries under 20 words for quick understanding
- **Academic Focus**: Specialized prompts for educational content extraction

### Chat Moderator

- **Real-time Filtering**: Instant detection of inappropriate content before message sending
- **Predefined Word List**: Comprehensive list of inappropriate words and variations
- **Pattern Matching**: Advanced regex patterns to catch obfuscated inappropriate content
- **Warning System**: Modal alerts for policy violations with educational messaging
- **Message Blocking**: Prevents inappropriate messages from being sent to the chat

### Implementation Details

```javascript
// Chat Summarizer - Multiple Model Approach
const FREE_MODELS = [
  "deepseek/deepseek-chat-v3.1:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
  "huggingfaceh4/zephyr-7b-beta:free",
];

// OpenRouter API Call
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: "Bearer sk-or-v1-...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: modelName,
    messages: [
      {
        role: "system",
        content:
          "Provide ONE-LINE summary focusing on important announcements...",
      },
    ],
  }),
});

// Chat Moderator - Word Detection
const BAD_WORDS = ["inappropriate", "words", "list"];
const containsBadWords = (text) => {
  const regex = new RegExp(
    `\\b${word}\\b|${word.split("").join("[\\s\\*\\@\\#\\$]*")}`,
    "i"
  );
  return BAD_WORDS.some((word) => regex.test(text.toLowerCase()));
};
```

## UI/UX Features

- **Material Design**: React Native Paper components
- **Responsive Design**: Cross-platform compatibility
- **Loading States**: User-friendly loading indicators
- **Error Handling**: Comprehensive error messages
- **Theme Support**: Light/dark mode ready
- **Accessibility**: Screen reader support
- **Professional Chat UI**: WhatsApp-inspired chat interface
- **Image Optimization**: Automatic image compression and resizing

## State Management

### Three-Layer Architecture

1. **Redux Toolkit**: Client-side state (UI preferences, posts, study groups)
2. **TanStack Query**: Server state management and caching
3. **AsyncStorage**: Persistent storage for tokens and preferences

### Redux Slices

- **postsSlice**: Marketplace posts with filtering and search
- **studyGroupsSlice**: Study groups state with search and filtering

### Benefits

- **Performance**: Optimized re-renders and caching
- **Developer Experience**: Type-safe state management
- **Offline Support**: Built-in offline capabilities
- **Real-time Updates**: Automatic background refetching

## Testing & Development

### Development Tools

- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Expo DevTools**: Debugging and development

### Cross-Platform Testing

- **iOS**: Simulator and physical devices
- **Android**: Emulator and physical devices
- **Web**: Browser-based testing


### Technical Improvements

- **Performance Optimization**: Efficient API calls and state management
- **Code Quality**: Enhanced TypeScript implementation and error boundaries
- **User Experience**: Improved loading states and navigation flow
- **Security Enhancement**: JWT-based Socket.IO authentication
- **Database Optimization**: Indexed queries for better performance

### Bug Fixes and Enhancements

- **JSON Parsing Error**: Fixed user data storage and retrieval issues
- **Authentication System**: Enhanced logout and route protection
- **Profile Management**: Complete profile editing with form validation
- **Image Compression**: Resolved 413 Payload Too Large errors
- **Chat Stability**: Improved Socket.IO connection management


This comprehensive platform provides a complete solution for campus community interaction with cutting-edge AI features, real-time communication, and professional-grade state management, making it an ideal platform for modern educational environments.
