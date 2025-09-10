"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardAnalytics() {
  const { data, loading, error } = useDashboardData()

  // Transform data for charts
  const userGrowth = data?.metrics ? [
    // Transform user growth data from API
    ...(data.metrics.userGrowth || []).map(item => ({
      month: item.month,
      users: item.users,
      drivers: item.drivers
    }))
  ] : []

  const revenueByService = data?.metrics ? [
    // Transform revenue by service data from API
    ...(data.metrics.revenueByService || []).map(item => ({
      service: item.service,
      revenue: item.revenue,
      bookings: item.bookings
    }))
  ] : []

  const hourlyActivity = data?.metrics ? [
    // Transform hourly activity data from API
    ...(data.metrics.hourlyActivity || []).map(item => ({
      hour: item.hour.toString().padStart(2, '0'),
      rides: item.rides,
      deliveries: item.deliveries
    }))
  ] : []

  // Calculate overview metrics
  const conversionRate = data?.metrics?.conversionMetrics?.conversionRate || 0
  const avgTripDuration = data?.metrics?.conversionMetrics?.avgTripDuration || 0
  const customerSatisfaction = data?.metrics?.conversionMetrics?.customerSatisfaction || 0
  const driverUtilization = data?.metrics?.conversionMetrics?.driverUtilization || 0
  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Detailed analytics and insights for your platform</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
                )}
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Trip Duration</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <div className="text-2xl font-bold">{avgTripDuration.toFixed(1)} min</div>
                )}
                <p className="text-xs text-muted-foreground">-3 min from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <div className="text-2xl font-bold">{customerSatisfaction.toFixed(1)}/5</div>
                )}
                <p className="text-xs text-muted-foreground">+0.2 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Driver Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <div className="text-2xl font-bold">{driverUtilization.toFixed(1)}%</div>
                )}
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trends</CardTitle>
              <CardDescription>Monthly growth of users and drivers</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] lg:h-[400px] flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ChartContainer
                  config={{
                    users: {
                      label: "Users",
                      color: "hsl(var(--chart-1))",
                    },
                    drivers: {
                      label: "Drivers",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px] lg:h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowth}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stackId="1"
                        stroke="hsl(var(--chart-1))"
                        fill="hsl(var(--chart-1))"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="drivers"
                        stackId="2"
                        stroke="hsl(var(--chart-2))"
                        fill="hsl(var(--chart-2))"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Service Type</CardTitle>
              <CardDescription>Revenue breakdown across different services</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] lg:h-[400px] flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Revenue",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[300px] lg:h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByService}>
                      <XAxis dataKey="service" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Activity Pattern</CardTitle>
              <CardDescription>Activity distribution throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] lg:h-[400px] flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ChartContainer
                  config={{
                    rides: {
                      label: "Rides",
                      color: "hsl(var(--chart-4))",
                    },
                    deliveries: {
                      label: "Deliveries",
                      color: "hsl(var(--chart-5))",
                    },
                  }}
                  className="h-[300px] lg:h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyActivity}>
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="rides" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                      <Line type="monotone" dataKey="deliveries" stroke="hsl(var(--chart-5))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
