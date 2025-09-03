import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const uploadFile = createAsyncThunk(
  'files/uploadFile',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log('Upload progress:', percentCompleted);
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Upload failed'
      );
    }
  }
);

export const fetchFiles = createAsyncThunk(
  'files/fetchFiles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });

      const response = await axios.get(`/api/files?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch files'
      );
    }
  }
);

export const fetchFileDetails = createAsyncThunk(
  'files/fetchFileDetails',
  async (fileId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/files/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch file details'
      );
    }
  }
);

export const fetchFileData = createAsyncThunk(
  'files/fetchFileData',
  async ({ fileId, params = {} }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });

      const response = await axios.get(`/api/files/${fileId}/data?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch file data'
      );
    }
  }
);

export const updateFile = createAsyncThunk(
  'files/updateFile',
  async ({ fileId, updateData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/files/${fileId}`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update file'
      );
    }
  }
);

export const deleteFile = createAsyncThunk(
  'files/deleteFile',
  async (fileId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/files/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return fileId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete file'
      );
    }
  }
);

export const shareFile = createAsyncThunk(
  'files/shareFile',
  async ({ fileId, shareData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/files/${fileId}/share`, shareData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to share file'
      );
    }
  }
);

// Initial state
const initialState = {
  files: [],
  currentFile: null,
  fileData: null,
  loading: false,
  uploading: false,
  uploadProgress: 0,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalFiles: 0,
    hasNext: false,
    hasPrev: false
  },
  filters: {
    search: '',
    status: 'all',
    sortBy: 'uploadDate',
    sortOrder: 'desc'
  }
};

// Slice
const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    resetUploadState: (state) => {
      state.uploading = false;
      state.uploadProgress = 0;
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: 'all',
        sortBy: 'uploadDate',
        sortOrder: 'desc'
      };
    }
  },
  extraReducers: (builder) => {
    // Upload File
    builder
      .addCase(uploadFile.pending, (state) => {
        state.uploading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 100;
        // Optionally add the new file to the list
        if (action.payload.data) {
          state.files.unshift(action.payload.data);
        }
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      });

    // Fetch Files
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload.data.files;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch File Details
    builder
      .addCase(fetchFileDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFileDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFile = action.payload.data;
      })
      .addCase(fetchFileDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch File Data
    builder
      .addCase(fetchFileData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFileData.fulfilled, (state, action) => {
        state.loading = false;
        state.fileData = action.payload.data;
      })
      .addCase(fetchFileData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update File
    builder
      .addCase(updateFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFile.fulfilled, (state, action) => {
        state.loading = false;
        // Update the file in the list
        const index = state.files.findIndex(f => f._id === action.payload.data._id);
        if (index !== -1) {
          state.files[index] = action.payload.data;
        }
        // Update current file if it's the same
        if (state.currentFile && state.currentFile._id === action.payload.data._id) {
          state.currentFile = action.payload.data;
        }
      })
      .addCase(updateFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete File
    builder
      .addCase(deleteFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the file from the list
        state.files = state.files.filter(f => f._id !== action.payload);
        // Clear current file if it's the deleted one
        if (state.currentFile && state.currentFile._id === action.payload) {
          state.currentFile = null;
        }
        // Clear file data if it's the deleted one
        if (state.fileData && state.fileData.fileId === action.payload) {
          state.fileData = null;
        }
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Share File
    builder
      .addCase(shareFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(shareFile.fulfilled, (state, action) => {
        state.loading = false;
        // Update the file in the list
        const index = state.files.findIndex(f => f._id === action.payload.data._id);
        if (index !== -1) {
          state.files[index] = action.payload.data;
        }
        // Update current file if it's the same
        if (state.currentFile && state.currentFile._id === action.payload.data._id) {
          state.currentFile = action.payload.data;
        }
      })
      .addCase(shareFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  clearError,
  setUploadProgress,
  resetUploadState,
  setFilters,
  clearFilters
} = fileSlice.actions;

// Export selectors
export const selectFiles = (state) => state.files.files;
export const selectCurrentFile = (state) => state.files.currentFile;
export const selectFileData = (state) => state.files.fileData;
export const selectFilesLoading = (state) => state.files.loading;
export const selectFilesUploading = (state) => state.files.uploading;
export const selectUploadProgress = (state) => state.files.uploadProgress;
export const selectFilesError = (state) => state.files.error;
export const selectFilesPagination = (state) => state.files.pagination;
export const selectFilesFilters = (state) => state.files.filters;

// Export reducer
export default fileSlice.reducer;
