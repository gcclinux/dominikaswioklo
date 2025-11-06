import React, { useState, useEffect } from 'react';
import Modal from './Modal';

function NewsletterModal({ isOpen, onClose, onSave, draftData }) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    message_part1: '',
    message_part2: ''
  });

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

  return (
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
            Cancel
          </button>
          <button
            onClick={handleSubmit}
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
            Save Draft
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default NewsletterModal;
