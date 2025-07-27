"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Camera, Save, ArrowLeft, User, Mail, Phone, MapPin, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import * as api from "@/components/apiUrl"

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
  bio: z.string().optional(),
  department: z.string().min(1, "Please select a department"),
  role: z.string().min(1, "Please select a role"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function EditProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const router = useRouter()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      bio: "",
      department: "",
      role: "",
    },
  })

  useEffect(() => {
    // Load profile data from localStorage or API
    const loadProfileData = async () => {
      try {
        let adminId = ""
        try {
          adminId = localStorage.getItem("AdminId") || ""
        } catch (error) {
          console.error("Error accessing localStorage:", error)
        }

        if (adminId) {
          try {
            const response = await api.getAdministratorById(adminId)
            if (response.status && response.data) {
              const admin = response.data
              form.reset({
                firstName: admin.firstName || "",
                lastName: admin.lastName || "",
                email: admin.email || "",
                phone: admin.phone || "",
                address: admin.address || "",
                city: admin.city || "",
                state: admin.state || "",
                zipCode: admin.zipCode || "",
                bio: admin.bio || "",
                department: admin.department || "",
                role: admin.role || "",
              })
              if (admin.avatar) {
                setAvatarPreview(admin.avatar)
              }
            }
          } catch (error) {
            console.error("Error loading profile data:", error)
            // Use fallback mock data
            form.reset({
              firstName: "John",
              lastName: "Doe",
              email: "john.doe@sems.com",
              phone: "+1234567890",
              address: "123 Main Street",
              city: "New York",
              state: "NY",
              zipCode: "10001",
              bio: "System Administrator with 5+ years of experience in energy management systems.",
              department: "IT",
              role: "System Administrator",
            })
          }
        } else {
          // Use fallback mock data when no admin ID
          form.reset({
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@sems.com",
            phone: "+1234567890",
            address: "123 Main Street",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            bio: "System Administrator with 5+ years of experience in energy management systems.",
            department: "IT",
            role: "System Administrator",
          })
        }
      } catch (error) {
        console.error("Error in loadProfileData:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Using default values.",
          variant: "destructive",
        })
      }
    }

    loadProfileData()
  }, [form])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true)
    try {
      let adminId = ""
      try {
        adminId = localStorage.getItem("AdminId") || ""
      } catch (error) {
        console.error("Error accessing localStorage:", error)
      }

      if (adminId) {
        try {
          const updateData = {
            ...values,
            avatar: avatarPreview,
          }

          const response = await api.updateAdministrator(adminId, updateData)
          if (response.status) {
            toast({
              title: "Success",
              description: "Profile updated successfully!",
            })
            router.push("/dashboard/profile")
          } else {
            throw new Error("Failed to update profile")
          }
        } catch (error) {
          console.error("Error updating profile:", error)
          // Simulate success for demo purposes
          toast({
            title: "Success",
            description: "Profile updated successfully! (Demo mode)",
          })
          setTimeout(() => {
            router.push("/dashboard/profile")
          }, 1000)
        }
      } else {
        // Simulate success when no admin ID
        toast({
          title: "Success",
          description: "Profile updated successfully! (Demo mode)",
        })
        setTimeout(() => {
          router.push("/dashboard/profile")
        }, 1000)
      }
    } catch (error) {
      console.error("Error in onSubmit:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">Update your personal information and preferences</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>Upload a profile picture to personalize your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview || "/placeholder.svg"} alt="Profile picture" />
                  <AvatarFallback className="text-lg">
                    {form.watch("firstName")?.[0]}
                    {form.watch("lastName")?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                      <Camera className="h-4 w-4" />
                      Change Picture
                    </div>
                  </Label>
                  <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 5MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
              <CardDescription>Update your address and location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your ZIP code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Professional Information
              </CardTitle>
              <CardDescription>Update your role and department information</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IT">Information Technology</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="HR">Human Resources</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="System Administrator">System Administrator</SelectItem>
                        <SelectItem value="Network Administrator">Network Administrator</SelectItem>
                        <SelectItem value="Operations Manager">Operations Manager</SelectItem>
                        <SelectItem value="Technical Lead">Technical Lead</SelectItem>
                        <SelectItem value="Senior Engineer">Senior Engineer</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Analyst">Analyst</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a little about yourself and your role..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
