import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Upload,
  BarChart3,
  HardDrive,
  FileText,
  Download,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { fetchFiles, uploadFile, deleteFile } from "../../store/slices/fileSlice";
import { toast } from "react-hot-toast";
import AdminRequest from "../Auth/AdminRequest";
import { motion } from "framer-motion";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { files, loading: filesLoading } = useSelector((state) => state.files);

  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("excelFile", file);

    setUploading(true);
    try {
      await dispatch(uploadFile(formData)).unwrap();
      toast.success("File uploaded successfully!");
      dispatch(fetchFiles());
    } catch (error) {
      toast.error(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        await dispatch(deleteFile(fileId)).unwrap();
        toast.success("File deleted successfully!");
        dispatch(fetchFiles());
      } catch (error) {
        toast.error(error.message || "Failed to delete file");
      }
    }
  };

  const stats = [
    {
      name: "Total Files",
      value: files.length,
      icon: FileText,
      color: "from-blue-500 to-indigo-500",
    },
    {
      name: "Storage Used",
      value: files.reduce((t, f) => t + (f.fileSize || 0), 0) / (1024 * 1024),
      unit: "MB",
      icon: HardDrive,
      color: "from-green-500 to-emerald-500",
      format: (v) => v.toFixed(2),
    },
    {
      name: "Total Sheets",
      value: files.reduce((t, f) => t + (f.sheets?.length || 0), 0),
      icon: BarChart3,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Total Rows",
      value: files.reduce((t, f) => t + (f.totalRows || 0), 0),
      icon: TrendingUp,
      color: "from-orange-500 to-yellow-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-8 shadow-lg text-white">
        <h1 className="text-3xl font-bold">📊 Dashboard</h1>
        <p className="mt-2 text-sm opacity-80">
          Welcome back! Manage your files and track analytics in style.
        </p>
      </div>

      {/* Admin Request */}
      <AdminRequest />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.name}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${stat.color} p-6 shadow-lg text-white`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-center space-x-4">
              <stat.icon className="h-10 w-10 opacity-90" />
              <div>
                <p className="text-sm opacity-80">{stat.name}</p>
                <p className="text-2xl font-bold">
                  {stat.format ? stat.format(stat.value) : stat.value}
                  {stat.unit && (
                    <span className="text-sm ml-1 opacity-80">{stat.unit}</span>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* File Upload Section */}
      <motion.div
        className="bg-white shadow-lg rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Upload Files</h2>
          <p className="text-sm text-gray-500">
            Upload Excel files to analyze your data
          </p>
        </div>

        <div className="p-8">
          <div
            className={`rounded-2xl p-10 text-center transition-all cursor-pointer backdrop-blur-sm ${
              dragActive
                ? "border-2 border-blue-500 bg-blue-50"
                : "border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-14 w-14 text-blue-500" />
            <p className="mt-4 text-lg font-semibold text-gray-800">
              {dragActive ? "Drop your file here" : "Drag & Drop or Click to Upload"}
            </p>
            <p className="text-sm text-gray-500">Supports .xlsx, .xls, .csv</p>
            <label className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {uploading ? "Uploading..." : "Choose File"}
            </label>
          </div>
        </div>
      </motion.div>

      {/* Files List */}
      <motion.div
        className="bg-white shadow-lg rounded-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Your Files</h2>
          <p className="text-sm text-gray-500">
            Manage your uploaded Excel files
          </p>
        </div>

        <div className="p-6">
          {filesLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="mx-auto h-14 w-14 text-gray-400 mb-4" />
              <p className="text-gray-600">No files uploaded yet</p>
              <p className="text-sm text-gray-400">
                Upload your first Excel file to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {files.map((file, idx) => (
                <motion.div
                  key={file._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {file.originalName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {file.sheets?.length || 0} sheets • {file.totalRows || 0} rows •
                        {file.fileSize
                          ? ` ${(file.fileSize / 1024 / 1024).toFixed(2)} MB`
                          : ""}
                      </p>
                      <p className="text-xs text-gray-400">
                        Uploaded {new Date(file.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        window.open(`/api/files/${file._id}/download`, "_blank")
                      }
                      className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file._id)}
                      className="p-2 rounded-full hover:bg-red-100 text-red-600 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
