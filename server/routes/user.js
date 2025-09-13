import { Router } from "express";
import { register, login, uploadProfilePicture,updateUserProfile, getUserAndProfile, updateProfileData,getUserProfile,downloadProfile,
  connectionRequest, getConnections, acceptConnectionRequest, whatAreMyConnections,  getUserProfileAndUserBasedOnUsername
 } from "../controllers/user.js";
import multer from "multer";
import { get } from "mongoose";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder must exist
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ fixed upload route (only one handler)
router.post("/upload_profile_pic", upload.single("profilePic"), uploadProfilePicture);

// ✅ register and login
router.post("/register", register);
router.post("/login", login);
router.post("/user_update", updateUserProfile); 
router.get('/get_user_and_profile', getUserAndProfile);
router.post("/update_profile_data", updateProfileData);
router.get("/user/get_all_users", getUserProfile);
router.get('/user/download_resume', downloadProfile);
router.post('/user/connection_request', connectionRequest);
router.get('/user/get_connections', getConnections);
router.get("/user/user_connection_requests", whatAreMyConnections);
router.post("/user/accept_connection_request", acceptConnectionRequest);
// router.post("/populate_profiles", populateUserProfiles);
router.get("/user/get_profile_based_on_username", getUserProfileAndUserBasedOnUsername);

export default router;
