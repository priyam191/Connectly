// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');

// dotenv.config();

import express from 'express';
import mongoose from 'mongoose';  
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import postRoutes from './routes/posts.js'; 
import userRoutes from './routes/user.js'; // Import user routes
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(postRoutes); // Use the post routes
app.use(userRoutes); // Use the user routes
app.use(express.static('uploads')); // Serve static files from the uploads directory

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware for multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  } else if (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const start = async () => {
  await connectDB();
  app.listen(5000, () => {
    console.log('🚀 Server is running on port 5000');
  });
};

start();
