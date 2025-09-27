import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Action to check and restore authentication state
export const checkAuthStatus = createAsyncThunk(
    "user/checkAuthStatus",
    async (_, thunkAPI) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                return thunkAPI.fulfillWithValue({ isAuthenticated: false });
            }
            
            const response = await clientServer.get("/get_user_and_profile", {
                params: { token }
            });
            
            return thunkAPI.fulfillWithValue({
                isAuthenticated: true,
                user: response.data.userId, // The API returns profile with userId populated
                token: token
            });
        } catch (err) {
            // If token is invalid, remove it
            localStorage.removeItem("token");
            return thunkAPI.fulfillWithValue({ isAuthenticated: false });
        }
    }
);

export const loginUser = createAsyncThunk(
    "user/login",
    async (user, thunkAPI) => {
        try{
            console.log("Attempting login with:", { email: user.email });
            const response = await clientServer.post("/login", {
                email: user.email,
                password: user.password
            });

            console.log("Login response:", response.data);
            localStorage.setItem("token", response.data.token);

            return thunkAPI.fulfillWithValue({
                token: response.data.token,
                user: response.data.user
            });
        }catch(err){
            console.error("Login error:", err.response?.data || err.message);
            return thunkAPI.rejectWithValue(err.response?.data || { message: "Network error" });
        }
    }
)

export const registerUser = createAsyncThunk(
    "user/register",
    async (user, thunkAPI) => {
        try{
            console.log("Attempting registration with:", { 
                name: user.name, 
                username: user.username, 
                email: user.email 
            });
            const response = await clientServer.post("/register", {
                name: user.name,
                username: user.username,
                email: user.email,
                password: user.password
            });

            console.log("Registration response:", response.data);
            // Note: Register doesn't return a token, user needs to login after registration
            return thunkAPI.fulfillWithValue(response.data);
        }catch(err){
            console.error("Registration error:", err.response?.data || err.message);
            return thunkAPI.rejectWithValue(err.response?.data || { message: "Network error" });
        }
    }
)

export const getAboutUser = createAsyncThunk(
    "user/getAboutUser",
    async(user, thunkAPI) => {
        try{
            
            const response = await clientServer.get("/get_user_and_profile", {
                params: { token: user.token }
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(err){
            return thunkAPI.rejectWithValue(err.response.data);
        }
    }
)

export const fetchUserProfile = createAsyncThunk(
    "user/fetchUserProfile",
    async(_, thunkAPI) => {
        try{
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found");
            }
            
            const response = await clientServer.get("/get_user_and_profile", {
                params: { token }
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(err){
            return thunkAPI.rejectWithValue(err.response?.data || { message: "Failed to fetch profile" });
        }
    }
)

export const getAllUsers = createAsyncThunk(
    "user?getAllUsers",
    async(_, thunkAPI) => {

        try{
            const response = await clientServer.get("/user/get_all_users");
            return thunkAPI.fulfillWithValue(response.data);

        }catch(err){
            return thunkAPI.rejectWithValue(err.response?.data || { message: "Failed to get users" });
        }
    }

)

export const sendConnectionRequest = createAsyncThunk(
    "user/sendConnectionRequest",
    async(connectionId, thunkAPI) => {
        try{
            const token = localStorage.getItem("token");
            const response = await clientServer.post("/user/connection_request", {
                token,
                connectionId
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(err){
            return thunkAPI.rejectWithValue(err.response?.data || { message: "Failed to send connection request" });
        }
    }
)

export const getConnections = createAsyncThunk(
    "user/getConnections",
    async(_, thunkAPI) => {
        try{
            const token = localStorage.getItem("token");
            const response = await clientServer.get("/user/get_connections", {
                params: { token }
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(err){
            return thunkAPI.rejectWithValue(err.response?.data || { message: "Failed to get connections" });
        }
    }
)

export const getConnectionRequests = createAsyncThunk(
    "user/getConnectionRequests",
    async(_, thunkAPI) => {
        try{
            const token = localStorage.getItem("token");
            const response = await clientServer.get("/user/user_connection_requests", {
                params: { token }
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(err){
            return thunkAPI.rejectWithValue(err.response?.data || { message: "Failed to get connection requests" });
        }
    }
)

export const acceptConnectionRequest = createAsyncThunk(
    "user/acceptConnectionRequest",
    async({ requestId, action_type }, thunkAPI) => {
        try{
            const token = localStorage.getItem("token");
            const response = await clientServer.post("/user/accept_connection_request", {
                token,
                requestId,
                action_type
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(err){
            return thunkAPI.rejectWithValue(err.response?.data || { message: "Failed to process connection request" });
        }
    }
)

export const updateUserProfile = createAsyncThunk(
    "user/updateUserProfile",
    async(userData, thunkAPI) => {
        try{
            const token = localStorage.getItem("token");
            const response = await clientServer.post("/user_update", {
                token,
                ...userData
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(err){
            return thunkAPI.rejectWithValue(err.response?.data || { message: "Failed to update user profile" });
        }
    }
)

export const updateProfileData = createAsyncThunk(
    "user/updateProfileData",
    async(profileData, thunkAPI) => {
        try{
            const token = localStorage.getItem("token");
            const response = await clientServer.post("/update_profile_data", {
                token,
                ...profileData
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(err){
            return thunkAPI.rejectWithValue(err.response?.data || { message: "Failed to update profile data" });
        }
    }
)

export const uploadProfilePicture = createAsyncThunk(
    "user/uploadProfilePicture",
    async(profilePic, thunkAPI) => {
        try{
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append('profilePic', profilePic);
            formData.append('token', token);
            
            const response = await clientServer.post("/upload_profile_pic", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return thunkAPI.fulfillWithValue(response.data);
        }catch(err){
            return thunkAPI.rejectWithValue(err.response?.data || { message: "Failed to upload profile picture" });
        }
    }
)