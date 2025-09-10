'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Mail,
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
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { validStoreTypes } from '../../types/store'

// OpenStreetMap Nominatim types
interface NominatimResult {
  place_id: string
  licence: string
  osm_type: string
  osm_id: string
  boundingbox: string[]
  lat: string
  lon: string
  display_name: string
  class: string
  type: string
  importance: number
  icon?: string
}

interface Store {
  id: string
  name: string
  type: string
  latitude?: number
  longitude?: number
  address: string
  city?: string
  state?: string
  zipCode?: string
  phone?: string
  email?: string
  description?: string
  image?: string
  createdAt?: string
  updatedAt?: string
}

const Stores = () => {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  })

  // CRUD states
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    type: '',
    imageUrl: ''
  })

  // OpenStreetMap location search state
  const locationInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const [locationSuggestions, setLocationSuggestions] = useState<NominatimResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [locationInput, setLocationInput] = useState('')
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Business hours state
  const [businessHours, setBusinessHours] = useState([
    { dayOfWeek: 1, dayName: 'Monday', openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 2, dayName: 'Tuesday', openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 3, dayName: 'Wednesday', openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 4, dayName: 'Thursday', openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 5, dayName: 'Friday', openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 6, dayName: 'Saturday', openTime: '10:00', closeTime: '16:00', isClosed: false },
    { dayOfWeek: 0, dayName: 'Sunday', openTime: '00:00', closeTime: '00:00', isClosed: true }
  ])

  const storeTypes = validStoreTypes

  // Fetch stores from API
  const fetchStores = async (page = 1, search = '', type = '') => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...(search && { search }),
        ...(type && type !== 'all' && { type })
      })

      const response = await fetch(`/api/stores?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        setStores(data.data.stores || [])
        if (data.pagination) {
          setPagination(prev => ({
            ...prev,
            currentPage: data.pagination.page || data.pagination.currentPage || 1,
            totalPages: data.pagination.totalPages || 1,
            totalItems: data.pagination.total || data.pagination.totalItems || 0
          }))
        }
        setError('')
      } else {
        setError(data.error || 'Failed to fetch stores')
        setStores([])
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
      setError('Failed to fetch stores')
      setStores([])
    } finally {
      setLoading(false)
    }
  }

  // Delete store
  const deleteStore = async (storeId: string) => {
    if (!confirm('Are you sure you want to delete this store?')) return

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        // Refresh stores after deletion
        fetchStores(pagination.currentPage, searchTerm, filterType)
      } else {
        alert('Failed to delete store: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting store:', error)
      alert('Failed to delete store')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      latitude: '',
      longitude: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      type: '',
      imageUrl: ''
    })
    setLocationInput('')
    setLocationSuggestions([])
    setShowSuggestions(false)
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    // Reset business hours to defaults
    setBusinessHours([
      { dayOfWeek: 1, dayName: 'Monday', openTime: '09:00', closeTime: '18:00', isClosed: false },
      { dayOfWeek: 2, dayName: 'Tuesday', openTime: '09:00', closeTime: '18:00', isClosed: false },
      { dayOfWeek: 3, dayName: 'Wednesday', openTime: '09:00', closeTime: '18:00', isClosed: false },
      { dayOfWeek: 4, dayName: 'Thursday', openTime: '09:00', closeTime: '18:00', isClosed: false },
      { dayOfWeek: 5, dayName: 'Friday', openTime: '09:00', closeTime: '18:00', isClosed: false },
      { dayOfWeek: 6, dayName: 'Saturday', openTime: '10:00', closeTime: '16:00', isClosed: false },
      { dayOfWeek: 0, dayName: 'Sunday', openTime: '00:00', closeTime: '00:00', isClosed: true }
    ])
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

  // Search locations using OpenStreetMap Nominatim API (focused on Ghana)
  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      // Ghana bounding box coordinates (approximate)
      // Format: min_lon,min_lat,max_lon,max_lat
      const ghanaBounds = '-3.2554,4.7367,1.1994,11.1733'

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&extratags=1&countrycodes=gh&bounded=1&viewbox=${ghanaBounds}`
      )
      const data: NominatimResult[] = await response.json()

      // If no results in Ghana, try a broader search
      if (data.length === 0) {
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)} Ghana&limit=5&addressdetails=1&extratags=1`
        )
        const fallbackData: NominatimResult[] = await fallbackResponse.json()
        setLocationSuggestions(fallbackData)
      } else {
        setLocationSuggestions(data)
      }

      setShowSuggestions(true)
    } catch (error) {
      console.error('Error searching locations:', error)
      setLocationSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Handle location input change with debounced search
  const handleLocationInputChange = (value: string) => {
    setLocationInput(value)

    // Update formData address for consistency
    setFormData(prev => ({
      ...prev,
      address: value
    }))

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      searchLocations(value)
    }, 300)

    setSearchTimeout(timeout)
  }

  // Handle location selection from suggestions
  const handleLocationSelect = (location: NominatimResult, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    console.log('Location selected:', location.display_name)

    const selectedLocation = location.display_name

    // Update both states immediately
    setLocationInput(selectedLocation)
    setFormData(prev => ({
      ...prev,
      address: selectedLocation,
      latitude: location.lat,
      longitude: location.lon
    }))

    // Close suggestions with a small delay to ensure state updates
    setTimeout(() => {
      setShowSuggestions(false)
      setLocationSuggestions([])
      console.log('Location input updated to:', selectedLocation)
    }, 10)
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // For address field, use the new handler
    if (name === 'address') {
      handleLocationInputChange(value)
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Handle business hours changes
  const handleBusinessHoursChange = (dayOfWeek: number, field: string, value: string | boolean) => {
    setBusinessHours(prev =>
      prev.map(hour =>
        hour.dayOfWeek === dayOfWeek
          ? { ...hour, [field]: value }
          : hour
      )
    )
  }

  // Create new store
  const handleCreate = async () => {
    if (!formData.name.trim()) return

    try {
      setActionLoading('create')
      setError('')

      let response

      if (selectedFile) {
        // Use FormData for file upload
        const formDataToSend = new FormData()

        // Add text fields
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (key === 'latitude' || key === 'longitude') {
              formDataToSend.append(key, value ? parseFloat(value as string).toString() : '')
            } else {
              formDataToSend.append(key, value.toString())
            }
          }
        })

        // Add business hours
        formDataToSend.append('businessHours', JSON.stringify(businessHours))

        // Add file
        formDataToSend.append('image', selectedFile)

        // Debug: Log what's being sent
        console.log('Sending FormData for create with file:')
        for (const [key, value] of formDataToSend.entries()) {
          if (value instanceof File) {
            console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`)
          } else {
            console.log(`${key}: ${value}`)
          }
        }

        response = await fetch('/api/stores', {
          method: 'POST',
          body: formDataToSend
        })
      } else {
        // Use JSON for no file upload
        const businessHoursData = businessHours.map(hour => ({
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isClosed: hour.isClosed
        }))

        const submitData = {
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          businessHours: businessHoursData
        }

        // Ensure latitude and longitude are valid numbers or null
        if (submitData.latitude && isNaN(submitData.latitude)) {
          submitData.latitude = null
        }
        if (submitData.longitude && isNaN(submitData.longitude)) {
          submitData.longitude = null
        }

        // Debug: Log what's being sent
        console.log('Sending JSON data:', submitData)
        console.log('Business Hours being sent:', businessHoursData)

        response = await fetch('/api/stores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        })
      }

      const data = await response.json()

      if (data.success) {
        fetchStores(pagination.currentPage, searchTerm, filterType)
        resetForm()
        setIsCreating(false)
      } else {
        setError(data.error || 'Failed to create store')
      }
    } catch (error) {
      console.error('Error creating store:', error)
      setError('Failed to create store')
    } finally {
      setActionLoading(null)
    }
  }

  // Start editing
  const handleEdit = async (store: Store) => {
    try {
      // Fetch full store data including business hours
      const response = await fetch(`/api/stores/${store.id}`)
      const data = await response.json()

      if (data.success) {
        const fullStore = data.data
        const locationValue = fullStore.address || ''

        setFormData({
          name: fullStore.name || '',
          description: fullStore.description || '',
          address: locationValue,
          latitude: fullStore.location?.latitude?.toString() || '',
          longitude: fullStore.location?.longitude?.toString() || '',
          city: fullStore.location?.city || '',
          state: fullStore.location?.state || '',
          zipCode: fullStore.location?.postalCode || '',
          phone: fullStore.contactPhone || '',
          email: fullStore.contactEmail || '',
          type: fullStore.type || '',
          imageUrl: fullStore.image || ''
        })

        // Populate business hours from the store data
        if (fullStore.businessHours && fullStore.businessHours.length > 0) {
          const hoursMap = fullStore.businessHours.reduce((acc: any, hour: any) => {
            acc[hour.dayOfWeek] = hour
            return acc
          }, {})

          setBusinessHours(prev =>
            prev.map(day => {
              const existing = hoursMap[day.dayOfWeek]
              return existing ? {
                ...day,
                openTime: existing.openTime,
                closeTime: existing.closeTime,
                isClosed: existing.isClosed
              } : day
            })
          )
        } else {
          // Reset to defaults if no business hours
          setBusinessHours([
            { dayOfWeek: 1, dayName: 'Monday', openTime: '09:00', closeTime: '18:00', isClosed: false },
            { dayOfWeek: 2, dayName: 'Tuesday', openTime: '09:00', closeTime: '18:00', isClosed: false },
            { dayOfWeek: 3, dayName: 'Wednesday', openTime: '09:00', closeTime: '18:00', isClosed: false },
            { dayOfWeek: 4, dayName: 'Thursday', openTime: '09:00', closeTime: '18:00', isClosed: false },
            { dayOfWeek: 5, dayName: 'Friday', openTime: '09:00', closeTime: '18:00', isClosed: false },
            { dayOfWeek: 6, dayName: 'Saturday', openTime: '10:00', closeTime: '16:00', isClosed: false },
            { dayOfWeek: 0, dayName: 'Sunday', openTime: '00:00', closeTime: '00:00', isClosed: true }
          ])
        }

        setLocationInput(locationValue)
        setLocationSuggestions([])
        setShowSuggestions(false)
        setSelectedFile(null)
        setFilePreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setEditingId(store.id)
      } else {
        alert('Failed to fetch store data for editing')
      }
    } catch (error) {
      console.error('Error fetching store for edit:', error)
      alert('Failed to fetch store data for editing')
    }
  }

  // Save edit
  const handleSaveEdit = async () => {
    if (!formData.name.trim() || !editingId) return

    try {
      setActionLoading('edit')
      setError('')

      let response

      if (selectedFile) {
        // Use FormData for file upload
        const formDataToSend = new FormData()

        // Add ID for updates
        if (editingId) {
          formDataToSend.append('id', editingId)
        }

        // Add text fields
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (key === 'latitude' || key === 'longitude') {
              const numValue = parseFloat(value as string)
              if (!isNaN(numValue)) {
                formDataToSend.append(key, numValue.toString())
              }
            } else {
              formDataToSend.append(key, value.toString())
            }
          }
        })

        // Add business hours
        formDataToSend.append('businessHours', JSON.stringify(businessHours))

        // Add file
        formDataToSend.append('image', selectedFile)

        response = await fetch(`/api/stores/${editingId}`, {
          method: 'PUT',
          body: formDataToSend
        })
      } else {
        // Use JSON for no file upload
        const submitData = {
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          businessHours: businessHours.map(hour => ({
            dayOfWeek: hour.dayOfWeek,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
            isClosed: hour.isClosed
          }))
        }

        // Ensure latitude and longitude are valid numbers or null
        if (submitData.latitude && isNaN(submitData.latitude)) {
          submitData.latitude = null
        }
        if (submitData.longitude && isNaN(submitData.longitude)) {
          submitData.longitude = null
        }

        // Debug: Log what's being sent
        console.log('Sending JSON data for update:', submitData)
        console.log('Business Hours being sent for update:', submitData.businessHours)

        response = await fetch(`/api/stores/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        })
      }

      const data = await response.json()

      if (data.success) {
        fetchStores(pagination.currentPage, searchTerm, filterType)
        setEditingId(null)
        resetForm()
      } else {
        setError(data.error || 'Failed to update store')
      }
    } catch (error) {
      console.error('Error updating store:', error)
      setError('Failed to update store')
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
    fetchStores()
  }, [])

  // Handle filter changes
  useEffect(() => {
    fetchStores(1, searchTerm, filterType)
  }, [searchTerm, filterType])

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const inputElement = locationInputRef.current
      const suggestionsElement = suggestionsRef.current

      // Check if click is outside both the input and the suggestions dropdown
      const isOutsideInput = inputElement && !inputElement.contains(target)
      const isOutsideSuggestions = suggestionsElement && !suggestionsElement.contains(target)

      if (isOutsideInput && isOutsideSuggestions) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <>

      <div className="min-h-screen bg-gray-50 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Stores Dashboard</h1>
              <p className="text-gray-600">Manage and monitor all stores in your platform</p>
            </div>
            {!isCreating && !editingId && (
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                disabled={!!actionLoading}
              >
                <Plus className="h-5 w-5" />
                Create Store
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
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {storeTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
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
                {isCreating ? 'Create New Store' : 'Edit Store'}
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
                  placeholder="Enter store name"
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <Select
                  value={formData.type || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select store type" />
                  </SelectTrigger>
                  <SelectContent>
                    {storeTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
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
                      e.preventDefault()
                      handleLocationSelect(locationSuggestions[0], e as any)
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
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city"
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter state"
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter ZIP code"
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phone number"
                  disabled={actionLoading === 'create' || actionLoading === 'edit'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
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
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter store description"
                disabled={actionLoading === 'create' || actionLoading === 'edit'}
              />
            </div>

            {/* Business Hours Section */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">Business Hours</label>
              <div className="space-y-3">
                {businessHours.map((day) => (
                  <div key={day.dayOfWeek} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                    <div className="w-20 text-sm font-medium text-gray-700">
                      {day.dayName}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={day.openTime}
                        onChange={(e) => handleBusinessHoursChange(day.dayOfWeek, 'openTime', e.target.value)}
                        disabled={day.isClosed || actionLoading === 'create' || actionLoading === 'edit'}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                      <span className="text-sm text-gray-500">to</span>
                      <input
                        type="time"
                        value={day.closeTime}
                        onChange={(e) => handleBusinessHoursChange(day.dayOfWeek, 'closeTime', e.target.value)}
                        disabled={day.isClosed || actionLoading === 'create' || actionLoading === 'edit'}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`closed-${day.dayOfWeek}`}
                        checked={day.isClosed}
                        onChange={(e) => handleBusinessHoursChange(day.dayOfWeek, 'isClosed', e.target.checked)}
                        disabled={actionLoading === 'create' || actionLoading === 'edit'}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`closed-${day.dayOfWeek}`} className="text-sm text-gray-600">
                        Closed
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Set operating hours for each day. Check "Closed" to mark the day as closed.
              </p>
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
                {isCreating ? 'Create Store' : 'Save Changes'}
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
            <span className="ml-2 text-gray-600">Loading stores...</span>
          </div>
        ) : (
          <>
            {/* Stores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {stores.map((store) => (
                <div key={store.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="relative h-48">
                    <img
                      src={store.image || ''}
                      alt={store.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/400/200'
                      }}
                    />

                    {/* Action Menu */}
                    <div className="absolute top-3 left-3">
                      <div className="relative group">
                        <button className="bg-white/90 hover:bg-white text-gray-700 p-1 rounded-full shadow-sm transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        <div className="absolute left-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-[120px]">
                          <button
                            onClick={() => handleEdit(store)}
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
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 truncate">{store.name}</h3>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{store.description}</p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      {store.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{store.address}</span>
                        </div>
                      )}

                      {store.type && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Tag className="h-4 w-4" />
                          <span>{store.type}</span>
                        </div>
                      )}

                      {(store.phone || store.email) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{store.phone || store.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created {formatDate(store.createdAt)}
                        </div>
                      </div>
                      {store.latitude && store.longitude && (
                        <div className="text-xs text-gray-500">
                          {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="text-sm text-gray-600">
                  Showing {Math.min(pagination.itemsPerPage * (pagination.currentPage - 1) + 1, pagination.totalItems)} to{' '}
                  {Math.min(pagination.itemsPerPage * pagination.currentPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} stores
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchStores(pagination.currentPage - 1, searchTerm, filterType)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchStores(pagination.currentPage + 1, searchTerm, filterType)}
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
                <div className="text-gray-500 text-lg mb-2">No stores found</div>
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
                <div className="text-sm text-gray-600">Total Stores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stores.filter(s => s.type).length}
                </div>
                <div className="text-sm text-gray-600">Categorized</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stores.filter(s => s.image).length}
                </div>
                <div className="text-sm text-gray-600">With Images</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stores.length > 0
                    ? (stores.reduce((sum, s) => sum + (s.latitude && s.longitude ? 1 : 0), 0))
                    : 'N/A'
                  }
                </div>
                <div className="text-sm text-gray-600">Geolocated</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default Stores