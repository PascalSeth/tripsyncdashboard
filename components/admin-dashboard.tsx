"use client"
import {
  Bell,
  Calendar,
  Car,
  CreditCard,
  DollarSign,
  Home,
  MapPin,
  Search,
  Settings,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight } from "lucide-react"
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

// Sample data for charts
const bookingTrends = [
  { month: "Jan", bookings: 1200, revenue: 24000 },
  { month: "Feb", bookings: 1400, revenue: 28000 },
  { month: "Mar", bookings: 1800, revenue: 36000 },
  { month: "Apr", bookings: 1600, revenue: 32000 },
  { month: "May", bookings: 2200, revenue: 44000 },
  { month: "Jun", bookings: 2800, revenue: 56000 },
]

const serviceTypes = [
  { name: "Ride Bookings", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Taxi Bookings", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Delivery", value: 15, color: "hsl(var(--chart-3))" },
  { name: "Moving Services", value: 10, color: "hsl(var(--chart-4))" },
  { name: "Emergency", value: 5, color: "hsl(var(--chart-5))" },
]

const dailyBookings = [
  { time: "00:00", bookings: 12 },
  { time: "04:00", bookings: 8 },
  { time: "08:00", bookings: 45 },
  { time: "12:00", bookings: 78 },
  { time: "16:00", bookings: 65 },
  { time: "20:00", bookings: 92 },
]

const driverPerformance = [
  { rating: "5 Stars", count: 450 },
  { rating: "4 Stars", count: 320 },
  { rating: "3 Stars", count: 180 },
  { rating: "2 Stars", count: 90 },
  { rating: "1 Star", count: 45 },
]

const menuData = [
  {
    title: "Dashboard",
    icon: Home,
    items: [
      { title: "Overview", url: "#" },
      { title: "Analytics", url: "#" },
    ],
  },
  {
    title: "Bookings",
    icon: Calendar,
    items: [
      { title: "All Bookings", url: "#" },
      { title: "Ride Bookings", url: "#" },
      { title: "Taxi Bookings", url: "#" },
      { title: "Day Bookings", url: "#" },
      { title: "Delivery Bookings", url: "#" },
      { title: "Moving Services", url: "#" },
      { title: "Emergency Calls", url: "#" },
      { title: "Shared Rides", url: "#" },
    ],
  },
  {
    title: "Users & Drivers",
    icon: Users,
    items: [
      { title: "Customers", url: "/users/customers" },
      { title: "Drivers", url: "/users/drivers" },
      { title: "Taxi Drivers", url: "/users/taxi-drivers" },
      { title: "Emergency Responders", url: "#" },
      { title: "Movers", url: "#" },
      { title: "Store Owners", url: "#" },
      { title: "User Verification", url: "#" },
      { title: "Driver Applications", url: "#" },
    ],
  },
  {
    title: "Services",
    icon: Car,
    items: [
      { title: "Service Types", url: "#" },
      { title: "Ride Types", url: "#" },
      { title: "Service Zones", url: "#" },
      { title: "Coverage Areas", url: "#" },
      { title: "Nearby Services", url: "#" },
    ],
  },
  {
    title: "Places & Stores",
    icon: MapPin,
    items: [
      { title: "Places", url: "#" },
      { title: "Place Categories", url: "#" },
      { title: "Place Votes", url: "#" },
      { title: "Stores", url: "#" },
      { title: "Products", url: "#" },
      { title: "Inventory Management", url: "#" },
      { title: "Business Hours", url: "#" },
    ],
  },
  {
    title: "Reviews & Ratings",
    icon: Star,
    items: [
      { title: "All Reviews", url: "#" },
      { title: "Review Analytics", url: "#" },
      { title: "Reported Reviews", url: "#" },
      { title: "Review Moderation", url: "#" },
    ],
  },
  {
    title: "Financial",
    icon: DollarSign,
    items: [
      { title: "Earnings", url: "#" },
      { title: "Commission Management", url: "#" },
      { title: "Subscriptions", url: "#" },
      { title: "Payment Methods", url: "#" },
      { title: "Pricing Configuration", url: "#" },
    ],
  },
  {
    title: "Emergency Services",
    icon: Zap,
    items: [
      { title: "Emergency Calls", url: "#" },
      { title: "Emergency Responders", url: "#" },
      { title: "Response Analytics", url: "#" },
      { title: "Emergency Zones", url: "#" },
    ],
  },
  {
    title: "Administration",
    icon: Shield,
    items: [
      { title: "System Metrics", url: "#" },
      { title: "Pending Verifications", url: "#" },
      { title: "Document Reviews", url: "#" },
      { title: "User Suspensions", url: "#" },
      { title: "Driver Approvals", url: "#" },
      { title: "Audit Logs", url: "#" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      { title: "Profile Settings", url: "#" },
      { title: "System Configuration", url: "#" },
      { title: "Notification Settings", url: "#" },
      { title: "Security Settings", url: "#" },
      { title: "API Configuration", url: "#" },
    ],
  },
  {
    title: "Search & Analytics",
    icon: Search,
    items: [
      { title: "Search Analytics", url: "#" },
      { title: "Popular Searches", url: "#" },
      { title: "System Analytics", url: "#" },
      { title: "Performance Metrics", url: "#" },
    ],
  },
]

export function AdminDashboard() {
  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Car className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Tripsync Admin</span>
              <span className="text-xs text-muted-foreground">Dashboard</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuData.map((section) => (
              <SidebarMenuItem key={section.title}>
                <Collapsible className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full">
                      <section.icon className="h-4 w-4" />
                      <span>{section.title}</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {section.items.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={item.url}>{item.title}</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Dashboard Overview</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              Export Data
            </Button>
          </div>
        </header>
        <div className="flex-1 space-y-4 p-4">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,234</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+20.1%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,350</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+180.1%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+19%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+0.2</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
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
                  className="h-[300px]"
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
            <Card className="col-span-3">
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
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
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
                      <span className="flex-1">{service.name}</span>
                      <span className="font-medium">{service.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
                {[
                  {
                    type: "booking",
                    message: "New ride booking from Downtown to Airport",
                    time: "2 minutes ago",
                    status: "active",
                  },
                  {
                    type: "driver",
                    message: "Driver John D. completed verification",
                    time: "5 minutes ago",
                    status: "success",
                  },
                  {
                    type: "emergency",
                    message: "Emergency call resolved in Sector 7",
                    time: "12 minutes ago",
                    status: "resolved",
                  },
                  {
                    type: "payment",
                    message: "Payment of $45.50 processed successfully",
                    time: "18 minutes ago",
                    status: "success",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 rounded-lg border p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      {activity.type === "booking" && <Calendar className="h-4 w-4" />}
                      {activity.type === "driver" && <Users className="h-4 w-4" />}
                      {activity.type === "emergency" && <Zap className="h-4 w-4" />}
                      {activity.type === "payment" && <CreditCard className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge
                      variant={
                        activity.status === "active"
                          ? "default"
                          : activity.status === "success"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
