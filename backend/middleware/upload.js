const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create user-specific folder
    const userDir = path.join(uploadsDir, req.user.id.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file extension
  const allowedExtensions = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Only Excel files (.xlsx, .xls) and CSV files (.csv) are allowed'), false);
  }
  
  // Check MIME type
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
    'application/csv',
    'text/comma-separated-values'
  ];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only Excel and CSV files are allowed'), false);
  }
  
  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  if (file.size > maxSize) {
    return cb(new Error('File size too large. Maximum size is 50MB'), false);
  }
  
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1 // Only allow 1 file at a time
  }
});

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only 1 file allowed'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + error.message
    });
  }
  
  if (error.message.includes('Only Excel files') || 
      error.message.includes('Invalid file type') ||
      error.message.includes('File size too large')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Helper function to get file info
const getFileInfo = (file, userId) => {
  return {
    filename: file.filename,
    originalName: file.originalname,
    filePath: file.path,
    fileSize: file.size,
    mimeType: file.mimetype,
    uploadedBy: userId,
    uploadDate: new Date()
  };
};

// Helper function to clean up uploaded file on error
const cleanupFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
};

module.exports = {
  upload: upload.single('excelFile'),
  handleUploadError,
  getFileInfo,
  cleanupFile
};
