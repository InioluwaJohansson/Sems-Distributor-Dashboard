"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { User2, Camera, Loader2, Edit, Save } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import * as api from "@/components/apiUrl"

// Admin profile data based on the provided JSON
const adminProfileData = {
  data: {
    id: 0,
    adminId: "",
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    phoneNumber: "",
    pictureUrl: "",
  },
  message: "Admin retrieved successfully!",
  status: true,
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(adminProfileData.data)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(adminProfileData.data)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would fetch data from an API
        // Simulate API call
        const adminId = localStorage.getItem("AdminId")
        console.log(adminId)
        const adminProfile = await api.getAdminById(parseInt(adminId))
        console.log(adminProfile)
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Use the mock data
        setProfile(adminProfile.data)
        setEditedProfile(adminProfile.data)
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
  }, [])

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
      setSelectedImage(result)

      // Extract base64 part only (removes "data:image/png;base64," or similar)
      const base64Only = result.split(',')[1]

      setEditedProfile({
        ...editedProfile,
        pictureUrl: result,
      })
    }
    reader.readAsDataURL(file)
  }
}

  // Function to trigger file input click
  const handleSelectImage = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedProfile({
      ...editedProfile,
      [name]: value,
    })
  }

  const handleSaveChanges = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would send the data to an API
        console.log("Saving profile changes:", editedProfile)
        const adminId = localStorage.getItem("AdminId")
        const payload = {
          "id": parseInt(adminId), // use actual ID
          "firstName": editedProfile.firstName,
          "lastName": editedProfile.lastName,
          "userName": editedProfile.userName,
          "email": editedProfile.email,
          "phoneNumber": editedProfile.phoneNumber,
          "pictureUrl": editedProfile.pictureUrl || "",
        }
      const response = await api.updateAdmin(payload)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      if(response.status == true){
        setProfile(editedProfile)
        setIsEditing(false)

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
          duration: 3000,
        })
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

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <User2 className="h-8 w-8 text-primary" />
            My Profile
          </h1>
          <p className="text-muted-foreground">View and manage your profile information</p>
        </div>
        <Button
          variant={isEditing ? "default" : "outline"}
          onClick={() => (isEditing ? handleSaveChanges() : setIsEditing(true))}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Saving..." : "Loading..."}
            </>
          ) : isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {isLoading && !isEditing ? (
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src={isEditing ? selectedImage || profile.pictureUrl : profile.pictureUrl || null}
                    alt={`${profile.firstName} ${profile.lastName}`}
                  />
                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                    {getInitials(profile.firstName, profile.lastName)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
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
                )}
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
              <div>
                <label className="text-sm font-medium text-muted-foreground">First Name</label>
                {isEditing ? (
                  <Input
                    name="firstName"
                    value={editedProfile.firstName}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 text-lg font-medium">{profile.firstName}</div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                {isEditing ? (
                  <Input name="lastName" value={editedProfile.lastName} onChange={handleInputChange} className="mt-1" />
                ) : (
                  <div className="mt-1 text-lg font-medium">{profile.lastName}</div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                {isEditing ? (
                  <Input name="userName" value={editedProfile.userName} onChange={handleInputChange} className="mt-1" />
                ) : (
                  <div className="mt-1 text-lg font-medium">{profile.userName}</div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                {isEditing ? (
                  <Input
                    name="email"
                    type="email"
                    value={editedProfile.email}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 text-lg font-medium">{profile.email}</div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                {isEditing ? (
                  <Input
                    name="phoneNumber"
                    value={editedProfile.phoneNumber}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 text-lg font-medium">{profile.phoneNumber}</div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Admin ID</label>
                <Input value={profile.adminId} disabled className="mt-1 bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">Admin ID cannot be changed</p>
              </div>
            </div>

            {isEditing && (
              <>
                <Separator className="my-4" />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setEditedProfile(profile)
                      setSelectedImage(null)
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSaveChanges} disabled={isLoading}>
                    {isLoading ? (
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
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
