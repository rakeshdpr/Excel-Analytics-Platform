import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Shield, Crown, Clock } from 'lucide-react';
import { requestAdminPrivileges } from '../../store/slices/authSlice';
import { toast } from 'react-hot-toast';

const AdminRequest = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.auth);
  const [hasRequested, setHasRequested] = useState(false);

  const handleRequestAdmin = async () => {
    try {
      await dispatch(requestAdminPrivileges()).unwrap();
      setHasRequested(true);
      toast.success('Admin privileges request submitted successfully!');
    } catch (error) {
      toast.error(error || 'Failed to submit admin request');
    }
  };

  // Don't show if user is already admin
  if (user?.role === 'admin') {
    return null;
  }

  // Don't show if user has already requested
  if (hasRequested) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Admin Request Submitted</p>
            <p className="mt-1">Your request for admin privileges has been submitted and is under review. You'll be notified once a decision is made.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Request Admin Privileges</h3>
              <p className="mt-1 text-sm text-blue-800">
                Want to manage users and platform settings? Request admin privileges to gain access to administrative features.
              </p>
            </div>
            <button
              onClick={handleRequestAdmin}
              disabled={loading}
              className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Request Admin
                </>
              )}
            </button>
          </div>
          
          <div className="mt-3 text-xs text-blue-700">
            <p>• Admin privileges allow you to manage users and platform settings</p>
            <p>• Your request will be reviewed by existing administrators</p>
            <p>• You'll remain a regular user until your request is approved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRequest;
