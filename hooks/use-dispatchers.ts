// hooks/use-dispatchers.ts
import { useState, useEffect } from 'react'

interface Dispatcher {
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
  deliveryProfile?: {
    rating: number
    totalDeliveries: number
    totalEarnings: number
    isAvailable: boolean
    isOnline: boolean
    vehicleId: string
    verificationStatus: string
  }
}

interface DispatchersData {
  dispatchers: Dispatcher[]
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

export function useDispatchers(searchTerm = '', statusFilter = 'all', page = 1, limit = 10) {
  const [data, setData] = useState<DispatchersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDispatchers = async () => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter !== 'all' && { status: statusFilter })
        })

        const response = await fetch(`/api/admin/users?type=DISPATCHER&${queryParams}`)
        const result = await response.json()

        if (result.success) {
          setData({
            dispatchers: result.data?.users || [],
            total: result.data?.pagination?.total || 0,
            page: result.data?.pagination?.page || 1,
            limit: result.data?.pagination?.limit || 10,
            totalPages: result.data?.pagination?.totalPages || 1,
            stats: result.data?.stats
          })
        } else {
          setError(result.error || 'Failed to fetch dispatchers')
        }
      } catch (err) {
        setError('Error fetching dispatchers')
        console.error('Dispatchers fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDispatchers()
  }, [searchTerm, statusFilter, page, limit])

  return { data, loading, error }
}