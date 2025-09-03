const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

class ExcelParser {
  constructor() {
    this.supportedFormats = ['.xlsx', '.xls', '.csv'];
  }

  // Parse Excel file and return structured data
  async parseFile(filePath, originalName) {
    try {
      const ext = path.extname(originalName).toLowerCase();
      
      if (!this.supportedFormats.includes(ext)) {
        throw new Error(`Unsupported file format: ${ext}`);
      }

      // Read the file
      const workbook = XLSX.readFile(filePath);
      const result = {
        sheets: [],
        totalSheets: workbook.SheetNames.length,
        fileInfo: {
          originalName,
          filePath,
          fileSize: fs.statSync(filePath).size
        }
      };

      // Process each sheet
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = this.parseSheet(sheet, sheetName);
        result.sheets.push(sheetData);
      }

      return result;
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  // Parse individual sheet
  parseSheet(sheet, sheetName) {
    try {
      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet, { 
        header: 1, // Use array format for better control
        defval: '', // Default value for empty cells
        raw: false // Convert all values to strings for consistency
      });

      if (!jsonData || jsonData.length === 0) {
        return {
          name: sheetName,
          rowCount: 0,
          columnCount: 0,
          headers: [],
          dataPreview: [],
          dataTypes: [],
          isEmpty: true
        };
      }

      // Extract headers (first row)
      const headers = jsonData[0].map(header => 
        header ? String(header).trim() : `Column_${jsonData[0].indexOf(header) + 1}`
      );

      // Remove header row and get data
      const dataRows = jsonData.slice(1).filter(row => 
        row.some(cell => cell !== null && cell !== undefined && cell !== '')
      );

      // Determine data types for each column
      const dataTypes = this.inferDataTypes(dataRows, headers);

      // Create data preview (first 5 rows)
      const dataPreview = dataRows.slice(0, 5).map(row => 
        headers.map((header, index) => row[index] || '')
      );

      // Create structured data for storage
      const structuredData = dataRows.map((row, rowIndex) => {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index] || '';
        });
        return rowData;
      });

      return {
        name: sheetName,
        rowCount: dataRows.length,
        columnCount: headers.length,
        headers,
        dataPreview,
        dataTypes,
        structuredData,
        isEmpty: false
      };
    } catch (error) {
      console.error(`Error parsing sheet ${sheetName}:`, error);
      return {
        name: sheetName,
        rowCount: 0,
        columnCount: 0,
        headers: [],
        dataPreview: [],
        dataTypes: [],
        isEmpty: true,
        error: error.message
      };
    }
  }

  // Infer data types for each column
  inferDataTypes(dataRows, headers) {
    const dataTypes = [];
    
    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const columnValues = dataRows
        .map(row => row[colIndex])
        .filter(val => val !== null && val !== undefined && val !== '');
      
      if (columnValues.length === 0) {
        dataTypes.push('string');
        continue;
      }

      // Sample up to 100 values for type inference
      const sampleValues = columnValues.slice(0, 100);
      const type = this.determineColumnType(sampleValues);
      dataTypes.push(type);
    }

    return dataTypes;
  }

  // Determine the most likely data type for a column
  determineColumnType(values) {
    let stringCount = 0;
    let numberCount = 0;
    let dateCount = 0;
    let booleanCount = 0;

    values.forEach(value => {
      const strValue = String(value).trim();
      
      if (strValue === '') {
        return;
      }

      // Check if it's a boolean
      if (['true', 'false', '1', '0', 'yes', 'no', 'y', 'n'].includes(strValue.toLowerCase())) {
        booleanCount++;
        return;
      }

      // Check if it's a number
      if (!isNaN(Number(strValue)) && isFinite(Number(strValue))) {
        numberCount++;
        return;
      }

      // Check if it's a date
      if (this.isValidDate(strValue)) {
        dateCount++;
        return;
      }

      // Default to string
      stringCount++;
    });

    // Determine the most common type
    const counts = [
      { type: 'string', count: stringCount },
      { type: 'number', count: numberCount },
      { type: 'date', count: dateCount },
      { type: 'boolean', count: booleanCount }
    ];

    counts.sort((a, b) => b.count - a.count);
    return counts[0].count > 0 ? counts[0].type : 'string';
  }

  // Check if a string represents a valid date
  isValidDate(str) {
    // Try different date formats
    const dateFormats = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/, // M/D/YYYY or M/D/YY
      /^\d{1,2}-\d{1,2}-\d{2,4}$/ // M-D-YYYY or M-D-YY
    ];

    if (dateFormats.some(format => format.test(str))) {
      const date = new Date(str);
      return !isNaN(date.getTime());
    }

    return false;
  }

  // Get basic file statistics
  getFileStats(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      console.error('Error getting file stats:', error);
      return null;
    }
  }

  // Validate file before processing
  validateFile(filePath, originalName) {
    const errors = [];
    
    // Check file extension
    const ext = path.extname(originalName).toLowerCase();
    if (!this.supportedFormats.includes(ext)) {
      errors.push(`Unsupported file format: ${ext}`);
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      errors.push('File not found');
    }

    // Check file size
    try {
      const stats = fs.statSync(filePath);
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (stats.size > maxSize) {
        errors.push(`File size too large: ${(stats.size / (1024 * 1024)).toFixed(2)}MB (max: 50MB)`);
      }
    } catch (error) {
      errors.push('Unable to read file size');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new ExcelParser();
