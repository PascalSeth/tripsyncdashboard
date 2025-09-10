'use client'
import React, { useState, useEffect, useRef } from 'react';
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
  Plus,
  Save,
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// OpenStreetMap Nominatim types
interface NominatimResult {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

interface Place {
  id: string;
  name: string;
  description?: string;
  location?: { name: string };
  category?: { id: string; name: string };
  priceLevel?: string;
  openingHours?: string;
  contactInfo?: string;
  websiteUrl?: string;
  tags?: string;
  imageUrl?: string;
  isActive: boolean;
  isApproved: boolean;
  rating?: number;
  createdAt?: string;
  placePhotos?: any[];
  owner?: { businessName: string };
}

interface Category {
  id: string;
  name: string;
}

const PlacesDashboard = () => {
  const { data: session, status } = useSession();
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });

  // CRUD states
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    categoryId: '',
    priceLevel: '',
    openingHours: '',
    contactInfo: '',
    websiteUrl: '',
    tags: '',
    imageUrl: '',
    isActive: true,
    isApproved: false
  });

  // OpenStreetMap location search state
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch places from API
  const fetchPlaces = async (page = 1, search = '', status = '', category = '') => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...(search && { search }),
        ...(status && status !== 'all' && { status }),
        ...(category && category !== 'all' && { category })
      });

      const response = await fetch(`/api/places?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setPlaces(data.data.places || []);
        if (data.pagination) {
          setPagination(prev => ({
            ...prev,
            currentPage: data.pagination.page || data.pagination.currentPage || 1,
            totalPages: data.pagination.totalPages || 1,
            totalItems: data.pagination.total || data.pagination.totalItems || 0
          }));
        }
        setError('');
      } else {
        setError(data.error || 'Failed to fetch places');
        setPlaces([]);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setError('Failed to fetch places');
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/places/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data || []);
      } else {
        console.error('Failed to fetch categories:', data.error);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Delete place
  const deletePlace = async (placeId: string) => {
    if (!confirm('Are you sure you want to delete this place?')) return;

    try {
      const response = await fetch(`/api/places/${placeId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        // Refresh places after deletion
        fetchPlaces(pagination.currentPage, searchTerm, filterStatus, filterCategory);
      } else {
        alert('Failed to delete place: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting place:', error);
      alert('Failed to delete place');
    }
  };

  // Update place status
  const togglePlaceStatus = async (placeId: string, currentStatus: boolean, field: string) => {
    try {
      const response = await fetch(`/api/places/${placeId}`, {
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
        // Refresh places after update
        fetchPlaces(pagination.currentPage, searchTerm, filterStatus, filterCategory);
      } else {
        alert('Failed to update place: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating place:', error);
      alert('Failed to update place');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      latitude: '',
      longitude: '',
      categoryId: '',
      priceLevel: '',
      openingHours: '',
      contactInfo: '',
      websiteUrl: '',
      tags: '',
      imageUrl: '',
      isActive: true,
      isApproved: false
    });
    setLocationInput('');
    setLocationSuggestions([]);
    setShowSuggestions(false);
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Search locations using OpenStreetMap Nominatim API (focused on Ghana)
  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // Ghana bounding box coordinates (approximate)
      // Format: min_lon,min_lat,max_lon,max_lat
      const ghanaBounds = '-3.2554,4.7367,1.1994,11.1733';

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&extratags=1&countrycodes=gh&bounded=1&viewbox=${ghanaBounds}`
      );
      const data: NominatimResult[] = await response.json();

      // If no results in Ghana, try a broader search
      if (data.length === 0) {
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)} Ghana&limit=5&addressdetails=1&extratags=1`
        );
        const fallbackData: NominatimResult[] = await fallbackResponse.json();
        setLocationSuggestions(fallbackData);
      } else {
        setLocationSuggestions(data);
      }

      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle location input change with debounced search
  const handleLocationInputChange = (value: string) => {
    setLocationInput(value);

    // Update formData address for consistency
    setFormData(prev => ({
      ...prev,
      address: value
    }));

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      searchLocations(value);
    }, 300);

    setSearchTimeout(timeout);
  };

  // Handle location selection from suggestions
  const handleLocationSelect = (location: NominatimResult, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    console.log('Location selected:', location.display_name);

    const selectedLocation = location.display_name;

    // Update both states immediately
    setLocationInput(selectedLocation);
    setFormData(prev => ({
      ...prev,
      address: selectedLocation,
      latitude: location.lat,
      longitude: location.lon
    }));

    // Close suggestions with a small delay to ensure state updates
    setTimeout(() => {
      setShowSuggestions(false);
      setLocationSuggestions([]);
      console.log('Location input updated to:', selectedLocation);
    }, 10);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // For address field, use the new handler
    if (name === 'address') {
      handleLocationInputChange(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Create new place
  const handleCreate = async () => {
    if (!formData.name.trim()) return;

    try {
      setActionLoading('create');
      setError('');

      let response;

      if (selectedFile) {
        // Use FormData for file upload
        const formDataToSend = new FormData();

        // Add text fields
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (key === 'latitude' || key === 'longitude') {
              formDataToSend.append(key, value ? parseFloat(value as string).toString() : '');
            } else if (typeof value === 'boolean') {
              formDataToSend.append(key, value.toString());
            } else {
              formDataToSend.append(key, value.toString());
            }
          }
        });

        // Add file
        formDataToSend.append('image', selectedFile);

        // Debug: Log what's being sent
        console.log('Sending FormData for update with file:');
        for (const [key, value] of formDataToSend.entries()) {
          if (value instanceof File) {
            console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
          } else {
            console.log(`${key}: ${value}`);
          }
        }

        response = await fetch('/api/places', {
          method: 'POST',
          body: formDataToSend
        });
      } else {
        // Use JSON for no file upload
        const submitData = {
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null
        };

        // Ensure latitude and longitude are valid numbers or null
        if (submitData.latitude && isNaN(submitData.latitude)) {
          submitData.latitude = null;
        }
        if (submitData.longitude && isNaN(submitData.longitude)) {
          submitData.longitude = null;
        }

        // Debug: Log what's being sent
        console.log('Sending JSON data:', submitData);

        response = await fetch('/api/places', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        });
      }

      const data = await response.json();

      if (data.success) {
        fetchPlaces(pagination.currentPage, searchTerm, filterStatus, filterCategory);
        resetForm();
        setIsCreating(false);
      } else {
        setError(data.error || 'Failed to create place');
      }
    } catch (error) {
      console.error('Error creating place:', error);
      setError('Failed to create place');
    } finally {
      setActionLoading(null);
    }
  };

  // Start editing
  const handleEdit = (place: Place) => {
    const locationValue = place.location?.name || '';

    setFormData({
      name: place.name || '',
      description: place.description || '',
      address: locationValue,
      latitude: '',
      longitude: '',
      categoryId: place.category?.id || '',
      priceLevel: place.priceLevel || '',
      openingHours: place.openingHours || '',
      contactInfo: place.contactInfo || '',
      websiteUrl: place.websiteUrl || '',
      tags: place.tags || '',
      imageUrl: place.imageUrl || '',
      isActive: place.isActive || false,
      isApproved: place.isApproved || false
    });

    setLocationInput(locationValue);
    setLocationSuggestions([]);
    setShowSuggestions(false);
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setEditingId(place.id);
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!formData.name.trim() || !editingId) return;

    try {
      setActionLoading('edit');
      setError('');

      let response;

      if (selectedFile) {
        // Use FormData for file upload
        const formDataToSend = new FormData();

        // Add ID for updates
        if (editingId) {
          formDataToSend.append('id', editingId);
        }

        // Add text fields
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (key === 'latitude' || key === 'longitude') {
              const numValue = parseFloat(value as string);
              if (!isNaN(numValue)) {
                formDataToSend.append(key, numValue.toString());
              }
            } else if (typeof value === 'boolean') {
              formDataToSend.append(key, value.toString());
            } else {
              formDataToSend.append(key, value.toString());
            }
          }
        });

        // Add file
        formDataToSend.append('image', selectedFile);

        response = await fetch(`/api/places/${editingId}`, {
          method: 'PUT',
          body: formDataToSend
        });
      } else {
        // Use JSON for no file upload
        const submitData = {
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null
        };

        // Ensure latitude and longitude are valid numbers or null
        if (submitData.latitude && isNaN(submitData.latitude)) {
          submitData.latitude = null;
        }
        if (submitData.longitude && isNaN(submitData.longitude)) {
          submitData.longitude = null;
        }

        // Debug: Log what's being sent
        console.log('Sending JSON data for update:', submitData);

        response = await fetch(`/api/places/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        });
      }

      const data = await response.json();

      if (data.success) {
        fetchPlaces(pagination.currentPage, searchTerm, filterStatus, filterCategory);
        setEditingId(null);
        resetForm();
      } else {
        setError(data.error || 'Failed to update place');
      }
    } catch (error) {
      console.error('Error updating place:', error);
      setError('Failed to update place');
    } finally {
      setActionLoading(null);
    }
  };

  // Cancel edit/create
  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    resetForm();
    setError('');
  };

  // Initial data fetch
  useEffect(() => {
    if (status === 'authenticated' && session?.token) {
      fetchPlaces();
      fetchCategories();
    }
  }, [status, session]);

  // Handle filter changes
  useEffect(() => {
    if (status === 'authenticated') {
      fetchPlaces(1, searchTerm, filterStatus, filterCategory);
    }
  }, [searchTerm, filterStatus, filterCategory]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inputElement = locationInputRef.current;
      const suggestionsElement = suggestionsRef.current;

      // Check if click is outside both the input and the suggestions dropdown
      const isOutsideInput = inputElement && !inputElement.contains(target);
      const isOutsideSuggestions = suggestionsElement && !suggestionsElement.contains(target);

      if (isOutsideInput && isOutsideSuggestions) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
  }

  const getPriceLevelDisplay = (priceLevel?: string) => {
    const levels: Record<string, { text: string; color: string; symbol: string }> = {
      'BUDGET': { text: 'Budget', color: 'text-green-600', symbol: '$' },
      'MODERATE': { text: 'Moderate', color: 'text-yellow-600', symbol: '$$' },
      'EXPENSIVE': { text: 'Expensive', color: 'text-red-600', symbol: '$$$' },
      'LUXURY': { text: 'Luxury', color: 'text-purple-600', symbol: '$$$$' }
    };
    return levels[priceLevel || ''] || { text: 'N/A', color: 'text-gray-400', symbol: '-' };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>

      <div className="min-h-screen bg-gray-50 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Places Dashboard</h1>
              <p className="text-gray-600">Manage and monitor all places in your platform</p>
            </div>
            {!isCreating && !editingId && (
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                disabled={!!actionLoading}
              >
                <Plus className="h-5 w-5" />
                Create Place
              </button>
            )}
          </div>
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
                placeholder="Search places..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {isCreating ? 'Create New Place' : 'Edit Place'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
                disabled={actionLoading === 'create' || actionLoading === 'edit'}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter place name"
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Select
                  value={formData.categoryId || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  ref={locationInputRef}
                  type="text"
                  name="address"
                  value={locationInput}
                  onChange={(e) => handleLocationInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && locationSuggestions.length > 0) {
                      e.preventDefault();
                      handleLocationSelect(locationSuggestions[0], e as any);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search for a location..."
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                  autoComplete="off"
                />

                {/* Location Suggestions Dropdown */}
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {locationSuggestions.map((location) => (
                      <button
                        key={location.place_id}
                        type="button"
                        onClick={(e) => handleLocationSelect(location, e)}
                        className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors duration-150 cursor-pointer"
                      >
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {location.display_name.split(',')[0]}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {location.display_name}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {formData.latitude && formData.longitude && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Coordinates: {formData.latitude}, {formData.longitude}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Start typing to see location suggestions from OpenStreetMap
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Level</label>
                <Select
                  value={formData.priceLevel || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priceLevel: value }))}
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select price level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUDGET">Budget ($)</SelectItem>
                    <SelectItem value="MODERATE">Moderate ($$)</SelectItem>
                    <SelectItem value="EXPENSIVE">Expensive ($$$)</SelectItem>
                    <SelectItem value="LUXURY">Luxury ($$$$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Info</label>
                <input
                  type="text"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phone number"
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>

                {/* File Input */}
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={actionLoading === 'create' || actionLoading === 'edit'}
                  />

                  {/* Image Preview */}
                  {filePreview && (
                    <div className="relative inline-block">
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        disabled={actionLoading === 'create' || actionLoading === 'edit'}
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Alternative: Image URL Input */}
                  <div className="text-sm text-gray-600">
                    <span>Or enter image URL: </span>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="https://example.com/image.jpg"
                      disabled={actionLoading === 'create' || actionLoading === 'edit'}
                    />
                  </div>

                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Opening Hours</label>
                <input
                  type="text"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mon-Fri 9AM-5PM"
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter place description"
                disabled={actionLoading === 'create' || actionLoading === 'edit'}
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tag1, tag2, tag3"
                disabled={actionLoading === 'create' || actionLoading === 'edit'}
              />
            </div>

            <div className="flex items-center gap-4 mt-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isApproved"
                  checked={formData.isApproved}
                  onChange={(e) => setFormData(prev => ({ ...prev, isApproved: e.target.checked }))}
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />
                <span className="text-sm font-medium text-gray-700">Approved</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={isCreating ? handleCreate : handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                disabled={!formData.name.trim() || actionLoading === 'create' || actionLoading === 'edit'}
              >
                {actionLoading === 'create' || actionLoading === 'edit' ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isCreating ? 'Create Place' : 'Save Changes'}
              </button>

              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                disabled={actionLoading === 'create' || actionLoading === 'edit'}
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading places...</span>
          </div>
        ) : (
          <>
            {/* Places Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {places.map((place) => {
                const priceLevel = getPriceLevelDisplay(place.priceLevel);
                
                return (
                  <div key={place.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="relative h-48">
                      <img
                        src={place.imageUrl || '/api/placeholder/400/200'}
                        alt={place.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/400/200';
                        }}
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={() => togglePlaceStatus(place.id, place.isActive, 'isActive')}
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            place.isActive 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          } transition-colors cursor-pointer`}
                        >
                          {place.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {place.isActive ? 'Active' : 'Inactive'}
                        </button>
                        
                        <button
                          onClick={() => togglePlaceStatus(place.id, place.isApproved, 'isApproved')}
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            place.isApproved 
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                              : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                          } transition-colors cursor-pointer`}
                        >
                          {place.isApproved ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {place.isApproved ? 'Approved' : 'Pending'}
                        </button>
                      </div>

                      {/* Action Menu */}
                      <div className="absolute top-3 left-3">
                        <div className="relative group">
                          <button className="bg-white/90 hover:bg-white text-gray-700 p-1 rounded-full shadow-sm transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          <div className="absolute left-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-[120px]">
                            <button
                              onClick={() => handleEdit(place)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => deletePlace(place.id)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left border-t border-gray-100"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 truncate">{place.name}</h3>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-medium text-gray-700">{place.rating || 'N/A'}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{place.description}</p>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        {place.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{place.location.name}</span>
                          </div>
                        )}

                        {place.category && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Tag className="h-4 w-4" />
                            <span>{place.category.name}</span>
                          </div>
                        )}

                        {place.priceLevel && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className={`font-medium ${priceLevel.color}`}>
                              {priceLevel.symbol} {priceLevel.text}
                            </span>
                          </div>
                        )}

                        {place.openingHours && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="truncate">{place.openingHours}</span>
                          </div>
                        )}

                        {place.contactInfo && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{place.contactInfo}</span>
                          </div>
                        )}

                        {place.websiteUrl && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Globe className="h-4 w-4" />
                            <a href={place.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {place.tags && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {place.tags.split(',').slice(0, 3).map((tag, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {tag.trim()}
                              </span>
                            ))}
                            {place.tags.split(',').length > 3 && (
                              <span className="text-gray-500 text-xs">
                                +{place.tags.split(',').length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created {formatDate(place.createdAt)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {place.placePhotos?.length || 0} photos
                        </div>
                      </div>

                      {/* Owner Info */}
                      {place.owner && (
                        <div className="mt-2 text-xs text-gray-500">
                          Owner: {place.owner.businessName}
                        </div>
                      )}
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
                  {pagination.totalItems} places
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchPlaces(pagination.currentPage - 1, searchTerm, filterStatus, filterCategory)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchPlaces(pagination.currentPage + 1, searchTerm, filterStatus, filterCategory)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {places.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No places found</div>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </>
        )}

        {/* Summary Stats */}
        {!loading && places.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{pagination.totalItems}</div>
                <div className="text-sm text-gray-600">Total Places</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {places.filter(p => p.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {places.filter(p => p.isApproved).length}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {places.length > 0 
                    ? (places.reduce((sum, p) => sum + (p.rating || 0), 0) / places.length).toFixed(1)
                    : 'N/A'
                  }
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default PlacesDashboard;