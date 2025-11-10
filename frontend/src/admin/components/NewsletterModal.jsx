import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';

function NewsletterModal({ isOpen, onClose, onSave, onSubmit, draftData, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    message_part1: '',
    message_part2: ''
  });
  const [showSendConfirm, setShowSendConfirm] = useState(false);

  // Update form data when draftData prop changes
  useEffect(() => {
    if (draftData) {
      setFormData({
        title: draftData.title || '',
        subtitle: draftData.subtitle || '',
        message_part1: draftData.message_part1 || '',
        message_part2: draftData.message_part2 || ''
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        message_part1: '',
        message_part2: ''
      });
    }
  }, [draftData, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.message_part1) {
      alert('Title and Message Part 1 are required');
      return;
    }
    onSave(formData);
    setFormData({ title: '', subtitle: '', message_part1: '', message_part2: '' });
  };

  const handleSendNewsletter = () => {
    if (!formData.title || !formData.message_part1) {
      alert('Title and Message Part 1 are required');
      return;
    }
    setShowSendConfirm(true);
  };

  const handleConfirmSend = () => {
    setShowSendConfirm(false);
    onSubmit(formData, draftData?.id);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="📰 Create Newsletter" maxWidth="700px" closeOnOverlayClick={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Title <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Newsletter title"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Subtitle
          </label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            placeholder="Newsletter subtitle"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Message Part 1 <span style={{ color: 'red' }}>*</span>
          </label>
          <textarea
            name="message_part1"
            value={formData.message_part1}
            onChange={handleChange}
            placeholder="First part of the message"
            rows="5"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Message Part 2
          </label>
          <textarea
            name="message_part2"
            value={formData.message_part2}
            onChange={handleChange}
            placeholder="Second part of the message"
            rows="5"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#16A085',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            Save Draft
          </button>
          <button
            onClick={handleSendNewsletter}
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              background: isSubmitting ? '#95a5a6' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isSubmitting ? (
              <>
                <span style={{ 
                  display: 'inline-block', 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid #fff', 
                  borderTopColor: 'transparent', 
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Sending...
              </>
            ) : (
              <>📧 Submit & Send</>
            )}
          </button>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </Modal>

      <ConfirmDialog
        isOpen={showSendConfirm}
        onClose={() => setShowSendConfirm(false)}
        onConfirm={handleConfirmSend}
        title="⚠️ Send Newsletter"
        message="Are you sure you want to send this newsletter to all users? This action cannot be undone."
        confirmText="Yes, Send Newsletter"
        cancelText="Cancel"
        confirmColor="#3498db"
        isDanger={false}
      />
    </>
  );
}

export default NewsletterModal;
