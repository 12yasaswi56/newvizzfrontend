import React, { useState } from 'react';
import axios from 'axios';
import { Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import '../pagesCss/StoryUpload.css';

// API base URL
const API_BASE_URL = "http://localhost:5000/api";

const StoryUpload = ({ onClose, onSuccess, currentUser }) => {
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!mediaFile) {
      setError('Please select a media file for your story');
      return;
    }
  
    if (!currentUser || !currentUser._id) {
      setError('User session expired. Please log in again.');
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
  
      const formData = new FormData();
      formData.append('file', mediaFile); // Changed from 'media' to 'file' to match backend
      if (caption.trim()) {
        formData.append('caption', caption);
      }
  
      // Get the token from localStorage
      const token = localStorage.getItem('auth-token');
      // Add this logging in StoryUpload.js before making the request
console.log('Current user ID:', currentUser?._id);
console.log('Token being sent:', localStorage.getItem('auth-token'));
      // Use the correct endpoint: /api/stories
      const response = await axios.post(`${API_BASE_URL}/stories`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      });
  
      console.log('Story upload response:', response.data);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      onClose(); // Close the modal after successful upload
    } catch (err) {
      console.error('Story upload failed:', err);
      setError(err.response?.data?.error || err.message || 'Failed to upload story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="story-upload-modal">
      <div className="story-upload-content">
        <div className="story-upload-header">
          <h3>Create Story</h3>
          <CloseIcon className="close-icon" onClick={onClose} />
        </div>

        <div className="story-upload-user">
          <Avatar 
            src={currentUser?.profilePic || "/default-avatar.png"} 
            className="user-avatar" 
          />
          <span>{currentUser?.username || "User"}</span>
        </div>

        <div className="story-upload-media">
          {mediaPreview ? (
            <div className="media-preview-container">
              <img 
                src={mediaPreview} 
                alt="Preview" 
                className="media-preview" 
              />
              <button 
                className="change-media-btn"
                onClick={() => {
                  setMediaFile(null);
                  setMediaPreview(null);
                }}
              >
                Change
              </button>
            </div>
          ) : (
            <div className="media-upload-area">
              <div className="upload-icon">
                <ImageIcon fontSize="large" />
              </div>
              <p>Select an image for your story</p>
              <label className="file-input-label">
                Select from device
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
              </label>
            </div>
          )}
        </div>

        <div className="story-caption-area">
          <textarea
            placeholder="Add a caption to your story..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="caption-input"
            maxLength={150}
          />
          <small className="caption-counter">{caption.length}/150</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="story-upload-actions">
          <button 
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="upload-btn"
            onClick={handleUpload}
            disabled={loading || !mediaFile}
          >
            {loading ? "Uploading..." : "Share to Story"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryUpload;