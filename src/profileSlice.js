import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';

// ASYNC THUNKS
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/user/profile');
      return response.data.data; // contains user, stats, recentSubmissions, heatmapData
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch profile'
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosClient.put('/user/profile', profileData);
      // We can also re-fetch the profile or just rely on the updated returned user
      return response.data.user; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

// SLICE
const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,            // holds the full profile payload
    loading: false,        // initial fetch loading
    updateLoading: false,  // loading for edit saves
    error: null,
    updateError: null,
  },
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
      state.updateError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateUserProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        // merge updated user data into existing data tree
        if (state.data && state.data.user) {
          state.data.user = { ...state.data.user, ...action.payload };
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  }
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
