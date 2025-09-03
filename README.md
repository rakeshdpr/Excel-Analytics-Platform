# Excel Analytics Platform

## Overview
Excel Analytics Platform is a full-stack web application designed to provide advanced analytics and visualization for Excel data. The platform consists of a React frontend and a Node.js/Express backend, enabling users to upload Excel files, analyze data, and visualize results through interactive charts.

## Features
- User authentication and authorization
- Excel file upload and parsing
- Data analytics and visualization with charts
- Admin panel for managing users and data
- Responsive and modern UI built with React and Tailwind CSS

## Project Structure
- `backend/`: Node.js/Express backend API, including routes, models, middleware, and services.
- `frontend/`: React frontend application with components, state management, and styles.
- `.gitignore`: Specifies files and directories to be ignored by Git.
- `README.md`: Project documentation.

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/rakeshdpr/Excel-Analytics-Platform.git
   cd Excel-Analytics-Platform
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

- To start the backend server:
  ```
  cd backend
  npm run dev
  ```

- To start the frontend development server:
  ```
  cd frontend
  npm start
  ```

The frontend will proxy API requests to the backend server.

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License
This project is licensed under the MIT License.
