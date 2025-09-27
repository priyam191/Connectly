

import Profile from '../models/profile.js';
import Post from '../models/post.js';
import User from '../models/users.js';
import Comment from '../models/comments.js';




export const activeCheck = async( req,res) =>{
    return res.status(200).json({
        message: "Active check successful",
        status: "success"
    });
}

export const createPost = async (req, res) => {
    const { token } = req.body;

    try {
        const user = await User.findOne({ token });
        if (!user) {        
            return res.status(404).json({ message: 'User not found' });
        }

        const post = new Post({
            userId: user._id,
            body: req.body.body,
            media: req.file != undefined ? req.file.filename : '',
            filetype: req.file != undefined ? req.file.mimetype.split("/")[1] : '',
        });

        await post.save();
        return res.status(201).json({ 
            message: 'Post created successfully', 
            post
        });

    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}


export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate('userId', 'name username profilePicture');
        return res.status(200).json({posts});
    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getPostsByUserId = async (req, res) => {
    try {
        const { userId } = req.query;
        const posts = await Post.find({ userId: userId }).sort({ createdAt: -1 }).populate('userId', 'name username profilePic');
        return res.status(200).json({posts});
    } catch (error) {
        console.error('Error fetching user posts:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}


export const deletePost = async (req, res) => {
    const { token, post_id } = req.body;
    try {
        const user = await User.findOne({ token }).select('_id');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const post = await Post.findOne({ _id: post_id, userId: user._id });
        if (!post) {
            return res.status(404).json({ message: 'Post not found or you do not have permission to delete this post' });
        }

        await Post.deleteOne({ _id: post_id });
        return res.status(200).json({ message: 'Post deleted successfully' });
        
    }catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}


export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body;

  try {
    const user = await User.findOne({ token }).select('_id');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      userId: user._id,
      postId: post._id,
      body: commentBody,   // ✅ fixed here
    });

    await comment.save();
    return res.status(201).json({ 
      message: 'Comment added successfully', 
      comment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const get_comments_by_post =  async (req, res) => {
    try{
        const { post_id } = req.query;
        const post = await Post.findOne({_id : post_id});
        if(!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comments = await Comment.find({ postId: post_id }).populate('userId', 'name username');
        return res.json( comments );
    }catch (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const deleteComment = async (req, res) => {
    const { token, post_id, comment_id } = req.body;

    try {
        const user = await User.findOne({ token }).select('_id');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const comment = await Comment.findOne({ _id: comment_id, userId: user._id, postId: post_id });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found or you do not have permission to delete this comment' });
        }

        if(comment.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to delete this comment' });
        }

        await comment.deleteOne({ _id: comment_id });
        return res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
    }
}

export const likePost = async (req, res) => {
    const {  post_id } = req.body;      

    try {
        const post = await Post.findById(post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.likes = post.likes + 1;
        await post.save();
        return res.status(200).json({ 
            message: 'Post liked successfully', 
            post
        });
    } catch (error) {
        console.error('Error liking post:', error);
    }
}

export const createSamplePosts = async (req, res) => {
    try {
        const users = await User.find();
        let createdCount = 0;

        for (const user of users) {
            // Create 2-3 sample posts for each user
            const samplePosts = [
                {
                    userId: user._id,
                    body: "Excited to share my latest project! Working on innovative solutions that make a difference.",
                    likes: Math.floor(Math.random() * 50),
                    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last week
                },
                {
                    userId: user._id,
                    body: "Great team collaboration today! The power of working together towards common goals.",
                    likes: Math.floor(Math.random() * 30),
                    createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000) // Random date within last 2 weeks
                },
                {
                    userId: user._id,
                    body: "Learning new technologies and expanding my skill set. Growth mindset is key!",
                    likes: Math.floor(Math.random() * 40),
                    createdAt: new Date(Date.now() - Math.random() * 21 * 24 * 60 * 60 * 1000) // Random date within last 3 weeks
                }
            ];

            for (const postData of samplePosts) {
                const existingPost = await Post.findOne({ 
                    userId: postData.userId, 
                    body: postData.body 
                });
                
                if (!existingPost) {
                    const post = new Post(postData);
                    await post.save();
                    createdCount++;
                }
            }
        }

        return res.status(200).json({
            message: `Successfully created ${createdCount} sample posts`,
            createdCount
        });
    } catch (error) {
        console.error('Error creating sample posts:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


