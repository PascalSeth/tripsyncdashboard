"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, TrendingUp, TrendingDown, Download } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts"

const monthlyEarnings = [
  { month: "Jan", gross: 45000, net: 38250, commission: 6750 },
  { month: "Feb", gross: 52000, net: 44200, commission: 7800 },
  { month: "Mar", gross: 48000, net: 40800, commission: 7200 },
  { month: "Apr", gross: 58000, net: 49300, commission: 8700 },
  { month: "May", gross: 62000, net: 52700, commission: 9300 },
  { month: "Jun", gross: 68000, net: 57800, commission: 10200 },
]

const earningsByService = [
  { service: "Rides", earnings: 45000, percentage: 45, color: "hsl(var(--chart-1))" },
  { service: "Taxi", earnings: 25000, percentage: 25, color: "hsl(var(--chart-2))" },
  { service: "Delivery", earnings: 15000, percentage: 15, color: "hsl(var(--chart-3))" },
  { service: "Moving", earnings: 10000, percentage: 10, color: "hsl(var(--chart-4))" },
  { service: "Emergency", earnings: 5000, percentage: 5, color: "hsl(var(--chart-5))" },
]

const dailyEarnings = [
  { day: "Mon", earnings: 8500 },
  { day: "Tue", earnings: 9200 },
  { day: "Wed", earnings: 8800 },
  { day: "Thu", earnings: 9500 },
  { day: "Fri", earnings: 11200 },
  { day: "Sat", earnings: 12800 },
  { day: "Sun", earnings: 10500 },
]

const topEarners = [
  { name: "Mike Johnson", earnings: "$4,567", trips: 234, rating: 4.8 },
  { name: "Sarah Wilson", earnings: "$4,234", trips: 189, rating: 4.9 },
  { name: "Tom Davis", earnings: "$3,890", trips: 156, rating: 4.7 },
  { name: "Alex Turner", earnings: "$3,567", trips: 178, rating: 5.0 },
  { name: "Lisa Brown", earnings: "$3,234", trips: 145, rating: 4.8 },
]

export function Earnings() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Earnings</h1>
          <p className="text-muted-foreground">Monitor platform revenue and driver earnings</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$68,000</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$10,200</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-600">+15.2%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Driver Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$57,800</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-600">+11.8%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Trip Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24.50</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              <span className="text-red-600">-2.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">By Service</TabsTrigger>
          <TabsTrigger value="daily">Daily Trends</TabsTrigger>
          <TabsTrigger value="drivers">Top Earners</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Earnings Trend</CardTitle>
              <CardDescription>Gross revenue, net earnings, and commission breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  gross: {
                    label: "Gross Revenue",
                    color: "hsl(var(--chart-1))",
                  },
                  net: {
                    label: "Net Earnings",
                    color: "hsl(var(--chart-2))",
                  },
                  commission: {
                    label: "Commission",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px] lg:h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyEarnings}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="gross"
                      stackId="1"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="net"
                      stackId="2"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="commission"
                      stackId="3"
                      stroke="hsl(var(--chart-3))"
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Earnings by Service Type</CardTitle>
                <CardDescription>Revenue distribution across services</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    earnings: {
                      label: "Earnings",
                    },
                  }}
                  className="h-[250px] lg:h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={earningsByService}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="earnings"
                      >
                        {earningsByService.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
                <CardDescription>Detailed breakdown by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {earningsByService.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: service.color }} />
                        <div>
                          <div className="font-medium">{service.service}</div>
                          <div className="text-sm text-muted-foreground">{service.percentage}% of total</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${service.earnings.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Earnings Pattern</CardTitle>
              <CardDescription>Weekly earnings distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  earnings: {
                    label: "Earnings",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[300px] lg:h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyEarnings}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="earnings" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Earning Drivers</CardTitle>
              <CardDescription>Highest performing drivers this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead className="min-w-[150px]">Driver Name</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Total Trips</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topEarners.map((driver, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant={index < 3 ? "default" : "outline"}>#{index + 1}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell className="font-bold text-green-600">{driver.earnings}</TableCell>
                        <TableCell>{driver.trips}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{driver.rating}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Excellent</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
