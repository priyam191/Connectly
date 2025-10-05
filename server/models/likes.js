import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create a compound index to ensure a user can only like a post once
likeSchema.index({ userId: 1, postId: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);
export default Like;