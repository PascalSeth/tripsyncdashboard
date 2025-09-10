// hooks/use-customers.ts
import { useState, useEffect } from 'react'

interface Customer {
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
  customerProfile?: {
    loyaltyPoints: number
    totalSpent: number
    totalRides: number
    averageRating: number
    subscriptionTier: string
  }
}

interface CustomersData {
  customers: Customer[]
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

export function useCustomers(searchTerm = '', statusFilter = '', segmentFilter = '', page = '', limit = '') {
  const [data, setData] = useState<CustomersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter && { status: statusFilter })
        })

        const response = await fetch(`/api/admin/users?type=USER&${queryParams}`)
        const result = await response.json()

        if (result.success) {
          setData({
            customers: result.data?.users || [],
            total: result.data?.pagination?.total || 0,
            page: result.data?.pagination?.page || 1,
            limit: result.data?.pagination?.limit || 10,
            totalPages: result.data?.pagination?.totalPages || 1,
            stats: result.data?.stats
          })
        } else {
          setError(result.error || 'Failed to fetch customers')
        }
      } catch (err) {
        setError('Error fetching customers')
        console.error('Customers fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [searchTerm, statusFilter, page, limit])

  return { data, loading, error }
}