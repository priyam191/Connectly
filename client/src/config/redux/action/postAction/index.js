import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config";

// Async thunk
export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/posts");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: "Error fetching posts" });
    }
  }
);

export const getUserPosts = createAsyncThunk(
  "post/getUserPosts",
  async (userId, thunkAPI) => {
    try {
      const response = await clientServer.get("/posts/user", {
        params: { userId }
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: "Error fetching user posts" });
    }
  }
);


export const createPost = createAsyncThunk(
  "post/createPost",
  async (userData, thunkAPI) => {
    const {file, body} = userData;
    try {
      const formData = new FormData();
      formData.append('token', localStorage.getItem('token'));
      formData.append("media", file); // Changed from "file" to "media" to match server expectation
      formData.append("body", body);

      const response = await clientServer.post("/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if(response.status === 200 || response.status === 201){
        return thunkAPI.fulfillWithValue("post uploaded successfully");
      }else{
        return thunkAPI.rejectWithValue(response.data || { message: "Error creating post" });
      }


    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: "Error creating post" });
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (post_id, thunkAPI) => {
    try {
      const response = await clientServer.delete("/delete_post", {
        data: {
          token: localStorage.getItem('token'),
          post_id: post_id
        }
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) { 
     return thunkAPI.rejectWithValue(err.response?.data || { message: "Error deleting post" });
    }
  }
);

export const incrementPostLike = createAsyncThunk(
  "post/incrementLike", 
  async (post, thunkAPI) => {
    try {
      const response = await clientServer.post("/like", {
        
        post_id: post.post_id
      })

      return thunkAPI.fulfillWithValue(response.data);
    }catch(error){
      return thunkAPI.rejectWithValue(error.response?.data || { message: "Error liking post" });
    }
  }
  
)

export const addComment = createAsyncThunk(
  "post/add_comment",
  async ({ post_id, text }, thunkAPI) => {
    try {
      const response = await clientServer.post("/comment", {
        token: localStorage.getItem("token"),
        post_id,
        commentBody: text,
      });

      return thunkAPI.fulfillWithValue({
        comment: response.data, // return new comment
        post_id,
      });
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Failed to add comment");
    }
  }
);


export const getAllComments = createAsyncThunk(
  "post/get_comments",
  async (postData, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_comments", {
        params: {
          post_id: postData.post_id,
        },
      });

      return thunkAPI.fulfillWithValue({
        comments: response.data,
        post_id: postData.post_id,
      });

    } catch (err) {
      // You should return rejectWithValue here
      return thunkAPI.rejectWithValue(err.response?.data || "Failed to fetch comments");
    }
  }
);







