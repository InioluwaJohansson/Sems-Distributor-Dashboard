"use client"

import { useEffect, useState } from "react"
import { CheckCircle } from "lucide-react"

interface SuccessAnimationProps {
  show: boolean
  message?: string
  onComplete?: () => void
  duration?: number
}

export function SuccessAnimation({
  show,
  message = "Operation completed successfully!",
  onComplete,
  duration = 2000,
}: SuccessAnimationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        if (onComplete) onComplete()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50 animate-in fade-in duration-300">
      <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center max-w-md text-center animate-in zoom-in-50 duration-300">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Success!</h3>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
