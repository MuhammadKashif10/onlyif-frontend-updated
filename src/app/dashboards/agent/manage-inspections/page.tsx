'use client';
import { useState } from 'react';
import { Button } from '@/components/reusable';
import Image from 'next/image';

export default function ManageInspections() {
  const [inspections] = useState([
    {
      id: 1,
      propertyName: "Beautiful Family Home",
      propertyImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=200&q=80",
      date: "2024-03-20",
      time: "2:00 PM",
      inspector: "Mike Johnson",
      status: "Upcoming",
      client: "John Smith",
      address: "123 Maple Street, Oakville, CA"
    },
    {
      id: 2,
      propertyName: "Modern Apartment",
      propertyImage: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=200&q=80",
      date: "2024-03-22",
      time: "10:00 AM",
      inspector: "Sarah Wilson",
      status: "Upcoming",
      client: "Emily Davis",
      address: "456 Oak Avenue, Downtown, CA"
    },
    {
      id: 3,
      propertyName: "Luxury Condo",
      propertyImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80",
      date: "2024-03-18",
      time: "3:30 PM",
      inspector: "David Brown",
      status: "Completed",
      client: "Michael Johnson",
      address: "789 Pine Boulevard, Hillside, CA"
    },
    {
      id: 4,
      propertyName: "Cozy Townhouse",
      propertyImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80",
      date: "2024-03-25",
      time: "1:00 PM",
      inspector: "Lisa Anderson",
      status: "Upcoming",
      client: "Robert Wilson",
      address: "321 Elm Street, Riverside, CA"
    },
    {
      id: 5,
      propertyName: "Urban Loft",
      propertyImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=200&q=80",
      date: "2024-03-15",
      time: "11:30 AM",
      inspector: "Tom Rodriguez",
      status: "Canceled",
      client: "Jennifer Lee",
      address: "987 Brick Street, Metro, CA"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMarkCompleted = (id: number) => {
    console.log('Mark inspection as completed:', id);
    // Implementation would update the inspection status
  };

  const handleReschedule = (id: number) => {
    console.log('Reschedule inspection:', id);
    // Implementation would open reschedule modal
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Inspection Management</h1>
              <p className="text-gray-600">Schedule and track property inspections</p>
            </div>
            <Button variant="primary" size="lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Schedule New Inspection
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">3</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">1</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-red-600">1</div>
            <div className="text-sm text-gray-600">Canceled</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-gray-600">5</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>

        {/* Inspections Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Scheduled Inspections</h2>
          </div>
          
          {/* Mobile View */}
          <div className="block md:hidden">
            {inspections.map((inspection) => (
              <div key={inspection.id} className="border-b border-gray-200 p-4">
                <div className="flex items-start space-x-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={inspection.propertyImage}
                      alt={`${inspection.propertyName} - Property thumbnail`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{inspection.propertyName}</h3>
                    <p className="text-sm text-gray-600">{inspection.address}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(inspection.date).toLocaleDateString()} at {inspection.time}
                    </p>
                    <p className="text-sm text-gray-600">Inspector: {inspection.inspector}</p>
                    <p className="text-sm text-gray-600">Client: {inspection.client}</p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                        {inspection.status}
                      </span>
                    </div>
                    {inspection.status === 'Upcoming' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleMarkCompleted(inspection.id)}
                          aria-label={`Mark ${inspection.propertyName} inspection as completed`}
                        >
                          Mark Completed
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReschedule(inspection.id)}
                          aria-label={`Reschedule ${inspection.propertyName} inspection`}
                        >
                          Reschedule
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inspections.map((inspection) => (
                  <tr key={inspection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={inspection.propertyImage}
                            alt={`${inspection.propertyName} - Property thumbnail`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{inspection.propertyName}</div>
                          <div className="text-sm text-gray-500">{inspection.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(inspection.date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{inspection.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inspection.inspector}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inspection.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inspection.status)}`}>
                        {inspection.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {inspection.status === 'Upcoming' ? (
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleMarkCompleted(inspection.id)}
                            aria-label={`Mark ${inspection.propertyName} inspection as completed`}
                          >
                            Mark Completed
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReschedule(inspection.id)}
                            aria-label={`Reschedule ${inspection.propertyName} inspection`}
                          >
                            Reschedule
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-400">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}