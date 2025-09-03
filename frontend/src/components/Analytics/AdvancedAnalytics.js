import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFiles } from '../../store/slices/fileSlice';
import { setSelectedFile, setSelectedSheet, clearChartData } from '../../store/slices/analyticsSlice';
import Chart2D from '../Charts/Chart2D';
import Chart3D from '../Charts/Chart3D';
import ChartControls from '../Charts/ChartControls';
import { BarChart3, FileText, TrendingUp, Box } from 'lucide-react';

const AdvancedAnalytics = () => {
  const dispatch = useDispatch();
  const { files, loading: filesLoading } = useSelector(state => state.files);
  const { selectedFile, selectedSheet, chartType, xAxis, yAxis, zAxis } = useSelector(state => state.analytics);
  
  const [activeTab, setActiveTab] = useState('charts');
  const [selectedFileId, setSelectedFileId] = useState('');

  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  useEffect(() => {
    if (selectedFileId) {
      const file = files.find(f => f._id === selectedFileId);
      if (file) {
        dispatch(setSelectedFile(file));
        if (file.sheets && file.sheets.length > 0) {
          dispatch(setSelectedSheet(file.sheets[0].name));
        }
      }
    }
  }, [selectedFileId, files, dispatch]);

  const handleFileSelect = (fileId) => {
    setSelectedFileId(fileId);
    dispatch(clearChartData());
  };

  const handleChartUpdate = () => {
    // Chart will automatically update when axes or type changes
    console.log('Chart update triggered');
  };

  const is3DChart = chartType && chartType.startsWith('3d-');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          </div>
          <p className="text-gray-600">
            Create interactive charts and 3D visualizations from your Excel data with dynamic axis selection.
          </p>
        </div>

        {/* File Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Data Source</h2>
          {filesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No files uploaded yet</p>
              <p className="text-sm text-gray-400">Upload Excel files to start creating charts</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map(file => (
                <button
                  key={file._id}
                  onClick={() => handleFileSelect(file._id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedFileId === file._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <FileText className={`h-6 w-6 mt-1 ${
                      selectedFileId === file._id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        selectedFileId === file._id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {file.sheets?.length || 0} sheets • {file.totalRows || 0} rows
                      </p>
                      <p className="text-xs text-gray-500">
                        Uploaded {new Date(file.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        {selectedFileId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Controls */}
            <div className="lg:col-span-1">
              <ChartControls
                fileId={selectedFileId}
                sheetName={selectedSheet}
                onChartUpdate={handleChartUpdate}
              />
            </div>

            {/* Chart Display */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Chart Preview</h2>
                  <div className="flex items-center space-x-2">
                                         {is3DChart ? (
                       <Box className="h-5 w-5 text-purple-600" />
                     ) : (
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    )}
                    <span className="text-sm text-gray-600">
                      {is3DChart ? '3D Visualization' : '2D Chart'}
                    </span>
                  </div>
                </div>

                {selectedFile && selectedSheet && xAxis && yAxis ? (
                  <div className="min-h-[500px]">
                    {is3DChart ? (
                      <Chart3D
                        fileId={selectedFileId}
                        sheetName={selectedSheet}
                        chartType={chartType}
                        xAxis={xAxis}
                        yAxis={yAxis}
                        zAxis={zAxis}
                        onChartUpdate={handleChartUpdate}
                      />
                    ) : (
                      <Chart2D
                        fileId={selectedFileId}
                        sheetName={selectedSheet}
                        chartType={chartType}
                        xAxis={xAxis}
                        yAxis={yAxis}
                        onChartUpdate={handleChartUpdate}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <BarChart3 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Configure Your Chart</h3>
                      <p className="text-gray-500">
                        Select chart type and axes from the controls on the left to start visualizing your data.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!selectedFileId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">Getting Started with Advanced Analytics</h3>
                <div className="text-blue-800 space-y-2">
                  <p>1. <strong>Select a file</strong> from your uploaded Excel files above</p>
                  <p>2. <strong>Choose a chart type</strong> (2D or 3D visualization)</p>
                  <p>3. <strong>Select your axes</strong> by choosing columns for X, Y, and Z (if 3D)</p>
                  <p>4. <strong>Customize</strong> your chart with advanced options</p>
                  <p>5. <strong>Interact</strong> with your charts - zoom, rotate, and explore the data</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
