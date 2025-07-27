"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { User2, Camera, Loader2, Check, X, ArrowLeft, Save } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import * as api from "@/components/apiUrl"
import { debounce } from "lodash"

// Admin profile data based on the provided JSON
const adminProfileData = {
  data: {
    id: 1,
    adminId: "Admin5a0ae",
    firstName: "Taiwo",
    lastName: "Makinde",
    userName: "taiwo_makinde",
    email: "taiwo.makinde10@gmail.com",
    phoneNumber: "+234 7059518998",
    pictureUrl: "",
  },
  message: "Admin retrieved successfully!",
  status: true,
}

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]|[^a-zA-Z0-9]/, "Password must contain at least one number or special character")

// Form schema for updating profile
const updateProfileSchema = z
  .object({
    id: z.number(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    userName: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string(),
    picture: z.string().optional().default(""),
    password: z.string().optional().default(""),
    confirmPassword: z.string().optional().default(""),
  })
  .refine(
    (data) => {
      // If password is provided, validate it
      if (data.password && data.password.length > 0) {
        try {
          passwordSchema.parse(data.password)
          return true
        } catch (error) {
          return false
        }
      }
      return true
    },
    {
      message: "Password must be at least 8 characters, include an uppercase letter, and a number or special character",
      path: ["password"],
    },
  )
  .refine(
    (data) => {
      // If both password fields are filled, they must match
      if (data.password && data.confirmPassword) {
        return data.password === data.confirmPassword
      }
      return true
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  )

export default function EditProfilePage() {
  const [profile, setProfile] = useState(adminProfileData.data)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true)
  const [usernameMessage, setUsernameMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Initialize update form
  const updateForm = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      userName: profile.userName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      picture: profile.pictureUrl || "",
      password: "",
      confirmPassword: "",
    },
  })

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would fetch data from an API
        // Simulate API call
        const adminId = localStorage.getItem("AdminId")
        const adminProfile = await api.getAdminById(Number.parseInt(adminId || "1"))
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Use the mock data
        updateForm.reset({
          id: adminProfile.data.id,
          firstName: adminProfile.data.firstName,
          lastName: adminProfile.data.lastName,
          userName: adminProfile.data.userName,
          email: adminProfile.data.email,
          phoneNumber: adminProfile.data.phoneNumber,
          picture: adminProfile.data.pictureUrl || "",
          password: "",
          confirmPassword: "",
        })
        setProfile(adminProfile.data)
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [updateForm, toast])

  const onUpdateSubmit = async (values: z.infer<typeof updateProfileSchema>) => {
    setIsLoading(true)
    try {
      // In a real app, this would send the data to an API
      console.log("Update form submitted:", values)
      const updateAdmin = {
        id: Number.parseInt(localStorage.getItem("AdminId") || "1"),
        firstName: values.firstName,
        lastName: values.lastName,
        userName: values.userName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        pictureUrl: values.picture || "",
      }

      const response = await api.updateAdmin(updateAdmin)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (response.status === true) {
        setProfile({
          ...profile,
          firstName: values.firstName,
          lastName: values.lastName,
          userName: values.userName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          pictureUrl: values.picture || "",
        })

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
          duration: 3000,
        })

        // Navigate back to profile page
        router.push("/dashboard/profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Function to handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        updateForm.setValue("picture", result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Function to trigger file input click
  const handleSelectImage = () => {
    fileInputRef.current?.click()
  }

  // Function to check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (username === profile.userName) {
      setIsUsernameAvailable(true)
      setUsernameMessage("")
      return
    }

    setIsCheckingUsername(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, we'll consider usernames containing "admin" as taken
      const isAvailable = !username.toLowerCase().includes("admin")
      setIsUsernameAvailable(isAvailable)
      setUsernameMessage(isAvailable ? "Username is available" : "Username is already taken")
    } catch (error) {
      console.error("Error checking username:", error)
      setIsUsernameAvailable(true)
      setUsernameMessage("")
    } finally {
      setIsCheckingUsername(false)
    }
  }

  // Create a debounced version of the username check function
  const debouncedCheckUsername = debounce(checkUsernameAvailability, 500)

  // Watch for username changes
  const username = updateForm.watch("userName")
  useEffect(() => {
    if (username && username !== profile.userName) {
      debouncedCheckUsername(username)
    } else {
      setIsUsernameAvailable(true)
      setUsernameMessage("")
    }

    return () => {
      debouncedCheckUsername.cancel()
    }
  }, [username, profile.userName, debouncedCheckUsername])

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <User2 className="h-8 w-8 text-primary" />
            Edit Profile
          </h1>
          <p className="text-muted-foreground">Update your personal information</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/profile")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>
      </div>

      {isLoading && !updateForm.formState.isSubmitting ? (
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Form {...updateForm}>
          <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={updateForm.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input type="hidden" {...field} value={field.value.toString()} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Profile Picture */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage
                        src={updateForm.watch("picture") || ""}
                        alt={`${updateForm.watch("firstName")} ${updateForm.watch("lastName")}`}
                      />
                      <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                        {getInitials(
                          updateForm.watch("firstName") || profile.firstName,
                          updateForm.watch("lastName") || profile.lastName,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="absolute bottom-0 right-0 rounded-full bg-background shadow-md"
                            onClick={handleSelectImage}
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upload profile picture</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={updateForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={updateForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={updateForm.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="Username" {...field} />
                            {isCheckingUsername && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              </div>
                            )}
                            {!isCheckingUsername && usernameMessage && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isUsernameAvailable ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        {usernameMessage && (
                          <p className={isUsernameAvailable ? "text-green-500 text-xs" : "text-red-500 text-xs"}>
                            {usernameMessage}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={updateForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={updateForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel className="text-muted-foreground">Admin ID</FormLabel>
                    <Input value={profile.adminId} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground mt-1">Admin ID cannot be changed</p>
                  </div>

                  <FormField
                    control={updateForm.control}
                    name="picture"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input type="hidden" {...field} />
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
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password (optional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={updateForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="New password" {...field} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Must be at least 8 characters with a capital letter and a number or special character
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={updateForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/profile")}
                  disabled={updateForm.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCheckingUsername || !isUsernameAvailable || updateForm.formState.isSubmitting}
                >
                  {updateForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}
    </div>
  )
}
