import React from 'react';
import uiData from '../data/uiElements.json';

function Footer() {
  const footerData = uiData.footer;

  // Basic link component (could be shared in a utils file later)
  const LinkComponent = ({ data }) => {
    if (!data || !data.url) return null;
    const target = data.isExternal ? '_blank' : '_self';
    const rel = data.isExternal ? 'noopener noreferrer' : undefined;
    return (
      <a href={data.url} target={target} rel={rel} style={data.style}>
        {data.text}
      </a>
    );
  };

  return (
    <footer style={footerData.style}>
      {footerData.copyright && (
        <span style={footerData.copyright.style}>
          {footerData.copyright.text}
        </span>
      )}
      {footerData.links && footerData.links.map(link => (
        <LinkComponent key={link.id} data={link} />
      ))}
    </footer>
  );
}

export default Footer;
