"use client"

import type React from "react"
import { Inter } from "next/font/google"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  Calendar,
  Car,
  ChevronRight,
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

import { Button } from "@/components/ui/button"
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
import "./globals.css"
import NextAuthSessionProvider from "./session-provider"

const inter = Inter({ subsets: ["latin"] })

const menuData = [
  {
    title: "Dashboard",
    icon: Home,
    items: [
      { title: "Overview", url: "/" },
      { title: "Analytics", url: "/dashboard/analytics" },
    ],
  },
  {
    title: "Bookings",
    icon: Calendar,
    items: [
      { title: "All Bookings", url: "/bookings/all" },
      { title: "Ride Bookings", url: "/bookings/rides" },
      { title: "Taxi Bookings", url: "/bookings/taxi" },
      { title: "Day Bookings", url: "/bookings/day" },
      { title: "Delivery Bookings", url: "/bookings/delivery" },
      { title: "Moving Services", url: "/bookings/moving" },
      { title: "Emergency Calls", url: "/bookings/emergency" },
      { title: "Shared Rides", url: "/bookings/shared" },
    ],
  },
  {
    title: "Users & Drivers",
    icon: Users,
    items: [
      { title: "Customers", url: "/users/customers" },
      { title: "Drivers", url: "/users/drivers" },
      { title: "Taxi Drivers", url: "/users/taxi-drivers" },
      { title: "Emergency Responders", url: "/users/emergency-responders" },
      { title: "Movers", url: "/users/movers" },
      { title: "Store Owners", url: "/users/store-owners" },
      { title: "User Verification", url: "/users/verification" },
      { title: "Driver Applications", url: "/users/applications" },
    ],
  },
  {
    title: "Services",
    icon: Car,
    items: [
      { title: "Service Types", url: "/services/types" },
      { title: "Service Zones", url: "/services/zones" },
    ],
  },
  {
    title: "Places & Stores",
    icon: MapPin,
    items: [
      { title: "Place Categories", url: "/places/categories" },
      { title: "Places", url: "/places" },
      { title: "Place Votes", url: "/places/votes" },
      { title: "Stores", url: "/stores" },
      { title: "Product Category", url: "/stores/product-category" },
      { title: "Product Sub-Category", url: "/stores/product-subcategory" },
      { title: "Products", url: "/stores/products" },
      { title: "Inventory Management", url: "/stores/inventory" },
      { title: "Business Hours", url: "/stores/hours" },
    ],
  },
  {
    title: "Reviews & Ratings",
    icon: Star,
    items: [
      { title: "All Reviews", url: "/reviews" },
      { title: "Review Analytics", url: "/reviews/analytics" },
      { title: "Reported Reviews", url: "/reviews/reported" },
      { title: "Review Moderation", url: "/reviews/moderation" },
    ],
  },
  {
    title: "Financial",
    icon: DollarSign,
    items: [
      { title: "Earnings", url: "/financial/earnings" },
      { title: "Commission Management", url: "/financial/commission" },
      { title: "Subscriptions", url: "/financial/subscriptions" },
      { title: "Payment Methods", url: "/financial/payments" },
      { title: "Pricing Configuration", url: "/financial/pricing" },
    ],
  },
  {
    title: "Emergency Services",
    icon: Zap,
    items: [
      { title: "Emergency Calls", url: "/emergency/calls" },
      { title: "Emergency Responders", url: "/emergency/responders" },
      { title: "Response Analytics", url: "/emergency/analytics" },
      { title: "Emergency Zones", url: "/emergency/zones" },
    ],
  },
  {
    title: "Administration",
    icon: Shield,
    items: [
      { title: "System Metrics", url: "/admin/metrics" },
      { title: "Pending Verifications", url: "/admin/verifications" },
      { title: "Document Reviews", url: "/admin/documents" },
      { title: "User Suspensions", url: "/admin/suspensions" },
      { title: "Driver Approvals", url: "/admin/approvals" },
      { title: "Audit Logs", url: "/admin/logs" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      { title: "Profile Settings", url: "/settings/profile" },
      { title: "System Configuration", url: "/settings/system" },
      { title: "Notification Settings", url: "/settings/notifications" },
      { title: "Security Settings", url: "/settings/security" },
      { title: "API Configuration", url: "/settings/api" },
    ],
  },
  {
    title: "Search & Analytics",
    icon: Search,
    items: [
      { title: "Search Analytics", url: "/analytics/search" },
      { title: "Popular Searches", url: "/analytics/popular" },
      { title: "System Analytics", url: "/analytics/system" },
      { title: "Performance Metrics", url: "/analytics/performance" },
    ],
  },
]

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <html lang="en">
      <body className={inter.className}>
            <NextAuthSessionProvider>

 
        <SidebarProvider>
          <Sidebar className="border-r">
            <SidebarHeader className="border-b px-4 py-4 lg:px-6">
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
            <SidebarContent className="px-2 py-2">
              <SidebarMenu>
                {menuData.map((section) => (
                  <SidebarMenuItem key={section.title}>
                    <Collapsible
                      className="group/collapsible"
                      defaultOpen={section.items.some((item) => item.url === pathname)}
                    >
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
                              <SidebarMenuSubButton asChild isActive={pathname === item.url}>
                                <Link href={item.url}>{item.title}</Link>
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
            <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 lg:h-16">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                </Button>
                <Button variant="outline" size="sm" className="hidden md:flex bg-transparent">
                  Export Data
                </Button>
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto p-4 lg:p-6 max-w-7xl">{children}</div>
            </main>
          </SidebarInset>
        </SidebarProvider>
 </NextAuthSessionProvider>      </body>
    </html>
  )
}
