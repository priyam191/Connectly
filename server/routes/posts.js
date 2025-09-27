import { Router } from "express";
import { activeCheck } from "../controllers/post.js";
import { createPost, getAllPosts, getPostsByUserId, deletePost,commentPost,get_comments_by_post,deleteComment,likePost, createSamplePosts } from "../controllers/post.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
        cb(null, 'uploads/'); 
        },
    filename: function (req, file, cb) { 
        cb(null, Date.now() + '-' + file.originalname );
    },
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.get("/", activeCheck);

router.post("/post", upload.single('media'), createPost);
router.get("/posts", getAllPosts);
router.get("/posts/user", getPostsByUserId);
router.delete("/delete_post", deletePost);
router.post("/comment", commentPost);
router.get("/get_comments", get_comments_by_post);
router.delete("/delete_comment", deleteComment);
router.post("/like", likePost);
router.post("/create_sample_posts", createSamplePosts);


export default router;