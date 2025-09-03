const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, handleUploadError, getFileInfo, cleanupFile } = require('../middleware/upload');
const ExcelFile = require('../models/ExcelFile');
const ExcelData = require('../models/ExcelData');
const excelParser = require('../services/excelParser');
const { validationResult } = require('express-validator');

// @route   POST /api/files/upload
// @desc    Upload Excel file
// @access  Private
router.post('/upload', protect, upload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get file info
    const fileInfo = getFileInfo(req.file, req.user.id);
    
    // Create ExcelFile record
    const excelFile = new ExcelFile({
      ...fileInfo,
      status: 'processing'
    });

    await excelFile.save();

    // Process file asynchronously
    processFileAsync(excelFile._id, req.file.path, req.file.originalname)
      .catch(error => {
        console.error('Error processing file:', error);
        // Update file status to error
        ExcelFile.findByIdAndUpdate(excelFile._id, {
          status: 'error',
          processingError: error.message
        }).catch(updateError => {
          console.error('Error updating file status:', updateError);
        });
      });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileId: excelFile._id,
        filename: excelFile.filename,
        originalName: excelFile.originalName,
        status: excelFile.status
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      cleanupFile(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// @route   GET /api/files
// @desc    Get user's files
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sortBy = 'uploadDate', sortOrder = 'desc' } = req.query;

    // Build query
    const query = { uploadedBy: req.user.id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const files = await ExcelFile.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploadedBy', 'username firstName lastName')
      .lean();

    // Get total count
    const total = await ExcelFile.countDocuments(query);

    res.json({
      success: true,
      data: {
        files,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalFiles: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching files',
      error: error.message
    });
  }
});

// @route   GET /api/files/:id
// @desc    Get file details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const file = await ExcelFile.findById(req.params.id)
      .populate('uploadedBy', 'username firstName lastName')
      .populate('sharedWith.user', 'username firstName lastName');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check access permissions
    if (file.uploadedBy._id.toString() !== req.user.id && 
        !file.isPublic && 
        !file.sharedWith.some(share => share.user._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update last accessed time
    file.updateLastAccessed();

    res.json({
      success: true,
      data: file
    });

  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching file',
      error: error.message
    });
  }
});

// @route   GET /api/files/:id/data
// @desc    Get file data with pagination
// @access  Private
router.get('/:id/data', protect, async (req, res) => {
  try {
    const { page = 1, limit = 100, sheetName } = req.query;
    
    // Check file access
    const file = await ExcelFile.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    if (file.uploadedBy.toString() !== req.user.id && 
        !file.isPublic && 
        !file.sharedWith.some(share => share.user.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Build query
    const query = { fileId: req.params.id };
    if (sheetName) {
      query.sheetName = sheetName;
    }

    // Get data with pagination
    const data = await ExcelData.find(query)
      .sort({ rowIndex: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const total = await ExcelData.countDocuments(query);

    res.json({
      success: true,
      data: {
        rows: data,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRows: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching file data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching file data',
      error: error.message
    });
  }
});

// @route   PUT /api/files/:id
// @desc    Update file metadata
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { description, tags, isPublic, accessLevel } = req.body;

    const file = await ExcelFile.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check ownership
    if (file.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update fields
    const updateFields = {};
    if (description !== undefined) updateFields.description = description;
    if (tags !== undefined) updateFields.tags = tags;
    if (isPublic !== undefined) updateFields.isPublic = isPublic;
    if (accessLevel !== undefined) updateFields.accessLevel = accessLevel;

    const updatedFile = await ExcelFile.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'username firstName lastName');

    res.json({
      success: true,
      message: 'File updated successfully',
      data: updatedFile
    });

  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating file',
      error: error.message
    });
  }
});

// @route   DELETE /api/files/:id
// @desc    Delete file
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const file = await ExcelFile.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check ownership
    if (file.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete file data
    await ExcelData.deleteMany({ fileId: req.params.id });
    
    // Delete file record
    await ExcelFile.findByIdAndDelete(req.params.id);

    // Clean up physical file
    cleanupFile(file.filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
});

// @route   POST /api/files/:id/share
// @desc    Share file with other users
// @access  Private
router.post('/:id/share', protect, async (req, res) => {
  try {
    const { userId, permission = 'read' } = req.body;

    const file = await ExcelFile.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check ownership
    if (file.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if already shared
    const existingShare = file.sharedWith.find(share => 
      share.user.toString() === userId
    );

    if (existingShare) {
      // Update existing share
      existingShare.permission = permission;
    } else {
      // Add new share
      file.sharedWith.push({ user: userId, permission });
    }

    await file.save();

    const updatedFile = await ExcelFile.findById(req.params.id)
      .populate('uploadedBy', 'username firstName lastName')
      .populate('sharedWith.user', 'username firstName lastName');

    res.json({
      success: true,
      message: 'File shared successfully',
      data: updatedFile
    });

  } catch (error) {
    console.error('Error sharing file:', error);
    res.status(500).json({
      success: false,
      message: 'Error sharing file',
      error: error.message
    });
  }
});

// Error handling middleware
router.use(handleUploadError);

// Helper function to process file asynchronously
async function processFileAsync(fileId, filePath, originalName) {
  try {
    console.log(`Processing file: ${originalName}`);
    
    // Parse Excel file
    const parsedData = await excelParser.parseFile(filePath, originalName);
    
    // Update file status to completed
    const updateData = {
      status: 'completed',
      totalRows: parsedData.sheets.reduce((sum, sheet) => sum + sheet.rowCount, 0),
      totalColumns: Math.max(...parsedData.sheets.map(sheet => sheet.columnCount)),
      sheets: parsedData.sheets.map(sheet => ({
        name: sheet.name,
        rowCount: sheet.rowCount,
        columnCount: sheet.columnCount,
        headers: sheet.headers,
        dataPreview: sheet.dataPreview,
        dataTypes: sheet.dataTypes
      }))
    };

    await ExcelFile.findByIdAndUpdate(fileId, updateData);

    // Store data rows
    for (const sheet of parsedData.sheets) {
      if (!sheet.isEmpty && sheet.structuredData) {
        const dataRows = sheet.structuredData.map((rowData, index) => ({
          fileId,
          sheetName: sheet.name,
          rowIndex: index + 1,
          data: rowData,
          headers: sheet.headers,
          dataTypes: sheet.dataTypes
        }));

        // Insert data in batches
        const batchSize = 1000;
        for (let i = 0; i < dataRows.length; i += batchSize) {
          const batch = dataRows.slice(i, i + batchSize);
          await ExcelData.insertMany(batch);
        }
      }
    }

    console.log(`File processed successfully: ${originalName}`);

  } catch (error) {
    console.error(`Error processing file ${originalName}:`, error);
    
    // Update file status to error
    await ExcelFile.findByIdAndUpdate(fileId, {
      status: 'error',
      processingError: error.message
    });

    throw error;
  }
}

module.exports = router;
