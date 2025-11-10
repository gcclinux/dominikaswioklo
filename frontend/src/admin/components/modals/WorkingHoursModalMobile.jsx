import Modal from '../Modal';
import WorkingHoursEditorMobile from '../WorkingHoursEditorMobile';
import { useAdminTranslation } from '../../utils/useAdminTranslation';

function WorkingHoursModalMobile({ isOpen, onClose, settings, onSave }) {
  const { t } = useAdminTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('workingHours.modalTitle')} maxWidth="100%">
      {settings && (
        <WorkingHoursEditorMobile
          startHour={settings.startHour}
          endHour={settings.endHour}
          includeWeekend={settings.includeWeekend}
          allow30Min={settings.allow30Min}
          onSave={onSave}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}

export default WorkingHoursModalMobile;
