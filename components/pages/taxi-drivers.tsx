"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Search, UserPlus, Download, Car } from "lucide-react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useTaxiDrivers } from "@/hooks/use-taxi-drivers"
import { Skeleton } from "@/components/ui/skeleton"

const driverPerformance = [
  { month: "Jan", earnings: 2400, trips: 120 },
  { month: "Feb", earnings: 2800, trips: 140 },
  { month: "Mar", earnings: 3200, trips: 160 },
  { month: "Apr", earnings: 2900, trips: 145 },
  { month: "May", earnings: 3500, trips: 175 },
  { month: "Jun", earnings: 3800, trips: 190 },
]

const ratingDistribution = [
  { rating: "5.0", count: 450 },
  { rating: "4.5-4.9", count: 320 },
  { rating: "4.0-4.4", count: 180 },
  { rating: "3.5-3.9", count: 90 },
  { rating: "Below 3.5", count: 45 },
]

export function TaxiDrivers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const { data, loading, error } = useTaxiDrivers(searchTerm, statusFilter, currentPage)

  const drivers = Array.isArray(data?.drivers) ? data.drivers : []
  const stats = data?.stats || { total: 0, active: 0, verified: 0, byRole: {} }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Taxi Drivers</h1>
          <p className="text-muted-foreground">Manage and monitor taxi driver accounts and performance</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Taxi Driver
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Taxi Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total?.toLocaleString() || '0'}</div>
            )}
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Taxi Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.active?.toLocaleString() || '0'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {stats?.total ? `${((stats.active / stats.total) * 100).toFixed(1)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">
                {drivers.length > 0
                  ? (drivers.reduce((sum, d) => sum + (d.taxiDriverProfile?.rating || 0), 0) / drivers.length).toFixed(1)
                  : '0'
                }
              </div>
            )}
            <p className="text-xs text-muted-foreground">+0.1 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">
                ${drivers.length > 0
                  ? (drivers.reduce((sum, d) => sum + (d.taxiDriverProfile?.totalEarnings || 0), 0) / drivers.length).toFixed(0)
                  : '0'
                }
              </div>
            )}
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Driver Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Taxi Driver Performance</CardTitle>
            <CardDescription>Monthly earnings and trip trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                earnings: {
                  label: "Earnings",
                  color: "hsl(var(--chart-1))",
                },
                trips: {
                  label: "Trips",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[250px] lg:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={driverPerformance}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="trips"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>Taxi driver ratings breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Drivers",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[250px] lg:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution}>
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Taxi Driver Management */}
      <Card>
        <CardHeader>
          <CardTitle>Taxi Driver Management</CardTitle>
          <CardDescription>Search and filter taxi driver accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search taxi drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Taxi Driver</TableHead>
                  <TableHead className="min-w-[200px]">Contact</TableHead>
                  <TableHead className="min-w-[150px]">Vehicle</TableHead>
                  <TableHead>Total Trips</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[120px]">Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : drivers.length > 0 ? drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={driver.avatar || `/placeholder.svg?height=32&width=32&text=${driver.firstName?.charAt(0) || 'T'}`} />
                            <AvatarFallback>{driver.firstName?.charAt(0) || 'T'}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{driver.firstName} {driver.lastName}</div>
                            <div className="text-sm text-muted-foreground">{driver.id}</div>
                          </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm min-w-0">
                        <div className="truncate">{driver.email}</div>
                        <div className="text-muted-foreground">{driver.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">
                          Vehicle info not available
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{driver.taxiDriverProfile?.totalRides || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{driver.taxiDriverProfile?.totalEarnings ? `$${driver.taxiDriverProfile.totalEarnings.toFixed(2)}` : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{driver.taxiDriverProfile?.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          driver.taxiDriverProfile?.isOnline ? "secondary" : "outline"
                        }
                      >
                        {driver.taxiDriverProfile?.isOnline ? "Online" : "Offline"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Location not available</div>
                        <div className="text-muted-foreground">N/A</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No taxi drivers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}