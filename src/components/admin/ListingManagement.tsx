'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/api/admin';
import { AdminListing } from '@/types/api';
import { Button, Loader, Alert, SearchBar, Pagination, Modal } from '@/components/reusable';
import { PROPERTY_STATUS, ADMIN_ROLES } from '@/utils/constants';

interface ListingManagementProps {
  userRole?: string;
}

export default function ListingManagement({ userRole }: ListingManagementProps) {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
  const [actionType, setActionType] = useState<'status' | 'delete' | null>(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadListings();
  }, [searchQuery, selectedStatus, sortBy, currentPage]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getListings({
        status: selectedStatus,
        q: searchQuery,
        sort: sortBy,
        page: currentPage,
        limit: 10,
      });
      if (response.success) {
        setListings(response.data.listings);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleListingAction = (listing: AdminListing, action: 'status' | 'delete', status?: string) => {
    setSelectedListing(listing);
    setActionType(action);
    if (status) setNewStatus(status);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedListing || !actionType) return;

    try {
      if (actionType === 'status') {
        await adminApi.updateListingStatus(selectedListing.id, newStatus);
      } else {
        await adminApi.deleteListing(selectedListing.id);
      }
      setShowModal(false);
      setSelectedListing(null);
      setActionType(null);
      setNewStatus('');
      loadListings();
    } catch (err) {
      setError(`Failed to ${actionType === 'status' ? 'update' : 'delete'} listing`);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      public: 'bg-green-100 text-green-800',
      private: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-gray-100 text-gray-800',
      withdrawn: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Listing Management</h2>
      </div>

      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search listings by title, address, or owner..."
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="createdAt">Date Created</option>
          <option value="title">Title</option>
          <option value="price">Price</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Listings Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader size="large" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
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
                {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={listing.image}
                            alt={listing.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                          <div className="text-sm text-gray-500">{listing.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{listing.ownerName}</div>
                      <div className="text-sm text-gray-500">{listing.ownerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${listing.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(listing.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {listing.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleListingAction(listing, 'status', 'public')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleListingAction(listing, 'status', 'withdrawn')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {listing.status !== 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleListingAction(listing, 'status', listing.status === 'public' ? 'private' : 'public')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {listing.status === 'public' ? 'Make Private' : 'Make Public'}
                          </Button>
                        )}
                        {userRole === ADMIN_ROLES.SUPER_ADMIN && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleListingAction(listing, 'delete')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${actionType === 'status' ? 'Update Status' : 'Delete'} Listing`}
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            {actionType === 'status'
              ? `Are you sure you want to change the status of "${selectedListing?.title}" to ${newStatus}?`
              : `Are you sure you want to delete "${selectedListing?.title}"? This action cannot be undone.`
            }
          </p>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'delete' ? 'danger' : 'primary'}
              onClick={confirmAction}
            >
              {actionType === 'status' ? 'Update' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}