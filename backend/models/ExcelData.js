const mongoose = require('mongoose');

const excelDataSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExcelFile',
    required: true
  },
  sheetName: {
    type: String,
    required: true
  },
  rowIndex: {
    type: Number,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Flexible schema for different data types
    required: true
  },
  // Store column headers for easy access
  headers: [{
    type: String,
    required: true
  }],
  // Store data types for each column
  dataTypes: [{
    type: String,
    enum: ['string', 'number', 'date', 'boolean', 'mixed'],
    default: 'string'
  }],
  // Store validation status for each row
  validationStatus: {
    type: String,
    enum: ['valid', 'warning', 'error'],
    default: 'valid'
  },
  validationErrors: [{
    column: String,
    message: String,
    type: String
  }],
  // Metadata for processing
  processedAt: {
    type: Date,
    default: Date.now
  },
  // For performance optimization - store frequently accessed data
  searchableText: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
excelDataSchema.index({ fileId: 1, sheetName: 1, rowIndex: 1 });
excelDataSchema.index({ fileId: 1, validationStatus: 1 });
excelDataSchema.index({ searchableText: 'text' });

// Pre-save middleware to create searchable text
excelDataSchema.pre('save', function(next) {
  if (this.data && typeof this.data === 'object') {
    this.searchableText = Object.values(this.data)
      .filter(val => val !== null && val !== undefined)
      .map(val => String(val))
      .join(' ')
      .toLowerCase();
  }
  next();
});

// Method to get formatted data for display
excelDataSchema.methods.getFormattedData = function() {
  const formatted = {};
  
  if (this.headers && this.data) {
    this.headers.forEach((header, index) => {
      const value = this.data[header] || this.data[index];
      formatted[header] = {
        value: value,
        type: this.dataTypes[index] || 'string',
        isValid: this.validationStatus === 'valid'
      };
    });
  }
  
  return formatted;
};

// Method to validate data types
excelDataSchema.methods.validateDataTypes = function() {
  const errors = [];
  
  if (this.headers && this.data) {
    this.headers.forEach((header, index) => {
      const value = this.data[header] || this.data[index];
      const expectedType = this.dataTypes[index];
      
      if (expectedType && value !== null && value !== undefined) {
        let isValid = true;
        
        switch (expectedType) {
          case 'number':
            isValid = !isNaN(Number(value)) && isFinite(value);
            break;
          case 'date':
            isValid = !isNaN(Date.parse(value));
            break;
          case 'boolean':
            isValid = ['true', 'false', '1', '0', true, false].includes(value);
            break;
        }
        
        if (!isValid) {
          errors.push({
            column: header,
            message: `Expected ${expectedType}, got ${typeof value}`,
            type: 'type_mismatch'
          });
        }
      }
    });
  }
  
  this.validationErrors = errors;
  this.validationStatus = errors.length === 0 ? 'valid' : 'warning';
  
  return errors;
};

module.exports = mongoose.model('ExcelData', excelDataSchema);
