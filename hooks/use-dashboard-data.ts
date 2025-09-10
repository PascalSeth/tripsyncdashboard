// hooks/use-dashboard-data.ts
import { useState, useEffect } from 'react'

interface DashboardMetrics {
  totalBookings: number
  activeDrivers: number
  totalRevenue: number
  avgRating: number
  bookingGrowth: number
  driverGrowth: number
  revenueGrowth: number
  ratingGrowth: number
  // Optional properties from analytics API
  conversionMetrics?: {
    conversionRate: number
    avgTripDuration: number
    customerSatisfaction: number
    driverUtilization: number
  }
  userGrowth?: Array<{
    month: string
    users: number
    drivers: number
  }>
  revenueByService?: Array<{
    service: string
    revenue: number
    bookings: number
  }>
  hourlyActivity?: Array<{
    hour: number
    rides: number
    deliveries: number
  }>
}

interface BookingTrend {
  month: string
  bookings: number
  revenue: number
}

interface ServiceType {
  name: string
  value: number
  color: string
}

interface DashboardData {
  metrics: DashboardMetrics
  bookingTrends: BookingTrend[]
  serviceTypes: ServiceType[]
  dailyBookings: { time: string; bookings: number }[]
  driverPerformance: { rating: string; count: number }[]
  recentActivity: {
    type: string
    message: string
    time: string
    status: string
  }[]
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch dashboard metrics
        const metricsResponse = await fetch('/api/admin/dashboard')
        const metricsData = await metricsResponse.json()

        // Try to fetch additional metrics data
        let analyticsData = null
        try {
          const analyticsResponse = await fetch('/api/admin/metrics')
          analyticsData = await analyticsResponse.json()
        } catch (analyticsError) {
          console.warn('Analytics data fetch failed, using dashboard data only:', analyticsError)
        }

        if (metricsData.success) {
          // Transform the data to match component expectations
          const transformedData: DashboardData = {
            metrics: {
              totalBookings: metricsData.data.totalBookings || 0,
              activeDrivers: metricsData.data.activeDrivers || 0,
              totalRevenue: metricsData.data.totalRevenue || 0,
              avgRating: metricsData.data.avgRating || 0,
              bookingGrowth: metricsData.data.bookingGrowth || 0,
              driverGrowth: metricsData.data.driverGrowth || 0,
              revenueGrowth: metricsData.data.revenueGrowth || 0,
              ratingGrowth: metricsData.data.ratingGrowth || 0,
              // Add conversion metrics from analytics if available
              ...(analyticsData && analyticsData.success && analyticsData.data.conversionMetrics && {
                conversionMetrics: analyticsData.data.conversionMetrics,
                userGrowth: analyticsData.data.userGrowth,
                revenueByService: analyticsData.data.revenueByService,
                hourlyActivity: analyticsData.data.hourlyActivity
              })
            },
            bookingTrends: metricsData.data.bookingTrends || [],
            serviceTypes: metricsData.data.serviceTypes || [],
            dailyBookings: metricsData.data.dailyBookings || [],
            driverPerformance: metricsData.data.driverPerformance || [],
            recentActivity: metricsData.data.recentActivity || []
          }

          setData(transformedData)
        } else {
          setError('Failed to fetch dashboard data')
        }
      } catch (err) {
        setError('Error fetching dashboard data')
        console.error('Dashboard data fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return { data, loading, error, refetch: () => window.location.reload() }
}