import React, { useState } from 'react';
import { Upload, FolderOpen, BarChart3, Settings } from 'lucide-react';
import FileUpload from './FileUpload';
import FileManager from './FileManager';

const Files = () => {
  const [activeTab, setActiveTab] = useState('upload');

  const tabs = [
    {
      id: 'upload',
      name: 'Upload Files',
      icon: Upload,
      description: 'Upload Excel and CSV files for processing'
    },
    {
      id: 'manage',
      name: 'File Manager',
      icon: FolderOpen,
      description: 'Manage and organize your uploaded files'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      description: 'View data insights and statistics'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      description: 'Configure file processing options'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return <FileUpload />;
      case 'manage':
        return <FileManager />;
      case 'analytics':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">File Analytics</h2>
              <p className="text-gray-600">
                Analyze your data and view insights from uploaded files
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
              <p className="text-gray-600">
                Advanced analytics and data visualization features will be available in future updates.
              </p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">File Settings</h2>
              <p className="text-gray-600">
                Configure file processing and management preferences
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Settings className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Coming Soon</h3>
              <p className="text-gray-600">
                File processing settings and preferences will be available in future updates.
              </p>
            </div>
          </div>
        );
      default:
        return <FileUpload />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Files</h1>
              <p className="mt-1 text-sm text-gray-500">
                Upload, manage, and analyze your Excel files
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Files;
