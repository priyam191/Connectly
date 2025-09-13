import UserLayout from '@/layout/userLayout'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { getConnections, getConnectionRequests, acceptConnectionRequest } from '@/config/redux/action/authAction'
import DashboardLayout from '@/layout/DashboardLayout'
import { baseURL } from '@/config'
import styles from './index.module.css'

function MyConnectionsPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { connections, connectionRequest, isLoading, message } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('connections')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    } else {
      dispatch(getConnections())
      dispatch(getConnectionRequests())
    }
  }, [dispatch, router])

  const handleAcceptRequest = (requestId) => {
    dispatch(acceptConnectionRequest({ requestId, action_type: 'accept' }))
      .then(() => {
        // Refresh connections and requests after accepting
        dispatch(getConnections())
        dispatch(getConnectionRequests())
      })
  }

  const handleRejectRequest = (requestId) => {
    dispatch(acceptConnectionRequest({ requestId, action_type: 'reject' }))
      .then(() => {
        // Refresh requests after rejecting
        dispatch(getConnectionRequests())
      })
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>My Network</h1>
              {connections && connections.length > 0 && (
                <p className={styles.connectionCount}>
                  {connections.length} connection{connections.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'connections' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('connections')}
              >
                Connections ({connections?.length || 0})
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'requests' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                Requests ({connectionRequest?.length || 0})
              </button>
            </div>
            {activeTab === 'connections' && (
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search connections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            )}
          </div>

          {message && (
            <div className={styles.message}>
              {message}
            </div>
          )}

          <div className={styles.content}>
            {activeTab === 'connections' && (
              <div className={styles.connectionsGrid}>
                {isLoading ? (
                  <div className={styles.loading}>Loading connections...</div>
                ) : connections && connections.length > 0 ? (
                  connections
                    .filter(connection => 
                      connection.connectionId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      connection.connectionId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      connection.connectionId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((connection) => (
                    <div key={connection._id} className={styles.connectionCard}>
                      <div className={styles.cardHeader}>
                        <img
                          className={styles.profileImage}
                          src={connection.connectionId?.profilePic 
                            ? `${baseURL}/${connection.connectionId.profilePic}`
                            : `${baseURL}/uploads/default.jpg`}
                          alt="Profile"
                        />
                        <div className={styles.profileInfo}>
                          <h3 className={styles.name}>{connection.connectionId?.name}</h3>
                          <p className={styles.username}>@{connection.connectionId?.username}</p>
                          <p className={styles.email}>{connection.connectionId?.email}</p>
                          <p className={styles.connectedDate}>
                            Connected {new Date(connection.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={styles.cardActions}>
                        <button 
                          className={styles.viewProfileBtn}
                          onClick={() => router.push(`/view_profile/${connection.connectionId?.username}`)}
                        >
                          View Profile
                        </button>
                        <button className={styles.messageBtn}>
                          Message
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <h3>No connections yet</h3>
                    <p>Start connecting with people to build your network!</p>
                  </div>
                )}
                {connections && connections.length > 0 && connections.filter(connection => 
                  connection.connectionId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  connection.connectionId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  connection.connectionId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && searchTerm && (
                  <div className={styles.emptyState}>
                    <h3>No connections found</h3>
                    <p>Try adjusting your search terms.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className={styles.requestsGrid}>
                {isLoading ? (
                  <div className={styles.loading}>Loading requests...</div>
                ) : connectionRequest && connectionRequest.length > 0 ? (
                  connectionRequest.map((request) => (
                    <div key={request._id} className={styles.requestCard}>
                      <div className={styles.cardHeader}>
                        <img
                          className={styles.profileImage}
                          src={request.userId?.profilePic 
                            ? `${baseURL}/${request.userId.profilePic}`
                            : `${baseURL}/uploads/default.jpg`}
                          alt="Profile"
                        />
                        <div className={styles.profileInfo}>
                          <h3 className={styles.name}>{request.userId?.name}</h3>
                          <p className={styles.username}>@{request.userId?.username}</p>
                          <p className={styles.email}>{request.userId?.email}</p>
                        </div>
                      </div>
                      <div className={styles.cardActions}>
                        <button 
                          className={styles.acceptBtn}
                          onClick={() => handleAcceptRequest(request._id)}
                        >
                          Accept
                        </button>
                        <button 
                          className={styles.rejectBtn}
                          onClick={() => handleRejectRequest(request._id)}
                        >
                          Reject
                        </button>
                        <button 
                          className={styles.viewProfileBtn}
                          onClick={() => router.push(`/view_profile/${request.userId?.username}`)}
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <h3>No pending requests</h3>
                    <p>You don't have any pending connection requests.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  )
}

export default MyConnectionsPage