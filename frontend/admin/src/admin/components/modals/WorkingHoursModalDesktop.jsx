import Modal from '../Modal';
import WorkingHoursEditor from '../WorkingHoursEditor';

function WorkingHoursModalDesktop({ isOpen, onClose, settings, onSave }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🕐 Working Hours" maxWidth="800px">
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
