// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL, AUTH_ENDPOINTS } from '../api/apiConfig';
import { jwtDecode } from 'jwt-decode';

// ✅ VALIDATE TOKEN
export const validateToken = createAsyncThunk('auth/validateToken', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.VALIDATE_TOKEN}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Token validation failed');
    }

    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const refreshToken = createAsyncThunk('auth/refreshToken', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Token refresh failed');
    }

    localStorage.setItem('token', data.token);
    
    // Update token expiry
    const decoded = jwtDecode(data.token);
    localStorage.setItem('tokenExpiry', decoded.exp.toString());

    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});


// ✅ LOGIN
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();

    if (!response.ok) return rejectWithValue(data.message || 'Login failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Store token expiry
    const decoded = jwtDecode(data.token);
    localStorage.setItem('tokenExpiry', decoded.exp.toString());

    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// ✅ REGISTER
export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();

    if (!response.ok) return rejectWithValue(data.message || 'Registration failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Store token expiry
    const decoded = jwtDecode(data.token);
    localStorage.setItem('tokenExpiry', decoded.exp.toString());

    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// ✅ LOGOUT
export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
  }
});

// ✅ CHECK TOKEN EXPIRY
export const checkTokenExpiry = () => (dispatch) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    dispatch(forceLogout());
    return;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      dispatch(forceLogout());
    } else if (decoded.exp < (currentTime + 300)) { // 5 minutes before expiry
      // Refresh token if it's about to expire
      dispatch(refreshToken());
    }
  } catch (error) {
    dispatch(forceLogout());
  }
};

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  tokenValid: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    forceLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.tokenValid = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
    },
  },
  extraReducers: (builder) => {
    builder
      // Validate Token
      .addCase(validateToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateToken.fulfilled, (state) => {
        state.loading = false;
        state.tokenValid = true;
      })
      .addCase(validateToken.rejected, (state) => {
        state.loading = false;
        state.tokenValid = false;
        state.isAuthenticated = false;
      })
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.tokenValid = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.loading = false;
        state.tokenValid = false;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.tokenValid = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.tokenValid = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.tokenValid = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.tokenValid = false;
      });
  },
});

export const { clearError, forceLogout } = authSlice.actions;
export default authSlice.reducer;