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
import { Search, UserPlus, Download } from "lucide-react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useCustomers } from "@/hooks/use-customers"
import { Skeleton } from "@/components/ui/skeleton"

const customerGrowth = [
  { month: "Jan", customers: 1200 },
  { month: "Feb", customers: 1450 },
  { month: "Mar", customers: 1800 },
  { month: "Apr", customers: 2100 },
  { month: "May", customers: 2500 },
  { month: "Jun", customers: 2800 },
]

const customerSegments = [
  { segment: "Regular", count: 1200 },
  { segment: "Premium", count: 450 },
  { segment: "VIP", count: 150 },
  { segment: "New", count: 800 },
]

const customersData = [
  {
    id: "CU001",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 234-567-8901",
    totalRides: 45,
    totalSpent: "$1,234.50",
    status: "active",
    joinDate: "2023-06-15",
    rating: 4.8,
    segment: "Premium",
  },
  {
    id: "CU002",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+1 234-567-8902",
    totalRides: 23,
    totalSpent: "$567.25",
    status: "active",
    joinDate: "2023-08-22",
    rating: 4.9,
    segment: "Regular",
  },
  {
    id: "CU003",
    name: "Bob Brown",
    email: "bob.brown@email.com",
    phone: "+1 234-567-8903",
    totalRides: 78,
    totalSpent: "$2,345.75",
    status: "inactive",
    joinDate: "2023-03-10",
    rating: 4.7,
    segment: "VIP",
  },
  {
    id: "CU004",
    name: "Alice Johnson",
    email: "alice.johnson@email.com",
    phone: "+1 234-567-8904",
    totalRides: 12,
    totalSpent: "$234.00",
    status: "active",
    joinDate: "2024-01-05",
    rating: 5.0,
    segment: "New",
  },
]

export function Customers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [segmentFilter, setSegmentFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const { data, loading, error } = useCustomers(searchTerm, statusFilter === 'all' ? '' : statusFilter, '', currentPage.toString())

  const customers = Array.isArray(data?.customers) ? data.customers : []
  const stats = data?.stats || {}

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Customers</h1>
          <p className="text-muted-foreground">Manage and monitor customer accounts and activities</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total?.toLocaleString() || '0'}</div>
            )}
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
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
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">
                {customers.filter(c => {
                  const createdAt = new Date(c.createdAt)
                  const now = new Date()
                  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
                  return createdAt >= oneMonthAgo
                }).length}
              </div>
            )}
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Customer Value</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">
                ${customers.length > 0
                  ? (customers.reduce((sum, c) => sum + (c.customerProfile?.totalSpent || 0), 0) / customers.length).toFixed(0)
                  : '0'
                }
              </div>
            )}
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Customer Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
            <CardDescription>Monthly customer acquisition</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                customers: {
                  label: "Customers",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[250px] lg:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerGrowth}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="customers"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>Distribution by customer type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Customers",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[250px] lg:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerSegments}>
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Customer Management */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>Search and filter customer accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Segments</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Customer</TableHead>
                  <TableHead className="min-w-[200px]">Contact</TableHead>
                  <TableHead>Total Rides</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[100px]">Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : customers.length > 0 ? customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={customer.avatar || `/placeholder.svg?height=32&width=32&text=${customer.firstName?.charAt(0) || 'U'}`} />
                          <AvatarFallback>{customer.firstName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{customer.firstName} {customer.lastName}</div>
                          <div className="text-sm text-muted-foreground">{customer.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm min-w-0">
                        <div className="truncate">{customer.email}</div>
                        <div className="text-muted-foreground">{customer.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{customer.customerProfile?.totalRides || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{customer.customerProfile?.totalSpent ? `$${customer.customerProfile.totalSpent}` : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{customer.customerProfile?.averageRating?.toFixed(1) || 'N/A'}</span>
                        {customer.customerProfile?.averageRating && <span className="text-yellow-500">★</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{customer.customerProfile?.subscriptionTier || 'Not Set'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.isActive ? "secondary" : "outline"}>{customer.isActive ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No customers found
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
