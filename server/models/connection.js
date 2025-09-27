import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
    userId: {           //who sent the connection request
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    connectionId: {          //who received the connection request
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
});

const Connection = mongoose.model("Connection", connectionSchema);
export default Connection;