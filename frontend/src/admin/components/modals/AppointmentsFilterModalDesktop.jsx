import Modal from '../Modal';
import AppointmentsFilterEditor from '../AppointmentsFilterEditor';
import { useAdminTranslation } from '../../utils/useAdminTranslation';

function AppointmentsFilterModalDesktop({ isOpen, onClose, settings, onSave }) {
  const { t } = useAdminTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('appointmentsFilter.modalTitleDesktop')} maxWidth="600px">
      {settings && (
        <AppointmentsFilterEditor
          pastDays={settings.pastAppointmentsDays}
          futureDays={settings.futureAppointmentsDays}
          onSave={onSave}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}

export default AppointmentsFilterModalDesktop;
