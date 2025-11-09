'use client';

// Imports at top of file
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Button from '@/components/reusable/Button';
import Badge from '@/components/reusable/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/reusable/EnhancedCard';
import { UserPlus, Eye, Edit, Trash2 } from 'lucide-react';
import { Agent } from '@/types/api';
import AgentAssignmentModal from '@/components/seller/AgentAssignmentModal';
import AssignedAgentCard from '@/components/seller/AssignedAgentCard';
import { useRouter } from 'next/navigation';
import { getSafeImageUrl } from '@/utils/imageUtils';
import { useAuth } from '@/hooks/useAuth';
import { sellerApi } from '@/api/seller';
import { propertiesApi } from '@/api/properties';
import { formatCurrencyCompact } from '@/utils/currency';
// import section
import EditPropertyModal from '@/components/seller/EditPropertyModal';
import ViewPropertyModal from '@/components/seller/ViewPropertyModal';

export default function SellerListingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // REMOVE this early-return block:
  // if (!isLoading) {
  //   if (!user) {
  //     router.push("/signin");
  //     return null;
  //   }
  //   // if (user.role !== "seller") {
  //   //   router.push("/signin");
  //   //   return null;
  //   // }
  // }
  
  // Redirect via effect (hooks stay in consistent order)
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'seller')) {
      router.push('/signin');
    }
  }, [isLoading, user, router]);

  // Fetch seller properties using React Query (unconditional hook)
  const {
    data: propertiesData,
    isLoading: propertiesLoading,
    error: propertiesError,
    refetch
  } = useQuery({
    queryKey: ["seller-properties", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID is required');
      const result = await sellerApi.getSellerListings(user.id);
      return result;
    },
    enabled: !!user && user.role === "seller",
    staleTime: 5 * 60 * 1000,
  });

  // Normalize properties data to an array
  const properties =
    Array.isArray(propertiesData)
      ? propertiesData
      : Array.isArray((propertiesData as any)?.data)
      ? (propertiesData as any).data
      : [];

  // Single delete mutation (remove any earlier duplicates)
  const { mutateAsync: deletePropertyMutation, isLoading: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      await propertiesApi.deleteProperty(id);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = async (id?: string) => {
    if (!id) return;
    const confirmed = window.confirm('Are you sure you want to delete this property?');
    if (!confirmed) return;
    try {
      await deletePropertyMutation(id);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete property');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      public: { color: 'green' as const, text: 'Public' },
      private: { color: 'blue' as const, text: 'Private' },
      pending: { color: 'yellow' as const, text: 'Pending' },
      sold: { color: 'gray' as const, text: 'Sold' },
      withdrawn: { color: 'red' as const, text: 'Withdrawn' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.private;
    return <Badge color={config.color}>{config.text}</Badge>;
  };

  // Define agent handlers BEFORE JSX usage
  const handleAssignAgent = (id?: string) => {
    if (!id) return;
    setSelectedPropertyId(id);
    setIsAssignModalOpen(true);
  };

  const handleAgentAssigned = (agent: Agent) => {
    setIsAssignModalOpen(false);
    setSelectedPropertyId(null);
    refetch();
  };

  // Add edit modal state and handlers
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any | null>(null);
  const handleEditOpen = (property: any) => {
    setEditingProperty(property);
    setIsEditModalOpen(true);
  };
  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setEditingProperty(null);
  };
  const handlePropertyUpdated = () => {
    handleEditClose();
    refetch();
  };
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingProperty, setViewingProperty] = useState<any | null>(null);

  const handleViewOpen = (property: any) => {
    setViewingProperty(property);
    setIsViewModalOpen(true);
  };

  const handleViewClose = () => {
    setIsViewModalOpen(false);
    setViewingProperty(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-2">
              Manage your property listings and track their performance
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/dashboards/seller/add-property')}>
            Add New Property
          </Button>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-500 mb-6">You haven't created any property listings yet.</p>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/dashboards/seller/add-property')}>
                Create Your First Listing
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any) => (
              <Card key={property._id || property.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={getSafeImageUrl(property.primaryImage || property.images?.[0]?.url || property.mainImage?.url)}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    {getStatusBadge(property.status)}
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg">{property.title}</CardTitle>
                  <p className="text-gray-600 text-sm">
                    {property.address?.street || property.address}, {property.address?.city || ''}, {property.address?.state || ''}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrencyCompact(property.price || 0)}
                    </p>
                    <div className="text-right">
                      <p className="text-xs text-gray-700 font-bold">Days Listed</p>
                      <p className="text-sm font-medium text-gray-900">
                        {property.daysOnMarket ||
                          (property.dateListed
                            ? Math.floor(
                                (new Date().getTime() - new Date(property.dateListed).getTime()) /
                                (1000 * 3600 * 24)
                              )
                            : 0)}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Property Stats placeholder (removed) */}

                  {/* Assigned Agent */}
                  {property.assignedAgent ? (
                    <AssignedAgentCard
                      agent={property.assignedAgent}
                      assignedAt={property.assignedDate || property.dateListed || new Date().toISOString()}
                      propertyId={property._id || property.id}
                    />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignAgent(property._id || property.id)}
                      className="w-full"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      No agent assign
                    </Button>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewOpen(property)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditOpen(property)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(property._id || property.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Agent Assignment Modal */}
        <AgentAssignmentModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedPropertyId(null);
          }}
          onAgentAssigned={handleAgentAssigned}
          propertyId={(selectedPropertyId || '')}
        />

        {/* Edit Property Modal */}
        {isEditModalOpen && (
          <EditPropertyModal
            isOpen={isEditModalOpen}
            onClose={handleEditClose}
            property={editingProperty}
            onUpdated={handlePropertyUpdated}
          />
        )}

        {/* View Property Modal */}
        {isViewModalOpen && viewingProperty && (
          <ViewPropertyModal
            isOpen={isViewModalOpen}
            onClose={handleViewClose}
            property={viewingProperty}
          />
        )}
      </div>
    </div>
  );
}