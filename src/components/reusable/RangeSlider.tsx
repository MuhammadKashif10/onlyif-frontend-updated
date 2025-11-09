'use client';
import { useState, useEffect, useRef } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  label: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export default function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  formatValue = (val) => val.toString(),
  className = ""
}: RangeSliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100;
  };

  const getValueFromPercentage = (percentage: number) => {
    return Math.round((percentage / 100) * (max - min) + min);
  };

  const handleMouseDown = (e: React.MouseEvent, handle: 'min' | 'max') => {
    e.preventDefault();
    setIsDragging(handle);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const newValue = getValueFromPercentage(percentage);

    if (isDragging === 'min') {
      const newMin = Math.min(newValue, value[1] - step);
      onChange([newMin, value[1]]);
    } else {
      const newMax = Math.max(newValue, value[0] + step);
      onChange([value[0], newMax]);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, value]);

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="text-sm text-gray-600">
          {formatValue(value[0])} - {formatValue(value[1])}
        </div>
      </div>
      
      <div
        ref={sliderRef}
        className="relative h-6 bg-gray-200 rounded-full cursor-pointer"
        onMouseDown={(e) => {
          const rect = sliderRef.current?.getBoundingClientRect();
          if (!rect) return;
          
          const percentage = ((e.clientX - rect.left) / rect.width) * 100;
          const newValue = getValueFromPercentage(percentage);
          
          if (Math.abs(newValue - value[0]) < Math.abs(newValue - value[1])) {
            handleMouseDown(e, 'min');
          } else {
            handleMouseDown(e, 'max');
          }
        }}
      >
        {/* Track fill */}
        <div
          className="absolute h-2 bg-blue-500 rounded-full top-2"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`
          }}
        />
        
        {/* Min handle */}
        <div
          className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg top-0 cursor-pointer hover:scale-110 transition-transform"
          style={{ left: `calc(${minPercentage}% - 12px)` }}
          onMouseDown={(e) => handleMouseDown(e, 'min')}
        />
        
        {/* Max handle */}
        <div
          className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg top-0 cursor-pointer hover:scale-110 transition-transform"
          style={{ left: `calc(${maxPercentage}% - 12px)` }}
          onMouseDown={(e) => handleMouseDown(e, 'max')}
        />
      </div>
    </div>
  );
} 