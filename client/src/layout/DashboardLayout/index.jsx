import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { setTokenIsThere } from "@/config/redux/reducer/authReducer";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, sendConnectionRequest, getConnections } from "@/config/redux/action/authAction";
import { baseURL } from "@/config";

function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  // ✅ Track connection state per user
  const [connectionStates, setConnectionStates] = useState({});

  useEffect(() => {
    if (localStorage.getItem("token") === null) {
      router.push("/login");
    }

    dispatch(setTokenIsThere());
    dispatch(getAllUsers());
    dispatch(getConnections());
  }, [router, dispatch]);

  // ✅ Handle connection request
  const handleConnect = (userId) => {
    dispatch(sendConnectionRequest(userId));
    setConnectionStates((prev) => ({
      ...prev,
      [userId]: 'pending'
    }));
  };

  // Check if user is connected
  const isConnected = (userId) => {
    return authState.connections?.some(conn => conn.connectionId?._id === userId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.homeContainer}>

        {/* Sidebar */}
        <aside className={styles.leftBar}>
          {/* Current User Profile Section */}
          {authState.user && (
            <div 
              onClick={() => authState.user?.userId?.username && router.push(`/view_profile/${authState.user.userId.username}`)}
              style={{
                padding: '15px',
                borderBottom: '1px solid #e1e1e1',
                marginBottom: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                margin: '10px'
              }}
            >
              <img
                src={authState.user.userId?.profilePic ? `${baseURL}/${authState.user.userId.profilePic}` : `https://via.placeholder.com/45x45/007bff/white?text=${(authState.user.userId?.name || 'M').charAt(0).toUpperCase()}`}
                alt="My Profile"
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #007bff'
                }}
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/45x45/007bff/white?text=${(authState.user.userId?.name || 'M').charAt(0).toUpperCase()}`;
                }}
              />
              <div>
                <h4 style={{margin: '0', fontSize: '14px', fontWeight: '600'}}>
                  {authState.user.userId?.name || 'My Profile'}
                </h4>
                <p style={{margin: '0', fontSize: '12px', color: '#666'}}>
                  @{authState.user.userId?.username || 'username'}
                </p>
              </div>
            </div>
          )}
          
          <div onClick={() => router.push('/dashboard')} className={styles.sideBarOption}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.icon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 
                1.125-1.125h2.25c.621 0 
                1.125.504 1.125 1.125V21h4.125c.621 0 
                1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            <h3>Home</h3>
          </div>
          <div onClick={() => router.push('/discover')} className={styles.sideBarOption}>
            <svg xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.icon}>
              <path strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>

              <h3>Discover</h3>
            </div>
            <div onClick={() => router.push('/my_connections')} className={styles.sideBarOption}>
            <svg xmlns="http://www.w3.org/2000/svg"
             fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5}
               stroke="currentColor"
                className={styles.icon}>
              <path strokeLinecap="round"
               strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>

              <h3>My Connections</h3>
            </div>
        </aside>

        {/* Feed Section */}
        <main className={styles.feedContainer}>
          {children}
        </main>

        {/* Extra Section */}
        <aside className={styles.extraContainer}>
          <h3 style={{marginBottom: '10px'}}>Top Profiles</h3>

          {authState.all_profiles_fetched && Array.isArray(authState.all_users) && authState.all_users
            .filter((profile) => {
              const listedUser = profile.userId || profile;
              const listedId = listedUser?._id;
              const currentUserId = authState.user?.userId?._id || authState.user?._id;
              return listedId && listedId !== currentUserId;
            })
            .map((profile) => {
              const user = profile.userId || profile;
              const userId = user?._id;
              return (
                <div
                  key={profile._id || userId}
                  className={styles.profileCard}
                  style={{display: 'flex' , justifyContent: 'space-between', alignItems: 'center'}}
                >
                  <div 
                    onClick={() => userId && router.push(`/view_profile/${user.username}`)} 
                    className={styles.profileInfo} 
                    style={{cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px'}}
                  >
                    <img
                      src={user?.profilePic ? `${baseURL}/${user.profilePic}` : `https://via.placeholder.com/40x40/007bff/white?text=${(user?.name || 'U').charAt(0).toUpperCase()}`}
                      alt={user?.name || 'Profile'}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #e1e1e1'
                      }}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/40x40/007bff/white?text=${(user?.name || 'U').charAt(0).toUpperCase()}`;
                      }}
                    />
                    <div>
                      <h4 style={{margin: '0', fontSize: '14px'}}>{user?.name}</h4>
                      {user?.username && <p style={{margin: '0', fontSize: '12px', color: '#666'}}>@{user.username}</p>}
                    </div>
                  </div>
                  <div
                    onClick={() => handleConnect(userId)}                  
                    className={styles.connect} 
                    style={{cursor: 'pointer'}}
                  >
                    {isConnected(userId) ? (
                      <span style={{color: '#28a745', fontSize: '0.8rem', fontWeight: '600'}}>✓</span>
                    ) : connectionStates[userId] === 'pending' ? (
                      <span style={{color: '#ffc107', fontSize: '0.8rem'}}>⏳</span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24"
                        strokeWidth={1.5} stroke="currentColor"
                        className={styles.icon}>
                        <path strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              )
            })}
        </aside>
      </div>
    </div>
  );
}

export default DashboardLayout;
