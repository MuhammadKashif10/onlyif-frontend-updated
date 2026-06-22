'use client';

// Imports at top of file
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Badge from '@/components/reusable/Badge';
import { Navbar } from '@/components';
import Link from 'next/link';
import { UserPlus, Eye, Edit, Trash2, LayoutDashboard, Home, Store, BarChart3, Settings, Plus, Building2, MessageSquare } from 'lucide-react';
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
import OccupancyBadge from '@/components/property/OccupancyBadge';

export default function SellerListingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const canAccessSellerDashboard = !!user?.roles?.includes('seller');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [statusTab, setStatusTab] = useState<'active' | 'drafts' | 'archived'>('active');

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
    if (!isLoading && (!user || !canAccessSellerDashboard)) {
      router.push('/signin');
    }
  }, [canAccessSellerDashboard, isLoading, user, router]);

  // Fetch seller properties using React Query (unconditional hook)
  const {
    data: propertiesData,
    refetch
  } = useQuery({
    queryKey: ["seller-properties", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID is required');
      const result = await sellerApi.getSellerListings(user.id);
      return result;
    },
    enabled: !!user && canAccessSellerDashboard,
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
    const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'error' | 'info'; text: string }> = {
      draft: { variant: 'default', text: 'Draft' },
      pending: { variant: 'warning', text: 'Pending' },
      review: { variant: 'info', text: 'Under Review' },
      active: { variant: 'success', text: 'Live' },
      public: { variant: 'success', text: 'Live' },
      'buyer-interest': { variant: 'info', text: 'Buyer Interest' },
      negotiation: { variant: 'info', text: 'Negotiation' },
      'under-offer': { variant: 'warning', text: 'Under Offer' },
      sold: { variant: 'default', text: 'Sold' },
      withdrawn: { variant: 'error', text: 'Withdrawn' },
      rejected: { variant: 'error', text: 'Rejected' },
      private: { variant: 'info', text: 'Private' }
    };
    const config = statusConfig[status] || statusConfig.private;
    return <Badge variant={config.variant}>{config.text}</Badge>;
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

  const activeCount = properties.filter((property: any) => ['active', 'public', 'buyer-interest', 'negotiation', 'under-offer'].includes(property.status)).length;
  const draftCount = properties.filter((property: any) => ['draft', 'pending', 'review'].includes(property.status)).length;
  const archivedCount = properties.filter((property: any) => ['sold', 'withdrawn', 'rejected'].includes(property.status)).length;
  const displayedProperties = properties.filter((property: any) => {
    if (statusTab === 'active') return ['active', 'public', 'buyer-interest', 'negotiation', 'under-offer'].includes(property.status);
    if (statusTab === 'drafts') return ['draft', 'pending', 'review'].includes(property.status);
    return ['sold', 'withdrawn', 'rejected'].includes(property.status);
  });

  const sidebarButtonClass = (isActive: boolean) =>
    `w-full flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out hover:shadow-sm ${
      isActive
        ? 'bg-black text-white shadow-lg shadow-black/10'
        : 'text-gray-600 hover:bg-white hover:text-gray-950'
    }`;

  const sidebarIconClass = (isActive: boolean) =>
    `h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`;

  const getAddressText = (property: any) => {
    if (!property?.address) return '';
    if (typeof property.address === 'string') return property.address;
    return [property.address.street, property.address.city, property.address.state].filter(Boolean).join(', ');
  };

  const getDaysListed = (property: any) => (
    property.daysOnMarket ||
    (property.dateListed
      ? Math.floor((new Date().getTime() - new Date(property.dateListed).getTime()) / (1000 * 3600 * 24))
      : 0)
  );

  return (
    <div className="min-h-screen bg-[#f5f6fb] flex flex-col">
      <Navbar />

      <div className="flex w-full flex-1 bg-[#f5f6fb] lg:pl-[280px]">
        <aside id="dashboard-sidebar" className="fixed left-0 top-20 bottom-0 z-30 hidden w-[280px] shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white px-5 py-4 lg:flex">
          <div className="flex-1">
            <nav className="space-y-2 pt-3">
              <button onClick={() => router.push('/dashboards/seller')} className={sidebarButtonClass(false)}>
                <LayoutDashboard className={sidebarIconClass(false)} />
                <span>Dashboard</span>
              </button>
              <button className={sidebarButtonClass(true)}>
                <Home className={sidebarIconClass(true)} />
                <span>Listings</span>
              </button>
              <button onClick={() => router.push('/dashboards/seller/messages')} className={sidebarButtonClass(false)}>
                <MessageSquare className={sidebarIconClass(false)} />
                <span>Messages</span>
              </button>
              <button onClick={() => router.push('/dashboards/seller/marketplace')} className={sidebarButtonClass(false)}>
                <Store className={sidebarIconClass(false)} />
                <span>Marketplace</span>
              </button>
              <button onClick={() => router.push('/dashboards/seller/analytics')} className={sidebarButtonClass(false)}>
                <BarChart3 className={sidebarIconClass(false)} />
                <span>Analytics</span>
              </button>
              <button onClick={() => router.push('/dashboards/seller/account')} className={sidebarButtonClass(false)}>
                <Settings className={sidebarIconClass(false)} />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          <div className="border-t border-gray-200 pt-5">
            <button
              onClick={() => router.push('/dashboards/seller/add-property')}
              className="mb-5 w-full cursor-pointer rounded-xl bg-black px-4 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all duration-200 ease-out hover:bg-gray-900 hover:shadow-xl"
            >
              List Property
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm">
                {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-950">{user?.name || 'Seller Name'}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">Verified Seller</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 grid grid-cols-2 gap-3 lg:hidden">
            <button onClick={() => router.push('/dashboards/seller')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Dashboard</button>
            <button className="rounded-xl bg-black px-4 py-3 text-sm font-bold text-white shadow-sm">Listings</button>
            <button onClick={() => router.push('/dashboards/seller/messages')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Messages</button>
            <button onClick={() => router.push('/dashboards/seller/marketplace')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Marketplace</button>
            <button onClick={() => router.push('/dashboards/seller/analytics')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Analytics</button>
            <button onClick={() => router.push('/dashboards/seller/account')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Settings</button>
          </div>

          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">Seller Inventory</p>
              <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">My Listings</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                Manage and optimize your property portfolio.
              </p>
            </div>
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-700 sm:w-auto"
              onClick={() => router.push('/dashboards/seller/add-property')}
            >
              <Plus className="h-5 w-5" />
              List New Property
            </button>
          </div>

          <div className="mb-10 border-b border-gray-300">
            <div className="flex gap-8 overflow-x-auto">
              {[
                { label: 'Active', key: 'active', count: activeCount },
                { label: 'Drafts', key: 'drafts', count: draftCount },
                { label: 'Archived', key: 'archived', count: archivedCount },
              ].map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setStatusTab(tab.key as 'active' | 'drafts' | 'archived')}
                  className={`whitespace-nowrap border-b-2 px-0 pb-4 text-sm font-bold transition ${
                    statusTab === tab.key
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

        {/* Properties Grid */}
        {displayedProperties.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-gray-300 bg-white/60 px-6 py-20 text-center shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
            <div className="mx-auto max-w-md">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-xl font-black tracking-tight text-gray-950">No listings found</h3>
              <p className="mb-8 text-sm leading-6 text-gray-500">
                {properties.length === 0
                  ? "You haven't created any property listings yet."
                  : `No ${statusTab === 'drafts' ? 'draft' : statusTab} listings found.`}
              </p>
              <button className="rounded-xl bg-black px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-gray-900" onClick={() => router.push('/dashboards/seller/add-property')}>
                Create Your First Listing
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {displayedProperties.map((property: any) => (
              <article key={property._id || property.id} className="overflow-hidden rounded-[24px] border border-blue-100/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_90px_rgba(15,23,42,0.10)]">
                <div className="grid lg:grid-cols-[minmax(280px,0.72fr)_1fr]">
                <div className="relative min-h-72 lg:min-h-[346px]">
                  <img
                    src={getSafeImageUrl(property.primaryImage || property.images?.[0]?.url || property.mainImage?.url)}
                    alt={property.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute left-5 top-5">
                    {getStatusBadge(property.status)}
                  </div>
                </div>
                
                <div className="flex flex-col justify-between p-6 sm:p-8">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <h2 className="truncate text-2xl font-black tracking-tight text-gray-950">{property.title}</h2>
                      <p className="mt-2 text-sm font-medium text-gray-500">{getAddressText(property)}</p>
                      <OccupancyBadge property={property} className="mt-2" />

                      <div className="mt-5 flex flex-wrap gap-3">
                        <span className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-gray-800">{property.beds || 0} Beds</span>
                        <span className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-gray-800">{property.baths || 0} Baths</span>
                        <span className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-gray-800">{property.size || property.squareMeters || 0} sqft</span>
                        <span className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">{getDaysListed(property)} days</span>
                      </div>
                    </div>

                    <div className="shrink-0 xl:text-right">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">Price Target</p>
                      <p className="mt-2 text-2xl font-black tracking-tight text-gray-950">
                      {formatCurrencyCompact(property.price || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="my-7 border-t border-gray-200" />

                  <div className="space-y-5">
                  {/* Buyer Activity */}
                  {property.buyerActivity && (
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm">
                      <p className="mb-2 font-bold text-gray-800">Buyer Activity</p>
                      <div className="flex flex-wrap gap-3 text-gray-600">
                        <span>{property.buyerActivity.views} views</span>
                        <span>{property.buyerActivity.unlocks} unlocked</span>
                        <span>{property.buyerActivity.inspectionRequests} inspections</span>
                        <span>{property.buyerActivity.saved} saved</span>
                      </div>
                    </div>
                  )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-7 flex flex-col gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-3">
                    <button className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:border-gray-950 hover:text-black" onClick={() => handleEditOpen(property)} aria-label="Edit listing">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:border-gray-950 hover:text-black" onClick={() => handleViewOpen(property)} aria-label="View listing">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-red-100 bg-white text-red-600 transition hover:border-red-300 hover:bg-red-50"
                      onClick={() => handleDelete(property._id || property.id)}
                      disabled={isDeleting}
                      aria-label="Delete listing"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    </div>
                    <button
                      onClick={() => handleEditOpen(property)}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-black px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-gray-900 sm:w-auto"
                    >
                      Manage Listing
                    </button>
                  </div>
                </div>
                </div>
              </article>
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
        </main>
      </div>

    </div>
  );
}
