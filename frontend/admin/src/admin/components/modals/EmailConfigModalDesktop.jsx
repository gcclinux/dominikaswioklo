import Modal from '../Modal';
import EmailSettingsEditor from '../EmailSettingsEditor';

function EmailConfigModalDesktop({ isOpen, onClose, emailSettings, onSave }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📧 Email Configuration" maxWidth="800px" closeOnOverlayClick={false}>
      {emailSettings ? (
        <EmailSettingsEditor
          settings={emailSettings}
          onSave={onSave}
          onCancel={onClose}
        />
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p>Loading email settings...</p>
        </div>
      )}
    </Modal>
  );
}

export default EmailConfigModalDesktop;
