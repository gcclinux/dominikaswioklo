import Modal from '../Modal';
import HeaderMessageEditor from '../HeaderMessageEditor';

function HeaderMessageModalMobile({ isOpen, onClose, settings, onSave }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💬 Header Message" maxWidth="100%" closeOnOverlayClick={false}>
      {settings && (
        <HeaderMessageEditor
          currentValue={settings.headerMessage}
          onSave={onSave}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}

export default HeaderMessageModalMobile;
