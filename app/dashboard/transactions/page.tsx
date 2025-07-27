"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FileText, Info, Receipt, RefreshCcw, Search, Loader2, X, CalendarIcon, DollarSign } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import * as api from "@/components/apiUrl"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Type definitions for our data
type Transaction = {
  id: number
  meterId: number
  allocatedUnits: number
  consumedUnits: number
  baseLoad: number
  peakLoad: number
  offPeakLoad: number
  getTransactionDto: {
    transactionId: string
    date: string
    time: string
    rate: number
    baseCharge: number
    taxes: number
    total: number
  }
  unitAllocationStatus: string
}

export default function TransactionsPage() {
  const router = useRouter()
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchBy, setSearchBy] = useState("transactionId")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [sortBy, setSortBy] = useState("transactionId")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const pdfRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Import jsPDF and jspdf-autotable at the component level
  const [jsPDFModule, setJsPDFModule] = useState<any>(null)

  // Load jsPDF and jspdf-autotable on component mount
  useEffect(() => {
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
  }, [])

  // Fetch transactions data
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would fetch data from an API
        const response = await api.getAllMeterUnitsAllocation()
        console.log(response.data)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setTransactions(response.data)
        setFilteredTransactions(response.data)
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  // Update the useEffect that filters transactions to include sorting and date filtering
  useEffect(() => {
    if (transactions.length > 0) {
      filterAndSortTransactions(searchQuery, searchBy, sortBy, sortDirection, dateRange)
    }
  }, [transactions, sortBy, sortDirection, dateRange])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    filterAndSortTransactions(query, "transactionId", sortBy, sortDirection, dateRange)
  }

  // Add a new function to filter and sort transactions
  const filterAndSortTransactions = (
    query: string,
    searchByField: string,
    sortByField: string,
    direction: "asc" | "desc",
    dates: { from: Date | undefined; to: Date | undefined },
  ) => {
    let filtered = [...transactions]

    // Filter by search query
    if (query) {
      filtered = filtered.filter((transaction) => {
        switch (searchByField) {
          case "transactionId":
            return transaction.getTransactionDto.transactionId.toLowerCase().includes(query.toLowerCase())
          case "meterId":
            return transaction.meterId.toString().includes(query)
          default:
            return true
        }
      })
    }

    // Filter by date range
    if (dates.from || dates.to) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.getTransactionDto.date)

        if (dates.from && dates.to) {
          return transactionDate >= dates.from && transactionDate <= dates.to
        } else if (dates.from) {
          return transactionDate >= dates.from
        } else if (dates.to) {
          return transactionDate <= dates.to
        }

        return true
      })
    }

    // Sort the filtered results
    switch (sortByField) {
      case "transactionId":
        filtered.sort((a, b) => {
          const comparison = a.getTransactionDto.transactionId.localeCompare(b.getTransactionDto.transactionId)
          return direction === "asc" ? comparison : -comparison
        })
        break
      case "date-oldest":
        filtered.sort((a, b) => {
          const dateA = new Date(a.getTransactionDto.date).getTime()
          const dateB = new Date(b.getTransactionDto.date).getTime()
          return dateA - dateB
        })
        break
      case "date-newest":
        filtered.sort((a, b) => {
          const dateA = new Date(a.getTransactionDto.date).getTime()
          const dateB = new Date(b.getTransactionDto.date).getTime()
          return dateB - dateA
        })
        break
      case "amount-highest":
        filtered.sort((a, b) => {
          const amountA = a.getTransactionDto.total
          const amountB = b.getTransactionDto.total
          return amountB - amountA
        })
        break
      case "amount-lowest":
        filtered.sort((a, b) => {
          const amountA = a.getTransactionDto.total
          const amountB = b.getTransactionDto.total
          return amountA - amountB
        })
        break
    }

    setFilteredTransactions(filtered)
  }

  const handleTransactionSelect = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDetailOpen(true)
  }

  // Add a function to handle sorting
  const handleSort = (value: string) => {
    setSortBy(value)
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const response = await api.getAllMeterUnitsAllocation()
      console.log(response.data)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setTransactions(response.data)
      setFilteredTransactions(response.data)
      setSearchQuery("")
      setDateRange({ from: undefined, to: undefined })
    } catch (error) {
      console.error("Error refreshing transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })}`
  }

  // Format currency (Naira)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Function to view meter details
  const handleViewMeterDetails = (meterId: number) => {
    setIsDetailOpen(false)
    router.push(`/dashboard/meters?meterId=${meterId}`)
  }

  // Function to download transaction as PDF
  const handleDownloadPDF = async (transaction: Transaction) => {
    setIsDownloading(true)
    try {
      if (!jsPDFModule) {
        throw new Error("PDF module not loaded")
      }

      // Create a new jsPDF instance
      //const doc = new jsPDFModule.default()
      const doc = new jsPDF()
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

      doc.text(`Transaction ID: ${transaction.getTransactionDto.transactionId}`, 20, 50)
      doc.text(`Date: ${formatDate(transaction.getTransactionDto.date)}`, 20, 55)
      doc.text(`Time: ${new Date(transaction.getTransactionDto.time).toLocaleTimeString()}`, 20, 60)
      doc.text(`Meter ID: ${transaction.meterId}`, 20, 65)
      doc.text(`Status: ${transaction.unitAllocationStatus}`, 20, 70)

      // Load Information Section
      doc.setFontSize(14)
      doc.setTextColor(52, 152, 219)
      doc.text("Load Information", 20, 85)
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)

      doc.text(`Allocated Units: ${transaction.allocatedUnits}`, 20, 95)
      doc.text(`Consumed Units: ${transaction.consumedUnits}`, 20, 100)
      doc.text(`Base Load: ${transaction.baseLoad}`, 20, 105)
      doc.text(`Peak Load: ${transaction.peakLoad.toFixed(6)}`, 20, 110)
      doc.text(`Off-Peak Load: ${transaction.offPeakLoad}`, 20, 115)

      // Billing Information Section
      doc.setFontSize(14)
      doc.setTextColor(52, 152, 219)
      doc.text("Billing Information", 20, 130)
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)

      // Create a table for billing details
      const tableData = [
        ["Rate", `₦${transaction.getTransactionDto.rate.toFixed(2)}`],
        ["Base Charge", `₦${transaction.getTransactionDto.baseCharge.toFixed(2)}`],
        ["Taxes", `₦${transaction.getTransactionDto.taxes.toFixed(2)}`],
        ["Total Amount", `₦${transaction.getTransactionDto.total.toFixed(2)}`],
      ]

      // Use autoTable
      // @ts-ignore - jspdf-autotable extends jsPDF prototype
      autoTable(doc, {
        startY: 140,
        head: [["Item", "Amount"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255] },
        styles: { halign: "left" },
        columnStyles: { 1: { halign: "right" } },
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
      doc.save(`transaction_${transaction.getTransactionDto.transactionId}.pdf`)

      toast({
        title: "PDF Downloaded",
        description: `Transaction ${transaction.getTransactionDto.transactionId} has been downloaded as PDF.`,
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

  // Calculate total amount of all transactions
  const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.getTransactionDto.total, 0)

  // Stats for the dashboard tiles
  const totalTransactions = transactions.length
  const activeTransactions = transactions.filter((t) => t.unitAllocationStatus === "Active").length
  const pendingTransactions = transactions.filter((t) => t.unitAllocationStatus === "Pending").length

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Receipt className="h-8 w-8 text-primary" />
          Transactions
        </h1>
        <p className="text-muted-foreground">View and manage all payment transactions</p>
      </div>

      {/* Dashboard Tiles */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">All transactions in the system</p>
            <Progress value={100} className="h-2 mt-2" indicatorColor="bg-gradient-to-r from-blue-400 to-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter((t) => t.unitAllocationStatus === "Active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.length > 0
                ? (
                    (transactions.filter((t) => t.unitAllocationStatus === "Active").length / transactions.length) *
                    100
                  ).toFixed(0)
                : 0}
              % of total transactions
            </p>
            <Progress
              value={
                transactions.length > 0
                  ? (transactions.filter((t) => t.unitAllocationStatus === "Active").length / transactions.length) * 100
                  : 0
              }
              className="h-2 mt-2"
              indicatorColor="bg-gradient-to-r from-green-400 to-green-600"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter((t) => t.unitAllocationStatus === "Pending").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.length > 0
                ? (
                    (transactions.filter((t) => t.unitAllocationStatus === "Pending").length / transactions.length) *
                    100
                  ).toFixed(0)
                : 0}
              % of total transactions
            </p>
            <Progress
              value={
                transactions.length > 0
                  ? (transactions.filter((t) => t.unitAllocationStatus === "Pending").length / transactions.length) *
                    100
                  : 0
              }
              className="h-2 mt-2"
              indicatorColor="bg-gradient-to-r from-yellow-400 to-yellow-600"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">Sum of all transaction amounts</p>
            <Progress value={100} className="h-2 mt-2" indicatorColor="bg-gradient-to-r from-purple-400 to-purple-600" />
          </CardContent>
        </Card>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Transaction List</CardTitle>
          <CardDescription>View and manage all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="relative flex-1 w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transaction ID..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Date range:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !dateRange.from && !dateRange.to && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Select date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range || { from: undefined, to: undefined })
                        filterAndSortTransactions(
                          searchQuery,
                          "transactionId",
                          sortBy,
                          sortDirection,
                          range || { from: undefined, to: undefined },
                        )
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                <Select value={sortBy} onValueChange={handleSort}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactionId">Transaction ID</SelectItem>
                    <SelectItem value="date-oldest">Date (Earliest First)</SelectItem>
                    <SelectItem value="date-newest">Date (Latest First)</SelectItem>
                    <SelectItem value="amount-highest">Amount (Highest First)</SelectItem>
                    <SelectItem value="amount-lowest">Amount (Lowest First)</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Transaction ID</TableHead>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Allocated Units</TableHead>
                    <TableHead className="text-center">Total Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className="cursor-pointer"
                        onClick={() => handleTransactionSelect(transaction)}
                      >
                        <TableCell className="font-medium text-center">
                          {transaction.getTransactionDto.transactionId}
                        </TableCell>
                        <TableCell className="text-center">{formatDate(transaction.getTransactionDto.date)}</TableCell>
                        <TableCell className="text-center">{transaction.allocatedUnits}</TableCell>
                        <TableCell className="text-center">
                          {formatCurrency(transaction.getTransactionDto.total)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={transaction.unitAllocationStatus === "Active" ? "default" : "secondary"}
                            className="inline-flex justify-center"
                          >
                            {transaction.unitAllocationStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTransactionSelect(transaction)
                              }}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadPDF(transaction)
                              }}
                            >
                              <FileText className="h-4 w-4 mr-1" /> PDF
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No data to display
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Sidebar - Redesigned to match the image */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent side="right" className="w-[85%] max-w-[85%] sm:max-w-[500px] overflow-y-auto p-0 bg-background">
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-lg font-semibold">Transaction Details</h2>
              <p className="text-sm text-muted-foreground">Detailed information about the selected transaction</p>
            </div>
            <SheetClose className="rounded-full p-2 hover:bg-muted">
              <X className="h-4 w-4" />
            </SheetClose>
          </div>

          {selectedTransaction && (
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="p-4" ref={pdfRef}>
                {/* Transaction ID and Date */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedTransaction.getTransactionDto.transactionId}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(selectedTransaction.getTransactionDto.time)}
                    </p>
                  </div>
                  <Badge variant={selectedTransaction.unitAllocationStatus === "Active" ? "default" : "secondary"}>
                    {selectedTransaction.unitAllocationStatus}
                  </Badge>
                </div>

                {/* Transaction Information */}
                <div className="rounded-lg border bg-card p-4 mb-4">
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-4">
                    <Info className="h-4 w-4 text-primary" />
                    Transaction Information
                  </h4>

                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Meter</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm font-medium text-primary flex items-center gap-1"
                        onClick={() => handleViewMeterDetails(selectedTransaction.meterId)}
                      >
                        View Meter Details
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Allocated Units</p>
                      <p className="text-sm font-medium">{selectedTransaction.allocatedUnits.toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Consumed Units</p>
                      <p className="text-sm font-medium">{selectedTransaction.consumedUnits.toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge
                        variant={selectedTransaction.unitAllocationStatus === "Active" ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {selectedTransaction.unitAllocationStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Load Information */}
                <div className="rounded-lg border bg-card p-4 mb-4">
                  <h4 className="text-sm font-medium mb-4">Load Information</h4>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Base Load</p>
                      <p className="text-sm font-medium">{selectedTransaction.baseLoad}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Peak Load</p>
                      <p className="text-sm font-medium">{selectedTransaction.peakLoad.toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Off-Peak Load</p>
                      <p className="text-sm font-medium">{selectedTransaction.offPeakLoad.toFixed(3)}</p>
                    </div>
                  </div>
                </div>

                {/* Billing Information */}
                <div className="rounded-lg border bg-card p-4 mb-4">
                  <h4 className="text-sm font-medium mb-4">Billing Information</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Rate</p>
                      <p className="text-sm font-medium">₦{selectedTransaction.getTransactionDto.rate.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Base Charge</p>
                      <p className="text-sm font-medium">
                        ₦{formatCurrency(selectedTransaction.getTransactionDto.baseCharge.toFixed(2))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxes</p>
                      <p className="text-sm font-medium">₦{formatCurrency(selectedTransaction.getTransactionDto.taxes.toFixed(2))}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-sm font-bold">₦{formatCurrency(selectedTransaction.getTransactionDto.total.toFixed(2))}</p>
                    </div>
                  </div>
                </div>

                {/* Download PDF Button */}
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => handleDownloadPDF(selectedTransaction)}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Download as PDF
                    </>
                  )}
                </Button>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
