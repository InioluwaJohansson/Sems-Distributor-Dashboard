"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Info, Download, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"

// Type definition for transaction
export type Transaction = {
  id: number
  transactionId: string
  meterId: number
  meterIdString: string
  date: string
  time: string
  allocatedUnits: number
  consumedUnits: number
  baseLoad: number
  peakLoad: number
  offPeakLoad: number
  rate: number
  baseCharge: number
  taxes: number
  total: number
  status: "Pending" | "Completed" | "Failed"
}

interface TransactionDetailsSidebarProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDetailsSidebar({ transaction, open, onOpenChange }: TransactionDetailsSidebarProps) {
  const router = useRouter()
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()
  const [jsPDFModule, setJsPDFModule] = useState<any>(null)

  // Load jsPDF and jspdf-autotable on component mount
  useState(() => {
    const loadModules = async () => {
      try {
        const jsPDFImport = await import("jspdf")
        await import("jspdf-autotable")
        setJsPDFModule(jsPDFImport)
      } catch (error) {
        console.error("Error loading PDF modules:", error)
      }
    }

    loadModules()
  })

  if (!transaction) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleViewMeter = () => {
    router.push(`/dashboard/meters?meterId=${transaction.meterId}`)
    onOpenChange(false)
  }

  const handleDownloadPdf = async () => {
    setIsDownloading(true)

    try {
      if (!jsPDFModule) {
        // Dynamically import jsPDF and jspdf-autotable
        const jsPDFImport = await import("jspdf")
        await import("jspdf-autotable")
        setJsPDFModule(jsPDFImport)
      }

      // Create a new jsPDF instance
      const doc = new (jsPDFModule?.default || window.jspdf.jsPDF)()

      // Add company logo/header
      doc.setFontSize(20)
      doc.setTextColor(44, 62, 80) // Dark blue header
      doc.text("SEMS Transaction Receipt", 105, 20, { align: "center" })

      // Add transaction details
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0) // Black text

      // Transaction Info Section
      doc.setFontSize(14)
      doc.setTextColor(52, 152, 219) // Blue section header
      doc.text("Transaction Information", 20, 40)
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)

      doc.text(`Transaction ID: ${transaction.transactionId}`, 20, 50)
      doc.text(`Date: ${formatDate(transaction.date)}`, 20, 55)
      doc.text(`Time: ${formatTime(transaction.time)}`, 20, 60)
      doc.text(`Status: ${transaction.status}`, 20, 65)
      doc.text(`Allocated Units: ${transaction.allocatedUnits}`, 20, 70)
      doc.text(`Consumed Units: ${transaction.consumedUnits}`, 20, 75)

      // Billing Information Section (moved before Load Information)
      doc.setFontSize(14)
      doc.setTextColor(52, 152, 219)
      doc.text("Billing Information", 20, 90)
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)

      // Create a table for billing details
      const billingTableData = [
        ["Rate", formatCurrency(transaction.rate)],
        ["Base Charge", formatCurrency(transaction.baseCharge)],
        ["Taxes", formatCurrency(transaction.taxes)],
        ["Total Amount", formatCurrency(transaction.total)],
      ]

      // Use autoTable for billing information
      // @ts-ignore - jspdf-autotable extends jsPDF prototype
      doc.autoTable({
        startY: 100,
        head: [["Item", "Amount"]],
        body: billingTableData,
        theme: "grid",
        headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255] },
        styles: { halign: "left" },
        columnStyles: { 1: { halign: "right" } },
      })

      // Load Information Section (moved after Billing Information)
      const loadInfoY = doc.autoTable.previous.finalY + 15
      doc.setFontSize(14)
      doc.setTextColor(52, 152, 219)
      doc.text("Load Information", 20, loadInfoY)
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)

      // Create a table for load information
      const loadTableData = [
        ["Base Load", transaction.baseLoad.toString()],
        ["Peak Load", transaction.peakLoad.toFixed(6)],
        ["Off-Peak Load", transaction.offPeakLoad.toString()],
      ]

      // Use autoTable for load information
      // @ts-ignore - jspdf-autotable extends jsPDF prototype
      doc.autoTable({
        startY: loadInfoY + 10,
        head: [["Load Type", "Value"]],
        body: loadTableData,
        theme: "grid",
        headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255] },
        styles: { halign: "left" },
      })

      // Add footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: "center" },
        )
      }

      // Save the PDF
      doc.save(`transaction_${transaction.transactionId}.pdf`)

      toast({
        title: "PDF Downloaded",
        description: `Transaction ${transaction.transactionId} has been downloaded as PDF.`,
        duration: 3000,
      })
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast({
        title: "Download Failed",
        description: "There was an error downloading the PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md p-0 bg-background">
        <div className="bg-slate-950 text-white p-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white flex items-center gap-2">
              <Info className="h-5 w-5" />
              Transaction Details
            </SheetTitle>
          </div>
          <SheetDescription className="text-slate-400">
            Detailed information about the selected transaction
          </SheetDescription>

          <div className="mt-4">
            <h2 className="text-2xl font-bold">{transaction.transactionId}</h2>
            <p className="text-slate-400">
              {formatDate(transaction.date)} at {formatTime(transaction.time)}
            </p>
            <div className="absolute top-6 right-6">
              <Badge
                variant={
                  transaction.status === "Completed"
                    ? "default"
                    : transaction.status === "Pending"
                      ? "secondary"
                      : "destructive"
                }
                className="ml-auto"
              >
                {transaction.status}
              </Badge>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)] px-6 py-4">
          <div className="space-y-6">
            {/* Transaction Information */}
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2 text-blue-500">
                <Info className="h-5 w-5" />
                Transaction Information
              </h3>
              <Separator className="my-2" />
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Meter</dt>
                  <dd>
                    <Button variant="link" className="p-0 h-auto font-medium text-primary" onClick={handleViewMeter}>
                      View Meter Details
                    </Button>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Allocated Units</dt>
                  <dd className="font-medium">{transaction.allocatedUnits}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Consumed Units</dt>
                  <dd className="font-medium">{transaction.consumedUnits}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge
                      variant={
                        transaction.status === "Completed"
                          ? "default"
                          : transaction.status === "Pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="mt-1"
                    >
                      {transaction.status}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Billing Information - Moved before Load Information */}
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2 text-blue-500">
                <Info className="h-5 w-5" />
                Billing Information
              </h3>
              <Separator className="my-2" />
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Rate</dt>
                  <dd className="font-medium">{formatCurrency(transaction.rate)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Base Charge</dt>
                  <dd className="font-medium">{formatCurrency(transaction.baseCharge)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Taxes</dt>
                  <dd className="font-medium">{formatCurrency(transaction.taxes)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Total Amount</dt>
                  <dd className="font-medium">{formatCurrency(transaction.total)}</dd>
                </div>
              </dl>
            </div>

            {/* Load Information - Moved after Billing Information */}
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2 text-blue-500">
                <Info className="h-5 w-5" />
                Load Information
              </h3>
              <Separator className="my-2" />
              <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Base Load</dt>
                  <dd className="font-medium">{transaction.baseLoad}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Peak Load</dt>
                  <dd className="font-medium">{transaction.peakLoad.toFixed(6)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Off-Peak Load</dt>
                  <dd className="font-medium">{transaction.offPeakLoad}</dd>
                </div>
              </dl>
            </div>

            <Button className="w-full mt-6" onClick={handleDownloadPdf} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
