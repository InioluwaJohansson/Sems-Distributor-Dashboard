"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddMeterSidebar } from "./add-meter-sidebar"

interface AddMeterButtonProps {
  adminId: number
}

export function AddMeterButton({ adminId }: AddMeterButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (values: { adminUserId: number; isActive: boolean }) => {
    // In a real app, this would send the data to an API
    console.log("New meter data:", values)
    // You could also add a success notification here
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Meter
      </Button>

      <AddMeterSidebar open={isOpen} onOpenChange={setIsOpen} adminId={adminId} onSubmit={handleSubmit} />
    </>
  )
}
