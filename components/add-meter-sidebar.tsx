"use client"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ParkingMeterIcon as Meter } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

// Form schema for adding a meter based on the provided schema
const addMeterSchema = z.object({
  adminUserId: z.number().int().min(1, "Admin ID is required"),
  isActive: z.boolean().default(true),
})

type AddMeterFormValues = z.infer<typeof addMeterSchema>

interface AddMeterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (values: AddMeterFormValues) => void
  adminId: number
}

export function AddMeterSidebar({ open, onOpenChange, onSubmit, adminId }: AddMeterSidebarProps) {
  // Initialize form with default values
  const form = useForm<AddMeterFormValues>({
    resolver: zodResolver(addMeterSchema),
    defaultValues: {
      adminUserId: adminId,
      isActive: true,
    },
  })

  const handleSubmit = (values: AddMeterFormValues) => {
    console.log("Form submitted:", values)
    if (onSubmit) {
      onSubmit(values)
    }
    onOpenChange(false)
    form.reset({
      adminUserId: adminId,
      isActive: true,
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Meter className="h-5 w-5 text-primary" />
              Add New Meter
            </SheetTitle>
          </div>
          <SheetDescription>Create a new smart meter</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="space-y-6 p-6 pt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="adminUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin User ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter admin ID"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <div className="text-sm text-muted-foreground">Set the meter as active or inactive</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Meter</Button>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
