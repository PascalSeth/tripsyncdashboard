'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, MoreHorizontal, Calendar, MapPin, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ServiceZones = () => {
  const [serviceZones, setServiceZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'pickup',
    coordinates: '',
    radius: ''
  });

  // Fetch service zones from API
  const fetchServiceZones = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search })
      });

      const response = await fetch(`/api/services/zones?${params}`);
      const data = await response.json();

      if (data.success) {
        setServiceZones(data.data || []);
        setPagination(data.pagination || {});
        setError('');
      } else {
        setError(data.error || 'Failed to fetch service zones');
      }
    } catch (err) {
      setError('Failed to load service zones');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchServiceZones();
  }, []);

  // Search handler with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchServiceZones(1, searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'pickup',
      coordinates: '',
      radius: ''
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create new service zone
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      setError('Service zone name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        type: formData.type,
        coordinates: formData.coordinates?.trim() || '',
        radius: formData.radius ? parseFloat(formData.radius) : null
      };

      const response = await fetch('/api/services/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchServiceZones(); // Refresh the list
        resetForm();
        setIsCreating(false);
      } else {
        setError(data.error || 'Failed to create service zone');
      }
    } catch (err) {
      setError('Failed to create service zone');
      console.error('Create error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start editing
  const handleEdit = (serviceZone) => {
    setFormData({
      name: serviceZone.name,
      description: serviceZone.description || '',
      type: serviceZone.type || 'pickup',
      coordinates: serviceZone.coordinates || '',
      radius: serviceZone.radius?.toString() || ''
    });
    setEditingId(serviceZone.id);
    setError('');
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!formData.name.trim()) {
      setError('Service zone name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const submitData = {
        id: editingId,
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        type: formData.type,
        coordinates: formData.coordinates?.trim() || '',
        radius: formData.radius ? parseFloat(formData.radius) : null
      };

      const response = await fetch('/api/services/zones', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchServiceZones(); // Refresh the list
        setEditingId(null);
        resetForm();
      } else {
        setError(data.error || 'Failed to update service zone');
      }
    } catch (err) {
      setError('Failed to update service zone');
      console.error('Update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    resetForm();
    setError('');
  };

  // Delete service zone
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/services/zones/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchServiceZones(); // Refresh the list
      } else {
        setError(data.error || 'Failed to delete service zone');
      }
    } catch (err) {
      setError('Failed to delete service zone');
      console.error('Delete error:', err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get service zone stats
  const getServiceZoneStats = () => {
    return {
      totalServiceZones: serviceZones.length,
      pickupZones: serviceZones.filter(sz => sz.type === 'pickup').length,
      dropoffZones: serviceZones.filter(sz => sz.type === 'dropoff').length,
      activeZones: serviceZones.filter(sz => sz.isActive !== false).length
    };
  };

  const stats = getServiceZoneStats();

  // Form Component
  const ServiceZoneForm = ({ onSave, onCancel, submitText }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{submitText} Service Zone</CardTitle>
        <CardDescription>
          {submitText === 'Create' ? 'Add a new service zone' : 'Update service zone details'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter service zone name"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter service zone description"
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="pickup">Pickup Zone</option>
            <option value="dropoff">Dropoff Zone</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coordinates">Coordinates</Label>
          <Input
            id="coordinates"
            name="coordinates"
            value={formData.coordinates}
            onChange={handleInputChange}
            placeholder="e.g., 5.6037,-0.1870"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="radius">Radius (meters)</Label>
          <Input
            id="radius"
            name="radius"
            type="number"
            value={formData.radius}
            onChange={handleInputChange}
            placeholder="Enter radius in meters"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={onSave}
            className="flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSubmitting ? 'Saving...' : submitText}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex items-center gap-2"
            disabled={isSubmitting}
          >
            <X size={16} />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Zones</h1>
          <p className="text-muted-foreground">Manage your service zones and geographic coverage areas</p>
        </div>
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Search service zones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          {!isCreating && !editingId && (
            <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
              <Plus size={20} />
              Add Service Zone
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && !isCreating && !editingId && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Create Form */}
      {isCreating && (
        <ServiceZoneForm
          onSave={handleCreate}
          onCancel={handleCancelEdit}
          submitText="Create"
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Zones</CardTitle>
            <div className="text-2xl font-bold">{stats.totalServiceZones}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pickup Zones</CardTitle>
            <div className="text-2xl font-bold text-blue-600">{stats.pickupZones}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dropoff Zones</CardTitle>
            <div className="text-2xl font-bold text-green-600">{stats.dropoffZones}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Zones</CardTitle>
            <div className="text-2xl font-bold text-purple-600">{stats.activeZones}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gray-400" />
            <CardTitle className="mb-2">Loading service zones...</CardTitle>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && serviceZones.length === 0 && !searchTerm && (
        <Card className="p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <CardTitle className="mb-2">No service zones yet</CardTitle>
            <CardDescription>Create your first service zone to get started</CardDescription>
          </div>
        </Card>
      )}

      {/* No Search Results */}
      {!isLoading && serviceZones.length === 0 && searchTerm && (
        <Card className="p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <CardTitle className="mb-2">No service zones found</CardTitle>
            <CardDescription>Try adjusting your search terms</CardDescription>
          </div>
        </Card>
      )}

      {/* Service Zones Grid */}
      {!isLoading && serviceZones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceZones.map((serviceZone) => (
            <Card key={serviceZone.id} className="relative overflow-hidden">
              {editingId === serviceZone.id ? (
                <CardContent className="p-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-4">
                      {error}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-name-${serviceZone.id}`}>Name *</Label>
                      <Input
                        id={`edit-name-${serviceZone.id}`}
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`edit-description-${serviceZone.id}`}>Description</Label>
                      <Textarea
                        id={`edit-description-${serviceZone.id}`}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`edit-type-${serviceZone.id}`}>Type</Label>
                      <select
                        id={`edit-type-${serviceZone.id}`}
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      >
                        <option value="pickup">Pickup Zone</option>
                        <option value="dropoff">Dropoff Zone</option>
                        <option value="both">Both</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`edit-coordinates-${serviceZone.id}`}>Coordinates</Label>
                      <Input
                        id={`edit-coordinates-${serviceZone.id}`}
                        name="coordinates"
                        value={formData.coordinates}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`edit-radius-${serviceZone.id}`}>Radius (meters)</Label>
                      <Input
                        id={`edit-radius-${serviceZone.id}`}
                        name="radius"
                        type="number"
                        value={formData.radius}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleSaveEdit}
                        size="sm"
                        className="flex items-center gap-1"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        size="sm"
                        className="flex items-center gap-1"
                        disabled={isSubmitting}
                      >
                        <X size={14} />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              ) : (
                <>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <MapPin size={24} className="text-gray-400" />
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(serviceZone)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Service Zone</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{serviceZone.name}"? This will affect all related bookings. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(serviceZone.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <CardTitle className="text-xl mb-1">{serviceZone.name}</CardTitle>
                        {serviceZone.description && (
                          <CardDescription className="text-sm">{serviceZone.description}</CardDescription>
                        )}
                      </div>

                      {/* Type and Status */}
                      <div className="flex gap-2">
                        <Badge variant="outline" className="capitalize">
                          {serviceZone.type || 'pickup'}
                        </Badge>
                        <Badge variant={serviceZone.isActive !== false ? "default" : "secondary"}>
                          {serviceZone.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {/* Zone Details */}
                      {serviceZone.coordinates && (
                        <div className="text-sm text-muted-foreground">
                          <div>Coordinates: {serviceZone.coordinates}</div>
                          {serviceZone.radius && (
                            <div>Radius: {serviceZone.radius}m</div>
                          )}
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          Created: {formatDate(serviceZone.createdAt)}
                        </div>
                        <div>
                          Updated: {formatDate(serviceZone.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => fetchServiceZones(pagination.page - 1, searchTerm)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchServiceZones(pagination.page + 1, searchTerm)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceZones;