const mongoose = require('mongoose');

const excelFileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'error'],
    default: 'uploading'
  },
  processingError: {
    type: String,
    default: null
  },
  totalRows: {
    type: Number,
    default: 0
  },
  totalColumns: {
    type: Number,
    default: 0
  },
  sheets: [{
    name: String,
    rowCount: Number,
    columnCount: Number,
    headers: [String],
    dataPreview: [[String]], // First 5 rows for preview
    dataTypes: [String] // Data types for each column
  }],
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: String,
    enum: ['private', 'shared', 'public'],
    default: 'private'
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'read'
    }
  }],
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  processingTime: {
    type: Number, // in milliseconds
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
excelFileSchema.index({ uploadedBy: 1, uploadDate: -1 });
excelFileSchema.index({ status: 1 });
excelFileSchema.index({ tags: 1 });
excelFileSchema.index({ isPublic: 1 });

// Virtual for file size in MB
excelFileSchema.virtual('fileSizeMB').get(function() {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

// Method to update last accessed time
excelFileSchema.methods.updateLastAccessed = function() {
  this.lastAccessed = new Date();
  return this.save();
};

// Method to get file statistics
excelFileSchema.methods.getStats = function() {
  return {
    totalRows: this.totalRows,
    totalColumns: this.totalColumns,
    sheets: this.sheets.length,
    fileSize: this.fileSizeMB + ' MB',
    uploadDate: this.uploadDate,
    lastAccessed: this.lastAccessed
  };
};

module.exports = mongoose.model('ExcelFile', excelFileSchema);
