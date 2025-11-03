import React, { useEffect } from 'react';
import './Modal.css';

function Modal({ isOpen, onClose, title, children, maxWidth = '500px', maxHeight = '90vh', closeOnOverlayClick = true, headerContent, showCloseButton = true }) {
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const isMobile = window.innerWidth <= 768;
  const modalStyle = isMobile 
    ? { maxWidth: 'calc(100vw - 1rem)', maxHeight } 
    : { maxWidth, maxHeight };

  return (
    <div className="modal-overlay" onClick={closeOnOverlayClick ? onClose : undefined}>
  <div className="modal-content" style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <div className="modal-header-right">
            {headerContent && <div className="modal-header-content">{headerContent}</div>}
            {showCloseButton && <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>}
          </div>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
