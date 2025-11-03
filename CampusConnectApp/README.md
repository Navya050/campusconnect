# CampusConnect - Campus Community Platform 🎓

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

- **Campus Marketplace**

  - Browse and search campus marketplace items
  - Category filtering (Books, Electronics, Appliances, etc.)
  - Item condition tracking and seller information
  - Mock data implementation ready for backend integration

- **User Profile Management**

  - Secure logout functionality with proper state cleanup
  - Authentication-protected profile access
  - User preference management

- **Navigation & Routing**
  - Tab-based navigation with Expo Router
  - Protected routes with authentication guards
  - Automatic redirects based on authentication state
  - Deep linking support

### In Development

- Real-time chat functionality for study groups
- Marketplace transaction system
- Push notifications
- File upload capabilities
- Advanced user profile features

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
- **Icons**: Expo Vector Icons

### Backend Stack

- **Runtime**: Node.js
- **Framework**: Express.js (^4.21.1)
- **Database**: MongoDB with Mongoose ODM (^8.8.0)
- **Authentication**: JWT (^9.0.2) with bcrypt (^5.1.1)
- **Environment**: dotenv (^16.4.5)

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- MongoDB (for backend)

### Frontend Setup

1. **Install dependencies**

   ```bash
   cd CampusConnectApp
   npm install
   ```

2. **Start the development server**

   ```bash
   npx expo start
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
   npm start
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
4. **Group View**: Access joined groups (chat feature coming soon)

### Marketplace Flow

1. **Item Browsing**: Search and filter campus marketplace items
2. **Category Filtering**: Books, Electronics, Appliances, etc.
3. **Item Details**: View seller information and item conditions
4. **Contact System**: (In development)

## 🔧 API Endpoints

### Authentication Routes (`/api/user/`)

- `POST /login` - User authentication
- `POST /signup` - User registration

### Group Management Routes (`/api/groups/`)

- `GET /` - Fetch groups with filtering
  - Query params: `category`, `educationLevel`, `graduationYear`, `userId`
- `POST /:groupId/join` - Join a study group
- `POST /:groupId/leave` - Leave a study group

### Example API Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "groupId",
      "name": "CSE PG 2026",
      "description": "Default group for CSE PG students graduating in 2026",
      "category": "CSE",
      "educationLevel": "PG",
      "graduationYear": "2026",
      "studentCount": 5,
      "maxCapacity": 20,
      "isFull": false,
      "isJoined": false,
      "createdAt": "2025-10-23T13:25:12.010Z"
    }
  ]
}
```

## 🏛️ Project Structure

```
CampusConnectApp/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   ├── login.tsx          # Login screen
│   └── register.tsx       # Registration screen
├── components/            # Reusable UI components
│   └── AuthGuard.tsx      # Authentication protection
├── pages/                 # Main page components
│   ├── HomePage.tsx       # Home screen
│   ├── StudySpacePage.tsx # Study groups management
│   ├── MarketPage.tsx     # Campus marketplace
│   └── UserProfilePage.tsx # User profile
├── shared/                # Shared utilities and hooks
│   ├── hooks/             # Custom React hooks
│   ├── config/            # App configuration
│   ├── utils/             # Utility functions
│   └── store/             # Redux store
└── features/              # Feature-based modules
    └── auth/              # Authentication feature

CampusConnectBackend/
├── models/                # MongoDB/Mongoose models
│   ├── user.js           # User model
│   └── group.js          # Group model
├── routes/                # API route handlers
│   ├── user.js           # User authentication routes
│   └── group.js          # Group management routes
├── middleware/            # Express middleware
└── app.js                # Express app configuration
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Route Protection**: AuthGuard component prevents unauthorized access
- **Token Validation**: Automatic token expiry checking
- **Secure Storage**: Platform-appropriate secure storage
- **Input Validation**: Comprehensive form validation

## UI/UX Features

- **Material Design**: React Native Paper components
- **Responsive Design**: Cross-platform compatibility
- **Loading States**: User-friendly loading indicators
- **Error Handling**: Comprehensive error messages
- **Theme Support**: Light/dark mode ready
- **Accessibility**: Screen reader support

## State Management

### Three-Layer Architecture

1. **Redux Toolkit**: Client-side state (authentication, UI preferences)
2. **TanStack Query**: Server state management and caching
3. **AsyncStorage**: Persistent storage for tokens and preferences

### Benefits

- **Performance**: Optimized re-renders and caching
- **Developer Experience**: Type-safe state management
- **Offline Support**: Built-in offline capabilities
- **Real-time Updates**: Automatic background refetching

## 🧪 Testing & Development

### Development Tools

- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Expo DevTools**: Debugging and development
- **React Query DevTools**: State inspection

### Cross-Platform Testing

- **iOS**: Simulator and physical devices
- **Android**: Emulator and physical devices
- **Web**: Browser-based testing

## Recent Updates (October 2025)

### Major Features Added

#### Study Space with Group Management

- **Dynamic Education Level Display**: Shows UG/PG specific content
- **Real-time Group Fetching**: Backend integration with filtering
- **Join/Leave Functionality**: Complete group membership management
- **Group Status Tracking**: Visual indicators for joined/available groups

#### Critical Bug Fixes

- **JSON Parsing Error**: Fixed "[object object] is not a valid json" error
- **Authentication System**: Enhanced logout and route protection
- **Token Management**: Proper JSON stringification for user data storage

#### Backend Enhancements

- **Group API Endpoints**: Complete CRUD operations for groups
- **Filtering System**: Category, education level, graduation year filtering
- **Capacity Management**: Group size limits and full status tracking
- **User Join Status**: Real-time tracking of user membership

### Technical Improvements

- **Error Handling**: Comprehensive error logging and user feedback
- **Performance Optimization**: Efficient API calls and state management
- **Code Quality**: Enhanced TypeScript implementation and error boundaries
- **User Experience**: Improved loading states and navigation flow

### Performance

- Optimize React Query cache settings
- Minimize unnecessary re-renders
- Use proper loading states
- Implement error boundaries

## Latest Updates (November 2025)

### Major Feature Implementation: Image Upload System for Marketplace Posts

#### New Features Added

**Complete Image Upload Workflow**

- **Image Selection**: Native gallery access using expo-image-picker
- **Image Preview**: Real-time preview with editing capabilities
- **Image Compression**: Advanced compression (30% quality) for optimal performance
- **Image Display**: Full integration with marketplace post feed
- **Permission Management**: Proper media library permission handling

**Technical Implementation**

- **Base64 Storage**: Direct MongoDB storage eliminating CDN dependencies
- **Payload Optimization**: Server limits increased to 10MB for image handling
- **EXIF Removal**: Metadata stripping for reduced file sizes
- **Aspect Ratio Control**: Consistent 4:3 ratio for uniform display
- **Error Handling**: Comprehensive error management for upload failures

#### Backend Enhancements

**Database Schema Updates**

```javascript
// Post model enhanced with image field
const postSchema = new mongoose.Schema({
  // ... existing fields
  image: {
    type: String,
    required: false,
  },
  // ... other fields
});
```

**Server Configuration**

```javascript
// Increased payload limits for image handling
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
```

#### Problem Resolution: 413 Payload Too Large

**Issue Resolved**

- Fixed "413 Payload Too Large" error for image uploads
- Implemented multi-layer optimization approach
- Reduced image quality from 80% to 30% (70% file size reduction)
- Increased server payload capacity from 1MB to 10MB

**Technical Solutions**

- **Client-Side**: Image compression, metadata removal, quality optimization
- **Server-Side**: Enhanced Express.js body parser limits
- **Error Prevention**: Multiple optimization layers to prevent payload issues

#### User Experience Improvements

**Image Upload Flow**

1. User clicks "Tap to add an image" in post creation
2. System requests media library permissions
3. Native image picker opens with gallery access
4. User selects and crops image (4:3 aspect ratio)
5. Image compressed to 30% quality and converted to base64
6. Preview displayed with remove option
7. Image included in post submission
8. Posted image appears in marketplace feed

**Visual Design**

- **Selection Interface**: Dashed border button with camera icon
- **Preview Display**: 200x150px preview with remove button overlay
- **Feed Display**: Full-width images with 200px height and rounded corners
- **Loading States**: Proper indicators during image processing

#### Performance Optimizations

**Image Processing**

- **Compression**: 30% quality setting reduces file size by ~70%
- **Format Optimization**: JPEG compression for optimal size/quality ratio
- **Metadata Removal**: EXIF data stripped to minimize payload
- **Consistent Sizing**: 4:3 aspect ratio prevents layout issues

**Server Performance**

- **Payload Handling**: 10MB limit accommodates compressed images
- **Memory Management**: Efficient base64 processing
- **Error Recovery**: Graceful handling of oversized payloads
- **Backward Compatibility**: No impact on existing functionality

#### Security Considerations

**Input Validation**

- **File Type Restriction**: Only image files accepted through picker
- **Size Limitations**: Server-side payload limits prevent abuse
- **Format Validation**: Base64 format validation on server
- **Permission Handling**: Proper media library permission management

**Data Storage**

- **Database Storage**: Direct MongoDB storage eliminates external dependencies
- **Base64 Encoding**: Secure encoding format for database storage
- **No External CDN**: Eliminates third-party security concerns
- **Access Control**: Images stored with associated post permissions

#### Dependencies Added

**Frontend**

```json
{
  "expo-image-picker": "~15.0.7"
}
```

**Installation**

```bash
cd CampusConnectApp
npx expo install expo-image-picker
```

#### API Integration

**Post Creation with Image**

```javascript
// Example API call with image data
const postData = {
  title: "MacBook Pro for Sale",
  content: "Excellent condition, barely used",
  image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...", // base64 string
  mode: "marketplace",
  category: "Electronics",
  tags: ["laptop", "apple", "macbook"],
};

fetch(`${API_URL}/posts`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(postData),
});
```

#### Future Enhancements

**Planned Improvements**

- **Multiple Images**: Support for multiple images per post
- **Image Optimization**: Server-side image processing and optimization
- **Caching**: Client-side image caching for better performance
- **Cloud Storage**: Migration to cloud storage for scalability
- **Advanced Editing**: Filters, effects, and advanced editing features

**Technical Roadmap**

- **Progressive Loading**: Lazy loading for image-heavy feeds
- **Thumbnail Generation**: Automatic thumbnail creation for previews
- **Format Support**: Support for PNG, WebP, and other formats
- **Compression Options**: User-selectable quality settings

This image upload implementation provides a complete, production-ready solution for marketplace post images while maintaining optimal performance and user experience through advanced compression and efficient data handling.
