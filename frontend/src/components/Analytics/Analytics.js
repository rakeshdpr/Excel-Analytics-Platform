import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  BarChart3, 
  FileSpreadsheet, 
  TrendingUp, 
  Users, 
  HardDrive, 
  Calendar,
  PieChart,
  Activity
} from 'lucide-react';
import { fetchFiles } from '../../store/slices/fileSlice';

const Analytics = () => {
  const dispatch = useDispatch();
  const { files } = useSelector(state => state.files);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    fileTypes: {},
    statusDistribution: {},
    monthlyUploads: {},
    averageFileSize: 0
  });

  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  useEffect(() => {
    if (files.length > 0) {
      calculateStats();
    }
  }, [files]);

  const calculateStats = () => {
    const newStats = {
      totalFiles: files.length,
      totalSize: 0,
      fileTypes: {},
      statusDistribution: {},
      monthlyUploads: {},
      averageFileSize: 0
    };

    files.forEach(file => {
      // Calculate total size
      newStats.totalSize += file.fileSize || 0;

      // Count file types
      const ext = file.originalName?.split('.').pop()?.toLowerCase() || 'unknown';
      newStats.fileTypes[ext] = (newStats.fileTypes[ext] || 0) + 1;

      // Count status distribution
      const status = file.status || 'unknown';
      newStats.statusDistribution[status] = (newStats.statusDistribution[status] || 0) + 1;

      // Count monthly uploads
      if (file.uploadDate) {
        const month = new Date(file.uploadDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        newStats.monthlyUploads[month] = (newStats.monthlyUploads[month] || 0) + 1;
      }
    });

    // Calculate average file size
    newStats.averageFileSize = newStats.totalFiles > 0 ? newStats.totalSize / newStats.totalFiles : 0;

    setStats(newStats);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-green-600',
      processing: 'text-blue-600',
      error: 'text-red-600',
      uploading: 'text-yellow-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const getFileTypeIcon = (type) => {
    const icons = {
      xlsx: '📈',
      xls: '📊',
      csv: '📋',
      unknown: '📄'
    };
    return icons[type] || '📄';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">
          Insights and statistics about your Excel files and data
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <HardDrive className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Storage</p>
              <p className="text-2xl font-bold text-gray-900">{formatBytes(stats.totalSize)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg File Size</p>
              <p className="text-2xl font-bold text-gray-900">{formatBytes(stats.averageFileSize)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Files</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.statusDistribution.completed || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* File Types Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">File Types</h3>
          <div className="space-y-3">
            {Object.entries(stats.fileTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileTypeIcon(type)}</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {type === 'unknown' ? 'Unknown' : type}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{count} files</span>
                  <span className="text-sm text-gray-400">
                    ({((count / stats.totalFiles) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Status</h3>
          <div className="space-y-3">
            {Object.entries(stats.statusDistribution).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status).replace('text-', 'bg-')}`}></div>
                  <span className="font-medium text-gray-900 capitalize">
                    {status === 'unknown' ? 'Unknown' : status}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{count} files</span>
                  <span className="text-sm text-gray-400">
                    ({((count / stats.totalFiles) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Uploads */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Uploads</h3>
          <div className="space-y-3">
            {Object.entries(stats.monthlyUploads)
              .sort((a, b) => new Date(a[0]) - new Date(b[0]))
              .map(([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{month}</span>
                  </div>
                  <span className="text-sm text-gray-600">{count} files</span>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {files.slice(0, 5).map((file) => (
              <div key={file._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getFileTypeIcon(file.originalName?.split('.').pop()?.toLowerCase())}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(file.status).replace('text-', 'bg-').replace('-600', '-100')} ${getStatusColor(file.status)}`}>
                  {file.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Analytics Link */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">Advanced Analytics Available Now!</h3>
            <p className="text-blue-800 mb-4">
              Create interactive charts and 3D visualizations with dynamic axis selection:
            </p>
            <ul className="text-blue-800 space-y-2 mb-4">
              <li>• 📊 Interactive 2D charts (Bar, Line, Pie, Scatter)</li>
              <li>• 🎯 3D visualizations with Three.js</li>
              <li>• 🔄 Dynamic axis selection and chart configuration</li>
              <li>• 📈 Real-time data visualization</li>
              <li>• 🎨 Customizable chart options and themes</li>
            </ul>
            <a
              href="/advanced-analytics"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Launch Advanced Analytics
            </a>
          </div>
          <div className="hidden lg:block">
            <div className="text-6xl">📊🎯</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
