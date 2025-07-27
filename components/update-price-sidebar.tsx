"use client"
import { Button } from "@/components/ui/button"
import React from "react"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { DollarSign } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

// Form schema for updating price
const updatePriceSchema = z.object({
  id: z.number(),
  itemName: z.string().min(1, "Item name is required"),
  rate: z.number().min(0, "Rate must be a positive number"),
  taxes: z.number().min(0, "Taxes must be a positive number"),
  baseCharge: z.number().min(0, "Base charge must be a positive number"),
})

type UpdatePriceFormValues = z.infer<typeof updatePriceSchema>

interface UpdatePriceSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (values: UpdatePriceFormValues) => void
  currentPrice: {
    id: number
    itemName: string
    rate: number
    taxes: number
    baseCharge: number
  }
}

export function UpdatePriceSidebar({ open, onOpenChange, onSubmit, currentPrice }: UpdatePriceSidebarProps) {
  // Initialize form with default values
  const form = useForm<UpdatePriceFormValues>({
    resolver: zodResolver(updatePriceSchema),
    defaultValues: {
      id: currentPrice.id,
      itemName: currentPrice.itemName,
      rate: currentPrice.rate,
      taxes: currentPrice.taxes,
      baseCharge: currentPrice.baseCharge,
    },
  })

  // Update form values when currentPrice changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        id: currentPrice.id,
        itemName: currentPrice.itemName,
        rate: currentPrice.rate,
        taxes: currentPrice.taxes,
        baseCharge: currentPrice.baseCharge,
      })
    }
  }, [open, currentPrice, form])

  const handleSubmit = (values: UpdatePriceFormValues) => {
    console.log("Form submitted:", values)
    if (onSubmit) {
      onSubmit(values)
    }
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Update Price
            </SheetTitle>
          </div>
          <SheetDescription>Update the energy pricing information</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="space-y-6 p-6 pt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <input type="hidden" {...form.register("id")} />

                <FormField
                  control={form.control}
                  name="itemName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Item name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate (₦)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Rate per unit"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxes (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Tax percentage"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="baseCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Charge (₦)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Base charge"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
