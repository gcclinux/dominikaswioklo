import React from 'react';

const BrandingFooter = ({ style = {}, isPremium = false }) => {
  // Don't render anything if premium
  if (isPremium) {
    return null;
  }

  return (
    <div style={{
      textAlign: 'center',
      padding: '1rem',
      fontSize: '0.85rem',
      color: 'white',
      fontWeight: '500',
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
      marginTop: 'auto',
      ...style
    }}>
      Powered by{' '}
      <a
        href="https://github.com/gcclinux/EasyScheduler"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 600,
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
        }}
      >
        EasyScheduler
      </a>
    </div>
  );
};

export default BrandingFooter;
