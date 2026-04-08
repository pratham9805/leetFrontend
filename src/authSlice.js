import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';

// ── Existing thunks (unchanged) ───────────────────────────────────────────────

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Invalid Credentials');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/user/check');
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const googleLoginUser = createAsyncThunk(
  'auth/googleLogin',
  async (credential, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/google', { credential });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Google login failed');
    }
  }
);

// ── Signup OTP thunks ─────────────────────────────────────────────────────────

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ emailId, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/verify-otp', { emailId, otp });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Verification failed', code: 'UNKNOWN' });
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (emailId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/resend-otp', { emailId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to resend OTP', code: 'UNKNOWN' });
    }
  }
);

// ── Password Reset thunks ─────────────────────────────────────────────────────

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (emailId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/forgot-password', { emailId });
      return { ...response.data, email: emailId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to send OTP', code: 'UNKNOWN' });
    }
  }
);

export const verifyResetOtp = createAsyncThunk(
  'auth/verifyResetOtp',
  async ({ emailId, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/verify-reset-otp', { emailId, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Verification failed', code: 'UNKNOWN' });
    }
  }
);

export const resendResetOtp = createAsyncThunk(
  'auth/resendResetOtp',
  async (emailId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/resend-reset-otp', { emailId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to resend OTP', code: 'UNKNOWN' });
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ emailId, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/reset-password', { emailId, newPassword, confirmPassword });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Password reset failed', code: 'UNKNOWN' });
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    // Signup OTP flow
    pendingEmail: null,
    otpLoading: false,
    otpError: null,
    // Password reset flow
    resetEmail: null,
    resetVerified: false,
    resetLoading: false,
    resetError: null,
  },
  reducers: {
    clearOtpError: (state) => { state.otpError = null; },
    setPendingEmail: (state, action) => { state.pendingEmail = action.payload; },
    clearPendingEmail: (state) => { state.pendingEmail = null; },
    clearResetError: (state) => { state.resetError = null; },
    clearResetEmail: (state) => {
      state.resetEmail = null;
      state.resetVerified = false;
      state.resetError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Register ────────────────────────────────────────────────────────────
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingEmail = action.payload?.email || null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
        state.isAuthenticated = false;
        state.user = null;
      })

      // ── Login ───────────────────────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })

      // ── Check Auth ──────────────────────────────────────────────────────────
      .addCase(checkAuth.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
      })

      // ── Logout ──────────────────────────────────────────────────────────────
      .addCase(logoutUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.pendingEmail = null;
        state.resetEmail = null;
        state.resetVerified = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })

      // ── Google Login ────────────────────────────────────────────────────────
      .addCase(googleLoginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Google login failed';
        state.isAuthenticated = false;
        state.user = null;
      })

      // ── Verify OTP (signup) ─────────────────────────────────────────────────
      .addCase(verifyOtp.pending, (state) => { state.otpLoading = true; state.otpError = null; })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.pendingEmail = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload || { message: 'Verification failed' };
      })

      // ── Resend OTP (signup) ─────────────────────────────────────────────────
      .addCase(resendOtp.pending, (state) => { state.otpLoading = true; state.otpError = null; })
      .addCase(resendOtp.fulfilled, (state) => { state.otpLoading = false; })
      .addCase(resendOtp.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload || { message: 'Failed to resend OTP' };
      })

      // ── Forgot Password ─────────────────────────────────────────────────────
      .addCase(forgotPassword.pending, (state) => { state.resetLoading = true; state.resetError = null; })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.resetLoading = false;
        state.resetEmail = action.payload?.email || null;
        state.resetVerified = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.resetLoading = false;
        state.resetError = action.payload || { message: 'Failed to send reset OTP' };
      })

      // ── Verify Reset OTP ────────────────────────────────────────────────────
      .addCase(verifyResetOtp.pending, (state) => { state.resetLoading = true; state.resetError = null; })
      .addCase(verifyResetOtp.fulfilled, (state) => {
        state.resetLoading = false;
        state.resetVerified = true;
      })
      .addCase(verifyResetOtp.rejected, (state, action) => {
        state.resetLoading = false;
        state.resetError = action.payload || { message: 'Verification failed' };
      })

      // ── Resend Reset OTP ────────────────────────────────────────────────────
      .addCase(resendResetOtp.pending, (state) => { state.resetLoading = true; state.resetError = null; })
      .addCase(resendResetOtp.fulfilled, (state) => { state.resetLoading = false; })
      .addCase(resendResetOtp.rejected, (state, action) => {
        state.resetLoading = false;
        state.resetError = action.payload || { message: 'Failed to resend OTP' };
      })

      // ── Reset Password ──────────────────────────────────────────────────────
      .addCase(resetPassword.pending, (state) => { state.resetLoading = true; state.resetError = null; })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetLoading = false;
        state.resetEmail = null;
        state.resetVerified = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetLoading = false;
        state.resetError = action.payload || { message: 'Password reset failed' };
      });
  },
});

export const {
  clearOtpError, setPendingEmail, clearPendingEmail,
  clearResetError, clearResetEmail,
} = authSlice.actions;

export default authSlice.reducer;