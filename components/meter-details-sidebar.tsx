"use client"

import { useState, useMemo } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Download, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { generatePDF, type TableColumn, type TableData } from "@/utils/pdf-generator"
import { useToast } from "@/hooks/use-toast"

interface MeterDetailsSidebarProps {
  isOpen: boolean
  onClose: () => void
  meter: {
    id: string
    name: string
    serialNumber: string
    location: string
    installationDate: string
    lastReading: number
    lastReadingDate: string
    status: string
    type: string
    phase: string
    maxLoad: number
    currentLoad: number
    billingInfo: {
      accountNumber: string
      billingCycle: string
      lastBillAmount: number
      lastBillDate: string
      paymentStatus: string
      dueDate: string
    }
    loadAllocation: {
      lighting: number
      heating: number
      cooling: number
      appliances: number
      other: number
    }
    readings: {
      date: string
      value: number
      voltage?: number
      cost?: number
    }[]
  }
}

// Timeframe options
const timeframeOptions = [
  { value: "1h", label: "1H" },
  { value: "1d", label: "1D" },
  { value: "1w", label: "1W" },
  { value: "2w", label: "2W" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
]

export function MeterDetailsSidebar({ isOpen, onClose, meter }: MeterDetailsSidebarProps) {
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState("1d")

  // Generate enhanced readings data with voltage and cost
  const enhancedReadings = useMemo(() => {
    return meter.readings.map((reading, index) => ({
      ...reading,
      voltage: reading.voltage || 220 + Math.random() * 20,
      cost: reading.cost || reading.value * 0.15 + Math.random() * 0.1,
    }))
  }, [meter.readings])

  // Filter data based on selected timeframe
  const filteredReadings = useMemo(() => {
    const now = new Date()
    const cutoffDate = new Date()

    switch (selectedTimeframe) {
      case "1h":
        cutoffDate.setHours(now.getHours() - 1)
        break
      case "1d":
        cutoffDate.setDate(now.getDate() - 1)
        break
      case "1w":
        cutoffDate.setDate(now.getDate() - 7)
        break
      case "2w":
        cutoffDate.setDate(now.getDate() - 14)
        break
      case "1M":
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case "3M":
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      default:
        cutoffDate.setDate(now.getDate() - 1)
    }

    return enhancedReadings.filter((reading) => {
      const readingDate = new Date(reading.date)
      return readingDate >= cutoffDate
    })
  }, [enhancedReadings, selectedTimeframe])

  // Format data for charts
  const chartData = useMemo(() => {
    return filteredReadings.map((reading) => {
      const date = new Date(reading.date)
      let timestamp

      if (selectedTimeframe === "1h") {
        timestamp = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      } else if (selectedTimeframe === "1d") {
        timestamp = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      } else if (selectedTimeframe === "1w" || selectedTimeframe === "2w") {
        timestamp = date.toLocaleDateString([], { weekday: "short", month: "numeric", day: "numeric" })
      } else {
        timestamp = date.toLocaleDateString([], { month: "short", day: "numeric" })
      }

      return {
        timestamp,
        consumption: reading.value,
        voltage: reading.voltage,
        cost: reading.cost,
      }
    })
  }, [filteredReadings, selectedTimeframe])

  // Calculate totals for the selected timeframe
  const totals = useMemo(() => {
    const totalConsumption = filteredReadings.reduce((sum, reading) => sum + reading.value, 0)
    const totalCost = filteredReadings.reduce((sum, reading) => sum + (reading.cost || 0), 0)

    return {
      consumption: totalConsumption,
      cost: totalCost,
    }
  }, [filteredReadings])

  const handleDownloadMeterData = async () => {
    setIsDownloading(true)

    try {
      // Define columns for billing info table
      const billingColumns: TableColumn[] = [
        { header: "Account Number", dataKey: "accountNumber" },
        { header: "Billing Cycle", dataKey: "billingCycle" },
        { header: "Last Bill Amount", dataKey: "lastBillAmount" },
        { header: "Last Bill Date", dataKey: "lastBillDate" },
        { header: "Payment Status", dataKey: "paymentStatus" },
        { header: "Due Date", dataKey: "dueDate" },
      ]

      // Define billing info data
      const billingData: TableData[] = [
        {
          accountNumber: meter.billingInfo.accountNumber,
          billingCycle: meter.billingInfo.billingCycle,
          lastBillAmount: `$${meter.billingInfo.lastBillAmount.toFixed(2)}`,
          lastBillDate: meter.billingInfo.lastBillDate,
          paymentStatus: meter.billingInfo.paymentStatus,
          dueDate: meter.billingInfo.dueDate,
        },
      ]

      // Define columns for load allocation table
      const loadColumns: TableColumn[] = [
        { header: "Category", dataKey: "category" },
        { header: "Allocation (kW)", dataKey: "allocation" },
        { header: "Percentage", dataKey: "percentage" },
      ]

      // Calculate total load
      const totalLoad = Object.values(meter.loadAllocation).reduce((sum, value) => sum + value, 0)

      // Define load allocation data
      const loadData: TableData[] = Object.entries(meter.loadAllocation).map(([key, value]) => ({
        category: key.charAt(0).toUpperCase() + key.slice(1),
        allocation: value,
        percentage: `${((value / totalLoad) * 100).toFixed(1)}%`,
      }))

      // Define columns for readings table
      const readingsColumns: TableColumn[] = [
        { header: "Date", dataKey: "date" },
        { header: "Reading (kWh)", dataKey: "value" },
      ]

      // Define readings data
      const readingsData: TableData[] = meter.readings.map((reading) => ({
        date: reading.date,
        value: reading.value,
      }))

      // Generate PDF
      const success = await generatePDF(`Meter Details: ${meter.name}`, `meter_details_${meter.serialNumber}.pdf`, [
        {
          title: "Meter Information",
          content: `Name: ${meter.name}\nSerial Number: ${meter.serialNumber}\nLocation: ${meter.location}\nInstallation Date: ${meter.installationDate}\nLast Reading: ${meter.lastReading} kWh (${meter.lastReadingDate})\nStatus: ${meter.status}\nType: ${meter.type}\nPhase: ${meter.phase}\nMax Load: ${meter.maxLoad} kW\nCurrent Load: ${meter.currentLoad} kW`,
        },
        {
          title: "Billing Information",
          table: {
            columns: billingColumns,
            data: billingData,
          },
        },
        {
          title: "Load Allocation",
          table: {
            columns: loadColumns,
            data: loadData,
          },
        },
        {
          title: "Recent Readings",
          table: {
            columns: readingsColumns,
            data: readingsData,
          },
        },
      ])

      if (success) {
        toast({
          title: "Download Successful",
          description: "Meter data has been downloaded as PDF.",
        })
      } else {
        throw new Error("Failed to generate PDF")
      }
    } catch (error) {
      console.error("Error downloading meter data:", error)
      toast({
        title: "Download Failed",
        description: "There was an error downloading the meter data.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadLoadAllocation = async () => {
    setIsDownloading(true)

    try {
      // Define columns for load allocation table
      const loadColumns: TableColumn[] = [
        { header: "Category", dataKey: "category" },
        { header: "Allocation (kW)", dataKey: "allocation" },
        { header: "Percentage", dataKey: "percentage" },
      ]

      // Calculate total load
      const totalLoad = Object.values(meter.loadAllocation).reduce((sum, value) => sum + value, 0)

      // Define load allocation data
      const loadData: TableData[] = Object.entries(meter.loadAllocation).map(([key, value]) => ({
        category: key.charAt(0).toUpperCase() + key.slice(1),
        allocation: value,
        percentage: `${((value / totalLoad) * 100).toFixed(1)}%`,
      }))

      // Generate PDF
      const success = await generatePDF(`Load Allocation: ${meter.name}`, `load_allocation_${meter.serialNumber}.pdf`, [
        {
          title: "Meter Information",
          content: `Name: ${meter.name}\nSerial Number: ${meter.serialNumber}\nLocation: ${meter.location}\nMax Load: ${meter.maxLoad} kW\nCurrent Load: ${meter.currentLoad} kW`,
        },
        {
          title: "Load Allocation",
          table: {
            columns: loadColumns,
            data: loadData,
          },
        },
      ])

      if (success) {
        toast({
          title: "Download Successful",
          description: "Load allocation data has been downloaded as PDF.",
        })
      } else {
        throw new Error("Failed to generate PDF")
      }
    } catch (error) {
      console.error("Error downloading load allocation data:", error)
      toast({
        title: "Download Failed",
        description: "There was an error downloading the load allocation data.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadReadings = async () => {
    setIsDownloading(true)

    try {
      // Define columns for readings table
      const readingsColumns: TableColumn[] = [
        { header: "Date", dataKey: "date" },
        { header: "Reading (kWh)", dataKey: "value" },
      ]

      // Define readings data
      const readingsData: TableData[] = meter.readings.map((reading) => ({
        date: reading.date,
        value: reading.value,
      }))

      // Generate PDF
      const success = await generatePDF(`Meter Readings: ${meter.name}`, `meter_readings_${meter.serialNumber}.pdf`, [
        {
          title: "Meter Information",
          content: `Name: ${meter.name}\nSerial Number: ${meter.serialNumber}\nLocation: ${meter.location}\nLast Reading: ${meter.lastReading} kWh (${meter.lastReadingDate})`,
        },
        {
          title: "Recent Readings",
          table: {
            columns: readingsColumns,
            data: readingsData,
          },
        },
      ])

      if (success) {
        toast({
          title: "Download Successful",
          description: "Meter readings have been downloaded as PDF.",
        })
      } else {
        throw new Error("Failed to generate PDF")
      }
    } catch (error) {
      console.error("Error downloading meter readings:", error)
      toast({
        title: "Download Failed",
        description: "There was an error downloading the meter readings.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full max-w-4xl overflow-y-auto sm:max-w-4xl">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Meter Details</SheetTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Meter Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Meter Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p>{meter.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                <p>{meter.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p>{meter.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Installation Date</p>
                <p>{meter.installationDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Reading</p>
                <p>
                  {meter.lastReading} kWh ({meter.lastReadingDate})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p>{meter.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p>{meter.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phase</p>
                <p>{meter.phase}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Max Load</p>
                <p>{meter.maxLoad} kW</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Load</p>
                <p>{meter.currentLoad} kW</p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={handleDownloadMeterData} disabled={isDownloading}>
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? "Downloading..." : "Download Meter Data"}
              </Button>
            </div>
          </div>

          {/* Billing Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Billing Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                <p>{meter.billingInfo.accountNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Billing Cycle</p>
                <p>{meter.billingInfo.billingCycle}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Bill Amount</p>
                <p>${meter.billingInfo.lastBillAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Bill Date</p>
                <p>{meter.billingInfo.lastBillDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                <p>{meter.billingInfo.paymentStatus}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                <p>{meter.billingInfo.dueDate}</p>
              </div>
            </div>
          </div>

          {/* Timeframe Selection */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Meter Analytics</h3>
            <ToggleGroup
              type="single"
              value={selectedTimeframe}
              onValueChange={(value) => value && setSelectedTimeframe(value)}
              className="text-xs"
            >
              {timeframeOptions.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  aria-label={option.label}
                  size="sm"
                  className="text-xs px-2 py-1 h-6"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Consumption and Cost Summary */}
          <div className="w-full">
            <h4 className="mb-2 text-base font-medium">Summary ({selectedTimeframe})</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium text-muted-foreground">Total Consumption</p>
                <p className="text-2xl font-bold">{totals.consumption.toFixed(2)} kWh</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium text-muted-foreground">Estimated Cost</p>
                <p className="text-2xl font-bold">₦{totals.cost.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Energy Consumption Chart */}
          <Card className="w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Energy Consumption ({selectedTimeframe})</CardTitle>
              <CardDescription>Energy consumption over time (kWh)</CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="timestamp"
                    />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="font-medium text-muted-foreground">Time</span>
                                  <span className="font-bold text-foreground">{label}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-muted-foreground">Consumption</span>
                                  <span className="font-bold" style={{ color: "#3b82f6" }}>
                                    {payload[0]?.value?.toFixed(2)} kWh
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="consumption"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{r:3}}
                      activeDot={{r: 4}}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Voltage Chart */}
          <Card className="w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Voltage Readings ({selectedTimeframe})</CardTitle>
              <CardDescription>Voltage readings over time (V)</CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="timestamp"
                    />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="font-medium text-muted-foreground">Time</span>
                                  <span className="font-bold text-foreground">{label}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-muted-foreground">Voltage</span>
                                  <span className="font-bold" style={{ color: "#10b981" }}>
                                    {payload[0]?.value?.toFixed(1)} V
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="voltage"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{r:3}}
                      activeDot={{
                        r: 4
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cost Chart */}
          <Card className="w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Electricity Cost ({selectedTimeframe})</CardTitle>
              <CardDescription>Cost of electricity over time (₦)</CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="timestamp"
                    />
                    <YAxis
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="font-medium text-muted-foreground">Time</span>
                                  <span className="font-bold text-foreground">{label}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-muted-foreground">Cost</span>
                                  <span className="font-bold" style={{ color: "#f59e0b" }}>
                                    ₦{payload[0]?.value?.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{r: 3}}
                      activeDot={{
                        r: 4,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Load Allocation */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Load Allocation</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {Object.entries(meter.loadAllocation).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm font-medium text-muted-foreground">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </p>
                  <p>{value} kW</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDownloadLoadAllocation}
                disabled={isDownloading}
              >
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? "Downloading..." : "Download Load Allocation"}
              </Button>
            </div>
          </div>

          {/* Download Readings Button */}
          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={handleDownloadReadings} disabled={isDownloading}>
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download Meter Readings"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
