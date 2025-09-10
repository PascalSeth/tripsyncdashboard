'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, MoreHorizontal, Calendar, Image, Upload, Loader2, AlertCircle, Search, Filter } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  storeTypes?: string[];
  productCount?: number;
  subcategories?: any[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Category form extracted to a stable, top-level component to prevent remounting
 * which was causing input focus loss after each keystroke.
 */
const CategoryForm: React.FC<{
  formData: { name: string; description: string; storeTypes: string[] };
  error: string;
  isSubmitting: boolean;
  selectedFile: File | null;
  filePreview: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onStoreTypeChange: (storeType: string, checked: boolean) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  submitText: string;
}> = ({
  formData,
  error,
  isSubmitting,
  selectedFile,
  filePreview,
  onInputChange,
  onStoreTypeChange,
  onFileChange,
  onSave,
  onCancel,
  submitText
}) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>{submitText} Category</CardTitle>
      <CardDescription>
        {submitText === 'Create' ? 'Add a new product category' : 'Update category details'}
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
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Enter category name"
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="Enter category description"
          rows={3}
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-2">
        <Label>Store Types *</Label>
        <div className="grid grid-cols-2 gap-2">
          {['GROCERY', 'PHARMACY', 'RESTAURANT', 'RETAIL', 'ELECTRONICS', 'OTHER'].map((storeType) => (
            <div key={storeType} className="flex items-center space-x-2">
              <Checkbox
                id={`storeType-${storeType}`}
                checked={formData.storeTypes.includes(storeType)}
                onCheckedChange={(checked) => onStoreTypeChange(storeType, !!checked)}
                disabled={isSubmitting}
              />
              <Label
                htmlFor={`storeType-${storeType}`}
                className="text-sm font-normal cursor-pointer"
              >
                {storeType.charAt(0) + storeType.slice(1).toLowerCase()}
              </Label>
            </div>
          ))}
        </div>
        {formData.storeTypes.length === 0 && (
          <p className="text-sm text-red-600">At least one store type must be selected</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Category Image</Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          disabled={isSubmitting}
        />
        {selectedFile && (
          <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
        )}
        {filePreview && (
          <div className="mt-2">
            <img
              src={filePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded border border-gray-300"
            />
          </div>
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

const ProductCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    storeTypes: [] as string[],
    image: null as File | null
  });

  // File handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed values
  const isSubmitting = actionLoading !== null;

  // Fetch categories from API
  const fetchCategories = async (page = 1, search = '', status = '') => {
    try {
      setIsLoading(true);
      setError('');

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(status && status !== 'all' && { status })
      });

      const response = await fetch(`/api/stores/categories?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setCategories(data.data || []);
        if (data.pagination) {
          setPagination(prev => ({
            ...prev,
            page: data.pagination.page || data.pagination.currentPage || 1,
            totalPages: data.pagination.totalPages || 1,
            total: data.pagination.total || data.pagination.totalItems || 0
          }));
        }
        setError('');
      } else {
        setError(data.message || 'Failed to fetch categories');
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle filter changes
  useEffect(() => {
    fetchCategories(1, debouncedSearchTerm, filterStatus);
  }, [debouncedSearchTerm, filterStatus]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      storeTypes: [],
      image: null
    });
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

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file input change (for backward compatibility)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e);
  };

  // Handle store type checkbox change
  const handleStoreTypeChange = (storeType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      storeTypes: checked
        ? [...prev.storeTypes, storeType]
        : prev.storeTypes.filter(type => type !== storeType)
    }));
  };

  // Create new category
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    if (formData.storeTypes.length === 0) {
      setError('At least one store type must be selected');
      return;
    }

    try {
      setActionLoading('create');
      setError('');

      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      // Send each store type as a separate form field
      formData.storeTypes.forEach(storeType => {
        submitData.append('storeTypes', storeType);
      });
      if (formData.description?.trim()) {
        submitData.append('description', formData.description.trim());
      }
      if (selectedFile) {
        submitData.append('image', selectedFile);
      }

      const response = await fetch('/api/stores/categories', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (data.success) {
        fetchCategories(pagination.page, debouncedSearchTerm, filterStatus);
        resetForm();
        setIsCreating(false);
      } else {
        setError(data.message || 'Failed to create category');
      }
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category');
    } finally {
      setActionLoading(null);
    }
  };

  // Start editing
  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      storeTypes: category.storeTypes || [],
      image: null // Reset image file input
    });
    setEditingId(category.id);
    setError('');
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    if (formData.storeTypes.length === 0) {
      setError('At least one store type must be selected');
      return;
    }

    try {
      setActionLoading('edit');
      setError('');

      const submitData = new FormData();
      if (editingId) {
        submitData.append('id', editingId);
      }
      submitData.append('name', formData.name.trim());
      // Send each store type as a separate form field
      formData.storeTypes.forEach(storeType => {
        submitData.append('storeTypes', storeType);
      });
      if (formData.description?.trim()) {
        submitData.append('description', formData.description.trim());
      }
      if (selectedFile) {
        submitData.append('image', selectedFile);
      }

      const response = await fetch(`/api/stores/categories/${editingId}`, {
        method: 'PUT',
        body: submitData,
      });

      const data = await response.json();

      if (data.success) {
        fetchCategories(pagination.page, debouncedSearchTerm, filterStatus);
        setEditingId(null);
        resetForm();
      } else {
        setError(data.message || 'Failed to update category');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category');
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

  // Delete category
  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/stores/categories/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchCategories(pagination.page, debouncedSearchTerm, filterStatus);
      } else {
        setError(data.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
    }
  };

  // Format date
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get category stats
  const getCategoryStats = () => {
    return {
      totalCategories: categories.length,
      totalProducts: categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0),
      withImages: categories.filter(cat => cat.imageUrl || cat.image).length,
      avgSubcategories: categories.length > 0 ? 
        Math.round(categories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0) / categories.length) : 0
    };
  };

  const stats = getCategoryStats();

  // CategoryForm moved to top-level for stability

  return (
    <div className="min-h-screen bg-gray-50 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Categories</h1>
              <p className="text-gray-600">Manage your product categories and organize your inventory</p>
            </div>
            {!isCreating && !editingId && (
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                disabled={!!actionLoading}
              >
                <Plus className="h-5 w-5" />
                Add Category
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

      {/* Create Form */}
      {isCreating && (
        <CategoryForm
          onSave={handleCreate}
          onCancel={handleCancel}
          submitText="Create"
          error={error}
          formData={formData}
          isSubmitting={isSubmitting}
          selectedFile={selectedFile}
          filePreview={filePreview}
          onInputChange={handleInputChange}
          onStoreTypeChange={handleStoreTypeChange}
          onFileChange={handleFileChange}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <div className="text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
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
            <CardTitle className="text-sm font-medium">Avg Subcategories</CardTitle>
            <div className="text-2xl font-bold text-purple-600">{stats.avgSubcategories}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gray-400" />
            <CardTitle className="mb-2">Loading categories...</CardTitle>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && categories.length === 0 && !searchTerm && (
        <Card className="p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📦</div>
            <CardTitle className="mb-2">No categories yet</CardTitle>
            <CardDescription>Create your first product category to get started</CardDescription>
          </div>
        </Card>
      )}

      {/* No Search Results */}
      {!isLoading && categories.length === 0 && searchTerm && (
        <Card className="p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <CardTitle className="mb-2">No categories found</CardTitle>
            <CardDescription>Try adjusting your search terms</CardDescription>
          </div>
        </Card>
      )}

      {/* Categories Grid */}
      {!isLoading && categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="relative overflow-hidden">
              {editingId === category.id ? (
                <CardContent className="p-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-4">
                      {error}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-name-${category.id}`}>Name *</Label>
                      <input
                        id={`edit-name-${category.id}`}
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`edit-description-${category.id}`}>Description</Label>
                      <textarea
                        id={`edit-description-${category.id}`}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Store Types *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['GROCERY', 'PHARMACY', 'RESTAURANT', 'RETAIL', 'ELECTRONICS', 'OTHER'].map((storeType) => (
                          <div key={storeType} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-storeType-${storeType}-${category.id}`}
                              checked={formData.storeTypes.includes(storeType)}
                              onCheckedChange={(checked) => handleStoreTypeChange(storeType, !!checked)}
                              disabled={isSubmitting}
                            />
                            <Label
                              htmlFor={`edit-storeType-${storeType}-${category.id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {storeType.charAt(0) + storeType.slice(1).toLowerCase()}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formData.storeTypes.length === 0 && (
                        <p className="text-sm text-red-600">At least one store type must be selected</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`edit-image-${category.id}`}>Category Image</Label>
                      <Input
                        id={`edit-image-${category.id}`}
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                      />
                      {selectedFile && (
                        <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
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
                        onClick={handleCancel}
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
                  {(category.imageUrl || category.image) ? (
                    <div 
                      className="h-48 bg-cover bg-center relative" 
                      style={{backgroundImage: `url(${category.imageUrl || category.image})`}}
                    >
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
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
                                  <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{category.name}"? This will also delete all subcategories and products. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteCategory(category.id)}
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
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
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
                                  <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{category.name}"? This will also delete all subcategories and products. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteCategory(category.id)}
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
                  
                  <CardContent className={category.imageUrl || category.image ? "pt-4" : ""}>
                    <div className="space-y-3">
                      <div>
                        <CardTitle className="text-xl mb-1">{category.name}</CardTitle>
                        {category.description && (
                          <CardDescription className="text-sm">{category.description}</CardDescription>
                        )}
                      </div>
                      
                      {/* Stats */}
                      <div className="flex gap-4 py-2">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{category.productCount || 0}</div>
                          <div className="text-xs text-muted-foreground">Products</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-purple-600">{category.subcategories?.length || 0}</div>
                          <div className="text-xs text-muted-foreground">Subcategories</div>
                        </div>
                      </div>

                      {/* Subcategories */}
                      {category.subcategories && category.subcategories.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">Subcategories:</div>
                          <div className="flex flex-wrap gap-1">
                            {category.subcategories.slice(0, 3).map((sub, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {sub.name || sub}
                              </Badge>
                            ))}
                            {category.subcategories.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{category.subcategories.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Timestamps */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          Created: {formatDate(category.createdAt)}
                        </div>
                        <div>
                          Updated: {formatDate(category.updatedAt)}
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
            onClick={() => fetchCategories(pagination.page - 1, debouncedSearchTerm)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchCategories(pagination.page + 1, debouncedSearchTerm)}
          >
            Next
          </Button>
        </div>
      )}
      </div>
    </div>
  );
};

export default ProductCategories;