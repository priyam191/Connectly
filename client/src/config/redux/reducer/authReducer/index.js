import { createSlice } from "@reduxjs/toolkit";
import { getAboutUser, loginUser, registerUser, fetchUserProfile, checkAuthStatus, getAllUsers, sendConnectionRequest, getConnections, getConnectionRequests, acceptConnectionRequest } from "@/config/redux/action/authAction"; // import BOTH thunks

const initialState = {
  user: null,
  isError: false,
  isLoading: false,
  isSuccess: false,
  loggedIn: false,
  message: '',
  isToeknThere: false,
  messageType: '', // 'login', 'register', 'profile', 'general'
  profileFetched: false,
  connections: [],
  connectionRequest: [],
  all_profiles_fetched: false,
  all_users: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: () => ({ ...initialState }),
    handleLoginUser: (state) => {
      state.message = 'hello';
    },
    clearMessage: (state) => {
      state.message = '';
      state.messageType = '';
    },
    setTokenIsThere: (state) => {
      state.isToeknThere = true;
    },
    setTokenIsNotThere: (state) => {
      state.isToeknThere = false;
    },
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.loggedIn = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.messageType = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // CHECK AUTH STATUS
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.isAuthenticated) {
          state.loggedIn = true;
          state.user = action.payload.user;
          state.isSuccess = true;
        } else {
          state.loggedIn = false;
          state.user = null;
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.loggedIn = false;
        state.user = null;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = 'Loading...';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.user = action.payload.user; 
        state.message = 'Login Successful';
        state.messageType = 'login';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Login failed";
        state.messageType = 'login';
        state.user = null;
        state.loggedIn = false;
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = 'Loading...';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.loggedIn = false; // User needs to login after registration
        state.user = null;
        state.message = 'Registration Successful! Please login with your credentials.';
        state.messageType = 'register';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Registration failed";
        state.messageType = 'register';
        state.user = null;
        state.loggedIn = false;
      })
      .addCase(getAboutUser.fulfilled,(state,action)=>{
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.user = action.payload.profile;
        state.message = 'Profile fetched successfully';
        state.messageType = 'profile';
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.message = 'Loading profile...';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.user = action.payload;
        state.message = 'Profile fetched successfully';
        state.messageType = 'profile';
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to fetch profile';
        state.messageType = 'profile';
      })
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.message = 'Loading users...';
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.all_profiles_fetched = true;
        state.all_users = action.payload; // API returns an array of profiles
        state.message = 'Users fetched successfully';
        
      })
      .addCase(getAllUsers.rejected, (state, action) => { 
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to fetch users';
        state.messageType = 'general';
      } )
      // Connection actions
      .addCase(sendConnectionRequest.pending, (state) => {
        state.isLoading = true;
        state.message = 'Sending connection request...';
      })
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.message = action.payload.message || 'Connection request sent successfully';
        state.messageType = 'general';
      })
      .addCase(sendConnectionRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to send connection request';
        state.messageType = 'general';
      })
      .addCase(getConnections.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.connections = action.payload.connections || [];
      })
      .addCase(getConnections.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.connections = [];
      })
      .addCase(getConnectionRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getConnectionRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.connectionRequest = action.payload.connections || [];
      })
      .addCase(getConnectionRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.connectionRequest = [];
      })
      .addCase(acceptConnectionRequest.pending, (state) => {
        state.isLoading = true;
        state.message = 'Processing request...';
      })
      .addCase(acceptConnectionRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.message = action.payload.message || 'Request processed successfully';
        state.messageType = 'general';
      })
      .addCase(acceptConnectionRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to process request';
        state.messageType = 'general';
      })
  },
});

export const { reset, handleLoginUser, clearMessage, logout,setTokenIsThere, setTokenIsNotThere } = authSlice.actions;
export default authSlice.reducer;
