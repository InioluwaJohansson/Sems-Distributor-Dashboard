"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import * as api from "@/components/apiUrl"

// Type definition for price
type Price = {
  id: number
  itemName: string
  rate: number
  taxes: number
  baseCharge: number
}

// Sample price data
const priceData = {
  data: {
    id: 1,
    itemName: "Defaults",
    rate: 270,
    taxes: 8,
    baseCharge: 3000,
  },
  message: "Data Retrieved!",
  status: true,
}

export default function UpdatePricePage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [formData, setFormData] = useState<Price>({
    id: 0,
    itemName: "",
    rate: 0,
    taxes: 0,
    baseCharge: 0,
  })
  const [errors, setErrors] = useState({
    itemName: "",
    rate: "",
    taxes: "",
    baseCharge: "",
  })

  // Fetch price data
  useEffect(() => {
    const fetchPrice = async () => {
      setIsLoading(true)
      try {

        // Simulate API call
        const pricesData = await api.getPrices()
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const price1Data = pricesData.data
        console.log(price1Data)
        setFormData({
          id: price1Data.id,
          itemName: price1Data.itemName,
          rate: price1Data.rate,
          taxes: price1Data.taxes,
          baseCharge: price1Data.baseCharge,
        })
      } catch (error) {
        console.error("Error fetching price:", error)
        toast({
          title: "Error",
          description: "There was an error loading the price data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchPrice()
    }
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Handle numeric values
    if (name === "rate" || name === "taxes" || name === "baseCharge") {
      setFormData((prev) => ({ ...prev, [name]: Number.parseFloat(value) || 0 }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      itemName: "",
      rate: "",
      taxes: "",
      baseCharge: "",
    }
    let isValid = true

    if (!formData.itemName.trim()) {
      newErrors.itemName = "Item name is required"
      isValid = false
    }

    if (formData.rate < 0) {
      newErrors.rate = "Rate must be a positive number"
      isValid = false
    }

    if (formData.taxes < 0) {
      newErrors.taxes = "Taxes must be a positive number"
      isValid = false
    }

    if (formData.baseCharge < 0) {
      newErrors.baseCharge = "Base charge must be a positive number"
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

    setIsSaving(true)
    setIsSuccess(false)
    setIsError(false)

    try {
      // In a real app, this would send the data to an API
      const priceFormData = {
        "id": formData.id,
        "itemName": formData.itemName,
        "rate": formData.rate,
        "taxes": formData.taxes,
        "baseCharge": formData.baseCharge
      }
      const response = await api.updatePrices(priceFormData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsSuccess(true)

      toast({
        title: "Price updated",
        description: "The price has been updated successfully.",
      })

      // Redirect after a short delay to show success animation
      setTimeout(() => {
        router.push("/dashboard/prices")
      }, 1500)
    } catch (error) {
      console.error("Error updating price:", error)
      setIsError(true)

      toast({
        title: "Error",
        description: "There was an error updating the price. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" />
            Update Price
          </h1>
          <p className="text-muted-foreground">Update energy pricing information</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price Information</CardTitle>
          <CardDescription>Update the energy pricing details</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <input type="hidden" name="id" value={formData.id} />

              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  name="itemName"
                  placeholder="Item name"
                  value={formData.itemName}
                  onChange={handleChange}
                />
                {errors.itemName && <p className="text-sm text-destructive">{errors.itemName}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate (₦)</Label>
                  <Input
                    id="rate"
                    name="rate"
                    type="number"
                    placeholder="Rate per unit"
                    value={formData.rate}
                    onChange={handleChange}
                  />
                  {errors.rate && <p className="text-sm text-destructive">{errors.rate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxes">Taxes (%)</Label>
                  <Input
                    id="taxes"
                    name="taxes"
                    type="number"
                    placeholder="Tax percentage"
                    value={formData.taxes}
                    onChange={handleChange}
                  />
                  {errors.taxes && <p className="text-sm text-destructive">{errors.taxes}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baseCharge">Base Charge (₦)</Label>
                  <Input
                    id="baseCharge"
                    name="baseCharge"
                    type="number"
                    placeholder="Base charge"
                    value={formData.baseCharge}
                    onChange={handleChange}
                  />
                  {errors.baseCharge && <p className="text-sm text-destructive">{errors.baseCharge}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/prices")}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="relative">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 animate-in zoom-in-50 duration-300" />
                      Saved!
                    </>
                  ) : isError ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4 text-red-500 animate-in zoom-in-50 duration-300" />
                      Failed
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
