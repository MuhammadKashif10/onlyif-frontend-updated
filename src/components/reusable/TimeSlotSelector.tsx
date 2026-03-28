'use client';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface TimeSlotSelectorProps {
  selectedSlot: string | null;
  onSlotSelect: (slotId: string) => void;
  date: Date | null;
  className?: string;
}

export default function TimeSlotSelector({
  selectedSlot,
  onSlotSelect,
  date,
  className = ""
}: TimeSlotSelectorProps) {
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 17; hour++) {
      const time = `${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`;
      slots.push({
        id: `slot-${hour}`,
        time,
        available: Math.random() > 0.3
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  if (!date) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">Please select a date first</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Available Time Slots for {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {timeSlots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => slot.available && onSlotSelect(slot.id)}
            disabled={!slot.available}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              selectedSlot === slot.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : slot.available
                ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="text-sm font-medium">{slot.time}</div>
            {!slot.available && (
              <div className="text-xs mt-1">Unavailable</div>
            )}
          </button>
        ))}
      </div>

      {selectedSlot && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Selected:</span> {timeSlots.find(s => s.id === selectedSlot)?.time}
          </p>
        </div>
      )}
    </div>
  );
} 