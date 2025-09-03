import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/users/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Profile update failed'
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/users/change-password', passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Password change failed'
      );
    }
  }
);

export const getDashboardOverview = createAsyncThunk(
  'user/getDashboardOverview',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/dashboard/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get dashboard data'
      );
    }
  }
);

export const getDashboardActivity = createAsyncThunk(
  'user/getDashboardActivity',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/dashboard/activity', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get activity data'
      );
    }
  }
);

export const getDashboardSettings = createAsyncThunk(
  'user/getDashboardSettings',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/dashboard/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get settings'
      );
    }
  }
);

export const updateDashboardSettings = createAsyncThunk(
  'user/updateDashboardSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/dashboard/settings', settingsData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update settings'
      );
    }
  }
);

export const getAllUsers = createAsyncThunk(
  'user/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.users;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get users'
      );
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'user/updateUserStatus',
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/admin/users/${userId}/status`, { isActive }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user status'
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete user'
      );
    }
  }
);

export const getPendingAdminRequests = createAsyncThunk(
  'user/getPendingAdminRequests',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/pending-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.requests;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get pending requests'
      );
    }
  }
);

export const approveAdminRequest = createAsyncThunk(
  'user/approveAdminRequest',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/admin/users/${userId}/approve-admin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to approve admin request'
      );
    }
  }
);

export const disapproveAdminRequest = createAsyncThunk(
  'user/disapproveAdminRequest',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/admin/users/${userId}/disapprove-admin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to disapprove admin request'
      );
    }
  }
);

const initialState = {
  profile: null,
  dashboard: {
    overview: null,
    activity: null,
    settings: null,
  },
  users: [],
  pendingRequests: [],
  loading: false,
  error: null,
  success: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserSuccess: (state) => {
      state.success = false;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get Dashboard Overview
      .addCase(getDashboardOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard.overview = action.payload;
        state.error = null;
      })
      .addCase(getDashboardOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Dashboard Activity
      .addCase(getDashboardActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard.activity = action.payload;
        state.error = null;
      })
      .addCase(getDashboardActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Dashboard Settings
      .addCase(getDashboardSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard.settings = action.payload;
        state.error = null;
      })
      .addCase(getDashboardSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Dashboard Settings
      .addCase(updateDashboardSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDashboardSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard.settings = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateDashboardSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update User Status
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get Pending Admin Requests
      .addCase(getPendingAdminRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingAdminRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = action.payload;
        state.error = null;
      })
      .addCase(getPendingAdminRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve Admin Request
      .addCase(approveAdminRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveAdminRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = state.pendingRequests.filter(req => req.user._id !== action.payload.userId);
        state.success = true;
        state.error = null;
      })
      .addCase(approveAdminRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Disapprove Admin Request
      .addCase(disapproveAdminRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disapproveAdminRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = state.pendingRequests.filter(req => req.user._id !== action.payload.userId);
        state.success = true;
        state.error = null;
      })
      .addCase(disapproveAdminRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearUserError, clearUserSuccess, setProfile } = userSlice.actions;
export default userSlice.reducer;
