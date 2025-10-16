import bcrypt from 'bcrypt';
import User from '../models/users.js';
import Profile from '../models/profile.js';
import Connection from '../models/connection.js';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const convertUserDataTOPDF = async (userData) => {
    const doc = new PDFDocument();

    const outputPath = crypto.randomBytes(16).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("uploads/" + outputPath);
    doc.pipe(stream);

    //  Fix here: use backticks and proper path
    const imagePath = path.join("uploads", userData.userId.profilePic);
    if (fs.existsSync(imagePath)) {
        doc.image(imagePath, { align: "center", width: 200 });
    } else {
        doc.text("Profile picture not found", { align: "center" });
    }

    doc.fontSize(20).text(`Name: ${userData.userId.name}`, { align: "center" });
    doc.fontSize(16).text(`Username: ${userData.userId.username}`, { align: "center" });
    doc.fontSize(16).text(`Email: ${userData.userId.email}`, { align: "center" });
    doc.fontSize(16).text(`Bio: ${userData.bio}`, { align: "center" });
    doc.fontSize(16).text(`Location: ${userData.location}`, { align: "center" });
    doc.fontSize(16).text(`Education: ${userData.education}`, { align: "center" });
    doc.fontSize(16).text(`Experience: ${userData.experience}`, { align: "center" });

    doc.end();
    return outputPath;
};

export const register = async( req,res) =>{
    try{
        const { name, email, password, username } = req.body;

        // Validate input
        if (!name || !email || !password || !username) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (user) { 
            return res.status(400).json({ message: "User already exists" });
        }

        const HashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            username,
            email,
            password: HashedPassword,
            profilePic: "default.jpg"
        });
        await newUser.save();

        // Create profile with sample data
        const sampleProfile = new Profile({ 
            userId: newUser._id,
            bio: "Passionate professional with expertise in technology and innovation.",
            currentPosition: "Software Developer",
            location: "New York, USA",
            pastWork: [
                {
                    position: "Junior Developer",
                    company: "Tech Solutions Inc",
                    startDate: new Date("2022-01-01"),
                    endDate: new Date("2023-06-30")
                }
            ],
            education: [
                {
                    degree: "Bachelor of Science",
                    fieldOfStudy: "Computer Science",
                    institution: "University of Technology",
                    startDate: new Date("2018-09-01"),
                    endDate: new Date("2022-05-30")
                }
            ]
        });
        await sampleProfile.save();

        return res.status(201).json({
            message: "User registered successfully",
            user: { name, email, username }
        });
    }catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = crypto.randomBytes(32).toString('hex'); // Generate a random token
        await User.updateOne({ _id: user._id },  { token } ); // Store token in user document
        
        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: { name: user.name, email: user.email, username: user.username }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const uploadProfilePicture = async (req, res) => {
  try {
    const { token } = req.body; // must come from form-data
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    user.profilePic = req.file.filename;
    await user.save();

    return res.status(200).json({
      message: "Profile picture uploaded successfully",
      file: req.file,
    });
  } catch (error) {
    console.error("Profile picture upload error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const updateUserProfile = async (req, res) => {
    try{
        const {token, ...newUserData} = req.body;

        const user = await User.findOne({ token: token });

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { username, email } = newUserData;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        Object.assign(user, newUserData);
        await user.save();
        return res.status(200).json({
            message: "User profile updated successfully"});
    }catch (error) {
        console.error("Update user profile error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const getUserAndProfile = async (req, res) => {
    try{
        const { token } = req.query;

        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userProfile = await Profile.findOne({ userId: user._id }).populate('userId', 'name username email profilePic');
        return res.json(userProfile);
    }catch (error) {
        console.error("Get user and profile error:", error);
        return res.status(500).json({ message: "Internal server error" });
    } 
};

export const updateProfileData = async (req, res) => {
    try{

        const { token, ...newProfileData } = req.body;


        const userProfile = await User.findOne({token: token});
        if (!userProfile) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const profile_to_update = await Profile.findOne({ userId: userProfile._id });
        Object.assign(profile_to_update, newProfileData);       //syntax: object.assign(target, source)
        await profile_to_update.save();
        return res.status(200).json({
            message: "Profile data updated successfully",
            profile: profile_to_update
        });


    }catch (error) {
        console.error("Update profile data error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        // const { userId } = req.params;

        const profiles = await Profile.find().populate('userId', 'name username email profilePic');
        if (!profiles) {
            return res.status(404).json({ message: "Profile not found" });
        }

        return res.json(profiles);
    } catch (error) {
        console.error("Get user profile error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const downloadProfile = async (req, res) => {
  try {
    const user_id = req.query.id;

    const userProfile = await Profile.findOne({ userId: user_id })
      .populate("userId", "name username email profilePic");

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    let outputPath = await convertUserDataTOPDF(userProfile);

    return res.json({
      message: "Profile data converted to PDF successfully",
      pdf: outputPath,
    });
  } catch (error) {
    console.error("Download profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const connectionRequest = async (req, res) => {
    
    const { token, connectionId } = req.body;
    try{
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const connectionUser = await User.findById(connectionId);
        if (!connectionUser) {
            return res.status(404).json({ message: "Connection user not found" });
        }

        const existingRequest = await Connection.findOne({
            userId: user._id,
            connectionId: connectionUser._id
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Connection request already sent" });
        }

        const request = new Connection({
            userId: user._id,
            connectionId: connectionUser._id,
        });

        await request.save();
        return res.status(200).json({ message: "Connection request sent successfully" });

        
    }catch (error) {
        console.error("Connection request error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const getConnections = async (req, res) => {
    const { token } = req.query;
    try{
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Get all accepted connections where user is either the sender or receiver
        const sentConnections = await Connection.find({ 
            userId: user._id, 
            status: 'accepted' 
        }).populate('connectionId', 'name username email profilePic');
        
        const receivedConnections = await Connection.find({ 
            connectionId: user._id, 
            status: 'accepted' 
        }).populate('userId', 'name username email profilePic');

        // Transform the data to have consistent structure
        const allConnections = [
            ...sentConnections.map(conn => ({
                _id: conn._id,
                connectionId: conn.connectionId,
                status: conn.status,
                createdAt: conn.createdAt
            })),
            ...receivedConnections.map(conn => ({
                _id: conn._id,
                connectionId: conn.userId, // The other user is in userId field for received connections
                status: conn.status,
                createdAt: conn.createdAt
            }))
        ];

        return res.status(200).json({ connections: allConnections });

    }catch (error) {
        console.error("Get connections error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const whatAreMyConnections = async (req, res) => {
    const { token } = req.query;
    try{
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const connections = await Connection.find({connectionId: user._id, status: 'pending' }).populate('userId', 'name username email profilePic');
        return res.status(200).json({ connections });

    }catch (error) {
        console.error("Get connections error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const acceptConnectionRequest = async (req, res) => {
    const { token, requestId, action_type } = req.body;
    try{
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const connection = await Connection.findOne({ _id: requestId, connectionId: user._id });
        if (!connection) {
            return res.status(404).json({ message: "Connection request not found" });
        }

        if(action_type === 'accept'){
            connection.status = 'accepted';
            await connection.save();
            return res.status(200).json({ message: "Connection request accepted" });
        }else if(action_type === 'reject'){
            await Connection.deleteOne({ _id: requestId });
            return res.status(200).json({ message: "Connection request rejected" });
        }else{
            return res.status(400).json({ message: "Invalid action type" });
        }

    }catch (error) {
        console.error("Accept connection request error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// export const populateUserProfiles = async (req, res) => {
//     try {
//         const users = await User.find();
//         let updatedCount = 0;

//         for (const user of users) {
//             const existingProfile = await Profile.findOne({ userId: user._id });
            
//             if (!existingProfile) {
//                 const sampleProfile = new Profile({
//                     userId: user._id,
//                     bio: "Experienced professional with a passion for innovation and growth.",
//                     currentPosition: "Senior Developer",
//                     pastWork: [
//                         {
//                             position: "Software Engineer",
//                             company: "Innovation Corp",
//                             startDate: new Date("2020-03-01"),
//                             endDate: new Date("2023-12-31")
//                         },
//                         {
//                             position: "Junior Developer",
//                             company: "StartupTech",
//                             startDate: new Date("2018-06-01"),
//                             endDate: new Date("2020-02-28")
//                         }
//                     ],
//                     education: [
//                         {
//                             degree: "Master of Science",
//                             fieldOfStudy: "Software Engineering",
//                             institution: "Tech University",
//                             startDate: new Date("2016-09-01"),
//                             endDate: new Date("2018-05-30")
//                         },
//                         {
//                             degree: "Bachelor of Science",
//                             fieldOfStudy: "Computer Science",
//                             institution: "State University",
//                             startDate: new Date("2012-09-01"),
//                             endDate: new Date("2016-05-30")
//                         }
//                     ]
//                 });
//                 await sampleProfile.save();
//                 updatedCount++;
//             }
//         }

//         return res.status(200).json({
//             message: `Successfully populated ${updatedCount} user profiles`,
//             updatedCount
//         });
//     } catch (error) {
//         console.error("Populate profiles error:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// }

export const getUserProfileAndUserBasedOnUsername = async (req, res) => {

    const { username } = req.query;
    try{
        const user = await User.findOne({  username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const  userProfile = await Profile.findOne({ userId: user._id })
            .populate("userId", "name username email profilePic");

        if (!userProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        return res.json(userProfile);
    }catch (error) {
        console.error("Get user profile error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


        




    

