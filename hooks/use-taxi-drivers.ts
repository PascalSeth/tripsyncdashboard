// hooks/use-taxi-drivers.ts
import { useState, useEffect } from 'react'

interface TaxiDriver {
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
  taxiDriverProfile?: {
    rating: number
    totalRides: number
    totalEarnings: number
    isAvailable: boolean
    isOnline: boolean
    vehicleId: string
    taxiLicenseNumber: string
    verificationStatus: string
  }
}

interface TaxiDriversData {
  drivers: TaxiDriver[]
  total: number
  page: number
  limit: number
  totalPages: number
  stats?: {
    total: number
    active: number
    verified: number
    byRole: Record<string, number>
  }
}

export function useTaxiDrivers(searchTerm = '', statusFilter = 'all', page = 1, limit = 10) {
  const [data, setData] = useState<TaxiDriversData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTaxiDrivers = async () => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter !== 'all' && { status: statusFilter })
        })

        const response = await fetch(`/api/admin/users?type=TAXI_DRIVER&${queryParams}`)
        const result = await response.json()

        if (result.success) {
          setData({
            drivers: result.data?.users || [],
            total: result.data?.pagination?.total || 0,
            page: result.data?.pagination?.page || 1,
            limit: result.data?.pagination?.limit || 10,
            totalPages: result.data?.pagination?.totalPages || 1,
            stats: result.data?.stats
          })
        } else {
          setError(result.error || 'Failed to fetch taxi drivers')
        }
      } catch (err) {
        setError('Error fetching taxi drivers')
        console.error('Taxi drivers fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTaxiDrivers()
  }, [searchTerm, statusFilter, page, limit])

  return { data, loading, error }
}