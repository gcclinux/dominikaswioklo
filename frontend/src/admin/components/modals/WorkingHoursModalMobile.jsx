import Modal from '../Modal';
import WorkingHoursEditorMobile from '../WorkingHoursEditorMobile';

function WorkingHoursModalMobile({ isOpen, onClose, settings, onSave }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🕐 Working Hours" maxWidth="100%">
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
