import Modal from '../Modal';
import NumberSettingEditor from '../NumberSettingEditor';

function DisplayAvailabilityModalDesktop({ isOpen, onClose, settings, onSave }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📅 Display Availability" maxWidth="650px">
      {settings && (
        <NumberSettingEditor
          currentValue={settings.displayAvailability}
          onSave={onSave}
          onCancel={onClose}
          min={1}
          max={52}
          step={1}
          label="Weeks Ahead"
          recommendedRange="1-8 weeks"
          helpText="Number of weeks ahead customers will see available slots on the booking calendar. Increasing shows more future slots but may be overwhelming."
          previewText={(value) => value === 1 ? `Customers will see availability for the next week only.` : `Customers will see availability for the next ${value} weeks.`}
        />
      )}
    </Modal>
  );
}

export default DisplayAvailabilityModalDesktop;
