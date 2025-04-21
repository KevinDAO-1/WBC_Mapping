import React, { useEffect, useRef, useState, useCallback } from 'react';

// --- YouTube API Loader Hook ---
// Ensures the YouTube IFrame Player API script is loaded only once.
let apiLoaded = false;
let loadingPromise = null;
const loadYouTubeAPI = () => {
  if (apiLoaded) {
    return Promise.resolve(window.YT);
  }
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onload = () => {
      // The API will call window.onYouTubeIframeAPIReady() when ready.
      // We need to ensure YT is available before resolving.
      const checkYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkYT);
          apiLoaded = true;
          loadingPromise = null;
          console.log("YouTube IFrame API loaded.");
          resolve(window.YT);
        }
      }, 100);
    };
    script.onerror = (error) => {
      console.error("Failed to load YouTube API script:", error);
      loadingPromise = null;
      reject(error);
    };
    document.body.appendChild(script);
  });

  return loadingPromise;
};
// --- End YouTube API Loader Hook ---


// Helper function to extract YouTube Video ID from various URL formats
function getYouTubeId(url) {
  if (!url) return null;
  // Regular expression to cover various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// --- Constants ---
const PLAYER_CONTAINER_ID_PREFIX = 'youtube-player-container-';

// --- Component ---
function VideoPlayer({ 
  src, 
  style = {}, 
  className = "", 
  // Control props managed by parent (App.jsx)
  isPlaying = false, 
  initialTime = 0, 
  onTimeUpdate = () => {}, // Callback to report current time
  onPlayPause = () => {}, // Callback to report play/pause state changes
  // Original props (showControls handled by YouTube player itself)
  autoPlay = false, // Note: autoplay policy might block this initially
}) {
  
  const youtubeId = getYouTubeId(src);
  const playerRef = useRef(null); // Ref to store the YT.Player instance
  const intervalRef = useRef(null); // Ref for the time update interval
  const [isApiReady, setIsApiReady] = useState(apiLoaded); // Track if YT API is loaded
  const [uniqueId] = useState(() => PLAYER_CONTAINER_ID_PREFIX + Math.random().toString(36).substring(7)); // Unique ID for the iframe container

  // --- Load YouTube API ---
  useEffect(() => {
    if (!apiLoaded) {
      loadYouTubeAPI().then(() => setIsApiReady(true)).catch(err => console.error("YT API Load Error in component:", err));
    }
  }, []);

  // --- Initialize Player ---
  const initializePlayer = useCallback(() => {
    if (!isApiReady || !youtubeId || playerRef.current) {
      // console.log("Player init skipped:", { isApiReady, youtubeId, playerExists: !!playerRef.current });
      return; // Don't initialize if API not ready, no ID, or player already exists
    }
    console.log(`Initializing YT Player for ID: ${youtubeId} in container: ${uniqueId}`);
    
    const player = new window.YT.Player(uniqueId, {
      videoId: youtubeId,
      playerVars: {
        'playsinline': 1, // Important for mobile
        'autoplay': autoPlay ? 1 : 0,
        'controls': 1, // Show standard YouTube controls
        'start': Math.round(initialTime), // Set initial start time
        // Add other vars as needed: 'modestbranding', 'rel', etc.
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange,
        'onError': onPlayerError
      }
    });
    playerRef.current = player;

  }, [isApiReady, youtubeId, uniqueId, autoPlay, initialTime]); // Dependencies for initialization

  // --- Effect to Initialize Player when API is Ready ---
  useEffect(() => {
    // The global onYouTubeIframeAPIReady might be called before this component mounts,
    // or the API might already be loaded. We trigger init when isApiReady becomes true.
    if (isApiReady) {
      // If the global callback hasn't run yet, define it
      if (!window.onYouTubeIframeAPIReady) {
        console.log("Defining global onYouTubeIframeAPIReady");
        window.onYouTubeIframeAPIReady = () => {
          console.log("Global onYouTubeIframeAPIReady called.");
          // Potentially initialize players that mounted before API was ready
          // For simplicity here, we rely on the isApiReady state change
        };
      }
      // Attempt initialization
      initializePlayer();
    }
  }, [isApiReady, initializePlayer]);


  // --- Player Event Handlers ---
  const onPlayerReady = useCallback((event) => {
    console.log(`Player ready: ${youtubeId}`);
    // Player is ready, now apply the desired playing state from props
    if (isPlaying) {
      event.target.playVideo();
    } else {
      event.target.pauseVideo();
    }
    // Seek again if needed, as start time might not be exact
    // Seek to initialTime *only* when the player is ready
    // This ensures seek happens after potential autoplay or start parameter
    if (initialTime > 0) {
       console.log(`Player ready, seeking player ${youtubeId} to: ${initialTime}`);
       event.target.seekTo(initialTime, true); 
    }
  }, [isPlaying, initialTime, youtubeId]); // Keep dependencies

  const onPlayerStateChange = useCallback((event) => {
    const state = event.data;
    console.log(`Player state changed: ${state} for ${youtubeId}`);
    
    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (state === window.YT.PlayerState.PLAYING) {
      onPlayPause(true); // Report playing state up
      // Start interval to report time updates
      intervalRef.current = setInterval(() => {
        if (playerRef.current) {
          const currentTime = playerRef.current.getCurrentTime();
          // console.log(`Time update: ${currentTime}`);
          onTimeUpdate(currentTime);
        }
      }, 500); // Report time every 500ms
    } else if (state === window.YT.PlayerState.PAUSED) {
      onPlayPause(false); // Report paused state up
    } else if (state === window.YT.PlayerState.ENDED) {
      onPlayPause(false); // Report ended as paused
      onTimeUpdate(0); // Reset time on end? Or report duration? TBD
    }
    // Other states: BUFFERING, CUED, UNSTARTED
  }, [onPlayPause, onTimeUpdate, youtubeId]);

  const onPlayerError = useCallback((event) => {
    console.error(`YouTube Player Error (${youtubeId}):`, event.data);
  }, [youtubeId]);

  // --- Effect to Control Play/Pause from Props ---
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      // console.log(`Controlling player ${youtubeId}: isPlaying prop = ${isPlaying}`);
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, youtubeId]); // Depend only on isPlaying and youtubeId

  // --- Effect to Seek from Props (e.g., when shrinking back) ---
   // Remove the separate useEffect for seeking, as it's now handled in onPlayerReady
   /*
   useEffect(() => {
    // ... removed seek logic ...
   }, [initialTime, youtubeId]); 
   */

  // --- Cleanup ---
  useEffect(() => {
    // Return cleanup function
    return () => {
      console.log(`Cleaning up player: ${youtubeId}`);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Check if player instance exists and has destroy method before calling
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
          console.log(`Player ${youtubeId} destroyed.`);
        } catch (error) {
          console.error(`Error destroying player ${youtubeId}:`, error);
        }
      }
      playerRef.current = null;
    };
  }, [youtubeId, uniqueId]); // Ensure cleanup runs if ID changes


  // --- Render Logic ---
  // Basic style, restore aspect ratio for self-sizing.
  const defaultStyle = {
    display: 'block',
    width: '100%', // Take full width
    // height: '100%', // Remove height, let aspect ratio determine it
    aspectRatio: '16 / 9', // Restore aspect ratio here
    border: 'none',
    borderRadius: '4px',
    // marginBottom: '20px', // Remove default margin
    ...style, // Allow overriding, e.g., App.jsx might set marginBottom: 0
  };

  if (youtubeId) {
    // Render a container div for the YouTube API to target
    return (
      <div 
        id={uniqueId} 
        key={uniqueId} // Use uniqueId as key
        className={className} 
        style={defaultStyle}
      >
        {/* The iframe will be created here by the YouTube API */}
      </div>
    );
  } else {
    // Fallback for non-YouTube URLs (keep original logic)
    console.warn("VideoPlayer received non-YouTube src:", src);
    return (
      <video
        key={src}
        className={className}
        controls={true} // Always show controls for non-YT
        preload="metadata"
        style={defaultStyle}
        autoPlay={autoPlay}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag or this video format.
      </video>
    );
  }
}

export default VideoPlayer;
