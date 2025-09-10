"use client"

import { Calendar, CreditCard, DollarSign, Star, Users, Zap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardOverview() {
  const { data, loading, error } = useDashboardData()

  if (loading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome to your ride booking admin dashboard</p>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome to your ride booking admin dashboard</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Error loading dashboard data: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const metrics = data?.metrics
  const bookingTrends = data?.bookingTrends || []
  const serviceTypes = data?.serviceTypes || []
  const dailyBookings = data?.dailyBookings || []
  const driverPerformance = data?.driverPerformance || []
  const recentActivity = data?.recentActivity || []

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to your ride booking admin dashboard</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalBookings?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{metrics?.bookingGrowth || 0}%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeDrivers?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{metrics?.driverGrowth || 0}%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.totalRevenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{metrics?.revenueGrowth || 0}%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avgRating?.toFixed(1) || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{metrics?.ratingGrowth || 0}</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
            <CardDescription>Monthly bookings and revenue overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                bookings: {
                  label: "Bookings",
                  color: "hsl(var(--chart-1))",
                },
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[250px] sm:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingTrends}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stackId="1"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="2"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
            <CardDescription>Breakdown by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Percentage",
                },
              }}
              className="h-[200px] sm:h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {serviceTypes.map((service, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: service.color }} />
                  <span className="flex-1 truncate">{service.name}</span>
                  <span className="font-medium">{service.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Booking Pattern</CardTitle>
            <CardDescription>Bookings throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                bookings: {
                  label: "Bookings",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyBookings}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-3))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Driver Ratings</CardTitle>
            <CardDescription>Distribution of driver ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Count",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={driverPerformance}>
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest bookings and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 rounded-lg border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  {activity.type === "booking" && <Calendar className="h-4 w-4" />}
                  {activity.type === "driver" && <Users className="h-4 w-4" />}
                  {activity.type === "emergency" && <Zap className="h-4 w-4" />}
                  {activity.type === "payment" && <CreditCard className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge
                  variant={
                    activity.status === "active" ? "default" : activity.status === "success" ? "secondary" : "outline"
                  }
                  className="shrink-0"
                >
                  {activity.status}
                </Badge>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
