'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, MoreHorizontal, Loader2, AlertCircle } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
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

// Types matching your PlaceCategory model structure
interface PlaceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

const Categories = () => {
  const [categories, setCategories] = useState<PlaceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    sortOrder: 0,
    isActive: true
  });

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/places/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      sortOrder: 0,
      isActive: true
    });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle checkbox change for shadcn checkbox
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isActive: checked
    }));
  };

  // Create new category
  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    
    try {
      setActionLoading('create');
      setError(null);
      
      const response = await fetch('/api/places/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sortOrder: parseInt(formData.sortOrder.toString()) || 0
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchCategories(); // Refresh the list
        resetForm();
        setIsCreating(false);
      } else {
        setError(data.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Failed to create category');
    } finally {
      setActionLoading(null);
    }
  };

  // Start editing
  const handleEdit = (category: PlaceCategory) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      sortOrder: category.sortOrder,
      isActive: category.isActive
    });
    setEditingId(category.id);
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!formData.name.trim() || !editingId) return;
    
    try {
      setActionLoading('edit');
      setError(null);
      
      const response = await fetch('/api/places/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingId,
          ...formData,
          sortOrder: parseInt(formData.sortOrder.toString()) || 0
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchCategories(); // Refresh the list
        setEditingId(null);
        resetForm();
      } else {
        setError(data.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category');
    } finally {
      setActionLoading(null);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    resetForm();
    setError(null);
  };

  // Delete category
  const handleDelete = async (id: string) => {
    try {
      setActionLoading(`delete-${id}`);
      setError(null);
      
      const response = await fetch(`/api/places/categories?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchCategories(); // Refresh the list
      } else {
        setError(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle active status
  const toggleActive = async (category: PlaceCategory) => {
    try {
      setActionLoading(`toggle-${category.id}`);
      setError(null);
      
      const response = await fetch('/api/places/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: category.id,
          ...category,
          isActive: !category.isActive
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchCategories(); // Refresh the list
      } else {
        setError(data.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
      setError('Failed to update category');
    } finally {
      setActionLoading(null);
    }
  };

  // Sort categories by sortOrder
  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  // Loading spinner component
  const LoadingSpinner = ({ size = 16 }: { size?: number }) => (
    <Loader2 size={size} className="animate-spin" />
  );

  // Error display component
  const ErrorDisplay = () => error && (
    <Card className="mb-6 border-red-200 bg-red-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-700"
          >
            <X size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Form Component
  const CategoryForm = ({ onSave, onCancel, submitText }: {
    onSave: () => void;
    onCancel: () => void;
    submitText: string;
  }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{submitText} Category</CardTitle>
        <CardDescription>
          {submitText === 'Create' ? 'Add a new place category' : 'Update category details'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter category name"
              disabled={actionLoading === 'create' || actionLoading === 'edit'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              placeholder="e.g., 🏪"
              disabled={actionLoading === 'create' || actionLoading === 'edit'}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter category description"
            rows={3}
            disabled={actionLoading === 'create' || actionLoading === 'edit'}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={handleInputChange}
              placeholder="0"
              disabled={actionLoading === 'create' || actionLoading === 'edit'}
            />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleCheckboxChange}
              disabled={actionLoading === 'create' || actionLoading === 'edit'}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={onSave} 
            className="flex items-center gap-2"
            disabled={!formData.name.trim() || actionLoading === 'create' || actionLoading === 'edit'}
          >
            {(actionLoading === 'create' || actionLoading === 'edit') ? (
              <LoadingSpinner />
            ) : (
              <Save size={16} />
            )}
            {submitText}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel} 
            className="flex items-center gap-2"
            disabled={actionLoading === 'create' || actionLoading === 'edit'}
          >
            <X size={16} />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <LoadingSpinner size={32} />
            <p className="text-muted-foreground mt-4">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Place Categories</h1>
          <p className="text-muted-foreground">Manage your place categories and their settings</p>
        </div>
        {!isCreating && !editingId && (
          <Button 
            onClick={() => setIsCreating(true)} 
            className="flex items-center gap-2"
            disabled={!!actionLoading}
          >
            <Plus size={20} />
            Add Category
          </Button>
        )}
      </div>

      {/* Error Display */}
      <ErrorDisplay />

      {/* Create Form */}
      {isCreating && (
        <CategoryForm 
          onSave={handleCreate} 
          onCancel={handleCancelEdit} 
          submitText="Create" 
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <div className="text-2xl font-bold text-green-600">
              {categories.filter(cat => cat.isActive).length}
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <div className="text-2xl font-bold text-red-600">
              {categories.filter(cat => !cat.isActive).length}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Categories Grid */}
      {sortedCategories.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📁</div>
            <CardTitle className="mb-2">No categories yet</CardTitle>
            <CardDescription>Create your first category to get started</CardDescription>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCategories.map((category) => (
            <Card key={category.id} className="relative">
              {editingId === category.id ? (
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-name-${category.id}`}>Name *</Label>
                      <Input
                        id={`edit-name-${category.id}`}
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={actionLoading === 'edit'}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`edit-icon-${category.id}`}>Icon</Label>
                      <Input
                        id={`edit-icon-${category.id}`}
                        name="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        disabled={actionLoading === 'edit'}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`edit-description-${category.id}`}>Description</Label>
                      <Textarea
                        id={`edit-description-${category.id}`}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        disabled={actionLoading === 'edit'}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-sort-${category.id}`}>Sort Order</Label>
                        <Input
                          id={`edit-sort-${category.id}`}
                          name="sortOrder"
                          type="number"
                          value={formData.sortOrder}
                          onChange={handleInputChange}
                          disabled={actionLoading === 'edit'}
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          id={`edit-active-${category.id}`}
                          checked={formData.isActive}
                          onCheckedChange={handleCheckboxChange}
                          disabled={actionLoading === 'edit'}
                        />
                        <Label htmlFor={`edit-active-${category.id}`}>Active</Label>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={handleSaveEdit} 
                        size="sm" 
                        className="flex items-center gap-1"
                        disabled={!formData.name.trim() || actionLoading === 'edit'}
                      >
                        {actionLoading === 'edit' ? <LoadingSpinner size={14} /> : <Save size={14} />}
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancelEdit} 
                        size="sm" 
                        className="flex items-center gap-1"
                        disabled={actionLoading === 'edit'}
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
                        <span className="text-2xl">{category.icon || '📁'}</span>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <CardDescription>Order: {category.sortOrder}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={!!actionLoading}
                          >
                            {actionLoading === `toggle-${category.id}` ? (
                              <LoadingSpinner />
                            ) : (
                              <MoreHorizontal size={16} />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleEdit(category)}
                            disabled={!!actionLoading}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => toggleActive(category)}
                            disabled={!!actionLoading}
                          >
                            {category.isActive ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()} 
                                className="text-red-600"
                                disabled={!!actionLoading}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={actionLoading === `delete-${category.id}`}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(category.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={actionLoading === `delete-${category.id}`}
                                >
                                  {actionLoading === `delete-${category.id}` ? (
                                    <>
                                      <LoadingSpinner size={14} />
                                      Deleting...
                                    </>
                                  ) : (
                                    'Delete'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">ID: {category.id}</span>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;