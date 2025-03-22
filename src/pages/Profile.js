import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Avatar, Button, Tabs, Tab, Grid, Typography, CircularProgress, Box } from '@mui/material';
import PostGrid from '../components/PostGrid'; // Assuming you have this component
import '../pagesCss/Profile.css';
import socket from '../services/socket';
import FollowersFollowingModal from '../components/FollowersFollowingModal'; // Import the modal component

// API base URL
const API_BASE_URL = "http://localhost:5000/api";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('followers'); // 'followers' or 'following'

  // Get current user from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    socket.connect();
    socket.emit('joinUser', currentUser?._id);

    socket.on('followerUpdate', handleFollowerUpdate);
    socket.on('followingUpdate', handleFollowingUpdate);

    return () => {
        socket.disconnect();
        socket.off('followerUpdate', handleFollowerUpdate);
        socket.off('followingUpdate', handleFollowingUpdate);
        socket.emit('leaveUser', currentUser?._id);
    };
  }, [currentUser]);

  const handleFollowerUpdate = (data) => {
    fetchProfileData();
  };

  const handleFollowingUpdate = (data) => {
    fetchProfileData();
  };

  // Handlers for opening the followers/following modals
  const handleOpenFollowersModal = () => {
    setModalType('followers');
    setModalOpen(true);
  };

  const handleOpenFollowingModal = () => {
    setModalType('following');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = token ? { 'x-auth-token': token } : {};

      const response = await axios.get(`${API_BASE_URL}/profile/${userId}`, { headers });
      setProfileData(response.data);

      // Check if current user is following this profile
      if (currentUser && response.data.followers.includes(currentUser._id)) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }

      // Fetch user posts
      const postsResponse = await axios.get(`${API_BASE_URL}/posts/user/${userId}`, { headers });
      console.log("Fetched posts:", response.data); // Debugging
      setPosts(postsResponse.data);

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile data
  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId, currentUser]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (isFollowing) {
        // Unfollow
        await axios.post(`${API_BASE_URL}/profile/${userId}/unfollow`, {}, {
          headers: { 'x-auth-token': token }
        });
        setIsFollowing(false);
      } else {
        // Follow
        await axios.post(`${API_BASE_URL}/profile/${userId}/follow`, {}, {
          headers: { 'x-auth-token': token }
        });
        setIsFollowing(true);
      }

      // Update profile data after follow/unfollow
      const updatedProfile = await axios.get(`${API_BASE_URL}/profile/${userId}`, {
        headers: { 'x-auth-token': token }
      });
      setProfileData(updatedProfile.data);
      
    } catch (err) {
      console.error('Error toggling follow:', err);
      setError(err.response?.data?.error || err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!profileData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>User not found</Typography>
      </Box>
    );
  }

  const isOwnProfile = currentUser && currentUser._id === userId;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <Avatar 
          src={profileData.profilePic ? `http://localhost:5000${profileData.profilePic}` : ''} 
          alt={profileData.username} 
          className="profile-avatar"
          sx={{ width: 120, height: 120 }}
        />
        
        <div className="profile-info">
          <div className="profile-user-info">
            <Typography variant="h5" component="h1" className="username">
              {profileData.username}
            </Typography>
            
            {!isOwnProfile && (
              <Button 
                variant={isFollowing ? "outlined" : "contained"} 
                color="primary"
                onClick={handleFollowToggle}
                className="follow-button"
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
            
            {isOwnProfile && (
              <Button 
                variant="outlined" 
                onClick={() => navigate(`/edit-profile/${userId}`)}
                className="edit-profile-button"
              >
                Edit Profile
              </Button>
            )}
          </div>
          
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{profileData.postsCount}</span>
              <span className="stat-label">posts</span>
            </div>
            <div className="stat" onClick={handleOpenFollowersModal} style={{ cursor: 'pointer' }}>
              <span className="stat-value">{profileData.followersCount}</span>
              <span className="stat-label">followers</span>
            </div>
            <div className="stat" onClick={handleOpenFollowingModal} style={{ cursor: 'pointer' }}>
              <span className="stat-value">{profileData.followingCount}</span>
              <span className="stat-label">following</span>
            </div>
          </div>
          
          <div className="profile-bio">
            <Typography variant="body1" component="h2" className="full-name">
              {profileData.fullName}
            </Typography>
            <Typography variant="body2" className="bio">
              {profileData.bio || "No bio yet"}
            </Typography>
          </div>
        </div>
      </div>
      
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered
        className="profile-tabs"
      >
        <Tab label="Posts" />
        <Tab label="Saved" disabled={!isOwnProfile} />
        <Tab label="Tagged" />
      </Tabs>
      
      <div className="profile-content">
        {tabValue === 0 && (
          posts.length > 0 ? (
            <PostGrid posts={posts} />
          ) : (
            <div className="no-posts">
              <Typography variant="body1">No posts yet</Typography>
            </div>
          )
        )}
        
        {tabValue === 1 && isOwnProfile && (
          <div className="saved-posts">
            <Typography variant="body1">Saved posts will appear here</Typography>
          </div>
        )}
        
        {tabValue === 2 && (
          <div className="tagged-posts">
            <Typography variant="body1">Posts you're tagged in will appear here</Typography>
          </div>
        )}
      </div>

      {/* Followers/Following Modal */}
      <FollowersFollowingModal
        open={modalOpen}
        onClose={handleCloseModal}
        userId={userId}
        type={modalType}
        currentUserId={currentUser?._id}
      />
    </div>
  );
};

export default Profile;