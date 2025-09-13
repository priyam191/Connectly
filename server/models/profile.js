import mongoose from "mongoose";   

const educationSchema = new mongoose.Schema({
    degree: {
        type: String,
        required: true,
    },
    fieldOfStudy: {
        type: String,
        required: true,
    },
    institution: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
});


const workSchema = new mongoose.Schema({
    position: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
});



const ProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    bio: {
        type: String,
        default: "",
    },
    currentPosition: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "",
    },
    pastWork:{
        type: [workSchema],
        default: [],
    },
    education: {
        type: [educationSchema],
        default: [],
    },
});

const Profile = mongoose.model("Profile", ProfileSchema);
export default Profile;