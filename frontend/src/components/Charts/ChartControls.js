import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchColumns, 
  setChartType, 
  setXAxis, 
  setYAxis, 
  setZAxis,
  setChartConfig 
} from '../../store/slices/analyticsSlice';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Settings,
  ChevronDown,
  Check,
  Box
} from 'lucide-react';

const ChartControls = ({ fileId, sheetName, onChartUpdate }) => {
  const dispatch = useDispatch();
  const { columns, availableSheets, selectedSheet, chartType, xAxis, yAxis, zAxis, chartConfig } = useSelector(state => state.analytics);
  const { files } = useSelector(state => state.files);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: BarChart3, description: 'Vertical bars for comparing values' },
    { id: 'line', name: 'Line Chart', icon: LineChart, description: 'Connected points showing trends over time' },
    { id: 'pie', name: 'Pie Chart', icon: PieChart, description: 'Circular chart showing proportions' },
    { id: 'doughnut', name: 'Doughnut Chart', icon: PieChart, description: 'Hollow circular chart showing proportions' },
    { id: 'scatter', name: 'Scatter Plot', icon: BarChart3, description: 'Points showing correlation between variables' },
    { id: '3d-scatter', name: '3D Scatter Plot', icon: Box, description: 'Three-dimensional scatter visualization' },
    { id: '3d-bar', name: '3D Bar Chart', icon: Box, description: 'Three-dimensional bar visualization' }
  ];

  useEffect(() => {
    if (fileId && sheetName) {
      dispatch(fetchColumns({ fileId, sheetName }));
    }
  }, [dispatch, fileId, sheetName]);

  useEffect(() => {
    if (fileId) {
      const file = files.find(f => f._id === fileId);
      setSelectedFile(file);
    }
  }, [fileId, files]);

  const handleChartTypeChange = (type) => {
    dispatch(setChartType(type));
    if (type === 'pie' || type === 'doughnut') {
      dispatch(setXAxis(''));
      dispatch(setYAxis(''));
    }
    if (onChartUpdate) onChartUpdate();
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
    if (onChartUpdate) onChartUpdate();
  };

  const handleSheetChange = (newSheetName) => {
    if (fileId && newSheetName) {
      dispatch(fetchColumns({ fileId, sheetName: newSheetName }));
    }
  };

  const getSuitableColumns = (axis) => {
    if (!columns.length) return [];
    
    // Always return all columns for now since suitableFor property might not be properly set
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Chart Configuration</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Settings className="h-4 w-4" />
          <span>Advanced</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected File
          </label>
          <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
            {selectedFile ? selectedFile.originalName : 'No file selected'}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sheet
          </label>
          <select
            value={selectedSheet || ''}
            onChange={(e) => handleSheetChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableSheets.map(sheet => (
              <option key={sheet} value={sheet}>{sheet}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Chart Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {chartTypes.map(type => (
            <button
              key={type.id}
              onClick={() => handleChartTypeChange(type.id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                chartType === type.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            X-Axis {chartType === 'pie' || chartType === 'doughnut' ? '(Categories)' : ''}
          </label>
          <select
            value={xAxis}
            onChange={(e) => handleAxisChange('x', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select X-Axis</option>
            {getSuitableColumns('x').map(col => (
              <option key={col.name} value={col.name}>
                {getColumnTypeIcon(col.type)} {col.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Y-Axis {chartType === 'pie' || chartType === 'doughnut' ? '(Values)' : ''}
          </label>
          <select
            value={yAxis}
            onChange={(e) => handleAxisChange('y', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Y-Axis</option>
            {getSuitableColumns('y').map(col => (
              <option key={col.name} value={col.name}>
                {getColumnTypeIcon(col.type)} {col.name}
              </option>
            ))}
          </select>
        </div>

        {(chartType === '3d-scatter' || chartType === '3d-bar') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Z-Axis
            </label>
            <select
              value={zAxis}
              onChange={(e) => handleAxisChange('z', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Z-Axis</option>
              {getSuitableColumns('z').map(col => (
                <option key={col.name} value={col.name}>
                  {getColumnTypeIcon(col.type)} {col.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {showAdvanced && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Advanced Chart Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Title
              </label>
              <input
                type="text"
                value={chartConfig.title}
                onChange={(e) => dispatch(setChartConfig({ title: e.target.value }))}
                placeholder="Enter chart title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <span className="text-sm text-gray-700">Show Legend</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={chartConfig.animation}
                  onChange={(e) => dispatch(setChartConfig({ animation: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Animations</span>
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isChartReady() ? (
              <>
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Chart ready to render</span>
              </>
            ) : (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                <span className="text-sm text-gray-500">Configure chart options</span>
              </>
            )}
          </div>
          
          {isChartReady() && (
            <button
              onClick={() => onChartUpdate && onChartUpdate()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Update Chart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartControls;
