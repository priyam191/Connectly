import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UserLayout from '@/layout/userLayout';
import DashboardLayout from '@/layout/DashboardLayout';
import { getAllUsers, sendConnectionRequest, getConnections } from '@/config/redux/action/authAction';
import styles from './index.module.css';
import baseURL from '@/config';
import { useRouter } from 'next/router';

function Discoverpage() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
    dispatch(getConnections());
  }, [authState.all_profiles_fetched, dispatch]);

  // Handle connection request
  const handleConnect = (userId) => {
    dispatch(sendConnectionRequest(userId));
  };

  // Check if user is connected
  const isConnected = (userId) => {
    return authState.connections?.some(conn => conn.connectionId?._id === userId);
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <h1 style={{ textAlign: 'center', margin: '1rem 0' }}>
          Discover People
        </h1>

        <div className={styles.allUserProfile}>
          {authState.all_profiles_fetched &&
            authState.all_users
              .filter((user) => {
                // Hide the current logged-in user from the list
                return user.userId?.username !== authState.user?.username;
              })
              .map((user) => {
                const profilePic = user.userId?.profilePic || user.profilePic;
                // console.log("User data:", user);


                return (
                  <div key={user._id || user.id} className={styles.userCard}>
                    <div onClick={() => router.push(`/view_profile/${user.userId.username}`)} className={styles.cardContent}>
                      <img
                        className={styles.userCardImage}
                        src={ profilePic ? `${baseURL}${profilePic}` : `${baseURL}/uploads/default.jpg` }

                        alt="profile"
                      />

                      <h3 className={styles.userName}>
                        {user?.userId?.name || 'No Name'}
                      </h3>
                      <p className={styles.userUsername}>
                        @{user?.userId?.username || 'unknown'}
                      </p>
                    </div>

                    <button 
                      className={isConnected(user.userId._id) ? styles.connectedBtn : styles.followBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnect(user.userId._id);
                      }}
                    >
                      {isConnected(user.userId._id) ? '✓ Connected' : '+ Connect'}
                    </button>
                  </div>
                );
              })}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export default Discoverpage;
