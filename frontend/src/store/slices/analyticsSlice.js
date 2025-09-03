import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchChartData = createAsyncThunk(
  'analytics/fetchChartData',
  async ({ fileId, sheetName, chartType, xAxis, yAxis, limit }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/analytics/chart-data/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { sheetName, chartType, xAxis, yAxis, limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chart data');
    }
  }
);

export const fetchColumns = createAsyncThunk(
  'analytics/fetchColumns',
  async ({ fileId, sheetName }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/analytics/columns/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { sheetName }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch columns');
    }
  }
);

export const fetchDataSummary = createAsyncThunk(
  'analytics/fetchDataSummary',
  async ({ fileId, sheetName }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/analytics/summary/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { sheetName }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch data summary');
    }
  }
);

const initialState = {
  chartData: [],
  columns: [],
  dataSummary: {},
  selectedFile: null,
  selectedSheet: '',
  chartType: 'bar',
  xAxis: '',
  yAxis: '',
  zAxis: '',
  loading: false,
  error: null,
  availableSheets: [],
  chartConfig: {
    title: '',
    showLegend: true,
    showGrid: true,
    animation: true,
    responsive: true
  }
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setSelectedFile: (state, action) => {
      state.selectedFile = action.payload;
      state.chartData = [];
      state.columns = [];
      state.dataSummary = {};
      state.xAxis = '';
      state.yAxis = '';
      state.zAxis = '';
    },
    setSelectedSheet: (state, action) => {
      state.selectedSheet = action.payload;
      state.chartData = [];
      state.columns = [];
      state.dataSummary = {};
      state.xAxis = '';
      state.yAxis = '';
      state.zAxis = '';
    },
    setChartType: (state, action) => {
      state.chartType = action.payload;
      state.chartData = [];
    },
    setXAxis: (state, action) => {
      state.xAxis = action.payload;
      state.chartData = [];
    },
    setYAxis: (state, action) => {
      state.yAxis = action.payload;
      state.chartData = [];
    },
    setZAxis: (state, action) => {
      state.zAxis = action.payload;
      state.chartData = [];
    },
    setChartConfig: (state, action) => {
      state.chartConfig = { ...state.chartConfig, ...action.payload };
    },
    clearChartData: (state) => {
      state.chartData = [];
      state.columns = [];
      state.dataSummary = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAnalytics: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch chart data
      .addCase(fetchChartData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.loading = false;
        state.chartData = action.payload.data;
        state.error = null;
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch columns
      .addCase(fetchColumns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchColumns.fulfilled, (state, action) => {
        state.loading = false;
        state.columns = action.payload.columns;
        state.availableSheets = action.payload.availableSheets;
        state.selectedSheet = action.payload.selectedSheet;
        state.error = null;
      })
      .addCase(fetchColumns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch data summary
      .addCase(fetchDataSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.dataSummary = action.payload.summary;
        state.error = null;
      })
      .addCase(fetchDataSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setSelectedFile,
  setSelectedSheet,
  setChartType,
  setXAxis,
  setYAxis,
  setZAxis,
  setChartConfig,
  clearChartData,
  clearError,
  resetAnalytics
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
