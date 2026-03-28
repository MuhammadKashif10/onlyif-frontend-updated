'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Mail, Building2, Search as SearchIcon } from 'lucide-react';

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface Location {
  id: string;
  name: string;
  type: 'city' | 'zip' | 'neighborhood';
  state: string;
}

interface LocationSearchProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationSearch({
  value,
  onChange,
  placeholder = "Search by city, ZIP, or neighborhood",
  className = ""
}: LocationSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock location data as fallback
  const mockLocations: Location[] = [
    { id: '1', name: 'Austin', type: 'city', state: 'TX' },
    { id: '2', name: 'Dallas', type: 'city', state: 'TX' },
    { id: '3', name: 'Houston', type: 'city', state: 'TX' },
    { id: '4', name: 'San Antonio', type: 'city', state: 'TX' },
    { id: '5', name: '78701', type: 'zip', state: 'TX' },
    { id: '6', name: '78702', type: 'zip', state: 'TX' },
    { id: '7', name: '78703', type: 'zip', state: 'TX' },
    { id: '8', name: '78704', type: 'zip', state: 'TX' },
    { id: '9', name: 'Downtown Austin', type: 'neighborhood', state: 'TX' },
    { id: '10', name: 'East Austin', type: 'neighborhood', state: 'TX' },
    { id: '11', name: 'Westlake', type: 'neighborhood', state: 'TX' },
    { id: '12', name: 'Round Rock', type: 'city', state: 'TX' },
    { id: '13', name: 'Cedar Park', type: 'city', state: 'TX' },
    { id: '14', name: 'Georgetown', type: 'city', state: 'TX' },
    { id: '15', name: 'Leander', type: 'city', state: 'TX' },
  ];

  // API call function
  const fetchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setFilteredLocations([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        const locationData = data.data || data;
        setLocations(locationData);
        setFilteredLocations(locationData);
      } else {
        // Fallback to mock data if API fails
        const filtered = mockLocations.filter(location =>
          location.name.toLowerCase().includes(query.toLowerCase()) ||
          location.state.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8);
        setFilteredLocations(filtered);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Fallback to mock data
      const filtered = mockLocations.filter(location =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.state.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      setFilteredLocations(filtered);
    }
  }, []);

  // Debounced search
  const debouncedFetchLocations = useCallback(
    debounce(fetchLocations, 300),
    [fetchLocations]
  );

  // Search effect
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLocations([]);
      return;
    }
    debouncedFetchLocations(searchQuery);
  }, [searchQuery, debouncedFetchLocations]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleLocationSelect = (location: Location) => {
    const displayName = location.type === 'zip' ? location.name : `${location.name}, ${location.state}`;
    setSearchQuery(displayName);
    onChange(displayName);
    setIsOpen(false);
  };

  const getLocationIcon = (type: Location['type']) => {
    switch (type) {
      case 'city':
        return (
          <MapPin className="w-4 h-4" color="#47C96F" strokeWidth={2} size={24} />
        );
      case 'zip':
        return (
          <Mail className="w-4 h-4" color="#47C96F" strokeWidth={2} size={24} />
        );
      case 'neighborhood':
        return (
          <Building2 className="w-4 h-4" color="#47C96F" strokeWidth={2} size={24} />
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <SearchIcon className="w-5 h-5" color="#47C96F" strokeWidth={2} size={24} />
        </div>
      </div>

      {isOpen && filteredLocations.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredLocations.map((location) => (
            <button
              key={location.id}
              onClick={() => handleLocationSelect(location)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors flex items-center space-x-3"
            >
              <div className="text-gray-500">
                {getLocationIcon(location.type)}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {location.name}
                  {location.type !== 'zip' && `, ${location.state}`}
                </div>
                <div className="text-sm text-gray-500 capitalize">
                  {location.type}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}