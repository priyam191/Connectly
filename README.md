# LinkedIn Clone - Login System

This is a LinkedIn clone application with a working login and registration system.

## Project Structure

- `client/` - Next.js frontend application
- `server/` - Express.js backend API

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (make sure it's running locally or update the MONGO_URI in server/.env)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory with your MongoDB connection string:
```
MONGO_URI=mongodb://localhost:27017/linkedin-clone
```

4. Start the server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`


### Common Issues:

1. **"Network error" message**:
   - Make sure the server is running on port 5000
   - Check if MongoDB is running
   - Verify the MONGO_URI in your .env file

2. **"Invalid email or password"**:
   - Make sure you're using the correct email/password combination
   - Check the browser console for detailed error messages

3. **"User already exists"**:
   - Try using a different email address for registration

### Debug Information:

The application includes console logging for debugging:
- Login attempts are logged to the browser console
- Registration attempts are logged to the browser console
- API responses and errors are logged

Check the browser's developer tools console for detailed information about API calls and responses.

## API Endpoints

- `POST /login` - User login
- `POST /register` - User registration
- `GET /get_user_and_profile` - Get user profile (requires token)

## Technologies Used

- **Frontend**: Next.js, React, Redux Toolkit, Axios
- **Backend**: Express.js, MongoDB, Mongoose, bcrypt
- **Authentication**: JWT-like tokens stored in database
