'use client'
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Globe, 
  Tag, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Filter,
  Search,
  Calendar,
  DollarSign,
  Loader,
  AlertCircle,
  Trash2,
  Edit,
  MoreVertical,
  Building,
  FileText,
  User,
  Mail
} from 'lucide-react';

interface StoreOwner {
  id: string
  email: string
  phone: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  isVerified: boolean
  avatar?: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  storeOwnerProfile?: {
    businessName: string
    businessType: string
    businessLicense?: string
    taxId?: string
    businessAddress?: string
  }
}

const StoreOwnerDashboard = () => {
  const { data: session, status } = useSession();
  const [stores, setStores] = useState<StoreOwner[]>([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBusinessType, setFilterBusinessType] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });

  const businessTypes = [
    'GROCERY',
    'RESTAURANT', 
    'PHARMACY',
    'ELECTRONICS',
    'CLOTHING',
    'BOOKS',
    'HARDWARE',
    'OTHER'
  ];

  // Fetch stores from API
  const fetchStores = async (page = 1, search = '', status = '', businessType = '') => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...(search && { search }),
        ...(status && status !== 'all' && { status }),
        ...(businessType && businessType !== 'all' && { businessType })
      });

      const response = await fetch(`/api/admin/users?type=STORE_OWNER&${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setStores(data.data?.users || []);
        if (data.data?.pagination) {
          setPagination(prev => ({
            ...prev,
            currentPage: data.data.pagination.page,
            totalPages: data.data.pagination.totalPages,
            totalItems: data.data.pagination.total
          }));
        }
        setError('');
      } else {
        setError(data.error || 'Failed to fetch stores');
        setStores([]);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to fetch stores');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete store
  const deleteStore = async (storeId) => {
    if (!confirm('Are you sure you want to delete this store owner?')) return;

    try {
      const response = await fetch(`/api/store-owner/${storeId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        // Refresh stores after deletion
        fetchStores(pagination.currentPage, searchTerm, filterStatus, filterBusinessType);
      } else {
        alert('Failed to delete store: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      alert('Failed to delete store');
    }
  };

  // Update store status
  const toggleStoreStatus = async (storeId, currentStatus, field) => {
    try {
      const response = await fetch(`/api/store-owner/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [field]: !currentStatus
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh stores after update
        fetchStores(pagination.currentPage, searchTerm, filterStatus, filterBusinessType);
      } else {
        alert('Failed to update store: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating store:', error);
      alert('Failed to update store');
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (status === 'authenticated' && session?.token) {
      fetchStores();
    }
  }, [status, session]);

  // Handle filter changes
  useEffect(() => {
    if (status === 'authenticated') {
      fetchStores(1, searchTerm, filterStatus, filterBusinessType);
    }
  }, [searchTerm, filterStatus, filterBusinessType]);

  // Show loading if session is loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Show error if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBusinessTypeDisplay = (type) => {
    const types = {
      'GROCERY': { text: 'Grocery Store', color: 'bg-green-100 text-green-800' },
      'RESTAURANT': { text: 'Restaurant', color: 'bg-orange-100 text-orange-800' },
      'PHARMACY': { text: 'Pharmacy', color: 'bg-blue-100 text-blue-800' },
      'ELECTRONICS': { text: 'Electronics', color: 'bg-purple-100 text-purple-800' },
      'CLOTHING': { text: 'Clothing', color: 'bg-pink-100 text-pink-800' },
      'BOOKS': { text: 'Books', color: 'bg-indigo-100 text-indigo-800' },
      'HARDWARE': { text: 'Hardware', color: 'bg-gray-100 text-gray-800' },
      'OTHER': { text: 'Other', color: 'bg-yellow-100 text-yellow-800' }
    };
    return types[type] || { text: type, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Owners Dashboard</h1>
          <p className="text-gray-600">Manage and monitor all store owners in your platform</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search store owners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <select
              value={filterBusinessType}
              onChange={(e) => setFilterBusinessType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Business Types</option>
              {businessTypes.map(type => (
                <option key={type} value={type}>{getBusinessTypeDisplay(type).text}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading store owners...</span>
          </div>
        ) : (
          <>
            {/* Stores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {stores.map((store) => {
                const businessType = getBusinessTypeDisplay(store.storeOwnerProfile?.businessType || 'OTHER');

                return (
                  <div key={store.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={() => toggleStoreStatus(store.id, store.isActive, 'isActive')}
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            store.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          } transition-colors cursor-pointer`}
                        >
                          {store.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {store.isActive ? 'Active' : 'Inactive'}
                        </button>

                        <button
                          onClick={() => toggleStoreStatus(store.id, store.isVerified, 'isVerified')}
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            store.isVerified
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                          } transition-colors cursor-pointer`}
                        >
                          {store.isVerified ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {store.isVerified ? 'Verified' : 'Pending'}
                        </button>
                      </div>

                      {/* Action Menu */}
                      <div className="absolute top-3 left-3">
                        <div className="relative group">
                          <button className="bg-white/20 hover:bg-white/30 text-white p-1 rounded-full transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          <div className="absolute left-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-[120px]">
                            <button
                              onClick={() => {/* Add edit functionality */}}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => deleteStore(store.id)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left border-t border-gray-100"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-xl font-bold mb-1">{store.storeOwnerProfile?.businessName || 'Business Name'}</h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${businessType.color}`}>
                          {businessType.text}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Owner Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{store.firstName} {store.lastName}</span>
                        </div>

                        {store.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{store.email}</span>
                          </div>
                        )}

                        {store.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{store.phone}</span>
                          </div>
                        )}

                        {store.storeOwnerProfile?.businessLicense && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span className="truncate" title={store.storeOwnerProfile.businessLicense}>
                              License: {store.storeOwnerProfile.businessLicense.length > 20
                                ? store.storeOwnerProfile.businessLicense.substring(0, 20) + '...'
                                : store.storeOwnerProfile.businessLicense
                              }
                            </span>
                          </div>
                        )}

                        {store.storeOwnerProfile?.taxId && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="h-4 w-4" />
                            <span>Tax ID: {store.storeOwnerProfile.taxId}</span>
                          </div>
                        )}
                      </div>

                      {/* Business Information */}
                      {store.storeOwnerProfile?.businessAddress && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Business Address</h4>
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            <span>{store.storeOwnerProfile.businessAddress}</span>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Registered {formatDate(store.createdAt)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {store.id}
                        </div>
                      </div>

                      {/* Places Count - Placeholder for now */}
                      <div className="mt-2 text-xs text-gray-500">
                        Places data not available
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="text-sm text-gray-600">
                  Showing {Math.min(pagination.itemsPerPage * (pagination.currentPage - 1) + 1, pagination.totalItems)} to{' '}
                  {Math.min(pagination.itemsPerPage * pagination.currentPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} store owners
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchStores(pagination.currentPage - 1, searchTerm, filterStatus, filterBusinessType)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchStores(pagination.currentPage + 1, searchTerm, filterStatus, filterBusinessType)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {stores.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No store owners found</div>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </>
        )}

        {/* Summary Stats */}
        {!loading && stores.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{pagination.totalItems}</div>
                <div className="text-sm text-gray-600">Total Store Owners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stores.filter(s => s.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stores.filter(s => s.isVerified).length}
                </div>
                <div className="text-sm text-gray-600">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  Places data not available
                </div>
                <div className="text-sm text-gray-600">Total Places</div>
              </div>
            </div>

            {/* Business Type Breakdown */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Business Types</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {businessTypes.map(type => {
                  const count = stores.filter(s => s.storeOwnerProfile?.businessType === type).length;
                  const typeInfo = getBusinessTypeDisplay(type);
                  return count > 0 && (
                    <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">{typeInfo.text}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;