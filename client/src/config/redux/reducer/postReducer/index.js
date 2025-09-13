// const { createSlice } = require("@reduxjs/toolkit")
// const { reset } = require("../authReducer")
import { createSlice } from "@reduxjs/toolkit";
import { getAllPosts, getUserPosts, createPost, getAllComments, addComment } from "../../action/postAction";


const initialState = {
  posts: [],
  userPosts: [],
  isError: false,
  postFetched: false,
  isLoading: false,
  LoggedIn: false, // should ideally be in authSlice
  message: "",
  comments: [],
  postId: "",
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => ({ ...initialState }),
    resetPostId: (state) => {
      state.postId = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetching posts...";
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.postFetched = true;
        state.posts = action.payload.posts;
        state.message = action.payload.message;
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.postFetched = false;
        state.posts = [];
        state.message = action.payload?.message || "Failed to fetch posts";
      })
      // Get User Posts cases
      .addCase(getUserPosts.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetching user posts...";
      })
      .addCase(getUserPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.userPosts = action.payload.posts;
        state.message = action.payload.message;
      })
      .addCase(getUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.userPosts = [];
        state.message = action.payload?.message || "Failed to fetch user posts";
      })
      // Create Post cases
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.message = "Creating post...";
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.message = action.payload || "Post created successfully!";
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Failed to create post";
      })
      .addCase(getAllComments.fulfilled, (state, action) => {
        state.postId= action.payload.post_id;
        state.comments = action.payload.comments;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.postId === action.payload.post_id) {
          // Refresh comments after adding a new one
          // The comment will be fetched when the user opens the comments section again
        }
      })
  },
});

export const { reset, resetPostId } = postSlice.actions;
export default postSlice.reducer;