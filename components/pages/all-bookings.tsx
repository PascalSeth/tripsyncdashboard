"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Download, Search } from "lucide-react"
import { useBookings } from "@/hooks/use-bookings"
import { Skeleton } from "@/components/ui/skeleton"

const bookingsData = [
  {
    id: "BK001",
    type: "Ride",
    customer: "John Doe",
    driver: "Mike Johnson",
    from: "Downtown",
    to: "Airport",
    status: "completed",
    amount: "$25.50",
    date: "2024-01-15",
    time: "14:30",
  },
  {
    id: "BK002",
    type: "Delivery",
    customer: "Jane Smith",
    driver: "Sarah Wilson",
    from: "Mall",
    to: "Residential Area",
    status: "in-progress",
    amount: "$12.00",
    date: "2024-01-15",
    time: "15:45",
  },
  {
    id: "BK003",
    type: "Taxi",
    customer: "Bob Brown",
    driver: "Tom Davis",
    from: "Hotel",
    to: "Conference Center",
    status: "pending",
    amount: "$18.75",
    date: "2024-01-15",
    time: "16:20",
  },
  {
    id: "BK004",
    type: "Emergency",
    customer: "Emergency Services",
    driver: "Alex Turner",
    from: "Hospital",
    to: "Emergency Site",
    status: "completed",
    amount: "$45.00",
    date: "2024-01-15",
    time: "13:15",
  },
]

const statusColors = {
  completed: "secondary",
  "in-progress": "default",
  pending: "outline",
  cancelled: "destructive",
} as const

export function AllBookings() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const { data, loading, error } = useBookings(searchTerm, statusFilter, typeFilter, currentPage)

  const bookings = data?.bookings || []

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">All Bookings</h1>
          <p className="text-muted-foreground">Manage and monitor all booking activities</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{data?.total?.toLocaleString() || '0'}</div>
            )}
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'completed').length.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {data?.total ? `${((bookings.filter(b => b.status === 'completed').length / data.total) * 100).toFixed(1)}%` : '0%'} completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'in-progress').length.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {data?.total ? `${((bookings.filter(b => b.status === 'in-progress').length / data.total) * 100).toFixed(1)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">
                ${bookings.reduce((sum, b) => sum + parseFloat(b.amount.replace('$', '').replace(',', '')), 0).toFixed(0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">+8% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Management</CardTitle>
          <CardDescription>Filter and search through all bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ride">Ride</SelectItem>
                  <SelectItem value="taxi">Taxi</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Booking ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="min-w-[120px]">Customer</TableHead>
                  <TableHead className="min-w-[120px]">Driver</TableHead>
                  <TableHead className="min-w-[150px]">Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="min-w-[120px]">Date & Time</TableHead>
                  <TableHead className="min-w-[100px]">Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : bookings.length > 0 ? bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{booking.type}</Badge>
                    </TableCell>
                    <TableCell>{booking.customer}</TableCell>
                    <TableCell>{booking.driver}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="truncate">{booking.from}</div>
                        <div className="text-muted-foreground truncate">→ {booking.to}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[booking.status as keyof typeof statusColors]}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{booking.amount}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{booking.date}</div>
                        <div className="text-muted-foreground">{booking.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No bookings found
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
