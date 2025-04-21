import React, { useRef, useEffect } from 'react';

// Simplified Video Player - Animation and state handled by parent using layoutId
function VideoPlayer({ src, style = {}, className = "", showControls = true, autoPlay = false }) { // Added autoPlay prop
  const videoRef = useRef(null);

  if (!src) {
    return null; 
  }

  // Basic style, can be overridden by props
  const defaultStyle = {
    display: 'block',
    width: '100%',
    height: 'auto',
    borderRadius: '4px',
    marginBottom: '20px', // Keep default margin
    ...style, // Allow parent to pass styles
  };

  return (
    // No motion.div here anymore
    <video
      ref={videoRef}
      key={src} 
      className={className}
      controls={showControls} 
      preload="metadata" 
      style={defaultStyle}
      autoPlay={autoPlay} // Apply autoPlay prop
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

export default VideoPlayer;
