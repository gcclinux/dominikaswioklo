import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAdminTranslation } from '../utils/useAdminTranslation';

function NewsletterModal({ isOpen, onClose, onSave, draftData }) {
  const { t } = useAdminTranslation();
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
      alert(t('newsletterModal.errors.required'));
      return;
    }
    onSave(formData);
    setFormData({ title: '', subtitle: '', message_part1: '', message_part2: '' });
  };

  return (
  <Modal isOpen={isOpen} onClose={onClose} title={t('newsletterModal.modalTitle')} maxWidth="700px" closeOnOverlayClick={false}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            {t('newsletterModal.title')} <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder={t('newsletterModal.placeholders.title')}
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
            {t('newsletterModal.subtitle')}
          </label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            placeholder={t('newsletterModal.placeholders.subtitle')}
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
            {t('newsletterModal.messagePart1')} <span style={{ color: 'red' }}>*</span>
          </label>
          <textarea
            name="message_part1"
            value={formData.message_part1}
            onChange={handleChange}
            placeholder={t('newsletterModal.placeholders.messagePart1')}
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
            {t('newsletterModal.messagePart2')}
          </label>
          <textarea
            name="message_part2"
            value={formData.message_part2}
            onChange={handleChange}
            placeholder={t('newsletterModal.placeholders.messagePart2')}
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
            {t('newsletterModal.buttons.cancel')}
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
            {t('newsletterModal.buttons.saveDraft')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default NewsletterModal;
