"use client"

import React, { useState, useEffect, useRef } from "react"
import { Plus, Edit2, Trash2, Save, X, MoreHorizontal, Calendar, Image, Tag, Upload, Loader2, AlertCircle, Search, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Subcategory {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  imageUrl?: string;
  products?: number;
  createdAt?: string;
  updatedAt?: string;
  category?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

/**
 * Hoisted, stable components to prevent remounting and input focus loss.
 */
const ImageUpload: React.FC<{
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  preview?: string | null
}> = ({ onChange, preview }) => (
  <div className="space-y-2">
    <Label>Image</Label>
    <div className="flex items-center gap-4">
      <Input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
      />
      {preview && (
        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  </div>
)

const SubcategoryForm: React.FC<{
  formData: { name: string; description: string; categoryId: string }
  categories: { id: string; name: string }[]
  error: string
  isSubmitting: boolean
  selectedFile: File | null
  filePreview: string | null
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSelectChange: (value: string) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSave: () => void
  onCancel: () => void
  submitText: string
}> = ({
  formData,
  categories,
  error,
  isSubmitting,
  selectedFile,
  filePreview,
  onInputChange,
  onSelectChange,
  onFileChange,
  onSave,
  onCancel,
  submitText,
}) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>{submitText} Subcategory</CardTitle>
      <CardDescription>
        {submitText === "Create" ? "Add a new subcategory" : "Update subcategory details"}
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            placeholder="Enter subcategory name"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Parent Category *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={onSelectChange}
          >
            <SelectTrigger disabled={isSubmitting}>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="Enter subcategory description"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <ImageUpload onChange={onFileChange} preview={filePreview} />

      {selectedFile && (
        <p className="text-xs text-muted-foreground">Selected: {selectedFile.name}</p>
      )}

      <div className="flex gap-2 pt-4">
        <Button onClick={onSave} className="flex items-center gap-2" disabled={isSubmitting}>
          <Save size={16} />
          {submitText}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center gap-2 bg-transparent"
          disabled={isSubmitting}
        >
          <X size={16} />
          Cancel
        </Button>
      </div>
    </CardContent>
  </Card>
)

const Subcategories = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState("all")
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
  })

  // Computed values
  const isSubmitting = actionLoading !== null

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/stores/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const result = await response.json()
      
      // Handle API response structure
      if (result.success && result.data) {
        setCategories(Array.isArray(result.data) ? result.data : [])
      } else {
        console.error('Invalid categories API response:', result)
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  // Fetch subcategories
  const fetchSubcategories = async (page = 1, search = '', categoryId = '') => {
    try {
      setLoading(true)
      setError('')

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(categoryId && categoryId !== 'all' && { categoryId })
      })

      const response = await fetch(`/api/stores/subcategories?${queryParams}`)
      const result = await response.json()

      if (result.success && result.data) {
        setSubcategories(Array.isArray(result.data) ? result.data : [])
        if (result.pagination) {
          setPagination(prev => ({
            ...prev,
            page: result.pagination.page || result.pagination.currentPage || 1,
            totalPages: result.pagination.totalPages || 1,
            total: result.pagination.total || result.pagination.totalItems || 0
          }))
        }
        setError('')
      } else {
        setError(result.message || 'Failed to fetch subcategories')
        setSubcategories([])
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
      setError('Failed to load subcategories')
      setSubcategories([])
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchCategories()
    fetchSubcategories()
  }, [])

  // Handle filter changes
  useEffect(() => {
    fetchSubcategories(1, searchTerm, filterCategory)
  }, [searchTerm, filterCategory])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: "",
    })
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setSelectedFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle select changes
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value,
    }))
  }

  // Handle file input change (for backward compatibility)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e)
  }

  // Create new subcategory
  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.categoryId) {
      setError('Name and category are required')
      return
    }

    try {
      setActionLoading('create')
      setError('')

      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name.trim())
      formDataToSend.append('categoryId', formData.categoryId)
      if (formData.description?.trim()) {
        formDataToSend.append('description', formData.description.trim())
      }
      if (selectedFile) {
        formDataToSend.append('image', selectedFile)
      }

      const response = await fetch('/api/stores/subcategories', {
        method: 'POST',
        body: formDataToSend,
      })

      const result = await response.json()

      if (result.success) {
        fetchSubcategories(pagination.page, searchTerm, filterCategory)
        resetForm()
        setIsCreating(false)
      } else {
        setError(result.message || 'Failed to create subcategory')
      }
    } catch (error) {
      console.error('Error creating subcategory:', error)
      setError('Failed to create subcategory')
    } finally {
      setActionLoading(null)
    }
  }

  // Start editing
  const handleEdit = (subcategory: Subcategory) => {
    setFormData({
      name: subcategory.name,
      description: subcategory.description || "",
      categoryId: subcategory.categoryId,
    })
    setFilePreview(subcategory.imageUrl || "")
    setEditingId(subcategory.id)
    setError('')
  }

  // Save edit
  const handleSaveEdit = async () => {
    if (!formData.name.trim() || !formData.categoryId || !editingId) {
      setError('Name and category are required')
      return
    }

    try {
      setActionLoading('edit')
      setError('')

      const formDataToSend = new FormData()
      formDataToSend.append('id', editingId)
      formDataToSend.append('name', formData.name.trim())
      formDataToSend.append('categoryId', formData.categoryId)
      if (formData.description?.trim()) {
        formDataToSend.append('description', formData.description.trim())
      }
      if (selectedFile) {
        formDataToSend.append('image', selectedFile)
      }

      const response = await fetch(`/api/stores/subcategories/${editingId}`, {
        method: 'PUT',
        body: formDataToSend,
      })

      const result = await response.json()

      if (result.success) {
        fetchSubcategories(pagination.page, searchTerm, filterCategory)
        setEditingId(null)
        resetForm()
      } else {
        setError(result.message || 'Failed to update subcategory')
      }
    } catch (error) {
      console.error('Error updating subcategory:', error)
      setError('Failed to update subcategory')
    } finally {
      setActionLoading(null)
    }
  }

  // Cancel edit/create
  const handleCancel = () => {
    setEditingId(null)
    setIsCreating(false)
    resetForm()
    setError('')
  }

  // Delete subcategory
  const deleteSubcategory = async (id: string) => {
    try {
      const response = await fetch(`/api/stores/subcategories/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        fetchSubcategories(pagination.page, searchTerm, filterCategory)
      } else {
        setError(result.message || 'Failed to delete subcategory')
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error)
      setError('Failed to delete subcategory')
    }
  }

  // Filter subcategories - ensure it's always an array
  const filteredSubcategories = Array.isArray(subcategories) 
    ? (filterCategory === "all" 
        ? subcategories 
        : subcategories.filter((sub) => sub.categoryId === filterCategory))
    : []

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // ImageUpload moved to top-level for stability

  // SubcategoryForm moved to top-level for stability

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading subcategories...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Subcategories</h1>
              <p className="text-gray-600">Manage subcategories within your product categories</p>
            </div>
            {!isCreating && !editingId && (
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                disabled={!!actionLoading}
              >
                <Plus className="h-5 w-5" />
                Add Subcategory
              </button>
            )}
          </div>
        </div>

      {/* Filter Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="filter">Filter by Category:</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="flex items-center gap-1">
              <Tag size={14} />
              {filteredSubcategories.length} subcategories
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Create Form */}
      {isCreating && (
        <SubcategoryForm
          formData={formData}
          categories={categories}
          error={error}
          isSubmitting={isSubmitting}
          selectedFile={selectedFile}
          filePreview={filePreview}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onFileChange={handleImageChange}
          onSave={handleCreate}
          onCancel={handleCancel}
          submitText="Create"
        />
      )}

      {/* Subcategories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubcategories.map((subcategory) => (
          <Card key={subcategory.id} className="relative">
            {/* Edit Form */}
            {editingId === subcategory.id ? (
              <div className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`edit-name-${subcategory.id}`}>Name *</Label>
                    <Input
                      id={`edit-name-${subcategory.id}`}
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter subcategory name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`edit-category-${subcategory.id}`}>Parent Category *</Label>
                    <Select value={formData.categoryId} onValueChange={handleSelectChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`edit-description-${subcategory.id}`}>Description</Label>
                    <Textarea
                      id={`edit-description-${subcategory.id}`}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter subcategory description"
                      rows={2}
                    />
                  </div>

                  <ImageUpload
                    onChange={handleImageChange}
                    preview={filePreview}
                  />

                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSaveEdit} size="sm" className="flex items-center gap-1">
                      <Save size={14} />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      size="sm"
                      className="flex items-center gap-1 bg-transparent"
                    >
                      <X size={14} />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Card Header with Actions */}
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{subcategory.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {subcategory.category?.name || categories.find(c => c.id === subcategory.categoryId)?.name}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(subcategory)}>
                          <Edit2 size={14} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{subcategory.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteSubcategory(subcategory.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                {/* Card Content */}
                <CardContent className="space-y-4">
                  {/* Image */}
                  {subcategory.imageUrl ? (
                    <div className="aspect-video rounded-md overflow-hidden bg-muted">
                      <img
                        src={subcategory.imageUrl}
                        alt={subcategory.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                      <Image size={32} className="text-muted-foreground" />
                    </div>
                  )}

                  {/* Description */}
                  {subcategory.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{subcategory.description}</p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Tag size={14} />
                      {subcategory.products || 0} products
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar size={14} />
                      {formatDate(subcategory.updatedAt || subcategory.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredSubcategories.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Tag size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No subcategories found</h3>
            <p className="text-muted-foreground mb-4">
              {filterCategory === "all"
                ? "Get started by creating your first subcategory."
                : "No subcategories found for the selected category."}
            </p>
            {filterCategory !== "all" && (
              <Button variant="outline" onClick={() => setFilterCategory("all")}>
                Show All Categories
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}

export default Subcategories