"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Contact, Info, Plus, RefreshCcw, Search, UserCog, Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import * as api from "@/components/apiUrl"

// Updated administrator data based on the provided JSON
const administratorsData = {
  data: [
    {
      id: 1,
      adminId: "Admin5a0ae",
      firstName: "Taiwo",
      lastName: "Makinde",
      userName: "taiwo_makinde",
      email: "taiwo.makinde10@gmail.com",
      phoneNumber: "+234 7059518998",
      pictureUrl: "",
    },
    {
      id: 2,
      adminId: "Admin7b3fc",
      firstName: "John",
      lastName: "Doe",
      userName: "john_doe",
      email: "john.doe@sems.com",
      phoneNumber: "+1 555-123-4567",
      pictureUrl: "",
    },
    {
      id: 3,
      adminId: "Admin9c4ed",
      firstName: "Jane",
      lastName: "Smith",
      userName: "jane_smith",
      email: "jane.smith@sems.com",
      phoneNumber: "+1 555-987-6543",
      pictureUrl: "",
    },
    {
      id: 4,
      adminId: "Admin2d5fe",
      firstName: "Robert",
      lastName: "Johnson",
      userName: "robert_johnson",
      email: "robert.johnson@sems.com",
      phoneNumber: "+1 555-456-7890",
      pictureUrl: "",
    },
    {
      id: 5,
      adminId: "Admin8e6gf",
      firstName: "Emily",
      lastName: "Davis",
      userName: "emily_davis",
      email: "emily.davis@sems.com",
      phoneNumber: "+1 555-789-0123",
      pictureUrl: "",
    },
  ],
  message: "admins Data Retrieved!",
  status: true,
}

// Type definition for administrator
type Administrator = {
  id: number
  adminId: string
  firstName: string
  lastName: string
  userName: string
  email: string
  phoneNumber: string
  pictureUrl: string
}

// Form schema for creating administrator
const createAdminSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function AdministratorsPage() {
  const router = useRouter()
  const [selectedAdmin, setSelectedAdmin] = useState<Administrator | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchBy, setSearchBy] = useState("adminId")
  const [admins, setAdmins] = useState<Administrator[]>([])
  const [filteredAdmins, setFilteredAdmins] = useState<Administrator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false)

  // Fetch administrators data
  useEffect(() => {
    const fetchAdministrators = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would fetch data from an API
        const data = await api.getAllAdmins()

        setAdmins(data.data)
        setFilteredAdmins(data.data)
      } catch (error) {
        console.error("Error fetching administrators:", error)
        // Fallback to mock data
        setAdmins(administratorsData.data)
        setFilteredAdmins(administratorsData.data)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdministrators()
  }, [])

  // Initialize create form
  const createForm = useForm<z.infer<typeof createAdminSchema>>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  })

  // Update the handleSearch function to filter the fetched administrators
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query) {
      const filtered = admins.filter((admin) => {
        switch (searchBy) {
          case "adminId":
            return admin.adminId.toLowerCase().startsWith(query.toLowerCase())
          case "name":
            return (
              admin.firstName.toLowerCase().startsWith(query.toLowerCase()) ||
              admin.lastName.toLowerCase().startsWith(query.toLowerCase())
            )
          case "email":
            return admin.email.toLowerCase().startsWith(query.toLowerCase())
          default:
            return true
        }
      })
      setFilteredAdmins(filtered)
    } else {
      setFilteredAdmins(admins)
    }
  }

  const handleAdminSelect = (admin: Administrator) => {
    setSelectedAdmin(admin)
    setIsDetailOpen(true)
  }

  const handleAddAdmin = () => {
    router.push("/dashboard/administrators/add")
  }

  // Update the handleRefresh function to fetch fresh data
  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch fresh data from the API
      const data = await api.getAllAdmins()

      setAdmins(data.data)
      setFilteredAdmins(data.data)
      setSearchQuery("")
    } catch (error) {
      console.error("Error refreshing administrators:", error)
      // Fallback to mock data
      setAdmins(administratorsData.data)
      setFilteredAdmins(administratorsData.data)
    } finally {
      setIsLoading(false)
    }
  }

  const onCreateSubmit = (values: z.infer<typeof createAdminSchema>) => {
    // In a real app, this would send the data to an API
    console.log("Create form submitted:", values)

    // Create a new admin (for demo purposes)
    const newAdmin: Administrator = {
      id: administratorsData.data.length + 1,
      adminId: `Admin${Math.random().toString(36).substring(2, 7)}`,
      firstName: values.firstName,
      lastName: values.lastName,
      userName: `${values.firstName.toLowerCase()}_${values.lastName.toLowerCase()}`,
      email: values.email,
      phoneNumber: "",
      pictureUrl: "",
    }

    // Add the new admin to the list
    const updatedAdmins = [...administratorsData.data, newAdmin]
    setFilteredAdmins(updatedAdmins)

    // Close the form and reset it
    setIsAddAdminOpen(false)
    createForm.reset()
  }

  // Function to get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Stats for the dashboard tiles
  const totalAdmins = administratorsData.data.length

  // Update the content to show loading state
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserCog className="h-8 w-8 text-primary" />
            Administrators
          </h1>
          <p className="text-muted-foreground">Manage system administrators and their access levels</p>
        </div>
        <Button onClick={handleAddAdmin}>
          <Plus className="mr-2 h-4 w-4" />
          Add Administrator
        </Button>
      </div>

      {/* Dashboard Tiles */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Administrators</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
            <p className="text-xs text-muted-foreground">System administrators with access</p>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Administrator List</CardTitle>
          <CardDescription>View and manage all system administrators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1 max-w-sm flex">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search administrators..."
                className="pl-10 rounded-r-none"
                value={searchQuery}
                onChange={handleSearch}
              />
              <Select value={searchBy} onValueChange={setSearchBy}>
                <SelectTrigger className="w-[120px] rounded-l-none border-l-0">
                  <SelectValue placeholder="Search by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adminId">ID</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                    <TableHead className="text-center">Admin ID</TableHead>
                    <TableHead className="text-center">Name</TableHead>
                    <TableHead className="text-center">Email</TableHead>
                    <TableHead className="text-center">Username</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.length > 0 ? (
                    filteredAdmins.map((admin) => (
                      <TableRow key={admin.id} className="cursor-pointer" onClick={() => handleAdminSelect(admin)}>
                        <TableCell className="text-center">
                          <Avatar className="mx-auto">
                            <AvatarImage src={admin.pictureUrl || ""} alt={`${admin.firstName} ${admin.lastName}`} />
                            <AvatarFallback>{getInitials(admin.firstName, admin.lastName)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium text-center">{admin.adminId}</TableCell>
                        <TableCell className="text-center">{`${admin.firstName} ${admin.lastName}`}</TableCell>
                        <TableCell className="text-center">{admin.email}</TableCell>
                        <TableCell className="text-center">{admin.userName}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAdminSelect(admin)
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

      {/* Administrator Detail Sidebar */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent side="right" className="w-[85%] max-w-[85%] sm:max-w-[500px] overflow-y-auto p-0">
          <SheetHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Contact className="h-5 w-5 text-primary" />
                Administrator Details
              </SheetTitle>
            </div>
            <SheetDescription>Detailed information about the selected administrator</SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="space-y-6 p-6 pt-2">
              {selectedAdmin && (
                <>
                  {/* Administrator Profile */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={selectedAdmin.pictureUrl || ""}
                        alt={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}
                      />
                      <AvatarFallback className="text-2xl">
                        {getInitials(selectedAdmin.firstName, selectedAdmin.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}</h2>
                      <p className="text-muted-foreground">{selectedAdmin.adminId}</p>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Administrator Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Username</dt>
                          <dd>{selectedAdmin.userName}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                          <dd>{selectedAdmin.email}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                          <dd>{selectedAdmin.phoneNumber || "Not set"}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Admin ID</dt>
                          <dd>{selectedAdmin.adminId}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
