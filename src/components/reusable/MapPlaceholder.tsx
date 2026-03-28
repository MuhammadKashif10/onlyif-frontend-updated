import { MapPin, LayoutGrid, Plus, Minus } from 'lucide-react';

interface MapPlaceholderProps {
  address: string;
  className?: string;
}

export default function MapPlaceholder({
  address,
  className = ""
}: MapPlaceholderProps) {
  return (
    <div className={`bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      <div className="h-64 md:h-80 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
        {/* Map placeholder background */}
        <div className="absolute inset-0 bg-gray-200 opacity-20"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        {/* Location marker */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg mb-3">
            <MapPin color="#47C96F" strokeWidth={2} size={24} />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 font-medium">Property Location</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">{address}</p>
          </div>
        </div>

        {/* Map controls placeholder */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors" aria-label="Map layers">
            <LayoutGrid color="#47C96F" strokeWidth={2} size={24} />
          </button>
          <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors" aria-label="Add marker">
            <Plus color="#47C96F" strokeWidth={2} size={24} />
          </button>
        </div>

        {/* Zoom controls placeholder */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-1">
          <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors" aria-label="Zoom in">
            <Plus color="#47C96F" strokeWidth={2} size={24} />
          </button>
          <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors" aria-label="Zoom out">
            <Minus color="#47C96F" strokeWidth={2} size={24} />
          </button>
        </div>
      </div>

      {/* Map info bar */}
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" color="#47C96F" strokeWidth={2} size={24} />
            <span className="text-sm text-gray-600">Interactive map coming soon</span>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View on Google Maps
          </button>
        </div>
      </div>
    </div>
  );
}
