import React, { useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadFile } from '../../store/slices/fileSlice';

const FileUpload = () => {
  const dispatch = useDispatch();
  const { uploading, uploadProgress } = useSelector(state => state.files);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file) => {
    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ];
    
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setErrorMessage('Please select a valid Excel or CSV file');
      toast.error('Invalid file type. Please select an Excel or CSV file.');
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setErrorMessage('File size too large. Maximum size is 50MB');
      toast.error('File size too large. Maximum size is 50MB');
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
    setUploadStatus('idle');
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadStatus('uploading');
      setErrorMessage('');

      const formData = new FormData();
      formData.append('excelFile', selectedFile);

      const result = await dispatch(uploadFile(formData)).unwrap();

      if (result.success) {
        setUploadStatus('success');
        setSelectedFile(null);
        toast.success('File uploaded successfully!');
        
        // Reset after 3 seconds
        setTimeout(() => {
          setUploadStatus('idle');
        }, 3000);
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error.message || 'Upload failed');
      toast.error('Upload failed: ' + (error.message || 'Unknown error'));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'uploading':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      default:
        return <FileSpreadsheet className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'success':
        return 'Upload successful!';
      case 'error':
        return 'Upload failed';
      case 'uploading':
        return 'Uploading...';
      default:
        return 'Ready to upload';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Excel Files</h2>
        <p className="text-gray-600">
          Upload your Excel (.xlsx, .xls) or CSV files for analysis and processing
        </p>
      </div>

      {/* Drag & Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInputChange}
        />

        {!selectedFile ? (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your Excel file here
              </p>
              <p className="text-gray-500 mb-4">
                or click to browse files
              </p>
              <button
                type="button"
                onClick={openFileDialog}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Choose File
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Supports .xlsx, .xls, and .csv files up to 50MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {getStatusIcon()}
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {getStatusText()}
              </p>
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="h-8 w-8 text-blue-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            {uploadStatus === 'idle' && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload File'
                )}
              </button>
            )}

            {uploadStatus === 'uploading' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="text-green-600 font-medium">
                File uploaded successfully! Processing...
              </div>
            )}

            {uploadStatus === 'error' && (
              <button
                onClick={handleUpload}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upload Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Upload Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure your Excel file has headers in the first row</li>
          <li>• Remove any empty rows or columns for better processing</li>
          <li>• Large files may take longer to process</li>
          <li>• Supported formats: .xlsx, .xls, .csv</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
