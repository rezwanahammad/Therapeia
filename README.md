# Therapeia - Online Pharmacy Platform

A comprehensive e-commerce platform for online pharmacy services with AI-powered chatbot assistance, built with Node.js, Express, React, and Google Gemini AI.

## Features

### AI-Powered Chatbot

- **Gemini AI Integration**: Powered by Google's Gemini AI model for intelligent pharmaceutical assistance
- **Context-Aware Responses**: Provides medication guidance specific to Bangladeshi pharmaceutical guidelines
- **Dual Modes**:
  - General pharmacy consultation (home mode)
  - Product-specific medication guidance (product mode)
- **Smart Prompting**: Automatically formats queries with medical context and safety guidelines
- **Professional Tone**: Maintains medically appropriate responses with healthcare consultation recommendations

### User Management

- **User Registration & Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **User Profiles**: Complete user management with personal information, addresses, and order history
- **Shopping Cart**: Full cart functionality with add, update, and remove operations
- **Order Tracking**: Comprehensive order management with status updates and tracking information

### E-Commerce Features

- **Product Catalog**: Complete product management with categories, descriptions, and pricing
- **Product Search & Filtering**: Advanced search capabilities with category-based filtering
- **Order Management**: Full order lifecycle from creation to delivery
- **Payment Integration**: Ready for payment gateway integration
- **Inventory Management**: Product stock tracking and management

### Admin Panel

- **Admin Authentication**: Separate admin authentication system with role-based access
- **Product Management**: Add, edit, delete, and manage product inventory
- **Order Administration**: View, update status, track, and manage all customer orders
- **User Management**: Monitor user accounts, view order history, and manage user data
- **Analytics Dashboard**: Order audit trails and comprehensive reporting

### Security Features

- **JWT Authentication**: Secure token-based authentication for both users and admins
- **Password Hashing**: bcrypt for secure password storage
- **Cookie-based Sessions**: HTTP-only cookies for enhanced security
- **Role-based Access Control**: Separate authentication for users and administrators
- **Input Validation**: Comprehensive request validation and sanitization

### Technical Features

- **REST API**: Well-structured RESTful API endpoints
- **MongoDB Integration**: Mongoose ODM for database operations
- **File Upload**: Cloudinary integration for image management
- **Error Handling**: Comprehensive error handling and logging
- **CORS Support**: Cross-origin resource sharing configuration
- **Environment Configuration**: Secure environment variable management

## Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **File Storage**: Cloudinary
- **AI Integration**: Google Gemini AI API
- **Additional**:
  - CORS for cross-origin requests
  - Cookie-parser for session management
  - Morgan for request logging
  - Multer for file uploads
  - Dotenv for environment variables

### Frontend

- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router DOM 7.9.3
- **Styling**: CSS3 with custom components
- **Development**:
  - ESLint for code quality
  - Hot Module Replacement (HMR)
  - TypeScript definitions

## Project Structure

```
Therapia/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Route handlers
│   │   │   ├── auth.controller.js       # User authentication
│   │   │   ├── adminAuth.controller.js  # Admin authentication
│   │   │   ├── user.controller.js       # User management
│   │   │   ├── product.controller.js    # Product operations
│   │   │   ├── order.controller.js      # Order management
│   │   │   └── admin*.controller.js     # Admin operations
│   │   ├── middleware/           # Custom middleware
│   │   │   ├── auth.js                  # User authentication middleware
│   │   │   └── adminAuth.js             # Admin authentication middleware
│   │   ├── models/              # MongoDB schemas
│   │   │   ├── user.js                  # User model
│   │   │   ├── admin.js                 # Admin model
│   │   │   ├── product.js               # Product model
│   │   │   └── order.js                 # Order model
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   │   ├── gemini.js                # AI chatbot service
│   │   │   ├── cloudinary.js            # File upload service
│   │   │   └── events.js                # Event handling
│   │   ├── config/              # Configuration
│   │   │   └── db.js                    # Database connection
│   │   └── server.js            # Application entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── ChatModal.jsx            # AI chatbot interface
│   │   │   ├── AuthModal.jsx            # Authentication forms
│   │   │   ├── ProductCard.jsx          # Product display
│   │   │   ├── Header.jsx               # Navigation header
│   │   │   └── admin/                   # Admin components
│   │   ├── pages/               # Page components
│   │   │   ├── admin/                   # Admin dashboard pages
│   │   │   ├── AccountDashboard.jsx     # User account page
│   │   │   ├── Cart.jsx                 # Shopping cart
│   │   │   └── ProductDescription.jsx   # Product details
│   │   ├── utils/               # Utility functions
│   │   └── assets/              # Static assets
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/rezwanahammad/Therapeia.git
   cd Therapeia
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Configuration

Create `.env` files in both backend and frontend directories:

**Backend `.env`:**

```env
# Database
MONGO_URI=mongodb://localhost:27017/therapeia
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/therapeia

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_API_VERSION=v1

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server Configuration
NODE_ENV=development
PORT=5000
```

**Frontend `.env`:**

```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

1. **Start the Backend Server**

   ```bash
   cd backend
   npm run dev
   # Server runs on http://localhost:5000
   ```

2. **Start the Frontend Development Server**

   ```bash
   cd frontend
   npm run dev
   # Client runs on http://localhost:5173
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Admin Panel: http://localhost:5173/admin

## AI Chatbot Features

### Gemini AI Integration

The chatbot uses Google's Gemini AI with sophisticated prompting:

- **Medical Context**: Acts as a professional pharmacy assistant in Bangladesh
- **Safety Guidelines**: Ensures medically appropriate responses
- **Compliance**: Follows Bangladeshi pharmaceutical guidelines
- **Professional Recommendations**: Always advises consulting healthcare professionals
- **Fallback Responses**: Handles queries outside medical domain gracefully

### Usage Modes

1. **Home Mode**: General pharmaceutical consultation
2. **Product Mode**: Specific medication guidance with product context

### Implementation Details

- **Smart Prompting**: Automatically formats user queries with medical context
- **Response Filtering**: 60-100 word responses in professional tone
- **Error Handling**: Graceful error handling with user-friendly messages
- **Real-time Chat**: Instant responses with loading states

## API Documentation

### Authentication Endpoints

#### User Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Admin Authentication

- `POST /api/admin/auth/register` - Admin registration
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout
- `GET /api/admin/auth/me` - Get current admin

### Product Endpoints

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Order Endpoints

- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `GET /api/admin/orders` - List all orders (Admin)
- `PUT /api/admin/orders/:id/status` - Update order status (Admin)

### User Management

- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `GET /api/users/:id/cart` - Get user cart
- `POST /api/users/:id/cart` - Add to cart

### AI Chatbot

- `POST /api/chat` - Send message to AI chatbot

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development

```bash
cd frontend
npm run dev  # Uses Vite with HMR
```

### Building for Production

```bash
# Frontend
cd frontend
npm run build

# Backend (uses Node.js directly)
cd backend
npm start
```

### Code Quality

```bash
# Frontend linting
cd frontend
npm run lint
```

## Security Considerations

- JWT tokens with secure HTTP-only cookies
- Password hashing with bcrypt (10 rounds)
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Environment variable protection
- Role-based access control
- Secure admin authentication

## Key Features Highlight

### AI-Powered Medical Assistance

- Context-aware pharmaceutical guidance
- Bangladeshi medical compliance
- Professional consultation recommendations
- Smart error handling for non-medical queries

### Comprehensive E-commerce

- Full shopping cart functionality
- Order tracking and management
- Product catalog with search
- Admin dashboard for complete control

### Modern Development Stack

- React 19 with Vite for fast development
- Express.js with MongoDB for robust backend
- JWT authentication for security
- Modular architecture for scalability
