// import React, { useState, useEffect, useRef } from 'react';
// import { Avatar } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
// import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
// import axios from 'axios';
// import '../pagesCss/StoryViewer.css';

// const StoryViewer = ({ story, onClose, stories, setActiveStory }) => {
//   const [progress, setProgress] = useState(0);
//   const [isPaused, setIsPaused] = useState(false);
//   const progressInterval = useRef(null);
//   const storyDuration = 5000; // 5 seconds per story
//   const progressStep = 100 / (storyDuration / 100); // Progress increment per 100ms

//   // Current story index in the stories array
//   const currentStoryIndex = stories.findIndex(s => s._id === story._id);
  
//   // Mark story as viewed when opened
//   useEffect(() => {
//     const markAsViewed = async () => {
//       try {
//         const token = localStorage.getItem('auth-token');
//         if (token) {
//           await axios.post(`http://localhost:5000/api/stories/${story._id}/view`, {}, {
//             headers: { 'x-auth-token': token }
//           });
//         }
//       } catch (error) {
//         console.error('Error marking story as viewed:', error);
//       }
//     };
    
//     markAsViewed();
//   }, [story._id]);
  
//   useEffect(() => {
//     // Reset progress when story changes
//     setProgress(0);
    
//     // Clear any existing interval
//     if (progressInterval.current) {
//       clearInterval(progressInterval.current);
//     }
    
//     // Start progress timer
//     progressInterval.current = setInterval(() => {
//       if (!isPaused) {
//         setProgress(prevProgress => {
//           const newProgress = prevProgress + progressStep;
          
//           // If story completed
//           if (newProgress >= 100) {
//             clearInterval(progressInterval.current);
            
//             // Move to next story if available
//             if (currentStoryIndex < stories.length - 1) {
//               setActiveStory(stories[currentStoryIndex + 1]);
//             } else {
//               // Close story viewer if it was the last story
//               onClose();
//             }
//             return 0;
//           }
          
//           return newProgress;
//         });
//       }
//     }, 100);
    
//     // Cleanup on unmount
//     return () => {
//       if (progressInterval.current) {
//         clearInterval(progressInterval.current);
//       }
//     };
//   }, [story, isPaused, stories, currentStoryIndex, setActiveStory, onClose]);
  
//   const handlePause = () => {
//     setIsPaused(true);
//   };
  
//   const handleResume = () => {
//     setIsPaused(false);
//   };
  
//   const handlePrevStory = () => {
//     if (currentStoryIndex > 0) {
//       setActiveStory(stories[currentStoryIndex - 1]);
//     }
//   };
  
//   const handleNextStory = () => {
//     if (currentStoryIndex < stories.length - 1) {
//       setActiveStory(stories[currentStoryIndex + 1]);
//     } else {
//       onClose();
//     }
//   };
  
//   // Get the full URL for the story media
//   const getFullMediaUrl = (path) => {
//     // If the path is already a full URL, return it
//     if (path.startsWith('http')) {
//       return path;
//     }
    
//     // Otherwise, construct the full URL
//     return `http://localhost:5000${path}`;
//   };
  
//   return (
//     <div className="story-viewer">
//       <div className="story-header">
//         <div className="progress-container">
//           {stories.map((s, index) => (
//             <div 
//               key={s._id} 
//               className="progress-bar-container"
//             >
//               <div 
//                 className="progress-bar" 
//                 style={{ 
//                   width: index === currentStoryIndex ? `${progress}%` : 
//                          index < currentStoryIndex ? '100%' : '0%' 
//                 }}
//               />
//             </div>
//           ))}
//         </div>
        
//         <div className="story-user-info">
//           <Avatar src={story.user?.profilePic || "/default-avatar.png"} alt={story.user?.username || "User"} />
//           <span className="username">{story.user?.username || "User"}</span>
//           <span className="timestamp">{new Date(story.createdAt).toLocaleString()}</span>
//         </div>
        
//         <div className="close-button" onClick={onClose}>
//           <CloseIcon />
//         </div>
//       </div>
      
//       <div 
//         className="story-content" 
//         onMouseDown={handlePause}
//         onMouseUp={handleResume}
//         onTouchStart={handlePause}
//         onTouchEnd={handleResume}
//       >
//         <img src={getFullMediaUrl(story.media)} alt="Story" className="story-image" />
//         {story.caption && <div className="story-caption">{story.caption}</div>}
        
//         {currentStoryIndex > 0 && (
//           <div className="nav-button prev" onClick={handlePrevStory}>
//             <ArrowBackIosIcon />
//           </div>
//         )}
        
//         {currentStoryIndex < stories.length - 1 && (
//           <div className="nav-button next" onClick={handleNextStory}>
//             <ArrowForwardIosIcon />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StoryViewer;

import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import '../pagesCss/StoryViewer.css';

const StoryViewer = ({ story, onClose, stories, setActiveStory }) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [viewerCount, setViewerCount] = useState(0);
  const progressInterval = useRef(null);
  const storyDuration = 5000; // 5 seconds per story
  const progressStep = 100 / (storyDuration / 100); // Progress increment per 100ms

  // Current story index in the stories array
  const currentStoryIndex = stories.findIndex(s => s._id === story._id);
  
  // Mark story as viewed when opened
  useEffect(() => {
    const markAsViewed = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (token) {
          await axios.post(`http://localhost:5000/api/stories/${story._id}/view`, {}, {
            headers: { 'x-auth-token': token }
          });
        }
      } catch (error) {
        console.error('Error marking story as viewed:', error);
      }
    };
    
    markAsViewed();
  }, [story._id]);

  // Fetch viewers when story changes and it's the current user's story
  useEffect(() => {
    const fetchViewers = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (token && story.user?._id === user?._id) {
          const response = await axios.get(`http://localhost:5000/api/stories/${story._id}/viewers`, {
            headers: { 'x-auth-token': token }
          });
          setViewers(response.data.viewers);
          setViewerCount(response.data.count);
        }
      } catch (error) {
        console.error('Error fetching story viewers:', error);
      }
    };

    fetchViewers();
  }, [story._id, story.user?._id]);
  
  useEffect(() => {
    // Reset progress when story changes
    setProgress(0);
    
    // Clear any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    // Start progress timer
    progressInterval.current = setInterval(() => {
      if (!isPaused && !showViewers) { // Pause when viewers modal is open
        setProgress(prevProgress => {
          const newProgress = prevProgress + progressStep;
          
          // If story completed
          if (newProgress >= 100) {
            clearInterval(progressInterval.current);
            
            // Move to next story if available
            if (currentStoryIndex < stories.length - 1) {
              setActiveStory(stories[currentStoryIndex + 1]);
            } else {
              // Close story viewer if it was the last story
              onClose();
            }
            return 0;
          }
          
          return newProgress;
        });
      }
    }, 100);
    
    // Cleanup on unmount
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [story, isPaused, stories, currentStoryIndex, setActiveStory, onClose, showViewers]);
  
  const handlePause = () => {
    setIsPaused(true);
  };
  
  const handleResume = () => {
    setIsPaused(false);
  };
  
  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setActiveStory(stories[currentStoryIndex - 1]);
    }
  };
  
  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setActiveStory(stories[currentStoryIndex + 1]);
    } else {
      onClose();
    }
  };

  const handleShowViewers = () => {
    setShowViewers(true);
    setIsPaused(true);
  };

  const handleCloseViewers = () => {
    setShowViewers(false);
    setIsPaused(false);
  };
  
  // Get the full URL for the story media
  const getFullMediaUrl = (path) => {
    // If the path is already a full URL, return it
    if (path.startsWith('http')) {
      return path;
    }
    
    // Otherwise, construct the full URL
    return `http://localhost:5000${path}`;
  };
  
  return (
    <div className="story-viewer">
      {/* Viewers Modal */}
      {showViewers && (
        <div className="viewers-modal">
          <div className="viewers-modal-content">
            <div className="viewers-modal-header">
              <h3>Viewers ({viewerCount})</h3>
              <button className="close-viewers" onClick={handleCloseViewers}>
                <CloseIcon />
              </button>
            </div>
            <div className="viewers-list">
              {viewers.length > 0 ? (
                viewers.map(viewer => (
                  <div key={viewer._id} className="viewer-item">
                    <Avatar 
                      src={viewer.profilePic ? `http://localhost:5000${viewer.profilePic}` : "/default-avatar.png"}
                      className="viewer-avatar"
                    />
                    <span className="viewer-username">{viewer.username}</span>
                  </div>
                ))
              ) : (
                <p className="no-viewers">No viewers yet</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="story-header">
        <div className="progress-container">
          {stories.map((s, index) => (
            <div 
              key={s._id} 
              className="progress-bar-container"
            >
              <div 
                className="progress-bar" 
                style={{ 
                  width: index === currentStoryIndex ? `${progress}%` : 
                         index < currentStoryIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>
        
        <div className="story-user-info">
          <Avatar src={story.user?.profilePic || "/default-avatar.png"} alt={story.user?.username || "User"} />
          <span className="username">{story.user?.username || "User"}</span>
          <span className="timestamp">{new Date(story.createdAt).toLocaleString()}</span>
        </div>
        
        <div className="close-button" onClick={onClose}>
          <CloseIcon />
        </div>
      </div>
      
      <div 
        className="story-content" 
        onMouseDown={handlePause}
        onMouseUp={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
      >
        <img src={getFullMediaUrl(story.media)} alt="Story" className="story-image" />
        {story.caption && <div className="story-caption">{story.caption}</div>}
        
        {/* Viewers button - only show for the current user's stories */}
        {story.user?._id === JSON.parse(localStorage.getItem('user'))?._id && (
          <div className="viewers-button" onClick={handleShowViewers}>
            <VisibilityIcon /> {viewerCount}
          </div>
        )}
        
        {currentStoryIndex > 0 && (
          <div className="nav-button prev" onClick={handlePrevStory}>
            <ArrowBackIosIcon />
          </div>
        )}
        
        {currentStoryIndex < stories.length - 1 && (
          <div className="nav-button next" onClick={handleNextStory}>
            <ArrowForwardIosIcon />
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;