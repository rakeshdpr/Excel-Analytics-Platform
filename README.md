# Excel Analytics Platform

A powerful platform for uploading, analyzing, and visualizing Excel data with interactive charts. Built with modern web technologies and a focus on user experience.

## 🎯 Project Overview

This platform allows users to:
- Upload Excel files (.xls or .xlsx)
- Analyze data with dynamic axis selection
- Generate interactive 2D and 3D charts
- Download charts in PNG/PDF formats
- Access personal dashboard with upload history
- Admin panel for user management

## 🚀 Week 1, 2 & 3 Completion Status

### ✅ Week 1 Completed Features:
- **Project Setup**: Complete Node.js/Express backend with MongoDB
- **User Authentication**: JWT-based auth with bcrypt password hashing
- **User Management**: User registration, login, profile management
- **Admin Panel**: Basic admin interface with user management
- **Frontend Foundation**: React app with Redux, Tailwind CSS
- **Protected Routes**: Role-based access control (RBAC)
- **Database Models**: User schema with proper validation
- **API Endpoints**: Complete REST API for auth and user management
- **Security**: Helmet, CORS, rate limiting, input validation
- **Error Handling**: Comprehensive error handling and logging

### ✅ Week 2 Completed Features:
- **File Upload System**: Excel/CSV file upload with drag & drop
- **Excel Parsing**: XLSX library integration for file processing
- **Data Storage**: MongoDB models for files and parsed data
- **File Management**: Complete file CRUD operations
- **File Sharing**: User-to-user file sharing with permissions
- **File Analytics**: Basic statistics and insights dashboard
- **Upload Validation**: File type, size, and format validation
- **Progress Tracking**: Upload progress and status monitoring
- **Search & Filtering**: Advanced file search and filtering
- **Responsive UI**: Modern, mobile-friendly file management interface

### ✅ Week 3 Completed Features:
- **Chart Rendering**: Chart.js integration for 2D visualizations
- **3D Visualizations**: Three.js and React Three Fiber for 3D charts
- **Dynamic Axis Selection**: User-selectable X, Y, and Z axes
- **Multiple Chart Types**: Bar, Line, Pie, Scatter, 3D Scatter, 3D Bar
- **Interactive Charts**: Zoom, pan, rotate, and hover interactions
- **Real-time Data**: Live chart updates based on axis selection
- **Advanced Analytics**: Dedicated analytics interface with chart controls
- **Chart Configuration**: Customizable titles, legends, and display options
- **Responsive Design**: Mobile-friendly chart interface
- **Data Validation**: Smart axis suggestions based on data types

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Multer** - File upload handling
- **XLSX** - Excel file parsing
- **express-rate-limit** - Rate limiting

### Frontend
- **React.js** - UI library
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Chart.js** - 2D chart rendering
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js

## 📁 Project Structure

```
excel-analytics/
├── backend/                 # Backend server
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── scripts/            # Utility scripts
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── store/          # Redux store and slices
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── public/             # Static files
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/excel-analytics
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   ```

4. **Start MongoDB** (if running locally)

5. **Seed admin user:**
   ```bash
   node scripts/seedAdmin.js
   ```

6. **Start backend server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Open browser:**
   Navigate to `http://localhost:3000`

## 🔐 Default Login Credentials

After running the seed script, you can use:

**Admin User:**
- Email: `admin@excelanalytics.com`
- Password: `admin123456`

**Test User:**
- Email: `test@excelanalytics.com`
- Password: `test123456`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password

### Dashboard
- `GET /api/dashboard/overview` - Dashboard overview
- `GET /api/dashboard/activity` - User activity
- `GET /api/dashboard/settings` - User settings
- `PUT /api/dashboard/settings` - Update settings

### Admin (Admin only)
- `GET /api/admin/users` - List all users
- `GET /api/admin/stats` - Platform statistics
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Deactivate user

## 🎨 Features Implemented (Week 1)

### Authentication System
- Secure user registration with validation
- JWT-based authentication
- Password hashing and security
- Role-based access control
- Session management

### User Dashboard
- Personal profile management
- Settings and preferences
- Activity tracking (framework)
- Subscription management
- Data usage monitoring

### Admin Panel
- User management interface
- Platform statistics
- User role management
- Account activation/deactivation

### Security Features
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- JWT token validation

## 🔮 Upcoming Features (Future Weeks)

- **Week 2:** File upload, Excel parsing, data storage
- **Week 3:** Chart generation, Chart.js & Three.js integration
- **Week 4:** Analysis history, AI integration, download features
- **Week 5:** Testing, deployment, final polish

## 🧪 Testing

The application includes comprehensive error handling and validation. Test the following scenarios:

- User registration with invalid data
- Login with wrong credentials
- Accessing protected routes without authentication
- Admin-only route access
- Profile updates and validation

## 🚀 Deployment

### Backend (Render/Heroku)
- Set environment variables
- Deploy to your preferred platform
- Ensure MongoDB connection

### Frontend (Netlify/Vercel)
- Build the project: `npm run build`
- Deploy the `build` folder
- Configure proxy for API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request




