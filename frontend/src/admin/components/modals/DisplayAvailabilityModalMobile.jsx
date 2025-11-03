import Modal from '../Modal';
import DisplayAvailabilityEditorMobile from '../DisplayAvailabilityEditorMobile';

function DisplayAvailabilityModalMobile({ isOpen, onClose, settings, onSave }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📅 Availability" maxWidth="100%">
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
