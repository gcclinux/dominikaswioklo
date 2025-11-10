import Modal from '../Modal';
import HeaderMessageEditor from '../HeaderMessageEditor';
import { useAdminTranslation } from '../../utils/useAdminTranslation';

function HeaderMessageModalDesktop({ isOpen, onClose, settings, onSave }) {
  const { t } = useAdminTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('headerMessage.modalTitle')} maxWidth="650px" closeOnOverlayClick={false}>
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
