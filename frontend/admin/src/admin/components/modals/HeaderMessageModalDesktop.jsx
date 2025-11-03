import Modal from '../Modal';
import HeaderMessageEditor from '../HeaderMessageEditor';

function HeaderMessageModalDesktop({ isOpen, onClose, settings, onSave }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💬 Header Message" maxWidth="650px">
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

export default HeaderMessageModalDesktop;
