import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/userLayout';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateUserProfile, updateProfileData, uploadProfilePicture } from '@/config/redux/action/authAction';
import clientServer, { baseURL } from '@/config';
import styles from './index.module.css';

function EditProfilePage() {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState({
    bio: '',
    currentPosition: '',
    location: '',
    pastWork: [],
    education: [],
    name: '',
    username: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');

  // Fetch user profile data
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Update form data when user profile is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        bio: user.bio || '',
        currentPosition: user.currentPosition || '',
        location: user.location || '',
        pastWork: user.pastWork || [],
        education: user.education || [],
        name: user.userId?.name || '',
        username: user.userId?.username || '',
        email: user.userId?.email || ''
      });
      setProfilePicPreview(user.userId?.profilePic ? `${baseURL}/${user.userId.profilePic}` : `https://via.placeholder.com/150x150/007bff/white?text=${(user.userId?.name || 'U').charAt(0).toUpperCase()}`);
    }
  }, [user]);

  // Handle profile picture upload
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload profile picture using Redux action
  const handleProfilePictureUpload = async () => {
    if (!profilePic) return true;

    try {
      await dispatch(uploadProfilePicture(profilePic)).unwrap();
      setMessage('Profile picture updated successfully!');
      return true;
    } catch (error) {
      setMessage('Failed to upload profile picture: ' + error.message);
      return false;
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle adding new work experience
  const addWorkExperience = () => {
    setProfileData(prev => ({
      ...prev,
      pastWork: [...prev.pastWork, {
        position: '',
        company: '',
        startDate: '',
        endDate: ''
      }]
    }));
  };

  // Handle removing work experience
  const removeWorkExperience = (index) => {
    setProfileData(prev => ({
      ...prev,
      pastWork: prev.pastWork.filter((_, i) => i !== index)
    }));
  };

  // Handle work experience input changes
  const handleWorkExperienceChange = (index, field, value) => {
    setProfileData(prev => ({
      ...prev,
      pastWork: prev.pastWork.map((work, i) => 
        i === index ? { ...work, [field]: value } : work
      )
    }));
  };

  // Handle adding new education
  const addEducation = () => {
    setProfileData(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        fieldOfStudy: '',
        institution: '',
        startDate: '',
        endDate: ''
      }]
    }));
  };

  // Handle removing education
  const removeEducation = (index) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // Handle education input changes
  const handleEducationChange = (index, field, value) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Upload profile picture first if changed
      if (profilePic) {
        await handleProfilePictureUpload();
      }

      // Update user basic info using Redux action
      await dispatch(updateUserProfile({
        name: profileData.name,
        username: profileData.username,
        email: profileData.email
      })).unwrap();

      // Update profile data using Redux action
      await dispatch(updateProfileData({
        bio: profileData.bio,
        currentPosition: profileData.currentPosition,
        location: profileData.location,
        pastWork: profileData.pastWork,
        education: profileData.education
      })).unwrap();

      setMessage('Profile updated successfully!');
      
      // Refresh user profile
      dispatch(fetchUserProfile());
      
    } catch (error) {
      setMessage('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <h2>Loading...</h2>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Edit Profile</h1>
            <p>Update your profile information</p>
          </div>

          {message && (
            <div className={styles.message}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Profile Picture Section */}
            <div className={styles.section}>
              <h3>Profile Picture</h3>
              <div className={styles.profilePicSection}>
                <div className={styles.profilePicPreview}>
                  <img
                    src={profilePicPreview}
                    alt="Profile Preview"
                    className={styles.profilePic}
                  />
                </div>
                <div className={styles.profilePicUpload}>
                  <input
                    type="file"
                    id="profilePic"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className={styles.fileInput}
                  />
                  <label htmlFor="profilePic" className={styles.fileLabel}>
                    Choose New Photo
                  </label>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className={styles.section}>
              <h3>Basic Information</h3>
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profileData.username}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="currentPosition">Current Position</label>
                <input
                  type="text"
                  id="currentPosition"
                  name="currentPosition"
                  value={profileData.currentPosition}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="e.g., New York, NY"
                />
              </div>
            </div>

            {/* Bio Section */}
            <div className={styles.section}>
              <h3>About</h3>
              <div className={styles.formGroup}>
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            {/* Work Experience Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Work Experience</h3>
                <button
                  type="button"
                  onClick={addWorkExperience}
                  className={styles.addButton}
                >
                  + Add Experience
                </button>
              </div>
              {profileData.pastWork.map((work, index) => (
                <div key={index} className={styles.experienceItem}>
                  <div className={styles.itemHeader}>
                    <h4>Experience {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeWorkExperience(index)}
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Position</label>
                      <input
                        type="text"
                        value={work.position}
                        onChange={(e) => handleWorkExperienceChange(index, 'position', e.target.value)}
                        className={styles.input}
                        placeholder="e.g., Software Engineer"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Company</label>
                      <input
                        type="text"
                        value={work.company}
                        onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                        className={styles.input}
                        placeholder="e.g., Tech Corp"
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={work.startDate}
                        onChange={(e) => handleWorkExperienceChange(index, 'startDate', e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>End Date</label>
                      <input
                        type="date"
                        value={work.endDate}
                        onChange={(e) => handleWorkExperienceChange(index, 'endDate', e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Education Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Education</h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className={styles.addButton}
                >
                  + Add Education
                </button>
              </div>
              {profileData.education.map((edu, index) => (
                <div key={index} className={styles.educationItem}>
                  <div className={styles.itemHeader}>
                    <h4>Education {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        className={styles.input}
                        placeholder="e.g., Bachelor of Science"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Field of Study</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                        className={styles.input}
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                      className={styles.input}
                      placeholder="e.g., University of Technology"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>End Date</label>
                      <input
                        type="date"
                        value={edu.endDate}
                        onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className={styles.submitSection}>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export default EditProfilePage;
