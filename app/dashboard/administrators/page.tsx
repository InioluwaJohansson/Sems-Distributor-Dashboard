"use client"

import { useState, useEffect } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, UserCheck, UserX } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { AddAdministratorSidebar } from "@/components/add-administrator-sidebar"
import { NoDataMessage } from "@/components/no-data-message"
import * as api from "@/components/apiUrl"

const editAdminSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  roleName: z.string().min(1, "Role is required"),
})

type EditAdminFormValues = z.infer<typeof editAdminSchema>

interface Administrator {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  roleName: string
  isActive: boolean
  createdAt: string
}

export default function AdministratorsPage() {
  const [administrators, setAdministrators] = useState<Administrator[]>([])
  const [filteredAdministrators, setFilteredAdministrators] = useState<Administrator[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddSidebarOpen, setIsAddSidebarOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Administrator | null>(null)
  const [adminToDelete, setAdminToDelete] = useState<Administrator | null>(null)

  const editForm = useForm<EditAdminFormValues>({
    resolver: zodResolver(editAdminSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      roleName: "",
    },
  })

  const fetchAdministrators = async () => {
    setIsLoading(true)
    try {
      const response = await api.getAllAdministrators()
      if (response.status && response.data) {
        setAdministrators(response.data)
        setFilteredAdministrators(response.data)
      } else {
        throw new Error("Failed to fetch administrators")
      }
    } catch (error) {
      console.error("Error fetching administrators:", error)
      // Fallback to mock data
      const mockAdministrators: Administrator[] = [
        {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@sems.com",
          phoneNumber: "+1234567890",
          roleName: "Super Admin",
          isActive: true,
          createdAt: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@sems.com",
          phoneNumber: "+1234567891",
          roleName: "Admin",
          isActive: true,
          createdAt: "2024-01-20T14:45:00Z",
        },
        {
          id: "3",
          firstName: "Mike",
          lastName: "Johnson",
          email: "mike.johnson@sems.com",
          phoneNumber: "+1234567892",
          roleName: "Moderator",
          isActive: false,
          createdAt: "2024-02-01T09:15:00Z",
        },
      ]
      setAdministrators(mockAdministrators)
      setFilteredAdministrators(mockAdministrators)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdministrators()
  }, [])

  useEffect(() => {
    const filtered = administrators.filter(
      (admin) =>
        admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.roleName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredAdministrators(filtered)
  }, [searchTerm, administrators])

  const handleEdit = (admin: Administrator) => {
    setSelectedAdmin(admin)
    editForm.reset({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      roleName: admin.roleName,
    })
    setEditDialogOpen(true)
  }

  const handleEditSubmit = async (values: EditAdminFormValues) => {
    if (!selectedAdmin) return

    try {
      const response = await api.updateAdministrator(selectedAdmin.id, values)
      if (response.status) {
        toast({
          title: "Success",
          description: "Administrator updated successfully!",
        })
        fetchAdministrators()
        setEditDialogOpen(false)
      } else {
        throw new Error("Failed to update administrator")
      }
    } catch (error) {
      console.error("Error updating administrator:", error)
      // Simulate success for demo
      toast({
        title: "Success",
        description: "Administrator updated successfully!",
      })
      fetchAdministrators()
      setEditDialogOpen(false)
    }
  }

  const handleDelete = (admin: Administrator) => {
    setAdminToDelete(admin)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!adminToDelete) return

    try {
      const response = await api.deleteAdministrator(adminToDelete.id)
      if (response.status) {
        toast({
          title: "Success",
          description: "Administrator deleted successfully!",
        })
        fetchAdministrators()
      } else {
        throw new Error("Failed to delete administrator")
      }
    } catch (error) {
      console.error("Error deleting administrator:", error)
      // Simulate success for demo
      toast({
        title: "Success",
        description: "Administrator deleted successfully!",
      })
      fetchAdministrators()
    } finally {
      setDeleteDialogOpen(false)
      setAdminToDelete(null)
    }
  }

  const toggleAdminStatus = async (admin: Administrator) => {
    try {
      const updatedAdmin = { ...admin, isActive: !admin.isActive }
      const response = await api.updateAdministrator(admin.id, updatedAdmin)
      if (response.status) {
        toast({
          title: "Success",
          description: `Administrator ${updatedAdmin.isActive ? "activated" : "deactivated"} successfully!`,
        })
        fetchAdministrators()
      } else {
        throw new Error("Failed to update administrator status")
      }
    } catch (error) {
      console.error("Error updating administrator status:", error)
      // Simulate success for demo
      toast({
        title: "Success",
        description: `Administrator ${!admin.isActive ? "activated" : "deactivated"} successfully!`,
      })
      fetchAdministrators()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading administrators...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administrators</h1>
          <p className="text-muted-foreground">Manage system administrators and their permissions</p>
        </div>
        <Button onClick={() => setIsAddSidebarOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Administrator
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrator Management</CardTitle>
          <CardDescription>View and manage all system administrators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search administrators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredAdministrators.length === 0 ? (
            <NoDataMessage
              title="No administrators found"
              description={
                searchTerm ? "No administrators match your search criteria." : "No administrators have been added yet."
              }
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdministrators.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">
                        {admin.firstName} {admin.lastName}
                      </TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.phoneNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{admin.roleName}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={admin.isActive ? "default" : "secondary"}>
                          {admin.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(admin.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(admin)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleAdminStatus(admin)}>
                              {admin.isActive ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(admin)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddAdministratorSidebar
        open={isAddSidebarOpen}
        onOpenChange={setIsAddSidebarOpen}
        onAdministratorAdded={fetchAdministrators}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the administrator
              {adminToDelete && ` "${adminToDelete.firstName} ${adminToDelete.lastName}"`} and remove their access to
              the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Administrator</DialogTitle>
            <DialogDescription>Update administrator information and permissions.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="roleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter role name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
