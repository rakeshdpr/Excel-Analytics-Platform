import React from "react";
import { useSelector } from "react-redux";
import { User, Calendar, Mail, Shield } from "lucide-react";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-lg text-white overflow-hidden">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white shadow-lg backdrop-blur-md hover:scale-105 transition-transform">
              <User className="h-10 w-10 text-white" />
            </div>
            <span
              className={`absolute -bottom-1 -right-1 inline-flex h-4 w-4 rounded-full ring-2 ring-white ${
                user?.isActive ? "bg-green-400" : "bg-red-400"
              }`}
            ></span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-sm text-white/80">{user?.email}</p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium shadow ${
                user?.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {user?.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Personal Information
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="text-sm text-gray-900">
                {user?.firstName} {user?.lastName}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Username</dt>
              <dd className="text-sm text-gray-900">{user?.username}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Mail className="h-4 w-4 mr-1 text-gray-400" /> Email
              </dt>
              <dd className="text-sm text-gray-900">{user?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Shield className="h-4 w-4 mr-1 text-gray-400" /> Role
              </dt>
              <dd className="text-sm text-gray-900 capitalize">{user?.role}</dd>
            </div>
          </dl>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Account Details
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Member Since</dt>
              <dd className="text-sm text-gray-900">
                {formatDate(user?.createdAt)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Last Login</dt>
              <dd className="text-sm text-gray-900">
                {formatDate(user?.lastLogin)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="text-sm text-gray-900">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user?.isActive ? "Active" : "Inactive"}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Profile;
