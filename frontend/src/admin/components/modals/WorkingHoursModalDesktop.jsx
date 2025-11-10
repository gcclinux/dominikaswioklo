import Modal from '../Modal';
import WorkingHoursEditor from '../WorkingHoursEditor';
import { useAdminTranslation } from '../../utils/useAdminTranslation';

function WorkingHoursModalDesktop({ isOpen, onClose, settings, onSave }) {
  const { t } = useAdminTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('workingHours.modalTitle')} maxWidth="800px">
      {settings && (
        <WorkingHoursEditor
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

export default WorkingHoursModalDesktop;
