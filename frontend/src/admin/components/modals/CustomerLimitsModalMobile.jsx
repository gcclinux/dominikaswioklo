import Modal from '../Modal';
import CustomerLimitsEditorMobile from '../CustomerLimitsEditorMobile';
import { useAdminTranslation } from '../../utils/useAdminTranslation';

function CustomerLimitsModalMobile({ isOpen, onClose, settings, onSave }) {
  const { t } = useAdminTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('customerLimits.modalTitleMobile')} maxWidth="100%">
      {settings && (
        <CustomerLimitsEditorMobile
          maxApp={settings.maxApp}
          maxAppWeek={settings.maxAppWeek}
          onSave={onSave}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}

export default CustomerLimitsModalMobile;
