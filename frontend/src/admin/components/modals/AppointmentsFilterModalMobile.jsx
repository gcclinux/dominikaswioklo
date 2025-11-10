import Modal from '../Modal';
import AppointmentsFilterEditorMobile from '../AppointmentsFilterEditorMobile';
import { useAdminTranslation } from '../../utils/useAdminTranslation';

function AppointmentsFilterModalMobile({ isOpen, onClose, settings, onSave }) {
  const { t } = useAdminTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('appointmentsFilter.modalTitleMobile')} maxWidth="100%">
      {settings && (
        <AppointmentsFilterEditorMobile
          pastDays={settings.pastAppointmentsDays}
          futureDays={settings.futureAppointmentsDays}
          onSave={onSave}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}

export default AppointmentsFilterModalMobile;
