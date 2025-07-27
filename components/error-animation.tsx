"use client"

import { useEffect, useState } from "react"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorAnimationProps {
  show: boolean
  message?: string
  onDismiss?: () => void
  duration?: number
}

export function ErrorAnimation({
  show,
  message = "An error occurred. Please try again.",
  onDismiss,
  duration = 0, // 0 means it won't auto-dismiss
}: ErrorAnimationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      if (duration > 0) {
        const timer = setTimeout(() => {
          setVisible(false)
          if (onDismiss) onDismiss()
        }, duration)
        return () => clearTimeout(timer)
      }
    }
  }, [show, duration, onDismiss])

  const handleDismiss = () => {
    setVisible(false)
    if (onDismiss) onDismiss()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50 animate-in fade-in duration-300">
      <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center max-w-md text-center animate-in zoom-in-50 duration-300">
        <XCircle className="h-16 w-16 text-destructive mb-4" />
        <h3 className="text-xl font-semibold mb-2">Error</h3>
        <p className="text-muted-foreground mb-4">{message}</p>
        <Button onClick={handleDismiss}>Dismiss</Button>
      </div>
    </div>
  )
}
