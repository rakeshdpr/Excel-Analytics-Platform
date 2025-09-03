# 📊 Excel Analytics Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.5.0-green)](https://www.mongodb.com/)

> A powerful full-stack web application for uploading, analyzing, and visualizing Excel data with interactive 2D and 3D charts. Built with modern web technologies for seamless data insights.

## ✨ Features

- 🔐 **Secure Authentication**: JWT-based user authentication with role-based access control
- 📤 **File Upload**: Drag-and-drop Excel file upload with validation
- 📈 **Interactive Charts**: 2D and 3D visualizations using Chart.js and Three.js
- 👨‍💼 **Admin Panel**: Comprehensive user and data management
- 📱 **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- 🔍 **Data Analytics**: Dynamic axis selection and real-time chart updates
- 📊 **Dashboard**: Personal dashboard with upload history and analytics
- 🛡️ **Security**: Helmet, CORS, rate limiting, and input validation

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server-side runtime and framework
- **MongoDB** & **Mongoose** - Database and ODM
- **JWT** & **bcryptjs** - Authentication and security
- **Multer** & **XLSX** - File upload and Excel parsing
- **Helmet** & **CORS** - Security middleware

### Frontend
- **React.js** - UI library with hooks
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** & **Three.js** - Chart rendering and 3D graphics
- **Axios** - HTTP client for API calls

## 📁 Project Structure

```
excel-analytics-platform/
├── 📁 backend/
│   ├── 📁 models/          # Database schemas
│   ├── 📁 routes/          # API endpoints
│   ├── 📁 middleware/      # Custom middleware
│   ├── 📁 services/        # Business logic
│   ├── 📁 uploads/         # File storage
│   └── server.js           # Main server file
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/  # React components
│   │   ├── 📁 store/       # Redux store & slices
│   │   └── App.js          # Root component
│   ├── 📁 public/          # Static assets
│   └── package.json        # Dependencies
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rakeshdpr/Excel-Analytics-Platform.git
   cd excel-analytics-platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file with your MongoDB URI and JWT secret
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📖 Usage

1. **Register/Login** to create an account
2. **Upload Excel files** via drag-and-drop or file picker
3. **Select data columns** for X, Y, and Z axes
4. **Choose chart type** (2D Bar, 3D Scatter, etc.)
5. **Customize and download** your visualizations

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Special thanks to the open-source community

---

<div align="center">
  <p>Made with 💻 by <a href="https://github.com/rakeshdpr">Rakesh Kumar</a></p>
  <p>
    <a href="#excel-analytics-platform">Back to top</a>
  </p>
</div>
