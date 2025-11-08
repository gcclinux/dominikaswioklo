import React from 'react';
import Modal from './Modal';
import { useAdminTranslation } from '../utils/useAdminTranslation';

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  const { t } = useAdminTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="450px" closeOnOverlayClick={false}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <p style={{ fontSize: '1rem', lineHeight: '1.6', margin: 0, color: '#555' }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            {t('common.no')}
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#16A085',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            {t('confirmDialog.confirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
