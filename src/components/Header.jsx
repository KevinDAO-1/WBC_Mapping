import React from 'react';
import uiData from '../data/uiElements.json';

function Header() {
  const headerData = uiData.header;

  // Basic link component to handle internal/external links
  const LinkComponent = ({ data }) => {
    if (!data || !data.link) return null;
    const target = data.isExternal ? '_blank' : '_self';
    const rel = data.isExternal ? 'noopener noreferrer' : undefined;
    return (
      <a href={data.link} target={target} rel={rel} style={data.style}>
        {data.text}
      </a>
    );
  };

  return (
    <header style={headerData.style}>
      {/* Left side: Logo */}
      {headerData.logo && (
         <a href={headerData.logo.link} target={headerData.logo.isExternal ? '_blank' : '_self'} rel={headerData.logo.isExternal ? 'noopener noreferrer' : undefined}>
           <img 
             src={headerData.logo.imageUrl} 
             alt={headerData.logo.altText} 
             style={headerData.logo.style} 
           />
         </a>
      )}

      {/* Right side: Title (or Nav) */}
      {headerData.title && (
         <LinkComponent data={headerData.title} />
      )}
      
      {/* Add Navigation items here later if needed, reading from uiData.header.nav */}

    </header>
  );
}

export default Header;
