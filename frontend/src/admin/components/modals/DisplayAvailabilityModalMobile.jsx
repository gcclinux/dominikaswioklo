import Modal from '../Modal';
import DisplayAvailabilityEditorMobile from '../DisplayAvailabilityEditorMobile';
import { useAdminTranslation } from '../../utils/useAdminTranslation';

function DisplayAvailabilityModalMobile({ isOpen, onClose, settings, onSave }) {
  const { t } = useAdminTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('displayAvailability.modalTitleMobile')} maxWidth="100%">
      {settings && (
        <DisplayAvailabilityEditorMobile
          currentValue={settings.displayAvailability}
          onSave={onSave}
          onCancel={onClose}
          min={1}
          max={52}
        />
      )}
    </Modal>
  );
}

export default DisplayAvailabilityModalMobile;
