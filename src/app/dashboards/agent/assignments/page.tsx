'use client';
import { useState } from 'react';
import { Button } from '@/components/reusable';
import Image from 'next/image';

export default function Assignments() {
  const [properties] = useState([
    {
      id: 1,
      title: "Beautiful Family Home",
      price: 450000,
      location: "123 Maple Street, Oakville, CA",
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1200,
      status: "Active",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
      assignedDate: "2024-03-15"
    },
    {
      id: 2,
      title: "Modern Apartment",
      price: 280000,
      location: "456 Oak Avenue, Downtown, CA",
      bedrooms: 2,
      bathrooms: 1,
      squareFootage: 800,
      status: "Pending",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
      assignedDate: "2024-03-12"
    },
    {
      id: 3,
      title: "Luxury Condo",
      price: 650000,
      location: "789 Pine Boulevard, Hillside, CA",
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 1800,
      status: "Active",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      assignedDate: "2024-03-10"
    },
    {
      id: 4,
      title: "Cozy Townhouse",
      price: 375000,
      location: "321 Elm Street, Riverside, CA",
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1100,
      status: "Under Contract",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      assignedDate: "2024-03-08"
    },
    {
      id: 5,
      title: "Spacious Ranch",
      price: 520000,
      location: "654 Cedar Lane, Suburbia, CA",
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 2000,
      status: "Active",
      image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80",
      assignedDate: "2024-03-05"
    },
    {
      id: 6,
      title: "Urban Loft",
      price: 395000,
      location: "987 Brick Street, Metro, CA",
      bedrooms: 2,
      bathrooms: 2,
      squareFootage: 950,
      status: "Active",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      assignedDate: "2024-03-03"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Contract':
        return 'bg-blue-100 text-blue-800';
      case 'Sold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assigned Properties</h1>
          <p className="text-gray-600">Manage and track all properties under your responsibility</p>
        </div>

        {/* Filter and Sort */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="under-contract">Under Contract</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Sort by Date</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Showing {properties.length} properties
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Property Image */}
              <div className="relative h-48">
                <Image
                  src={property.image}
                  alt={`${property.title} - Exterior view of property`}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                    {property.status}
                  </span>
                </div>
              </div>
              
              {/* Property Details */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{property.title}</h3>
                <p className="text-2xl font-bold text-green-600 mb-2">${property.price.toLocaleString()}</p>
                <p className="text-gray-600 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.location}
                </p>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                  <span>{property.squareFootage.toLocaleString()} sqft</span>
                </div>
                <div className="text-xs text-gray-400 mb-4">
                  Assigned: {new Date(property.assignedDate).toLocaleDateString()}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    aria-label={`View details for ${property.title}`}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    aria-label={`Edit ${property.title}`}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Properties
          </Button>
        </div>
      </div>
    </div>
  );
}