"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const rideData = [
  { time: "06:00", rides: 12 },
  { time: "09:00", rides: 45 },
  { time: "12:00", rides: 78 },
  { time: "15:00", rides: 65 },
  { time: "18:00", rides: 92 },
  { time: "21:00", rides: 56 },
]

const popularRoutes = [
  { route: "Downtown → Airport", count: 234, revenue: "$5,850" },
  { route: "Mall → University", count: 189, revenue: "$3,780" },
  { route: "Hotel District → Beach", count: 156, revenue: "$4,680" },
  { route: "Business Center → Residential", count: 134, revenue: "$2,680" },
  { route: "Train Station → City Center", count: 98, revenue: "$1,960" },
]

const recentRides = [
  {
    id: "RD001",
    customer: "John Doe",
    driver: "Mike Johnson",
    from: "Downtown",
    to: "Airport",
    status: "completed",
    amount: "$25.50",
    duration: "28 min",
  },
  {
    id: "RD002",
    customer: "Jane Smith",
    driver: "Sarah Wilson",
    from: "Mall",
    to: "University",
    status: "in-progress",
    amount: "$18.00",
    duration: "15 min",
  },
  {
    id: "RD003",
    customer: "Bob Brown",
    driver: "Tom Davis",
    from: "Hotel",
    to: "Beach",
    status: "pending",
    amount: "$32.75",
    duration: "-",
  },
]

export function RideBookings() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Ride Bookings</h1>
        <p className="text-muted-foreground">Monitor and manage all ride booking activities</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">456</div>
            <p className="text-xs text-muted-foreground">+15% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Trip Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24 min</div>
            <p className="text-xs text-muted-foreground">-2 min from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Hourly Ride Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Ride Pattern</CardTitle>
            <CardDescription>Ride requests throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                rides: {
                  label: "Rides",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[250px] lg:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rideData}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="rides"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Popular Routes */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Routes</CardTitle>
            <CardDescription>Most requested ride routes</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Rides",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[250px] lg:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularRoutes} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="route" type="category" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rides Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Rides</CardTitle>
          <CardDescription>Latest ride booking activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Ride ID</TableHead>
                  <TableHead className="min-w-[120px]">Customer</TableHead>
                  <TableHead className="min-w-[120px]">Driver</TableHead>
                  <TableHead className="min-w-[150px]">Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRides.map((ride) => (
                  <TableRow key={ride.id}>
                    <TableCell className="font-medium">{ride.id}</TableCell>
                    <TableCell>{ride.customer}</TableCell>
                    <TableCell>{ride.driver}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="truncate">{ride.from}</div>
                        <div className="text-muted-foreground truncate">→ {ride.to}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ride.status === "completed"
                            ? "secondary"
                            : ride.status === "in-progress"
                              ? "default"
                              : "outline"
                        }
                      >
                        {ride.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{ride.duration}</TableCell>
                    <TableCell className="font-medium">{ride.amount}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
