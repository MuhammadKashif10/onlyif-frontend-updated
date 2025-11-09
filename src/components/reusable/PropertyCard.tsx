import Image from 'next/image';
import Link from 'next/link';
import { formatCurrencyCompact } from '@/utils/currency';

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  size: number; // This will now be in square meters
  featured?: boolean;
}

export default function PropertyCard({
  id,
  image,
  title,
  address,
  price,
  beds,
  baths,
  size,
  featured = false
}: PropertyCardProps) {
  const formatSize = (size: number) => {
    return `${size.toLocaleString()} sq m`; // Changed from sq ft
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
      featured ? 'ring-2 ring-blue-500' : ''
    }`}>
      <div className="relative">
        <Image
          src={image}
          alt={title}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
        />
        {featured && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Featured
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-sm font-semibold text-gray-800">
          {formatCurrencyCompact(price)}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-1">
          {address}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {beds} bed{beds !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              {baths} bath{baths !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              {formatSize(size)}
            </span>
          </div>
        </div>
        
        <Link
          href={`/property/${id}`}
          className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}