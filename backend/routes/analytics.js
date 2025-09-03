const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ExcelFile = require('../models/ExcelFile');
const ExcelData = require('../models/ExcelData');

// Get chart data for a specific file
router.get('/chart-data/:fileId', protect, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { sheetName, chartType, xAxis, yAxis, limit = 1000 } = req.query;

    // Check if user has access to the file
    const file = await ExcelFile.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (!file.isPublic && file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get the sheet data
    const sheetData = await ExcelData.find({
      fileId,
      sheetName: sheetName || file.sheets[0]?.name
    }).limit(parseInt(limit));

    if (!sheetData.length) {
      return res.status(404).json({ message: 'No data found for the specified sheet' });
    }

    // Get headers from the first record
    const headers = sheetData[0].headers || [];
    
    // Prepare chart data based on chart type
    let chartData = prepareChartData(sheetData, chartType, xAxis, yAxis, headers);

    res.json({
      success: true,
      data: chartData,
      headers,
      chartType,
      xAxis,
      yAxis,
      totalRecords: sheetData.length
    });

  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({ message: 'Error fetching chart data', error: error.message });
  }
});

// Get available columns for axis selection
router.get('/columns/:fileId', protect, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { sheetName } = req.query;

    const file = await ExcelFile.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (!file.isPublic && file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get the sheet data to extract headers
    const sheetData = await ExcelData.findOne({
      fileId,
      sheetName: sheetName || file.sheets[0]?.name
    });

    if (!sheetData) {
      return res.status(404).json({ message: 'No data found for the specified sheet' });
    }

    const headers = sheetData.headers || [];
    const dataTypes = sheetData.dataTypes || {};

    // Keep all columns but make them unique for React keys by adding index for duplicates
    const columns = headers.map((header, index) => {
      // Count how many times this header appears before this index
      const duplicateCount = headers.slice(0, index).filter(h => h === header).length;

      return {
        name: header,
        displayName: duplicateCount > 0 ? `${header} (${duplicateCount + 1})` : header,
        type: dataTypes[header] || 'string',
        suitableFor: getSuitableAxes(dataTypes[header] || 'string'),
        originalIndex: index
      };
    });

    res.json({
      success: true,
      columns,
      selectedSheet: sheetName || file.sheets[0]?.name,
      availableSheets: file.sheets.map(sheet => sheet.name)
    });

  } catch (error) {
    console.error('Columns error:', error);
    res.status(500).json({ message: 'Error fetching columns', error: error.message });
  }
});

// Get data summary for a file
router.get('/summary/:fileId', protect, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { sheetName } = req.query;

    const file = await ExcelFile.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (!file.isPublic && file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const sheetData = await ExcelData.find({
      fileId,
      sheetName: sheetName || file.sheets[0]?.name
    });

    if (!sheetData.length) {
      return res.status(404).json({ message: 'No data found for the specified sheet' });
    }

    const headers = sheetData[0].headers || [];
    const dataTypes = sheetData[0].dataTypes || {};

    // Calculate summary statistics for numeric columns
    const summary = {};
    headers.forEach(header => {
      if (dataTypes[header] === 'number') {
        const values = sheetData
          .map(record => record.data[header])
          .filter(val => typeof val === 'number' && !isNaN(val));
        
        if (values.length > 0) {
          summary[header] = {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((sum, val) => sum + val, 0) / values.length,
            count: values.length,
            total: values.reduce((sum, val) => sum + val, 0)
          };
        }
      } else if (dataTypes[header] === 'string') {
        const values = sheetData
          .map(record => record.data[header])
          .filter(val => val && typeof val === 'string');
        
        if (values.length > 0) {
          const uniqueValues = [...new Set(values)];
          summary[header] = {
            uniqueCount: uniqueValues.length,
            totalCount: values.length,
            sampleValues: uniqueValues.slice(0, 10)
          };
        }
      }
    });

    res.json({
      success: true,
      summary,
      totalRecords: sheetData.length,
      headers,
      dataTypes
    });

  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
});

// Helper function to prepare chart data
function prepareChartData(sheetData, chartType, xAxis, yAxis, headers) {
  if (!xAxis || !yAxis) {
    return [];
  }

  const xIndex = headers.indexOf(xAxis);
  const yIndex = headers.indexOf(yAxis);

  if (xIndex === -1 || yIndex === -1) {
    return [];
  }

  switch (chartType) {
    case 'line':
    case 'bar':
    case 'scatter':
      return sheetData.map(record => ({
        x: record.data[xAxis],
        y: record.data[yAxis],
        label: record.data[xAxis]?.toString() || ''
      }));

    case 'pie':
    case 'doughnut':
      const groupedData = {};
      sheetData.forEach(record => {
        const key = record.data[xAxis]?.toString() || 'Unknown';
        const value = parseFloat(record.data[yAxis]) || 0;
        groupedData[key] = (groupedData[key] || 0) + value;
      });
      
      return Object.entries(groupedData).map(([label, value]) => ({
        label,
        value,
        percentage: 0 // Will be calculated on frontend
      }));

    case '3d-scatter':
      const zAxis = headers.length > 2 ? headers[2] : yAxis; // Use third column or fallback to yAxis
      return sheetData.map(record => ({
        x: record.data[xAxis],
        y: record.data[yAxis],
        z: record.data[zAxis] || 0,
        label: record.data[xAxis]?.toString() || ''
      }));

    case '3d-bar':
      return sheetData.map(record => ({
        x: record.data[xAxis],
        y: record.data[yAxis],
        z: 0, // Z is not used for 3D bars, set to 0
        label: record.data[xAxis]?.toString() || ''
      }));

    default:
      return sheetData.map(record => ({
        x: record.data[xAxis],
        y: record.data[yAxis],
        label: record.data[xAxis]?.toString() || ''
      }));
  }
}

// Helper function to determine suitable axes for column types
function getSuitableAxes(dataType) {
  switch (dataType) {
    case 'number':
      return ['x', 'y', 'z'];
    case 'string':
      return ['x', 'label'];
    case 'date':
      return ['x', 'y'];
    case 'boolean':
      return ['x', 'y'];
    default:
      return ['x', 'y'];
  }
}

module.exports = router;
