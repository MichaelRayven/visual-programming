import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "@/lib/api";

export type User = {
  id: string;
  name: string;
  email: string;
  registeredAt: number;
};

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialLoading: boolean;
  error: string | null;
  updateProfileLoading: boolean;
  profileError: string | null;
  profileSuccess: boolean;
  changePasswordLoading: boolean;
  passwordError: string | null;
  passwordSuccess: boolean;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialLoading: true,
  error: null,
  updateProfileLoading: false,
  profileError: null,
  profileSuccess: false,
  changePasswordLoading: false,
  passwordError: null,
  passwordSuccess: false,
};

// Async Thunks for Authentication
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (userData: { name: string; email: string }, thunkAPI) => {
    try {
      const user = await api.updateProfile(userData.name, userData.email);
      return user;
    } catch (error) {
      const err = error as { message?: string };
      return thunkAPI.rejectWithValue(
        err.message || "Failed to update profile"
      );
    }
  }
);

export const updateUserPassword = createAsyncThunk(
  "auth/updateUserPassword",
  async (password: string, thunkAPI) => {
    try {
      await api.changePassword(password);
      return true;
    } catch (error) {
      const err = error as { message?: string };
      return thunkAPI.rejectWithValue(
        err.message || "Failed to change password"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await api.login(credentials.email, credentials.password);
      return response;
    } catch (error) {
      const err = error as { message?: string };
      return thunkAPI.rejectWithValue(err.message || "Failed to log in");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    userData: { name: string; email: string; password: string },
    thunkAPI
  ) => {
    try {
      const response = await api.register(
        userData.name,
        userData.email,
        userData.password
      );
      return response;
    } catch (error) {
      const err = error as { message?: string };
      return thunkAPI.rejectWithValue(err.message || "Failed to register");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await api.logout();
      return null;
    } catch (error) {
      const err = error as { message?: string };
      return thunkAPI.rejectWithValue(err.message || "Failed to log out");
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, thunkAPI) => {
    try {
      const response = await api.refresh();
      return response;
    } catch (error) {
      const err = error as { message?: string };
      return thunkAPI.rejectWithValue(err.message || "No valid session found");
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("auth_refresh_token");
      }
    },
    resetProfileStatus: (state) => {
      state.updateProfileLoading = false;
      state.profileError = null;
      state.profileSuccess = false;
    },
    resetPasswordStatus: (state) => {
      state.changePasswordLoading = false;
      state.passwordError = null;
      state.passwordSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isInitialLoading = false;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isInitialLoading = false;
      })
      .addCase(refreshToken.pending, (state) => {
        state.isInitialLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialLoading = false;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isInitialLoading = false;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.updateProfileLoading = true;
        state.profileError = null;
        state.profileSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updateProfileLoading = false;
        state.user = action.payload;
        state.profileSuccess = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updateProfileLoading = false;
        state.profileError = action.payload as string;
        state.profileSuccess = false;
      })
      .addCase(updateUserPassword.pending, (state) => {
        state.changePasswordLoading = true;
        state.passwordError = null;
        state.passwordSuccess = false;
      })
      .addCase(updateUserPassword.fulfilled, (state) => {
        state.changePasswordLoading = false;
        state.passwordSuccess = true;
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.changePasswordLoading = false;
        state.passwordError = action.payload as string;
        state.passwordSuccess = false;
      });
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
