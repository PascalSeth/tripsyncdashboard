// hooks/use-bookings.ts
import { useState, useEffect } from 'react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  phone: string
  avatar?: string
}

interface Provider {
  id: string
  firstName: string
  lastName: string
  phone: string
  avatar?: string
}

interface ServiceType {
  id: string
  name: string
  // Add other serviceType fields as needed
}

interface RawBooking {
  id: string
  bookingNumber: string
  customerId: string
  providerId: string
  serviceTypeId: string
  status: string
  type: string
  scheduledAt: string | null
  requestedAt: string
  acceptedAt: string | null
  startedAt: string | null
  completedAt: string | null
  cancelledAt: string | null
  pickupAddressId: string | null
  dropoffAddressId: string | null
  pickupLatitude: number
  pickupLongitude: number
  dropoffLatitude: number | null
  dropoffLongitude: number | null
  pickupInstructions: string | null
  dropoffInstructions: string | null
  estimatedDistance: number
  actualDistance: number | null
  estimatedDuration: number
  actualDuration: number | null
  estimatedPrice: number
  finalPrice: number
  surgePricing: number
  currency: string
  platformCommission: number
  providerEarning: number
  commissionRate: number
  serviceData: any
  paymentStatus: string
  paymentMethodId: string | null
  notes: string
  specialRequests: string | null
  cancellationReason: string | null
  cancelledBy: string | null
  cancellationFee: number | null
  isInterRegional: boolean
  originZoneId: string | null
  destinationZoneId: string | null
  interRegionalFee: number
  createdAt: string
  updatedAt: string
  serviceType: ServiceType
  customer: Customer
  provider: Provider
}

interface Booking {
  id: string
  type: string
  customer: string
  driver: string
  from: string
  to: string
  status: string
  amount: string
  date: string
  time: string
}

interface BookingsData {
  bookings: Booking[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function useBookings(searchTerm = '', statusFilter = 'all', typeFilter = 'all', page = 1, limit = 10) {
  const [data, setData] = useState<BookingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(typeFilter !== 'all' && { serviceType: typeFilter })
        })

        const response = await fetch(`/api/bookings?${queryParams}`)
        const result = await response.json()

        if (result.success) {
          // Transform the data to match the expected format
          const transformedBookings = (result.data || []).map((booking: RawBooking) => ({
            id: booking.bookingNumber,
            type: booking.serviceType?.name || booking.type,
            customer: `${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`.trim() || 'Unknown',
            driver: `${booking.provider?.firstName || ''} ${booking.provider?.lastName || ''}`.trim() || 'Unassigned',
            from: `Lat: ${booking.pickupLatitude}, Lng: ${booking.pickupLongitude}`,
            to: booking.dropoffLatitude && booking.dropoffLongitude
              ? `Lat: ${booking.dropoffLatitude}, Lng: ${booking.dropoffLongitude}`
              : 'N/A',
            status: booking.status.toLowerCase(),
            amount: `${booking.currency} ${booking.finalPrice}`,
            date: new Date(booking.requestedAt).toLocaleDateString(),
            time: new Date(booking.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))

          setData({
            bookings: transformedBookings,
            total: result.pagination?.total || 0,
            page: result.pagination?.page || 1,
            limit: result.pagination?.limit || 10,
            totalPages: result.pagination?.totalPages || 1
          })
        } else {
          setError(result.error || 'Failed to fetch bookings')
        }
      } catch (err) {
        setError('Error fetching bookings')
        console.error('Bookings fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [searchTerm, statusFilter, typeFilter, page, limit])

  return { data, loading, error }
}