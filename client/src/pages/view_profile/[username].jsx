import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/userLayout';
import React, { useEffect } from 'react';
import { useRouter } from "next/router";
import { useDispatch, useSelector } from 'react-redux';
import { getUserPosts } from '@/config/redux/action/postAction';
import { sendConnectionRequest } from '@/config/redux/action/authAction';
import clientServer, { baseURL } from '@/config';
import styles from './index.module.css';

function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userPosts, isLoading } = useSelector((state) => state.post);
  const { user, message, isLoading: authLoading, connections } = useSelector((state) => state.auth);

 


  // Fetch user posts when component mounts
  useEffect(() => {
    if (userProfile?.userId?._id) {
      dispatch(getUserPosts(userProfile.userId._id));
    }
  }, [userProfile, dispatch]);


  // Check if users are already connected
  const isConnected = connections?.some(conn => 
    conn.connectionId?._id === userProfile?.userId?._id
  );

  // Handle connection request
  const handleConnect = () => {
    if (userProfile?.userId?._id && user?.userId?._id !== userProfile.userId._id) {
      dispatch(sendConnectionRequest(userProfile.userId._id));
    }
  };

  if (!userProfile) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <h2>User not found</h2>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          {/* Banner */}
          <div className={styles.banner}>
            <div className={styles.bannerImage}></div>
          </div>

          {/* Profile Header */}
          <div className={styles.profileHeader}>
            <div className={styles.profileImageContainer}>
              <img
                className={styles.profileImage}
                src={userProfile.userId?.profilePic 
                  ? `${baseURL}/${userProfile.userId.profilePic}`
                  : `https://via.placeholder.com/120x120/007bff/white?text=${(userProfile.userId?.name || 'U').charAt(0).toUpperCase()}`}
                alt="Profile"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/120x120/007bff/white?text=${(userProfile.userId?.name || 'U').charAt(0).toUpperCase()}`;
                }}
              />
            </div>
            
            <div className={styles.profileInfo}>
              <div className={styles.nameSection}>
                <h1 className={styles.name}>
                  {userProfile.userId?.name || "No Name"}
                </h1>
                <p className={styles.headline}>
                  {userProfile.currentPosition || "Professional"}
                </p>
                <p className={styles.location}>
                  {userProfile.location || "Location not specified"}
                </p>
              </div>
              
              <div className={styles.actionButtons}>
                {user?.userId?._id !== userProfile.userId._id && (
                  <>
                    {isConnected ? (
                      <button className={styles.connectedBtn}>
                        ✓ Connected
                      </button>
                    ) : (
                      <button 
                        className={styles.connectBtn}
                        onClick={handleConnect}
                        disabled={authLoading}
                      >
                        {authLoading ? 'Sending...' : '+ Connect'}
                      </button>
                    )}
                    <button className={styles.messageBtn}>Message</button>
                  </>
                )}
                {user?.userId?._id === userProfile.userId._id && (
                  <button 
                    className={styles.editBtn}
                    onClick={() => router.push('/edit_profile')}
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Connection Status Message */}
          {message && (
            <div className={styles.message}>
              {message}
            </div>
          )}

          {/* Profile Content */}
          <div className={styles.profileContent}>
            <div className={styles.leftColumn}>
              {/* About Section */}
              <div className={styles.section}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon} >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>

                <h3 className={styles.sectionTitle}>About</h3>
                <p className={styles.sectionContent}>
                  {userProfile.bio || "This user hasn't added a bio yet."}
                </p>
              </div>

              {/* Experience Section */}
              {userProfile.pastWork && userProfile.pastWork.length > 0 && (
                <div className={styles.section}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon} >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                  <h3 className={styles.sectionTitle}>Experience</h3>
                  {userProfile.pastWork.map((work, index) => (
                    <div key={index} className={styles.experienceItem}>
                      <h4 className={styles.jobTitle}>{work.position}</h4>
                      <p className={styles.company}>{work.company}</p>
                      {/* <p className={styles.duration}>
                        {new Date(work.startDate).toLocaleDateString()} - {work.endDate ? new Date(work.endDate).toLocaleDateString() : 'Present'}
                      </p> */}
                    </div>
                  ))}
                </div>
              )}

              {/* Education Section */}
              {userProfile.education && userProfile.education.length > 0 && (
                <div className={styles.section}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon} >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                  <h3 className={styles.sectionTitle}>Education</h3>
                  {userProfile.education.map((edu, index) => (
                    <div key={index} className={styles.educationItem}>
                      <h4 className={styles.degree}>{edu.degree} in {edu.fieldOfStudy}</h4>
                      <p className={styles.institution}>{edu.institution}</p>
                      <p className={styles.duration}>
                        {new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              
            </div>

            <div className={styles.rightColumn}>
              {/* Contact Info */}
              <div className={styles.section}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon} >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                <h3 className={styles.sectionTitle}>Contact info</h3>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Email:</span>
                  <span className={styles.contactValue}>{userProfile.userId?.email || 'Not provided'}</span>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Username:</span>
                  <span className={styles.contactValue}>@{userProfile.userId?.username || 'unknown'}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Posts Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Posts</h3>
                {isLoading ? (
                  <p>Loading posts...</p>
                ) : userPosts && userPosts.length > 0 ? (
                  <div className={styles.postsContainer}>
                    {userPosts.map((post) => (
                      <div key={post._id} className={styles.postItem}>
                        <div className={styles.postHeader}>
                          <img
                            className={styles.postAuthorImage}
                            src={post.userId?.profilePic 
                              ? `${baseURL}/${post.userId.profilePic}`
                              : `https://via.placeholder.com/40x40/007bff/white?text=${(post.userId?.name || 'U').charAt(0).toUpperCase()}`}
                            alt="Author"
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/40x40/007bff/white?text=${(post.userId?.name || 'U').charAt(0).toUpperCase()}`;
                            }}
                          />
                          <div className={styles.postAuthorInfo}>
                            <h4 className={styles.postAuthorName}>{post.userId?.name}</h4>
                            <p className={styles.postDate}>
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={styles.postContent}>
                          <p className={styles.postText}>{post.body}</p>
                          {post.media && (
                            <img src={`${baseURL}/${post.media}`} alt="post" className={styles.postImage} />
                          )}
                        </div>
                        <div className={styles.postStats}>
                          <span className={styles.likeCount}>❤️ {post.likes} likes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noPosts}>No posts yet.</p>
                )}
              </div>


        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export default ViewProfilePage;

export async function getServerSideProps(context) {
  try {
    // Use the deployed server URL for server-side requests
    const serverURL = process.env.NODE_ENV === 'production' 
      ? 'https://connectly-prkz.onrender.com' 
      : 'http://localhost:5000';
    
    const response = await fetch(
      `${serverURL}/user/get_profile_based_on_username?username=${context.query.username}`
    );
    
    if (!response.ok) {
      return { props: { userProfile: null } };
    }
    
    const data = await response.json();

    // Check if the response has the expected structure
    if (data && data.userId) {
      return {
        props: { userProfile: data },
      };
    } else {
      return {
        props: { userProfile: null },
      };
    }
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    return { props: { userProfile: null } };
  }
}
