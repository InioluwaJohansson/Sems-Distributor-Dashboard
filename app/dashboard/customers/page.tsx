"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Contact, Info, Mail, MapPin, ParkingMeter, Phone, RefreshCcw, Search, Users, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import * as api from "@/components/apiUrl"
// Type definitions for our data
type Address = {
  id: number
  numberLine: string
  street: string
  city: string
  region: string
  state: string
  country: string | null
}

type Meter = {
  id: number
  meterId: string
  isActive: boolean
}

type Customer = {
  id: number
  customerId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  pictureUrl: string
  getAddressDto: Address
  getMeterDto: Meter[]
}

export default function CustomersPage() {
  const router = useRouter()
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchBy, setSearchBy] = useState("customerId")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch customers data
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would fetch data from an API
        const customerData = await api.getAllCustomers()
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Use the local data instead of API call
        setCustomers(customerData.data)
        setFilteredCustomers(customerData.data)
      } catch (error) {
        console.error("Error fetching customers:", error)
        // Set empty arrays as fallback
        setCustomers([])
        setFilteredCustomers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // Update the handleSearch function to filter the fetched customers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query) {
      const filtered = customers.filter((customer) => {
        switch (searchBy) {
          case "customerId":
            return customer.customerId.toLowerCase().startsWith(query.toLowerCase())
          case "name":
            return (
              customer.firstName.toLowerCase().startsWith(query.toLowerCase()) ||
              customer.lastName.toLowerCase().startsWith(query.toLowerCase())
            )
          case "email":
            return customer.email.toLowerCase().startsWith(query.toLowerCase())
          default:
            return true
        }
      })
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailOpen(true)
  }

  // Update the handleRefresh function to fetch fresh data
  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch fresh data from the API
      const customerData = await api.getAllCustomers()
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Use the local data instead of API call
      setCustomers(customerData.data)
      setFilteredCustomers(customerData.data)
      setSearchQuery("")
    } catch (error) {
      console.error("Error refreshing customers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Function to handle meter click
  const handleMeterClick = (meterId: number) => {
    router.push(`/dashboard/meters?meterId=${meterId}`)
  }

  // Update the content to show loading state
  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          Customers
        </h1>
        <p className="text-muted-foreground">Manage customer accounts and their meters</p>
      </div>

      {/* Dashboard Tiles */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
            <Progress value={100} className="h-2 mt-2" indicatorColor="bg-gradient-to-r from-blue-400 to-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers with Meters</CardTitle>
            <ParkingMeter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter((customer) => customer.getMeterDto.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {customers.length > 0
                ? (
                    (customers.filter((customer) => customer.getMeterDto.length > 0).length / customers.length) *
                    100
                  ).toFixed(0)
                : 0}
              % of total customers
            </p>
            <Progress
              value={
                customers.length > 0
                  ? (customers.filter((customer) => customer.getMeterDto.length > 0).length / customers.length) * 100
                  : 0
              }
              className="h-2 mt-2"
              indicatorColor="bg-gradient-to-r from-green-400 to-green-600"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers without Meters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter((customer) => customer.getMeterDto.length === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {customers.length > 0
                ? (
                    (customers.filter((customer) => customer.getMeterDto.length === 0).length / customers.length) *
                    100
                  ).toFixed(0)
                : 0}
              % of total customers
            </p>
            <Progress
              value={
                customers.length > 0
                  ? (customers.filter((customer) => customer.getMeterDto.length === 0).length / customers.length) * 100
                  : 0
              }
              className="h-2 mt-2"
              indicatorColor="bg-gradient-to-r from-orange-400 to-orange-600"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>View and manage all customers in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search customers..." className="pl-10" value={searchQuery} onChange={handleSearch} />
            </div>
            <Select value={searchBy} onValueChange={setSearchBy}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customerId">ID</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] text-center"></TableHead>
                    <TableHead className="text-center">Customer ID</TableHead>
                    <TableHead className="text-center">Name</TableHead>
                    <TableHead className="text-center">Email</TableHead>
                    <TableHead className="text-center">Meters</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className="cursor-pointer"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <TableCell className="text-center">
                          <Avatar className="mx-auto">
                            <AvatarImage
                              src={customer.pictureUrl || `/placeholder.svg?height=40&width=40`}
                              alt={`${customer.firstName} ${customer.lastName}`}
                            />
                            <AvatarFallback>{getInitials(customer.firstName, customer.lastName)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium text-center">{customer.customerId}</TableCell>
                        <TableCell className="text-center">{`${customer.firstName} ${customer.lastName}`}</TableCell>
                        <TableCell className="text-center">{customer.email}</TableCell>
                        <TableCell className="text-center">
                          <Badge>{customer.getMeterDto.length}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCustomerSelect(customer)
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No data to display
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Detail Sidebar */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent side="right" className="w-[85%] max-w-[85%] sm:max-w-[500px] overflow-y-auto p-0">
          <SheetHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Contact className="h-5 w-5 text-primary" />
                Customer Details
              </SheetTitle>
            </div>
            <SheetDescription>Detailed information about the selected customer</SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="space-y-6 p-6 pt-2">
              {selectedCustomer && (
                <>
                  {/* Customer Profile */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={selectedCustomer.pictureUrl || `/placeholder.svg?height=80&width=80`}
                        alt={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                      />
                      <AvatarFallback className="text-2xl">
                        {getInitials(selectedCustomer.firstName, selectedCustomer.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}</h2>
                      <p className="text-muted-foreground">{selectedCustomer.customerId}</p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Mail className="h-4 w-4" /> Email
                          </dt>
                          <dd>{selectedCustomer.email}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Phone className="h-4 w-4" /> Phone
                          </dt>
                          <dd>{selectedCustomer.phoneNumber || "Not set"}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>

                  {/* Address Information */}
                  {selectedCustomer.getAddressDto && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          Address Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-1 gap-2">
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Street Address</dt>
                            <dd>{`${selectedCustomer.getAddressDto.numberLine} ${selectedCustomer.getAddressDto.street}`}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">City</dt>
                            <dd>{selectedCustomer.getAddressDto.city}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Region</dt>
                            <dd>{selectedCustomer.getAddressDto.region}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">State</dt>
                            <dd>{selectedCustomer.getAddressDto.state}</dd>
                          </div>
                          {selectedCustomer.getAddressDto.country && (
                            <div>
                              <dt className="text-sm font-medium text-muted-foreground">Country</dt>
                              <dd>{selectedCustomer.getAddressDto.country}</dd>
                            </div>
                          )}
                        </dl>
                      </CardContent>
                    </Card>
                  )}

                  {/* Meters */}
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                      <ParkingMeter className="h-5 w-5 text-primary" />
                      Meters
                    </h3>
                    <Separator className="my-2" />

                    {selectedCustomer.getMeterDto.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        {selectedCustomer.getMeterDto.map((meter) => (
                          <Card
                            key={meter.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleMeterClick(meter.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{meter.meterId}</h4>
                                </div>
                                <Badge variant={meter.isActive ? "default" : "secondary"}>
                                  {meter.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <Button
                                variant="link"
                                className="p-0 h-auto mt-2 text-xs text-primary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMeterClick(meter.id)
                                }}
                              >
                                View Meter Details →
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">No meters assigned to this customer</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
