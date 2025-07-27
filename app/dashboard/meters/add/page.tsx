"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Activity, ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import * as api from "@/components/apiUrl"

export default function AddMeterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [formData, setFormData] = useState({
    adminUserId: 1,
    isActive: true,
  })
  const [errors, setErrors] = useState({
    adminUserId: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: name === "adminUserId" ? Number.parseInt(value) || 0 : value }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const validateForm = () => {
    const newErrors = {
      adminUserId: "",
    }
    let isValid = true

    if (formData.adminUserId <= 0) {
      newErrors.adminUserId = "Admin ID is required and must be a positive number"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setIsSuccess(false)
    setIsError(false)

    try {
      // In a real app, this would send the data to an API
      const response = await api.createMeter(formData.adminUserId, formData.isActive);
      if(response.status == true){
        toast({
          title: "Meter created",
          description: "The meter has been created successfully.",
        })
      
      } else{
        toast({
        title: "Error",
        description: "There was an error creating the meter. Please try again.",
        variant: "destructive",
      })
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsSuccess(true)


      // Redirect after a short delay to show success animation
      setTimeout(() => {
        router.push("/dashboard/meters")
      }, 1500)
    } catch (error) {
      console.error("Error creating meter:", error)
      setIsError(true)

      toast({
        title: "Error",
        description: "There was an error creating the meter. Please try again.",
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
            <Activity className="h-8 w-8 text-primary" />
            Add Meter
          </h1>
          <p className="text-muted-foreground">Create a new smart meter</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meter Information</CardTitle>
          <CardDescription>Enter the details for the new meter</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="">
              <Input hidden
                id="adminUserId"
                name="adminUserId"
                type="hidden"
                placeholder="Enter admin ID"
                value={formData.adminUserId}
                onChange={handleChange}
              />
              {errors.adminUserId && <p className="text-sm text-destructive">{errors.adminUserId}</p>}
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Active Status</Label>
                <p className="text-sm text-muted-foreground">Set whether the meter is active or inactive</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
                aria-label="Toggle active status"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/meters")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="relative">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 animate-in zoom-in-50 duration-300" />
                    Created!
                  </>
                ) : isError ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4 text-red-500 animate-in zoom-in-50 duration-300" />
                    Failed
                  </>
                ) : (
                  "Create Meter"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
