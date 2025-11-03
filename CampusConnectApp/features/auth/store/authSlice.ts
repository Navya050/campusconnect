import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../api/auth";

// Async actions
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      return await authAPI.login(credentials);
    } catch (error: any) {
      // Handle different error response formats
      const errorMessage =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      graduationYear: string;
      category: string;
      educationLevel: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.signup(userData);
      return response;
    } catch (error: any) {
      // Handle different error response formats
      const errorMessage =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Signup failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await authAPI.logout();
});

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    isLoading: false,
    error: null as string | null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
