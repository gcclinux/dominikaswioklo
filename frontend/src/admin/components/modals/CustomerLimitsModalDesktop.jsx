import Modal from '../Modal';
import CustomerLimitsEditor from '../CustomerLimitsEditor';
import { useAdminTranslation } from '../../utils/useAdminTranslation';

function CustomerLimitsModalDesktop({ isOpen, onClose, settings, onSave }) {
  const { t } = useAdminTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('customerLimits.modalTitleDesktop')} maxWidth="800px">
      {settings && (
        <CustomerLimitsEditor
          maxApp={settings.maxApp}
          maxAppWeek={settings.maxAppWeek}
          onSave={onSave}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}

export default CustomerLimitsModalDesktop;
