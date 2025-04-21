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

  const handleLocationSelect = useCallback((locationId) => {
    const content = allContentData[locationId]; 
    if (content) {
      setPanelContent(content);
      setIsPanelVisible(true);
      setIsPanelOpen(true);
      setEnlargedVideoSrc(null); 
    } else {
      console.warn(`Content not found for location ID: ${locationId}`);
      setPanelContent(null); 
      setIsPanelVisible(false); 
      setIsPanelOpen(false);
      setEnlargedVideoSrc(null);
    }
  }, []); 

  const handlePanelClose = useCallback(() => {
    setIsPanelVisible(false);
    setTimeout(() => setPanelContent(null), 400); 
    setIsPanelOpen(false);
    setEnlargedVideoSrc(null); 
  }, []);

  const handleEnlargeVideo = useCallback((src) => {
    setEnlargedVideoSrc(src);
  }, []);

  const handleShrinkVideo = useCallback(() => {
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

  // Style for the container that holds and centers the enlarged video
  const enlargedVideoWrapperStyle = {
      position: 'fixed',
      top: 0,
      // Adjust left to center the 85vw video in the full viewport
      left: '7.5vw', // (100vw - 85vw) / 2 = 7.5vw 
      width: '85vw', // Cover most of the viewport width
      height: '100vh',
      display: 'flex',
      alignItems: 'center', // Vertical centering
      justifyContent: 'center', // Horizontal centering (of the motion div inside)
      zIndex: 1150, 
      pointerEvents: 'none', 
  };

  // Style for the enlarged video motion.div itself
  const enlargedVideoMotionStyle = {
      width: '100%', // Take full width of the wrapper (which is 85vw)
      position: 'relative', 
      zIndex: 1200, 
      boxShadow: '0px 10px 30px rgba(0,0,0,0.5)', 
      borderRadius: '8px', 
      overflow: 'hidden',
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
    zIndex: 1300, 
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
              {/* Pass autoPlay prop */}
              <VideoPlayer src={enlargedVideoSrc} showControls={true} autoPlay={true} /> 
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
