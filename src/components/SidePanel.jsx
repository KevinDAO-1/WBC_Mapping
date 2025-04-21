import React from 'react';
import { motion } from 'framer-motion'; 
import VideoPlayer from './VideoPlayer'; // Import the simplified VideoPlayer

// Placeholder icon for enlarge button
const EnlargeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15 3h6v6l-2-2-7 7-2-2 7-7-2-2zM9 21H3v-6l2 2 7-7 2 2-7 7 2 2z"/></svg>;

// Variants for the main content container (staggers children)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07 
    }
  }
};

// Variants for individual items 
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 }, 
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1, 
    transition: { 
      type: "spring", 
      damping: 15, 
      stiffness: 100,
    } 
  }
};

// Accept onEnlargeVideo callback prop
function SidePanel({ onClose, content, onEnlargeVideo }) { 
  
  const panelStyle = {
    width: '100%', 
    height: '100%',
    backgroundColor: '#FFFFFF', 
    color: '#000000', 
    padding: '25px 30px', 
    boxSizing: 'border-box',
    overflowY: 'auto', 
    position: 'relative', 
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '15px', 
    right: '15px',
    background: 'none',
    border: 'none',
    color: '#555555', 
    fontSize: '1.8rem', 
    cursor: 'pointer',
    zIndex: 1 
  };

  // --- Styles for Content Blocks ---
  const mainTitleStyle = {
    fontSize: '2.2rem', 
    fontWeight: 'bold',
    marginBottom: '20px', 
    color: '#111111', 
  };

   const chapterTitleStyle = {
     fontSize: '1.3rem', 
     fontWeight: 'bold',
     marginTop: '30px', 
     marginBottom: '15px', 
     color: '#333333',
  };
  
  const paragraphStyle = {
     fontSize: '1rem',
     lineHeight: '1.7', 
     marginBottom: '15px',
     color: '#444444', 
  };

  const quoteStyle = {
    fontSize: '1.1rem', 
    fontFamily: 'inherit', 
    fontStyle: 'italic',
    margin: '15px 0 15px 20px', 
    paddingLeft: '15px',
    borderLeft: '3px solid #DDDDDD', 
    color: '#555555', 
  };
  
  const highlightQuoteStyle = {
    fontSize: '1.6rem', 
    fontWeight: 'bold', 
    fontFamily: 'inherit', 
    fontStyle: 'normal', 
    margin: '15px 0 25px 0', 
    padding: '0', 
    borderLeft: 'none', 
    backgroundColor: 'transparent', 
    color: '#111111', 
    textAlign: 'center', 
  };

  const attributionStyle = {
     display: 'block',
     marginTop: '5px',
     fontSize: '0.9rem',
     textAlign: 'right',
     color: '#666666',
  };

  const imageStyle = {
     width: '100%',
     height: 'auto',
     borderRadius: '4px', 
     marginBottom: '15px',
  };

  // Style for the container holding the normal video and enlarge button
  const videoContainerStyle = {
      position: 'relative', // To position the button
      marginBottom: '20px',
  };

  const enlargeButtonStyle = {
    position: 'absolute',
    top: '8px', // Position inside top-right
    right: '8px',
    background: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 8px',
    cursor: 'pointer',
    zIndex: 2, 
  };

  // --- End Styles ---

  const renderContentBlock = (block, index) => {
    return (
       <motion.div key={index} variants={itemVariants}>
         {(() => {
           switch (block.type) {
             case 'paragraph':
               return <p style={paragraphStyle}>{block.text}</p>;
             case 'quote': 
               return (
                 <blockquote style={quoteStyle}>
                   {block.text}
                   {block.attribution && <cite style={attributionStyle}>- {block.attribution}</cite>}
                 </blockquote>
               );
             case 'image':
               if (!block.url) return null;
               return <img src={block.url} alt={block.alt || 'Chapter image'} style={imageStyle} />;
             case 'video': // Render placeholder or potentially small preview if needed
                if (!block.url) return null;
                // For now, just show a placeholder in chapters, main video is separate
                return <p style={{ fontStyle: 'italic', color: '#777' }}>[Chapter Video: {block.url}]</p>;
             default:
               return null;
           }
         })()}
       </motion.div>
     );
  };

  return (
    <div style={panelStyle}>
      <button style={closeButtonStyle} onClick={onClose}>&times;</button>
      {content ? (
        <motion.div 
          variants={containerVariants} 
          initial="hidden"
          animate="visible" 
          exit="hidden" 
        >
          <motion.h2 variants={itemVariants} style={mainTitleStyle}>{content.title}</motion.h2> 
          
          {content.highlightQuote && (
            <motion.p variants={itemVariants} style={highlightQuoteStyle}>
              “{content.highlightQuote}”
            </motion.p>
          )}

          {/* Main Video Player (Normal State) */}
          {content.mainVideoUrl && (
            // Add layoutId to the wrapper div
            <motion.div 
              layoutId={`video-player-${content.id || 'main'}`} // Unique layoutId based on content ID
              variants={itemVariants} 
              style={videoContainerStyle}
            >
              <VideoPlayer src={content.mainVideoUrl} />
              <button 
                onClick={() => onEnlargeVideo(content.mainVideoUrl)} 
                style={enlargeButtonStyle} 
                title="Enlarge Video"
              >
                <EnlargeIcon />
              </button>
            </motion.div>
          )}

          {content.chapters?.map((chapter, chapterIndex) => (
            <motion.div 
              key={chapterIndex} 
              variants={itemVariants} 
            >
              {chapter.title && <h3 style={chapterTitleStyle}>{chapter.title}</h3>} 
              
              {chapter.contentBlocks?.map((block, blockIndex) => 
                renderContentBlock(block, `${chapterIndex}-${blockIndex}`)
              )}
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p>Select a location on the map.</p> 
      )}
    </div>
  );
}

export default SidePanel;
