import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    body:{
        type: String,
        required: true,
    },
    // likes count will be calculated as a virtual field
    // keeping the likes field for backward compatibility but will phase it out
    createdAt:{
        type: Date,
        default: Date.now,
    },
    updatedAt:{
        type: Date,
        default: Date.now,
    },
    media:{
        type: String,
        default: "",
    },
    active:{
        type: Boolean,
        default: true,
    },
    fileType:{
        type: String,
        default: "",
    },
    // filetype:{
    //     type: String,
    //     default: "",
    // }
});

// Virtual field to count likes
postSchema.virtual('likesCount', {
    ref: 'Like',
    localField: '_id',
    foreignField: 'postId',
    count: true
});

// Ensure virtual fields are included in JSON output
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

const Post = mongoose.model("Post", postSchema);    
export default Post;
