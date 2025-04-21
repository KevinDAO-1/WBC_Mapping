import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BabylonCanvas from './components/MapCanvas';
import SidePanel from './components/SidePanel';
import Header from './components/Header';
import Footer from './components/Footer';
import VideoPlayer from './components/VideoPlayer'; 
import allContentData from './data/contentData.json'; 

const ShrinkIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 15h6v6l-2-2 7-7 2-2-7 7-2-2zm18-6V3h-6l2 2-7 7-2-2 7-7 2 2z"/></svg>;

const panelVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0, opacity: 1,
    transition: { type: "tween", duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }
  },
  exit: {
    x: "100%", opacity: 0,
    transition: { type: "tween", duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }
  }
};

const videoTransition = {
  duration: 0.4, 
  ease: [0.25, 0.1, 0.25, 1.0] 
};

function App() {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [panelContent, setPanelContent] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [enlargedVideoSrc, setEnlargedVideoSrc] = useState(null);
  
  // --- Add state for video playback ---
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);
  // --- End video state ---

  const handleLocationSelect = useCallback((locationId) => {
    const content = allContentData[locationId]; 
    if (content) {
      setPanelContent(content);
      setIsPanelVisible(true);
      setIsPanelOpen(true);
      setEnlargedVideoSrc(null);
      // Reset video state when selecting a new location
      setVideoCurrentTime(0);
      setVideoIsPlaying(false);
    } else {
      console.warn(`Content not found for location ID: ${locationId}`);
      setPanelContent(null); 
      setIsPanelVisible(false);
      setIsPanelOpen(false);
      setEnlargedVideoSrc(null);
      // Reset video state
      setVideoCurrentTime(0);
      setVideoIsPlaying(false);
    }
  }, []);

  const handlePanelClose = useCallback(() => {
    setIsPanelVisible(false);
    setTimeout(() => setPanelContent(null), 400);
    setIsPanelOpen(false);
    setEnlargedVideoSrc(null);
    // Reset video state on close
    setVideoCurrentTime(0);
    setVideoIsPlaying(false);
  }, []);

  // --- Video State Handlers ---
  const handleVideoTimeUpdate = useCallback((time) => {
    // console.log("App received time update:", time);
    setVideoCurrentTime(time);
  }, []);

  const handleVideoPlayPause = useCallback((playing) => {
     // console.log("App received play/pause:", playing);
    setVideoIsPlaying(playing);
  }, []);
  // --- End Video State Handlers ---


  const handleEnlargeVideo = useCallback((src) => {
    // When enlarging, ensure the enlarged player starts playing
    setVideoIsPlaying(true); 
    setEnlargedVideoSrc(src);
  }, []);

  const handleShrinkVideo = useCallback(() => {
    // When shrinking, ensure the small player (when it reappears) starts paused
    // The time state (videoCurrentTime) is already preserved
    setVideoIsPlaying(false); 
    setEnlargedVideoSrc(null);
  }, []);

  const panelWidth = '35%';
  const translationAmount = `calc(-${panelWidth} / 2)`; 

  const canvasContainerStyle = {
    position: 'absolute', left: 0, top: 0, height: '100vh', width: '100vw', 
    transform: isPanelOpen ? `translateX(${translationAmount})` : 'translateX(0)', 
    transition: 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1.0)', 
  };

  const footerContainerStyle = {
    position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 900, 
    transform: isPanelOpen ? `translateX(${translationAmount})` : 'translateX(0)', 
    transition: 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1.0)', 
  };

  // Style for the container that holds and centers the enlarged video within the map area
  const enlargedVideoWrapperStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: isPanelOpen ? panelWidth : '0', // Define right boundary instead of width
      // width: isPanelOpen ? `calc(100vw - ${panelWidth})` : '100vw', // Remove explicit width
      bottom: 0,
      display: 'flex', // Use flexbox for centering again
      alignItems: 'center',
      justifyContent: 'center',
      // position: 'relative', // Not needed for flex centering
      zIndex: 1150,
      pointerEvents: 'none',
      transition: 'right 0.5s cubic-bezier(0.25, 0.1, 0.25, 1.0)', // Transition right boundary
  };

  // Style for the enlarged video motion.div itself - Define size/ratio, remove absolute positioning
  const enlargedVideoMotionStyle = {
      // position: 'absolute', // Remove absolute positioning
      // top: '50%',
      // left: '50%',
      // transform: 'translate(-50%, -50%)',
      width: '90%', // Keep 90% width relative to the flex container
      maxWidth: '1200px',
      aspectRatio: '16 / 9',
      position: 'relative', // Add back relative positioning for the button
      zIndex: 1200,
      backgroundColor: 'rgba(255, 0, 0, 0.2)', // Add temporary background for debugging
      // boxShadow: '0px 10px 30px rgba(0,0,0,0.5)', // Keep shadow removed
      borderRadius: '8px',
      // overflow: 'hidden', // Keep overflow hidden removed for now
      pointerEvents: 'auto',
  };

   const shrinkButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 8px',
    cursor: 'pointer',
    zIndex: 2000, // Increase zIndex significantly
  };


  return (
    <div className="App" style={{ position: 'relative', overflow: 'hidden', width: '100vw', height: '100vh' }}>
      <Header /> 
      
      <div style={canvasContainerStyle}>
        <BabylonCanvas onLocationSelect={handleLocationSelect} />
      </div>

      <AnimatePresence>
        {/* Side Panel Animation */}
        {isPanelVisible && (
          <motion.div
            key="side-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: 'fixed', top: 0, right: 0, height: '100vh', 
              width: panelWidth, zIndex: 1000,
            }}
          >
            <SidePanel
              onClose={handlePanelClose}
              content={panelContent}
              onEnlargeVideo={handleEnlargeVideo}
              isEnlarged={!!enlargedVideoSrc}
              // Pass video state and handlers down
              videoIsPlaying={videoIsPlaying}
              videoCurrentTime={videoCurrentTime}
              onVideoTimeUpdate={handleVideoTimeUpdate}
              onVideoPlayPause={handleVideoPlayPause}
            />
          </motion.div>
        )}

        {/* Enlarged Video Animation */}
        {enlargedVideoSrc && (
          // Use the wrapper for positioning and centering
          <div style={enlargedVideoWrapperStyle}> 
            <motion.div
              key="enlarged-video" 
              layoutId={`video-player-${panelContent?.id || 'main'}`} 
              style={enlargedVideoMotionStyle} 
              transition={videoTransition}
            >
              {/* Pass state and handlers to enlarged player */}
              <VideoPlayer 
                src={enlargedVideoSrc} 
                isPlaying={videoIsPlaying} // Control playing state
                initialTime={videoCurrentTime} // Set start time
                onTimeUpdate={handleVideoTimeUpdate} // Report time back
                onPlayPause={handleVideoPlayPause} // Report play/pause back
                autoPlay={true} // Attempt autoplay (might be blocked)
                // Pass explicit style to override default aspectRatio and fill parent motion.div
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  aspectRatio: 'unset', // Override internal aspect ratio
                  marginBottom: 0 
                }} 
              />
              <button onClick={handleShrinkVideo} style={shrinkButtonStyle} title="Shrink Video">
                <ShrinkIcon />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div style={footerContainerStyle}>
         <Footer /> 
      </div>
    </div>
  );
}

export default App;
