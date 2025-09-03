import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Share2, 
  Eye, 
  MoreVertical,
  Calendar,
  HardDrive,
  BarChart3,
  Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  fetchFiles, 
  deleteFile, 
  updateFile 
} from '../../store/slices/fileSlice';

const FileManager = () => {
  const dispatch = useDispatch();
  const { files, loading, pagination } = useSelector(state => state.files);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  const loadFiles = () => {
    const params = {
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      sortBy,
      sortOrder
    };
    dispatch(fetchFiles(params));
  };

  const handleDelete = async (fileId) => {
    try {
      await dispatch(deleteFile(fileId)).unwrap();
      toast.success('File deleted successfully');
      setShowDeleteModal(false);
      setSelectedFile(null);
      loadFiles();
    } catch (error) {
      toast.error('Failed to delete file: ' + error.message);
    }
  };

  const handleStatusUpdate = async (fileId, newStatus) => {
    try {
      await dispatch(updateFile({ fileId, status: newStatus })).unwrap();
      toast.success('File status updated');
      loadFiles();
    } catch (error) {
      toast.error('Failed to update file: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      processing: { color: 'bg-blue-100 text-blue-800', text: 'Processing' },
      error: { color: 'bg-red-100 text-red-800', text: 'Error' },
      uploading: { color: 'bg-yellow-100 text-yellow-800', text: 'Uploading' }
    };

    const config = statusConfig[status] || statusConfig.error;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'csv') return '📊';
    if (ext === 'xlsx') return '📈';
    if (ext === 'xls') return '📊';
    return '📄';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">File Manager</h2>
        <p className="text-gray-600">
          Manage and organize your uploaded Excel files
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search files by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="error">Error</option>
              <option value="uploading">Uploading</option>
            </select>
          </div>

          {/* Sort */}
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="uploadDate">Upload Date</option>
              <option value="originalName">File Name</option>
              <option value="fileSize">File Size</option>
              <option value="lastAccessed">Last Accessed</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="sm:w-32">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading files...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12">
          <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No files found</h3>
          <p className="mt-2 text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Upload your first Excel file to get started'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <div key={file._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              {/* File Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(file.originalName)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {file.originalName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.fileSize)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(file.status)}
                    <button
                      onClick={() => setSelectedFile(file)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* File Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Sheets:</span>
                  <span className="font-medium">{file.sheets?.length || 0}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Rows:</span>
                  <span className="font-medium">{file.totalRows?.toLocaleString() || 0}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Columns:</span>
                  <span className="font-medium">{file.totalColumns || 0}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Uploaded:</span>
                  <span className="font-medium">{formatDate(file.uploadDate)}</span>
                </div>

                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {file.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {file.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{file.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* File Actions */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {/* TODO: View file details */}}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>
                    
                    {file.status === 'completed' && (
                      <button
                        onClick={() => {/* TODO: Download file */}}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setShowShareModal(true);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {/* TODO: Previous page */}}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => {/* TODO: Next page */}}
              disabled={!pagination.hasNext}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedFile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete File</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete "{selectedFile.originalName}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedFile._id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedFile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <Share2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4 text-center">Share File</h3>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Share "{selectedFile.originalName}" with other users
              </p>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Email
                </label>
                <input
                  type="email"
                  placeholder="Enter user email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permission
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="read">Read Only</option>
                  <option value="write">Read & Write</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {/* TODO: Share file */}}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
