import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllPosts,
  createPost,
  deletePost,
  incrementPostLike,
  getAllComments,
  addComment,
} from "@/config/redux/action/postAction";
import { fetchUserProfile, getAllUsers } from "@/config/redux/action/authAction";
import { reset } from "@/config/redux/reducer/postReducer";
import UserLayout from "@/layout/userLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import styles from "./index.module.css";
import { baseURL } from "@/config/index.jsx";

function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux state
  const { user, all_profiles_fetched } = useSelector((state) => state.auth);
  const { posts, isLoading, isError, message, comments, postId } = useSelector(
    (state) => state.post
  );

  const profilePic = user?.userId?.profilePic || user?.profilePic;

  const [isTokenThere, setIsTokenThere] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // comment state
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [newComment, setNewComment] = useState("");

  // check token on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) router.push("/login");
      else setIsTokenThere(true);
    }
  }, [router]);

  // fetch posts + profile when token exists
  useEffect(() => {
    if (isTokenThere) {
      dispatch(getAllPosts());
      dispatch(fetchUserProfile());
    }

    if (!all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [isTokenThere, all_profiles_fetched, dispatch]);


  // validate file
  const validateAndSetFile = (file) => {
    if (!file) return false;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      setFileContent(null);
      setFilePreview(null);
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      setFileContent(null);
      setFilePreview(null);
      return false;
    }

    setFileContent(file);
    setUploadError("");

    const reader = new FileReader();
    reader.onload = (e) => setFilePreview(e.target.result);
    reader.readAsDataURL(file);

    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleUpload = async () => {
    if (!postContent && !fileContent) return;

    setIsUploading(true);
    setUploadError("");

    try {
      await dispatch(createPost({ file: fileContent, body: postContent }));

      // Clear input
      setPostContent("");
      setFileContent(null);
      setFilePreview(null);

      setTimeout(() => {
        dispatch(reset());
        dispatch(getAllPosts()); // refresh feed
      }, 1500);
    } catch (error) {
      setUploadError("Failed to upload post. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await dispatch(deletePost(postId));
      dispatch(getAllPosts());
    } catch (error) {
      console.error("Failed to delete post", error);
    }
  };

  // comments
  const handleOpenComments = (id) => {
    if (activeCommentPost === id) {
      setActiveCommentPost(null);
    } else {
      setActiveCommentPost(id);
      dispatch(getAllComments({ post_id: id }));
    }
  };

  const handleAddComment = async (id) => {
    if (!newComment.trim()) return;
    await dispatch(addComment({ post_id: id, text: newComment }));
    setNewComment("");
    // Refresh comments after adding a new one
    dispatch(getAllComments({ post_id: id }));
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.scrollComponent}>
          {/* Create Post */}
          <div className={styles.createPostContainer}>
            <img
              width={50}
              height={50}
              src={profilePic ? `${baseURL}/${profilePic}` : `https://via.placeholder.com/50x50/007bff/white?text=${(user?.userId?.name || user?.name || 'M').charAt(0).toUpperCase()}`}
              alt="User Avatar"
              className={styles.avatar}
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/50x50/007bff/white?text=${(user?.userId?.name || user?.name || 'M').charAt(0).toUpperCase()}`;
              }}
            />

            <div
              className={`${styles.textareaContainer} ${isDragOver ? styles.dragOver : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <textarea
                placeholder="What's on your mind? (You can also drag and drop an image here)"
                rows="5"
                className={styles.textarea}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
              {isDragOver && (
                <div className={styles.dragOverlay}>
                  <p>Drop your image here</p>
                </div>
              )}
            </div>

            {/* File Preview */}
            {filePreview && (
              <div className={styles.filePreview}>
                <img src={filePreview} alt="Preview" className={styles.previewImage} />
                <button
                  onClick={() => {
                    setFileContent(null);
                    setFilePreview(null);
                    setUploadError("");
                  }}
                  className={styles.removeFile}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Error Message */}
            {uploadError && <div className={styles.errorMessage}>{uploadError}</div>}

            {/* Redux Message */}
            {message && (
              <div
                className={`${styles.message} ${
                  isError ? styles.errorMessage : styles.successMessage
                }`}
              >
                {message}
              </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
              {/* Upload Button */}
              <label htmlFor="fileUpload">
                <div className={styles.Fab}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={styles.icon}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
              </label>
              <input
                onChange={handleFileChange}
                type="file"
                id="fileUpload"
                accept="image/*"
                hidden
              />

              {/* Send Button */}
              {(postContent.length > 0 || fileContent) && (
                <div
                  className={`${styles.send} ${isUploading ? styles.disabled : ""}`}
                  onClick={!isUploading ? handleUpload : undefined}
                >
                  {isUploading ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={styles.icon}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                      />
                    </svg>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Posts Section */}
          <div className={styles.postsContainer}>
            {isLoading && <p>Loading posts...</p>}
            {!isLoading && posts.length === 0 && <p>No posts yet.</p>}

            {posts.map((post) => (
              <div key={post._id} className={styles.singleCard} style={{ position: "relative" }}>
                <div className={styles.singleCard_profileContainer}>
                  <img
                    className={styles.userProfile}
                    src={post.userId?.profilePic ? `${baseURL}/${post.userId.profilePic}` : `https://via.placeholder.com/40x40/007bff/white?text=${(post.userId?.name || 'U').charAt(0).toUpperCase()}`}
                    alt="user"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/40x40/007bff/white?text=${(post.userId?.name || 'U').charAt(0).toUpperCase()}`;
                    }}
                  />
                  <div>
                    <h4>{post.userId?.name || "Anonymous"}</h4>
                    <p>@{post.userId?.username || "Anonymous"}</p>
                  </div>
                </div>

                {/* Delete button visible only for post owner */}
                {post.userId?._id === user?.userId?._id && (
                  <div
                    onClick={() => handleDelete(post._id)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      cursor: "pointer",
                      color: "red",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      width={22}
                      height={22}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </div>
                )}

                <div className={styles.postBody}>
                  <p style={{ margin: "10px 0 5px 5px" }}>{post.body}</p>
                  {post.media && (
                    <img src={`${baseURL}/${post.media}`} alt="post" className={styles.postImage} />
                  )}
                </div>
                <div className={styles.optionContainer}>
                  <div
                    onClick={async () => {
                      await dispatch(incrementPostLike({ post_id: post._id }));
                    }}
                    className={`${styles.posticon} ${post.userHasLiked ? styles.liked : ''}`}
                    style={{
                      color: post.userHasLiked ? '#e74c3c' : 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={post.userHasLiked ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                      />
                    </svg>
                    <p style={{ color: post.userHasLiked ? '#e74c3c' : 'inherit' }}>                      
                      {post.likes} {post.userHasLiked ? '❤️' : ''}
                    </p>
                  </div>

                  {/* Comment button */}
                  <div className={styles.posticon} onClick={() => handleOpenComments(post._id)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                      />
                    </svg>
                  </div>

                  <div className={styles.posticon}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Comments Section */}
                {activeCommentPost === post._id && (
                  <div className={styles.commentsSection}>
                    {postId === post._id && comments.length > 0 ? (
                      comments.map((c, idx) => (
                        <div key={idx} className={styles.comment}>
                          <strong>{c.userId?.username || "Anonymous"}:</strong><br></br>
                          {c.body}
                          <button  style={{marginLeft: "10px", backgroundColor:"red", color:"white", borderRadius:"20%"}}>delete</button>
                        </div>
                      ))
                    ) : (
                      <p>No comments yet.</p>
                    )}
                    <div className={styles.addComment}>
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button onClick={() => handleAddComment(post._id)}>Post</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export default Dashboard;
