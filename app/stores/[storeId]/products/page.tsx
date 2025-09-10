'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import {
  Package,
  Star,
  DollarSign,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Calendar,
  Loader,
  AlertCircle,
  Trash2,
  Edit,
  MoreVertical,
  Plus,
  Save,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Product, ProductCategory, ProductSubcategory } from '@/types/product'

interface Store {
  id: string
  name: string
  type: string
}

const StoreProducts = () => {
  const params = useParams()
  const storeId = params.storeId as string

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSubcategory, setFilterSubcategory] = useState('')
  const [filterInStock, setFilterInStock] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  })

  // Store info
  const [store, setStore] = useState<Store | null>(null)

  // Categories and subcategories for forms
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [subcategories, setSubcategories] = useState<ProductSubcategory[]>([])

  // CRUD states
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    subcategoryId: '',
    stockQuantity: '',
    inStock: true,
    imageUrls: [] as string[]
  })

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [filePreviews, setFilePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch store info
  const fetchStore = async () => {
    try {
      const response = await fetch(`/api/stores/${storeId}`)
      const data = await response.json()
      if (data.success) {
        setStore(data.data)
      }
    } catch (error) {
      console.error('Error fetching store:', error)
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/product-categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Fetch subcategories
  const fetchSubcategories = async (categoryId?: string) => {
    try {
      const url = categoryId
        ? `/api/product-subcategories?categoryId=${categoryId}`
        : '/api/product-subcategories'
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setSubcategories(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    }
  }

  // Fetch products
  const fetchProducts = async (page = 1, search = '', category = '', subcategory = '', inStock = '') => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(category && { category }),
        ...(subcategory && { subcategoryId: subcategory }),
        ...(inStock && { inStock })
      })

      const response = await fetch(`/api/stores/${storeId}/products?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data.products || [])
        if (data.data.pagination) {
          setPagination(data.data.pagination)
        }
        setError('')
      } else {
        setError(data.message || 'Failed to fetch products')
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to fetch products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Delete product
  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/stores/${storeId}/products/${productId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchProducts(pagination.page, searchTerm, filterCategory, filterSubcategory, filterInStock)
      } else {
        alert('Failed to delete product: ' + (data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      subcategoryId: '',
      stockQuantity: '',
      inStock: true,
      imageUrls: []
    })
    setSelectedFiles([])
    setFilePreviews([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + selectedFiles.length > 5) {
      alert('Maximum 5 images allowed')
      return
    }

    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select image files only')
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
    })

    setSelectedFiles(prev => [...prev, ...files])

    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  // Remove file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setFilePreviews(prev => prev.filter((_, i) => i !== index))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (name === 'categoryId') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        subcategoryId: '' // Reset subcategory when category changes
      }))
      fetchSubcategories(value)
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  // Create new product
  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.price || !formData.categoryId) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setActionLoading('create')

      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('categoryId', formData.categoryId)

      if (formData.description) formDataToSend.append('description', formData.description)
      if (formData.subcategoryId) formDataToSend.append('subcategoryId', formData.subcategoryId)
      if (formData.stockQuantity) formDataToSend.append('stockQuantity', formData.stockQuantity)
      formDataToSend.append('inStock', formData.inStock.toString())

      selectedFiles.forEach(file => {
        formDataToSend.append('images', file)
      })

      const response = await fetch(`/api/stores/${storeId}/products`, {
        method: 'POST',
        body: formDataToSend
      })

      const data = await response.json()

      if (data.success) {
        fetchProducts(pagination.page, searchTerm, filterCategory, filterSubcategory, filterInStock)
        resetForm()
        setIsCreating(false)
      } else {
        alert('Failed to create product: ' + (data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product')
    } finally {
      setActionLoading(null)
    }
  }

  // Start editing
  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId || '',
      stockQuantity: product.stockQuantity.toString(),
      inStock: product.inStock,
      imageUrls: product.images || []
    })
    setSelectedFiles([])
    setFilePreviews([])
    setEditingId(product.id)
    fetchSubcategories(product.categoryId)
  }

  // Save edit
  const handleSaveEdit = async () => {
    if (!formData.name.trim() || !formData.price || !formData.categoryId || !editingId) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setActionLoading('edit')

      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('categoryId', formData.categoryId)

      if (formData.description) formDataToSend.append('description', formData.description)
      if (formData.subcategoryId) formDataToSend.append('subcategoryId', formData.subcategoryId)
      if (formData.stockQuantity) formDataToSend.append('stockQuantity', formData.stockQuantity)
      formDataToSend.append('inStock', formData.inStock.toString())

      selectedFiles.forEach(file => {
        formDataToSend.append('images', file)
      })

      const response = await fetch(`/api/stores/${storeId}/products/${editingId}`, {
        method: 'PUT',
        body: formDataToSend
      })

      const data = await response.json()

      if (data.success) {
        fetchProducts(pagination.page, searchTerm, filterCategory, filterSubcategory, filterInStock)
        setEditingId(null)
        resetForm()
      } else {
        alert('Failed to update product: ' + (data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product')
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

  // Initial data fetch
  useEffect(() => {
    if (storeId) {
      fetchStore()
      fetchCategories()
      fetchSubcategories()
      fetchProducts()
    }
  }, [storeId])

  // Handle filter changes
  useEffect(() => {
    fetchProducts(1, searchTerm, filterCategory, filterSubcategory, filterInStock)
  }, [searchTerm, filterCategory, filterSubcategory, filterInStock])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Products - {store?.name || 'Store'}
              </h1>
              <p className="text-gray-600">Manage products for this store</p>
            </div>
            {!isCreating && !editingId && (
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                disabled={!!actionLoading}
              >
                <Plus className="h-5 w-5" />
                Add Product
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Select value={filterSubcategory} onValueChange={setFilterSubcategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Subcategories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subcategories</SelectItem>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Select value={filterInStock} onValueChange={setFilterInStock}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="true">In Stock</SelectItem>
                  <SelectItem value="false">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {isCreating ? 'Add New Product' : 'Edit Product'}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Product name"
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleInputChange({ target: { name: 'categoryId', value } } as any)}
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <Select
                  value={formData.subcategoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subcategoryId: value }))}
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map(subcategory => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  In Stock
                </label>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Product description"
                disabled={actionLoading === 'create' || actionLoading === 'edit'}
              />
            </div>

            {/* Image Upload */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images (Max 5)
              </label>

              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />

                {/* Image Previews */}
                <div className="flex flex-wrap gap-4">
                  {filePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        disabled={actionLoading === 'create' || actionLoading === 'edit'}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500">
                  Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB each
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={isCreating ? handleCreate : handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                disabled={!formData.name.trim() || !formData.price || !formData.categoryId || actionLoading === 'create' || actionLoading === 'edit'}
              >
                {actionLoading === 'create' || actionLoading === 'edit' ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isCreating ? 'Add Product' : 'Save Changes'}
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
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="relative h-48">
                    <img
                      src={product.image || product.images?.[0] || '/api/placeholder/400/200'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/400/200'
                      }}
                    />

                    {/* Stock Status */}
                    <div className="absolute top-3 right-3">
                      {product.inStock ? (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          In Stock
                        </div>
                      ) : (
                        <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    {/* Action Menu */}
                    <div className="absolute top-3 left-3">
                      <div className="relative group">
                        <button className="bg-white/90 hover:bg-white text-gray-700 p-1 rounded-full shadow-sm transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        <div className="absolute left-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-[120px]">
                          <button
                            onClick={() => handleEdit(product)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
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
                      <h3 className="text-xl font-semibold text-gray-900 truncate">
                        {product.name}
                      </h3>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Price and Stock */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(product.price)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Stock: {product.stockQuantity}
                      </div>
                    </div>

                    {/* Category */}
                    {product.category && (
                      <div className="text-sm text-gray-600 mb-2">
                        Category: {product.category.name}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Updated {formatDate(product.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="text-sm text-gray-600">
                  Showing {Math.min(pagination.limit * (pagination.page - 1) + 1, pagination.total)} to{' '}
                  {Math.min(pagination.limit * pagination.page, pagination.total)} of{' '}
                  {pagination.total} products
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchProducts(pagination.page - 1, searchTerm, filterCategory, filterSubcategory, filterInStock)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchProducts(pagination.page + 1, searchTerm, filterCategory, filterSubcategory, filterInStock)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 text-lg mb-2">No products found</div>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </>
        )}

        {/* Summary Stats */}
        {!loading && products.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.inStock).length}
                </div>
                <div className="text-sm text-gray-600">In Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {products.filter(p => p.images && p.images.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">With Images</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StoreProducts