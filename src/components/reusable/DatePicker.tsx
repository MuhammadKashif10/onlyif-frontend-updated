'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  placeholder?: string;
}

export default function DatePicker({
  selectedDate,
  onDateChange,
  minDate = new Date(),
  maxDate,
  className = "",
  placeholder = "Select a date"
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAvailableDates = () => {
    const dates = [];
    const currentDate = new Date(minDate);
    const endDate = maxDate || new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const availableDates = getAvailableDates();

  return (
    <div className={`relative ${className}`}>
      {/* Date Input */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left"
      >
        {selectedDate ? formatDate(selectedDate) : placeholder}
        <Calendar className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2" color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
      </button>

      {/* Date Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 mb-2 px-2">Available Dates</div>
            {availableDates.map((date) => (
              <button
                key={date.toISOString()}
                onClick={() => {
                  onDateChange(date);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                  selectedDate && selectedDate.toDateString() === date.toDateString()
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700'
                }`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close picker */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 