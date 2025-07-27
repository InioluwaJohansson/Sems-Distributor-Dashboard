import { AlertCircle } from "lucide-react"

interface NoDataMessageProps {
  message?: string
}

export function NoDataMessage({ message = "No data to display" }: NoDataMessageProps) {
  return (
    <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
      <div className="flex flex-col items-center text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
