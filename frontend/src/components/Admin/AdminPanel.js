import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Users,
  Shield,
  BarChart3,
  Calendar,
  UserCheck,
  UserX,
  Crown,
  Search,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getAllUsers, updateUserStatus, deleteUser, getPendingAdminRequests, approveAdminRequest, disapproveAdminRequest } from '../../store/slices/userSlice';

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { users, loading, pendingRequests } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'pending', name: 'Pending Requests', icon: Clock },
  ];

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getPendingAdminRequests());
  }, [dispatch]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.isActive === (statusFilter === 'active');
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    inactiveUsers: users.filter(u => !u.isActive).length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    regularUsers: users.filter(u => u.role === 'user').length,
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await dispatch(updateUserStatus({ userId, isActive: !currentStatus })).unwrap();
      dispatch(getAllUsers()); // Refresh user list
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        dispatch(getAllUsers()); // Refresh user list
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };
  const handleApproveAdminRequest = async (userId) => {
    if (window.confirm('Are you sure you want to approve this admin request? This user will gain admin privileges.')) {
      try {
        await dispatch(approveAdminRequest(userId)).unwrap();
        dispatch(getPendingAdminRequests()); // Refresh pending requests
        dispatch(getAllUsers()); // Refresh user list
      } catch (error) {
        console.error('Failed to approve admin request:', error);
      }
    }
  };

  const handleDisapproveAdminRequest = async (userId) => {
    if (window.confirm('Are you sure you want to disapprove this admin request? This user will remain a regular user.')) {
      try {
        await dispatch(disapproveAdminRequest(userId)).unwrap();
        dispatch(getPendingAdminRequests()); // Refresh pending requests
        dispatch(getAllUsers()); // Refresh user list
      } catch (error) {
        console.error('Failed to disapprove admin request:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage platform users and monitor system statistics.
        </p>
      </div>

      {/* Admin Info */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Welcome, {currentUser?.firstName} {currentUser?.lastName}
              </h2>
              <p className="text-sm text-gray-500">
                You have administrator privileges to manage the platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="px-6 py-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6">
                  <dt>
                    <div className="absolute rounded-md bg-blue-100 p-3">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500">
                      Total Users
                    </p>
                  </dt>
                  <dd className="ml-16 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                  </dd>
                </div>

                <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6">
                  <dt>
                    <div className="absolute rounded-md bg-green-100 p-3">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500">
                      Active Users
                    </p>
                  </dt>
                  <dd className="ml-16 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
                  </dd>
                </div>

                <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6">
                  <dt>
                    <div className="absolute rounded-md bg-purple-100 p-3">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500">
                      Admin Users
                    </p>
                  </dt>
                  <dd className="ml-16 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stats.adminUsers}</p>
                  </dd>
                </div>

                <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6">
                   <dt>
                     <div className="absolute rounded-md bg-orange-100 p-3">
                       <UserX className="h-6 w-6 text-orange-600" />
                     </div>
                     <p className="ml-16 truncate text-sm font-medium text-gray-500">
                       Inactive Users
                     </p>
                   </dt>
                   <dd className="ml-16 flex items-baseline">
                     <p className="text-2xl font-semibold text-gray-900">{stats.inactiveUsers}</p>
                   </dd>
                 </div>

                 <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6">
                   <dt>
                     <div className="absolute rounded-md bg-yellow-100 p-3">
                       <Clock className="h-6 w-6 text-yellow-600" />
                     </div>
                     <p className="ml-16 truncate text-sm font-medium text-gray-500">
                       Pending Admin Requests
                     </p>
                   </dt>
                   <dd className="ml-16 flex items-baseline">
                     <p className="text-2xl font-semibold text-gray-900">{pendingRequests.length}</p>
                   </dd>
                 </div>
              </div>

              {/* Platform Stats */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Regular Users</dt>
                      <dd className="text-sm text-gray-900">{stats.regularUsers}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Admin Users</dt>
                      <dd className="text-sm text-gray-900">{stats.adminUsers}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Active Users</dt>
                      <dd className="text-sm text-gray-900">{stats.activeUsers}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">User management active</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">Real-time user data</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">Admin controls enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
             <div className="space-y-6">
               {/* Search and Filters */}
               <div className="flex flex-col sm:flex-row gap-4">
                 <div className="flex-1">
                   <div className="relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                     <input
                       type="text"
                       placeholder="Search users by name, email, or username..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     />
                   </div>
                 </div>
                 
                 <div className="flex gap-2">
                   <select
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                     className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="all">All Status</option>
                     <option value="active">Active</option>
                     <option value="inactive">Inactive</option>
                   </select>
                   
                   <select
                     value={roleFilter}
                     onChange={(e) => setRoleFilter(e.target.value)}
                     className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="all">All Roles</option>
                     <option value="user">User</option>
                     <option value="admin">Admin</option>
                   </select>
                 </div>
               </div>
              {/* User List */}
              {loading ? (
                 <div className="flex items-center justify-center py-8">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                 </div>
               ) : filteredUsers.length === 0 ? (
                 <div className="text-center py-8">
                   <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                   <p className="text-gray-500">No users found</p>
                   <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                 </div>
               ) : (
                 <div className="bg-white shadow overflow-hidden sm:rounded-md">
                   <ul className="divide-y divide-gray-200">
                     {filteredUsers.map((user) => (
                       <li key={user._id}>
                         <div className="px-4 py-4 sm:px-6">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center">
                               <div className="flex-shrink-0 h-10 w-10">
                                 <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                   <Users className="h-6 w-6 text-gray-600" />
                                 </div>
                               </div>
                               <div className="ml-4">
                                 <div className="text-sm font-medium text-gray-900">
                                   {user.firstName} {user.lastName}
                                 </div>
                                 <div className="text-sm text-gray-500">{user.email}</div>
                                 <div className="text-xs text-gray-400">@{user.username}</div>
                               </div>
                             </div>
                             <div className="flex items-center space-x-2">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                 {user.role}
                               </span>
                               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                                 {user.isActive ? 'Active' : 'Inactive'}
                               </span>
                             </div>
                           </div>
                           <div className="mt-2 sm:flex sm:justify-between">
                             <div className="sm:flex">
                               <p className="flex items-center text-sm text-gray-500">
                                 <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                 Joined {formatDate(user.createdAt)}
                               </p>
                             </div>
                             <div className="mt-2 flex items-center space-x-2 sm:mt-0">
                               <button
                                 onClick={() => handleStatusToggle(user._id, user.isActive)}
                                 className={`px-3 py-1 text-xs font-medium rounded-md ${
                                   user.isActive
                                     ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                     : 'bg-green-100 text-green-800 hover:bg-green-200'
                                 }`}
                               >
                                 {user.isActive ? 'Deactivate' : 'Activate'}
                               </button>
                               <button
                                 onClick={() => handleDeleteUser(user._id)}
                                 className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                               >
                                 Delete
                               </button>
                               </div>
                           </div>
                         </div>
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
             </div>
           )}
           {/* Pending Requests Tab */}
           {activeTab === 'pending' && (
             <div className="space-y-6">
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                 <div className="flex items-start space-x-3">
                   <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                   <div>
                     <h3 className="text-sm font-medium text-blue-900">Admin Approval Requests</h3>
                     <p className="text-sm text-blue-800 mt-1">
                       New users have requested admin privileges. Review and approve or disapprove their requests.
                     </p>
                   </div>
                 </div>
               </div>

               {/* Pending Requests List */}
               {loading ? (
                 <div className="flex items-center justify-center py-8">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                 </div>
               ) : pendingRequests.length === 0 ? (
                 <div className="text-center py-8">
                   <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                   <p className="text-gray-500">No pending admin requests</p>
                   <p className="text-sm text-gray-400">All admin requests have been processed</p>
                 </div>
               ) : (
                 <div className="bg-white shadow overflow-hidden sm:rounded-md">
                   <ul className="divide-y divide-gray-200">
                     {pendingRequests.map((request) => (
                       <li key={request._id}>
                         <div className="px-4 py-4 sm:px-6">
                         <div className="flex items-center justify-between">
                             <div className="flex items-center">
                               <div className="flex-shrink-0 h-10 w-10">
                                 <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                   <Clock className="h-6 w-6 text-yellow-600" />
                                 </div>
                               </div>
                               <div className="ml-4">
                                 <div className="text-sm font-medium text-gray-900">
                                   {request.user.firstName} {request.user.lastName}
                                 </div>
                                 <div className="text-sm text-gray-500">{request.user.email}</div>
                                 <div className="text-xs text-gray-400">@{request.user.username}</div>
                                 <div className="text-xs text-gray-500 mt-1">
                                   Requested admin privileges on {formatDate(request.requestDate)}
                                 </div>
                               </div>
                             </div>
                             <div className="flex items-center space-x-2">
                               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                 Pending Approval
                               </span>
                             </div>
                           </div>
                           <div className="mt-2 sm:flex sm:justify-between">
                             <div className="sm:flex">
                               <p className="flex items-center text-sm text-gray-500">
                                 <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                 User since {formatDate(request.user.createdAt)}
                               </p>
                               </div>
                             <div className="mt-2 flex items-center space-x-2 sm:mt-0">
                               <button
                                 onClick={() => handleApproveAdminRequest(request.user._id)}
                                 className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md hover:bg-green-200 flex items-center space-x-1"
                               >
                                 <CheckCircle className="h-3 w-3" />
                                 <span>Approve</span>
                               </button>
                               <button
                                 onClick={() => handleDisapproveAdminRequest(request.user._id)}
                                 className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-md hover:bg-red-200 flex items-center space-x-1"
                               >
                                 <XCircle className="h-3 w-3" />
                                 <span>Disapprove</span>
                               </button>
                             </div>
                           </div>
                         </div>
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
             </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;