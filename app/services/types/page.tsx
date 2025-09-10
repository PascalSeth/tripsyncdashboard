'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, MoreHorizontal, Calendar, Image, Upload, Loader2 } from 'lucide-react';
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

const ServiceTypes = () => {
  const [serviceTypes, setServiceTypes] = useState([]);
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
    image: null
  });

  // Fetch service types from API
  const fetchServiceTypes = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search })
      });

      const response = await fetch(`/api/services/types?${params}`);
      const data = await response.json();

      if (data.success) {
        setServiceTypes(data.data || []);
        setPagination(data.pagination || {});
        setError('');
      } else {
        setError(data.error || 'Failed to fetch service types');
      }
    } catch (err) {
      setError('Failed to load service types');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchServiceTypes();
  }, []);

  // Search handler with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchServiceTypes(1, searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: null
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

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  // Create new service type
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      setError('Service type name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      if (formData.description?.trim()) {
        submitData.append('description', formData.description.trim());
      }
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const response = await fetch('/api/services/types', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (data.success) {
        await fetchServiceTypes(); // Refresh the list
        resetForm();
        setIsCreating(false);
      } else {
        setError(data.error || 'Failed to create service type');
      }
    } catch (err) {
      setError('Failed to create service type');
      console.error('Create error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start editing
  const handleEdit = (serviceType) => {
    setFormData({
      name: serviceType.name,
      description: serviceType.description || '',
      image: null // Reset image file input
    });
    setEditingId(serviceType.id);
    setError('');
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!formData.name.trim()) {
      setError('Service type name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('id', editingId);
      submitData.append('name', formData.name.trim());
      if (formData.description?.trim()) {
        submitData.append('description', formData.description.trim());
      }
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const response = await fetch('/api/services/types', {
        method: 'PUT',
        body: submitData,
      });

      const data = await response.json();

      if (data.success) {
        await fetchServiceTypes(); // Refresh the list
        setEditingId(null);
        resetForm();
      } else {
        setError(data.error || 'Failed to update service type');
      }
    } catch (err) {
      setError('Failed to update service type');
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

  // Delete service type
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/services/types/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchServiceTypes(); // Refresh the list
      } else {
        setError(data.error || 'Failed to delete service type');
      }
    } catch (err) {
      setError('Failed to delete service type');
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

  // Get service type stats
  const getServiceTypeStats = () => {
    return {
      totalServiceTypes: serviceTypes.length,
      withImages: serviceTypes.filter(st => st.imageUrl || st.image).length,
      activeServiceTypes: serviceTypes.filter(st => st.isActive !== false).length
    };
  };

  const stats = getServiceTypeStats();

  // Form Component
  const ServiceTypeForm = ({ onSave, onCancel, submitText }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{submitText} Service Type</CardTitle>
        <CardDescription>
          {submitText === 'Create' ? 'Add a new service type' : 'Update service type details'}
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
            placeholder="Enter service type name"
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
            placeholder="Enter service type description"
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Service Type Image</Label>
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isSubmitting}
          />
          {formData.image && (
            <p className="text-sm text-gray-600">Selected: {formData.image.name}</p>
          )}
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
          <h1 className="text-3xl font-bold tracking-tight">Service Types</h1>
          <p className="text-muted-foreground">Manage your service types and organize your offerings</p>
        </div>
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Search service types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          {!isCreating && !editingId && (
            <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
              <Plus size={20} />
              Add Service Type
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
        <ServiceTypeForm
          onSave={handleCreate}
          onCancel={handleCancelEdit}
          submitText="Create"
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Service Types</CardTitle>
            <div className="text-2xl font-bold">{stats.totalServiceTypes}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Images</CardTitle>
            <div className="text-2xl font-bold text-green-600">{stats.withImages}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <div className="text-2xl font-bold text-blue-600">{stats.activeServiceTypes}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gray-400" />
            <CardTitle className="mb-2">Loading service types...</CardTitle>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && serviceTypes.length === 0 && !searchTerm && (
        <Card className="p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🚗</div>
            <CardTitle className="mb-2">No service types yet</CardTitle>
            <CardDescription>Create your first service type to get started</CardDescription>
          </div>
        </Card>
      )}

      {/* No Search Results */}
      {!isLoading && serviceTypes.length === 0 && searchTerm && (
        <Card className="p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <CardTitle className="mb-2">No service types found</CardTitle>
            <CardDescription>Try adjusting your search terms</CardDescription>
          </div>
        </Card>
      )}

      {/* Service Types Grid */}
      {!isLoading && serviceTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceTypes.map((serviceType) => (
            <Card key={serviceType.id} className="relative overflow-hidden">
              {editingId === serviceType.id ? (
                <CardContent className="p-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-4">
                      {error}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-name-${serviceType.id}`}>Name *</Label>
                      <Input
                        id={`edit-name-${serviceType.id}`}
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`edit-description-${serviceType.id}`}>Description</Label>
                      <Textarea
                        id={`edit-description-${serviceType.id}`}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`edit-image-${serviceType.id}`}>Service Type Image</Label>
                      <Input
                        id={`edit-image-${serviceType.id}`}
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                      />
                      {formData.image && (
                        <p className="text-sm text-gray-600">Selected: {formData.image.name}</p>
                      )}
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
                  {/* Image Header */}
                  {(serviceType.imageUrl || serviceType.image) ? (
                    <div
                      className="h-48 bg-cover bg-center relative"
                      style={{backgroundImage: `url(${serviceType.imageUrl || serviceType.image})`}}
                    >
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(serviceType)}>
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
                                  <AlertDialogTitle>Delete Service Type</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{serviceType.name}"? This will also affect all related bookings. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(serviceType.id)}
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
                    </div>
                  ) : (
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Image size={24} className="text-gray-400" />
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(serviceType)}>
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
                                  <AlertDialogTitle>Delete Service Type</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{serviceType.name}"? This will also affect all related bookings. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(serviceType.id)}
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
                  )}

                  <CardContent className={serviceType.imageUrl || serviceType.image ? "pt-4" : ""}>
                    <div className="space-y-3">
                      <div>
                        <CardTitle className="text-xl mb-1">{serviceType.name}</CardTitle>
                        {serviceType.description && (
                          <CardDescription className="text-sm">{serviceType.description}</CardDescription>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <Badge variant={serviceType.isActive !== false ? "default" : "secondary"}>
                          {serviceType.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {/* Timestamps */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          Created: {formatDate(serviceType.createdAt)}
                        </div>
                        <div>
                          Updated: {formatDate(serviceType.updatedAt)}
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
            onClick={() => fetchServiceTypes(pagination.page - 1, searchTerm)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchServiceTypes(pagination.page + 1, searchTerm)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceTypes;