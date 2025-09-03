import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFiles } from '../../store/slices/fileSlice';
import { 
  fetchColumns, 
  setSelectedFile, 
  setSelectedSheet, 
  clearChartData,
  setChartType,
  setXAxis,
  setYAxis,
  setZAxis,
  setChartConfig
} from '../../store/slices/analyticsSlice';
import Chart2D from './Chart2D';
import Chart3D from './Chart3D';
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Box,
  Settings,
  ChevronDown,
  Check
} from 'lucide-react';

const Charts = () => {
  const dispatch = useDispatch();
  const { files, loading: filesLoading } = useSelector(state => state.files);
  const { 
    columns, 
    availableSheets, 
    selectedSheet, 
    chartType, 
    xAxis, 
    yAxis, 
    zAxis, 
    chartConfig,
    selectedFile 
  } = useSelector(state => state.analytics);
  
  const [selectedFileId, setSelectedFileId] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: BarChart3, description: 'Vertical bars for comparing values' },
    { id: 'line', name: 'Line Chart', icon: TrendingUp, description: 'Connected points showing trends over time' },
    { id: 'pie', name: 'Pie Chart', icon: BarChart3, description: 'Circular chart showing proportions' },
    { id: 'doughnut', name: 'Doughnut Chart', icon: BarChart3, description: 'Hollow circular chart showing proportions' },
    { id: 'scatter', name: 'Scatter Plot', icon: BarChart3, description: 'Points showing correlation between variables' },
    { id: '3d-scatter', name: '3D Scatter Plot', icon: Box, description: 'Three-dimensional scatter visualization' },
    { id: '3d-bar', name: '3D Bar Chart', icon: Box, description: 'Three-dimensional bar visualization' }
  ];

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

  useEffect(() => {
    if (selectedFileId && selectedSheet) {
      dispatch(fetchColumns({ fileId: selectedFileId, sheetName: selectedSheet }));
    }
  }, [dispatch, selectedFileId, selectedSheet]);

  const handleFileSelect = (fileId) => {
    setSelectedFileId(fileId);
    dispatch(clearChartData());
  };

  const handleChartTypeChange = (type) => {
    dispatch(setChartType(type));
  };

  const handleAxisChange = (axis, value) => {
    switch (axis) {
      case 'x':
        dispatch(setXAxis(value));
        break;
      case 'y':
        dispatch(setYAxis(value));
        break;
      case 'z':
        dispatch(setZAxis(value));
        break;
      default:
        break;
    }
  };

  const handleSheetChange = (newSheetName) => {
    if (selectedFileId && newSheetName) {
      dispatch(fetchColumns({ fileId: selectedFileId, sheetName: newSheetName }));
    }
  };

  const getSuitableColumns = (axis) => {
    if (!columns.length) return [];
    return columns;
  };

  const getColumnTypeIcon = (type) => {
    switch (type) {
      case 'number':
        return '🔢';
      case 'string':
        return '📝';
      case 'date':
        return '📅';
      case 'boolean':
        return '✅';
      default:
        return '❓';
    }
  };

  const isChartReady = () => {
    if (chartType === 'pie' || chartType === 'doughnut') {
      return xAxis && yAxis;
    }
    if (chartType.startsWith('3d-')) {
      return xAxis && yAxis && zAxis;
    }
    return xAxis && yAxis;
  };

  const is3DChart = chartType && chartType.startsWith('3d-');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Charts & Analytics</h1>
          </div>
          <p className="text-gray-400">
            Create interactive charts and 3D visualizations from your Excel data with dynamic axis selection.
          </p>
        </div>

        {/* File Selection */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-teal-300 mb-4">Select Data Source</h2>
          {filesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <p className="text-gray-400">No files uploaded yet</p>
              <p className="text-sm text-gray-500">Upload Excel files from the Dashboard to start creating charts</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map(file => (
                <button
                  key={file._id}
                  onClick={() => handleFileSelect(file._id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedFileId === file._id
                      ? 'border-blue-500 bg-blue-900'
                      : 'border-gray-700 hover:border-gray-600 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <FileText className={`h-6 w-6 mt-1 ${
                      selectedFileId === file._id ? 'text-blue-400' : 'text-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        selectedFileId === file._id ? 'text-white' : 'text-gray-300'
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
              <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-orange-300">Chart Configuration</h3>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Advanced</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Selected File
                    </label>
                    <div className="text-sm text-white bg-gray-700 px-3 py-2 rounded-md">
                      {selectedFile ? selectedFile.originalName : 'No file selected'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Sheet
                    </label>
                    <select
                      value={selectedSheet || ''}
                      onChange={(e) => handleSheetChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {availableSheets.map(sheet => (
                        <option key={sheet} value={sheet}>{sheet}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Chart Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {chartTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => handleChartTypeChange(type.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          chartType === type.id
                            ? 'border-blue-500 bg-blue-900 text-white'
                            : 'border-gray-700 hover:border-gray-600 hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <type.icon className="h-6 w-6" />
                          <span className="text-xs font-medium">{type.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      X-Axis {chartType === 'pie' || chartType === 'doughnut' ? '(Categories)' : ''}
                    </label>
                    <select
                      value={xAxis}
                      onChange={(e) => handleAxisChange('x', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select X-Axis</option>
                      {getSuitableColumns('x').map(col => (
                        <option key={`x-${col.name}-${col.originalIndex}`} value={col.name}>
                          {getColumnTypeIcon(col.type)} {col.displayName || col.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Y-Axis {chartType === 'pie' || chartType === 'doughnut' ? '(Values)' : ''}
                    </label>
                    <select
                      value={yAxis}
                      onChange={(e) => handleAxisChange('y', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Y-Axis</option>
                      {getSuitableColumns('y').map(col => (
                        <option key={`y-${col.name}-${col.originalIndex}`} value={col.name}>
                          {getColumnTypeIcon(col.type)} {col.displayName || col.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(chartType === '3d-scatter' || chartType === '3d-bar') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Z-Axis
                      </label>
                      <select
                        value={zAxis}
                        onChange={(e) => handleAxisChange('z', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Z-Axis</option>
                        {getSuitableColumns('z').map(col => (
                          <option key={`z-${col.name}-${col.originalIndex}`} value={col.name}>
                            {getColumnTypeIcon(col.type)} {col.displayName || col.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {showAdvanced && (
                  <div className="border-t border-gray-700 pt-6">
                    <h4 className="text-sm font-medium text-white mb-3">Advanced Chart Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Chart Title
                        </label>
                        <input
                          type="text"
                          value={chartConfig.title}
                          onChange={(e) => dispatch(setChartConfig({ title: e.target.value }))}
                          placeholder="Enter chart title"
                          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={chartConfig.showLegend}
                            onChange={(e) => dispatch(setChartConfig({ showLegend: e.target.checked }))}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-400">Show Legend</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={chartConfig.animation}
                            onChange={(e) => dispatch(setChartConfig({ animation: e.target.checked }))}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-400">Animations</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isChartReady() ? (
                        <>
                          <Check className="h-5 w-5 text-green-400" />
                          <span className="text-sm text-green-400 font-medium">Chart ready to render</span>
                        </>
                      ) : (
                        <>
                          <div className="h-5 w-5 rounded-full border-2 border-gray-500"></div>
                          <span className="text-sm text-gray-500">Configure chart options</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Display */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Chart Preview</h2>
                  <div className="flex items-center space-x-2">
                    {is3DChart ? (
                      <Box className="h-5 w-5 text-purple-400" />
                    ) : (
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                    )}
                    <span className="text-sm text-gray-400">
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
                      />
                    ) : (
                      <Chart2D
                        fileId={selectedFileId}
                        sheetName={selectedSheet}
                        chartType={chartType}
                        xAxis={xAxis}
                        yAxis={yAxis}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <BarChart3 className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Configure Your Chart</h3>
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
          <div className="bg-blue-900 bg-opacity-50 border border-blue-800 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-300 mb-2">Getting Started with Charts</h3>
                <div className="text-blue-400 space-y-2">
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

export default Charts;
