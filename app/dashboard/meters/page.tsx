"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Activity,
  DollarSign,
  Download,
  Info,
  MapPin,
  Plus,
  RefreshCcw,
  Search,
  SortAsc,
  SortDesc,
  Loader2,
  Copy,
  Check,
  Zap,
  Bolt,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as api from "@/components/apiUrl"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"
import { Progress } from "@/components/ui/progress"

// Type definitions for our data
type Address = {
  id: number
  numberLine: string
  street: string
  city: string
  region: string
  state: string
  country: string | null
}

type Transaction = {
  date: string
  time: string
  transactionId: string
  rate: number
  baseCharge: number
  taxes: number
  total: number
}

type UnitAllocation = {
  id: number
  meterId: number
  allocatedUnits: number
  consumedUnits: number
  baseLoad: number
  peakLoad: number
  offPeakLoad: number
  getTransactionDto: Transaction
  unitAllocationStatus: string
}

type MeterUnit = {
  id: number
  meterId: number
  powerValue: number
  voltageValue: number
  currentValue: number
  consumptionValue: number
  electricityCost: number
  powerFactorValue: number
  timeValue: string
}

type Meter = {
  id: number
  customerName: string
  meterId: string
  meterKey: string
  connectionAuth: string
  totalUnits: number
  consumedUnits: number
  baseLoad: number
  dateCreated: string
  getAddressDto: Address
  getMeterUnitAllocationsDto: UnitAllocation[]
  getMeterUnitsDto: MeterUnit[]
  isActive: boolean
  activeLoad: boolean
}

// Sort options
const sortOptions = [
  { value: "meterId", label: "Meter ID" },
  { value: "dateCreated", label: "Date Created" },
  { value: "status", label: "Status" },
]

// Timeframe options
const timeframeOptions = [
  { value: "1d", label: "1D" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
]

// Async function to fetch meters
async function fetchMeters(): Promise<Meter[]> {
  try {
    // In a real app, this would fetch data from an API
    // Uncomment the line below to use the actual API
    try {
      const metersResponse = await api.getAllMeters()
      if (metersResponse.status === true && metersResponse.data) {
        return metersResponse.data.map((meter) => {
          // Process meter units
          const meterUnits =
            meter.getMeterUnitsDto?.map((meterUnit) => ({
              id: meterUnit.id,
              meterId: meterUnit.meterId,
              powerValue: meterUnit.powerValue,
              voltageValue: meterUnit.voltageValue,
              currentValue: meterUnit.currentValue,
              consumptionValue: meterUnit.consumptionValue,
              electricityCost: meterUnit.electricityCost,
              powerFactorValue: meterUnit.powerFactorValue,
              timeValue: meterUnit.timeValue,
            })) || []
          // Process unit allocations
          const unitAllocations =
            meter.getMeterUnitAllocationsDto?.map((unitAllocation) => ({
              id: unitAllocation.id,
              meterId: unitAllocation.meterId,
              allocatedUnits: unitAllocation.allocatedUnits,
              consumedUnits: unitAllocation.consumedUnits,
              baseLoad: unitAllocation.baseLoad,
              peakLoad: unitAllocation.peakLoad,
              offPeakLoad: unitAllocation.offPeakLoad,
              getTransactionDto: {
                date: unitAllocation.getTransactionDto.date,
                time: unitAllocation.getTransactionDto.time,
                transactionId: unitAllocation.getTransactionDto.transactionId,
                rate: unitAllocation.getTransactionDto.rate,
                baseCharge: unitAllocation.getTransactionDto.baseCharge,
                taxes: unitAllocation.getTransactionDto.taxes,
                total: unitAllocation.getTransactionDto.total,
              },
              unitAllocationStatus: unitAllocation.unitAllocationStatus,
            })) || []

          // Process address
          const address = meter.getAddressDto
            ? {
                id: meter.getAddressDto.id,
                numberLine: meter.getAddressDto.numberLine.toString(),
                street: meter.getAddressDto.street,
                city: meter.getAddressDto.city,
                region: meter.getAddressDto.region,
                state: meter.getAddressDto.state,
                country: "Nigeria",
              }
            : null

          // Return the processed meter
          return {
            id: meter.id,
            customerName: meter.customerName,
            meterId: meter.meterId,
            meterKey: meter.meterKey,
            connectionAuth: meter.connectionAuth,
            totalUnits: meter.totalUnits,
            consumedUnits: meter.consumedUnits,
            baseLoad: meter.baseLoad,
            dateCreated: meter.dateCreated,
            getAddressDto: address,
            getMeterUnitAllocationsDto: unitAllocations,
            getMeterUnitsDto: meterUnits,
            isActive: meter.isActive,
            activeLoad: meter.activeLoad,
          }
        })
      }
    } catch (apiError) {
      console.error("API Error:", apiError)
    }

    // Simulate API call with delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate sample meters with random data
    const meters: Meter[] = []

    // Create 10 meters with random data
    for (let i = 1; i <= 10; i++) {
      const isActive = Math.random() > 0.3
      const activeLoad = isActive && Math.random() > 0.5
      const totalUnits = Math.floor(Math.random() * 1000) + 50
      const consumedUnits = Math.floor(Math.random() * totalUnits)

      // Generate a random date within the last year
      const now = new Date()
      const randomDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000)

      // Create meter readings
      const meterUnits: MeterUnit[] = []
      for (let j = 0; j < 30; j++) {
        const readingTime = new Date(now.getTime() - (30 - j) * 24 * 60 * 60 * 1000)

        // Base values with some randomness
        const powerValue = 400 + Math.random() * 200
        const voltageValue = 220 + Math.random() * 20
        const currentValue = 1.5 + Math.random() * 1.5
        const consumptionValue = 0.001 + Math.random() * 0.002
        const electricityCost = 0.3 + Math.random() * 0.5
        const powerFactorValue = 0.85 + Math.random() * 0.15

        meterUnits.push({
          id: j + 1,
          meterId: i,
          powerValue,
          voltageValue,
          currentValue,
          consumptionValue,
          electricityCost,
          powerFactorValue,
          timeValue: readingTime.toISOString(),
        })
      }

      // Create unit allocations
      const unitAllocations: UnitAllocation[] = []
      const numAllocations = Math.floor(Math.random() * 3) + 1

      for (let j = 0; j < numAllocations; j++) {
        const allocatedUnits = Math.floor(Math.random() * 300) + 50
        const consumedUnits = Math.floor(Math.random() * allocatedUnits)
        const baseLoad = Math.random() * 2
        const peakLoad = baseLoad + Math.random()
        const offPeakLoad = baseLoad * 0.8
        const rate = 200 + Math.random() * 100
        const baseCharge = 2000 + Math.random() * 1000
        const taxes = allocatedUnits * rate * 0.05
        const total = allocatedUnits * rate + baseCharge + taxes

        unitAllocations.push({
          id: j + 1,
          meterId: i,
          allocatedUnits,
          consumedUnits,
          baseLoad,
          peakLoad,
          offPeakLoad,
          getTransactionDto: {
            date: new Date(randomDate.getTime() + j * 7 * 24 * 60 * 60 * 1000).toISOString(),
            time: new Date(
              randomDate.getTime() + j * 7 * 24 * 60 * 60 * 1000 + Math.random() * 24 * 60 * 60 * 1000,
            ).toISOString(),
            transactionId: Math.random().toString(36).substring(2, 15).toUpperCase(),
            rate,
            baseCharge,
            taxes,
            total,
          },
          unitAllocationStatus: Math.random() > 0.3 ? "Active" : "Pending",
        })
      }

      // Create address
      const states = ["Lagos", "Ogun", "Oyo", "Abuja", "Rivers", "Kano", "Kaduna", "Enugu"]
      const cities = ["Lagos", "Abeokuta", "Ibadan", "Abuja", "Port Harcourt", "Kano", "Kaduna", "Enugu"]
      const streets = ["Main St", "Park Ave", "First Rd", "Second Ave", "Third St", "Fourth Rd"]

      const stateIndex = Math.floor(Math.random() * states.length)

      const address: Address = {
        id: i,
        numberLine: Math.floor(Math.random() * 100 + 1).toString(),
        street: streets[Math.floor(Math.random() * streets.length)],
        city: cities[stateIndex],
        region: "Region " + (Math.floor(Math.random() * 5) + 1),
        state: states[stateIndex],
        country: "Nigeria",
      }

      // Create the meter
      meters.push({
        id: i,
        customerName: `Customer ${i}`,
        meterId: `METER${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
        meterKey: Math.random().toString(16).substring(2, 10),
        connectionAuth: Math.random().toString(16).substring(2, 16),
        totalUnits,
        consumedUnits,
        baseLoad: Math.random() * 5,
        dateCreated: randomDate.toISOString(),
        getAddressDto: address,
        getMeterUnitAllocationsDto: unitAllocations,
        getMeterUnitsDto: meterUnits,
        isActive,
        activeLoad,
      })
    }

    return meters
  } catch (error) {
    console.error("Error fetching meters:", error)
    return []
  }
}

export default function MetersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState("1d")
  const [sortBy, setSortBy] = useState("meterId")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [searchQuery, setSearchQuery] = useState("")
  const [meters, setMeters] = useState<Meter[]>([])
  const [filteredMeters, setFilteredMeters] = useState<Meter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [meterReadings, setMeterReadings] = useState<MeterUnit[]>([])
  const [isReadingsLoading, setIsReadingsLoading] = useState(false)
  const [downloadingAllocationId, setDownloadingAllocationId] = useState<number | null>(null)
  const searchParams = useSearchParams()
  const meterIdParam = searchParams.get("meterId")
  const [copied, setCopied] = useState<string | null>(null)
  const [chartData, setChartData] = useState<any[]>([])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  // Fetch meters data
  useEffect(() => {
    const loadMeters = async () => {
      setIsLoading(true)
      try {
        const data = await fetchMeters()
        setMeters(data)
        setFilteredMeters(data)
      } catch (error) {
        console.error("Error loading meters:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMeters()
  }, [])

  // Find meter by ID when the page loads or when the URL parameter changes
  useEffect(() => {
    if (meterIdParam && meters.length > 0) {
      const meterId = Number.parseInt(meterIdParam)
      const meter = meters.find((m) => m.id === meterId)
      if (meter) {
        setSelectedMeter(meter)
        setIsDetailOpen(true)
        loadMeterReadings(meter.id)
      }
    }
  }, [meterIdParam, meters])

  // Load meter readings when a meter is selected
  const loadMeterReadings = async (meterId: number) => {
    setIsReadingsLoading(true)
    try {
      // Try to fetch from API first
      try {
        const readings = await api.getMeterUnitsData(meterId)
        if (readings && readings.data && readings.data.length > 0) {
          setMeterReadings(readings.data)
          return readings.data
        }
      } catch (apiError) {
        console.error("API Error:", apiError)
      }

      // Fallback to mock data
      const selectedMeter = meters.find((m) => m.id === meterId)
      if (selectedMeter && selectedMeter.getMeterUnitsDto) {
        setMeterReadings(selectedMeter.getMeterUnitsDto)
      } else {
        // Generate some mock data if nothing is available
        const mockReadings: MeterUnit[] = []
        const now = new Date()

        for (let i = 0; i < 24; i++) {
          const readingTime = new Date(now.getTime() - (24 - i) * 60 * 60 * 1000)
          mockReadings.push({
            id: i + 1,
            meterId,
            powerValue: 400 + Math.random() * 200,
            voltageValue: 220 + Math.random() * 20,
            currentValue: 1.5 + Math.random() * 1.5,
            consumptionValue: 0.1 + Math.random() * 0.2,
            electricityCost: 30 + Math.random() * 50,
            powerFactorValue: 0.85 + Math.random() * 0.15,
            timeValue: readingTime.toISOString(),
          })
        }

        setMeterReadings(mockReadings)
      }
    } catch (error) {
      console.error("Error loading meter readings:", error)
      setMeterReadings([])
    } finally {
      setIsReadingsLoading(false)
    }
  }

  // Filter and sort meters when search query or sort options change
  useEffect(() => {
    let result = [...meters]

    // Filter by search query
    if (searchQuery) {
      result = result.filter((meter) => meter.meterId.toLowerCase().startsWith(searchQuery.toLowerCase()))
    }

    // Sort the filtered results
    result = sortMeters(result, sortBy, sortDirection)

    setFilteredMeters(result)
  }, [searchQuery, sortBy, sortDirection, meters])

  // Process meter readings data for charts based on selected timeframe
  useEffect(() => {
    if (meterReadings && meterReadings.length > 0) {
      // Filter data based on selected timeframe
      const now = new Date()
      const cutoffDate = new Date()

      switch (selectedTimeframe) {
        case "1d":
          cutoffDate.setDate(now.getDate() - 1)
          break
        case "7d":
          cutoffDate.setDate(now.getDate() - 7)
          break
        case "30d":
          cutoffDate.setDate(now.getDate() - 30)
          break
        case "90d":
          cutoffDate.setDate(now.getDate() - 90)
          break
        default:
          cutoffDate.setDate(now.getDate() - 1)
      }

      // Filter readings within the timeframe
      const filteredReadings = meterReadings.filter((reading) => {
        const readingDate = new Date(reading.timeValue)
        return readingDate >= cutoffDate
      })

      // Group and aggregate data based on timeframe
      let processedData: any[] = []

      if (selectedTimeframe === "1d") {
        // For 1 day, group by hour
        const hourlyData: { [key: string]: { voltage: number[]; consumption: number; cost: number; count: number } } =
          {}

        filteredReadings.forEach((reading) => {
          const date = new Date(reading.timeValue)
          const hourKey = `${date.getHours()}:00`

          if (!hourlyData[hourKey]) {
            hourlyData[hourKey] = { voltage: [], consumption: 0, cost: 0, count: 0 }
          }

          hourlyData[hourKey].voltage.push(reading.voltageValue)
          hourlyData[hourKey].consumption += reading.consumptionValue
          hourlyData[hourKey].cost += reading.electricityCost
          hourlyData[hourKey].count++
        })

        processedData = Object.entries(hourlyData).map(([hour, data]) => ({
          timestamp: hour,
          rawTime: new Date(`2024-01-01 ${hour}`).getTime(),
          consumption: data.consumption,
          voltage: data.voltage.length > 0 ? data.voltage.reduce((sum, v) => sum + v, 0) / data.voltage.length : 0,
          current: 1.5 + Math.random() * 1.5, // Mock current data
          cost: data.cost,
          power: 400 + Math.random() * 200, // Mock power data
          powerFactor: 0.85 + Math.random() * 0.15, // Mock power factor data
        }))
      } else if (selectedTimeframe === "7d") {
        // For 7 days, group by day
        const dailyData: { [key: string]: { voltage: number[]; consumption: number; cost: number; count: number } } = {}

        filteredReadings.forEach((reading) => {
          const date = new Date(reading.timeValue)
          const dayKey = date.toLocaleDateString()

          if (!dailyData[dayKey]) {
            dailyData[dayKey] = { voltage: [], consumption: 0, cost: 0, count: 0 }
          }

          dailyData[dayKey].voltage.push(reading.voltageValue)
          dailyData[dayKey].consumption += reading.consumptionValue
          dailyData[dayKey].cost += reading.electricityCost
          dailyData[dayKey].count++
        })

        processedData = Object.entries(dailyData).map(([day, data]) => ({
          timestamp: new Date(day).toLocaleDateString([], { month: "short", day: "numeric" }),
          rawTime: new Date(day).getTime(),
          consumption: data.consumption,
          voltage: data.voltage.length > 0 ? data.voltage.reduce((sum, v) => sum + v, 0) / data.voltage.length : 0,
          current: 1.5 + Math.random() * 1.5,
          cost: data.cost,
          power: 400 + Math.random() * 200,
          powerFactor: 0.85 + Math.random() * 0.15,
        }))
      } else if (selectedTimeframe === "30d") {
        // For 30 days, group by week
        const weeklyData: { [key: string]: { voltage: number[]; consumption: number; cost: number; count: number } } =
          {}

        filteredReadings.forEach((reading) => {
          const date = new Date(reading.timeValue)
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          const weekKey = weekStart.toLocaleDateString()

          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = { voltage: [], consumption: 0, cost: 0, count: 0 }
          }

          weeklyData[weekKey].voltage.push(reading.voltageValue)
          weeklyData[weekKey].consumption += reading.consumptionValue
          weeklyData[weekKey].cost += reading.electricityCost
          weeklyData[weekKey].count++
        })

        processedData = Object.entries(weeklyData).map(([week, data]) => ({
          timestamp: `Week of ${new Date(week).toLocaleDateString([], { month: "short", day: "numeric" })}`,
          rawTime: new Date(week).getTime(),
          consumption: data.consumption,
          voltage: data.voltage.length > 0 ? data.voltage.reduce((sum, v) => sum + v, 0) / data.voltage.length : 0,
          current: 1.5 + Math.random() * 1.5,
          cost: data.cost,
          power: 400 + Math.random() * 200,
          powerFactor: 0.85 + Math.random() * 0.15,
        }))
      } else if (selectedTimeframe === "90d") {
        // For 90 days, group by month
        const monthlyData: { [key: string]: { voltage: number[]; consumption: number; cost: number; count: number } } =
          {}

        filteredReadings.forEach((reading) => {
          const date = new Date(reading.timeValue)
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { voltage: [], consumption: 0, cost: 0, count: 0 }
          }

          monthlyData[monthKey].voltage.push(reading.voltageValue)
          monthlyData[monthKey].consumption += reading.consumptionValue
          monthlyData[monthKey].cost += reading.electricityCost
          monthlyData[monthKey].count++
        })

        processedData = Object.entries(monthlyData).map(([month, data]) => {
          const [year, monthIndex] = month.split("-")
          const date = new Date(Number.parseInt(year), Number.parseInt(monthIndex), 1)
          return {
            timestamp: date.toLocaleDateString([], { month: "short", year: "numeric" }),
            rawTime: date.getTime(),
            consumption: data.consumption,
            voltage: data.voltage.length > 0 ? data.voltage.reduce((sum, v) => sum + v, 0) / data.voltage.length : 0,
            current: 1.5 + Math.random() * 1.5,
            cost: data.cost,
            power: 400 + Math.random() * 200,
            powerFactor: 0.85 + Math.random() * 0.15,
          }
        })
      }

      // Sort by time
      processedData.sort((a, b) => a.rawTime - b.rawTime)

      console.log(`Processed data for ${selectedTimeframe}:`, processedData)
      setChartData(processedData)
    } else {
      setChartData([])
    }
  }, [meterReadings, selectedTimeframe])

  const handleMeterSelect = (meter: Meter) => {
    setSelectedMeter(meter)
    setIsDetailOpen(true)
    loadMeterReadings(meter.id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
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

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const data = await fetchMeters()
      setMeters(data)
      setFilteredMeters(sortMeters(data, sortBy, sortDirection))
      setSearchQuery("")
    } catch (error) {
      console.error("Error refreshing meters:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sortMeters = (metersToSort: Meter[], sortField: string, direction: "asc" | "desc") => {
    const sortedMeters = [...metersToSort]

    switch (sortField) {
      case "meterId":
        sortedMeters.sort((a, b) => {
          const comparison = a.meterId.localeCompare(b.meterId)
          return direction === "asc" ? comparison : -comparison
        })
        break
      case "dateCreated":
        sortedMeters.sort((a, b) => {
          const dateA = new Date(a.dateCreated).getTime()
          const dateB = new Date(b.dateCreated).getTime()
          return direction === "asc" ? dateA - dateB : dateB - dateA
        })
        break
      case "status":
        sortedMeters.sort((a, b) => {
          if (a.isActive === b.isActive) return 0
          if (direction === "asc") {
            return a.isActive ? -1 : 1
          } else {
            return a.isActive ? 1 : -1
          }
        })
        break
    }

    return sortedMeters
  }

  const handleSort = (value: string) => {
    if (value === sortBy) {
      // Toggle direction if clicking the same sort option
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new sort field and reset direction to ascending
      setSortBy(value)
      setSortDirection("asc")
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleDownloadAllocation = async (allocation: UnitAllocation) => {
    setDownloadingAllocationId(allocation.id)

    try {
      // Dynamically import jsPDF and jspdf-autotable
      const [jsPDFModule, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")])

      const jsPDF = jsPDFModule.default
      const autoTable = autoTableModule.default

      // Create a new PDF document
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(16)
      doc.text(`Allocation Report - ${allocation.getTransactionDto.transactionId}`, 14, 20)

      // Add date
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)

      // Add billing information table
      doc.setFontSize(12)
      doc.text("Billing Information", 14, 40)

      autoTable(doc, {
        startY: 45,
        head: [["Item", "Value"]],
        body: [
          ["Transaction ID", allocation.getTransactionDto.transactionId],
          ["Transaction Date", formatDate(allocation.getTransactionDto.date)],
          ["Transaction Time", formatTime(allocation.getTransactionDto.time)],
          ["Rate", `₦${allocation.getTransactionDto.rate.toFixed(2)}`],
          ["Base Charge", `₦${allocation.getTransactionDto.baseCharge.toFixed(2)}`],
          ["Taxes", `₦${allocation.getTransactionDto.taxes.toFixed(2)}`],
          ["Total", `₦${allocation.getTransactionDto.total.toFixed(2)}`],
          ["Status", allocation.unitAllocationStatus],
        ],
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      })

      // Add load information table
      const finalY = (doc as any).lastAutoTable.finalY || 120
      doc.text("Load Information", 14, finalY + 10)

      autoTable(doc, {
        startY: finalY + 15,
        head: [["Item", "Value"]],
        body: [
          ["Allocated Units", `${allocation.allocatedUnits}`],
          ["Consumed Units", `${allocation.consumedUnits}`],
          ["Base Load", `${allocation.baseLoad.toFixed(2)}`],
          ["Peak Load", `${allocation.peakLoad.toFixed(2)}`],
          ["Off-Peak Load", `${allocation.offPeakLoad.toFixed(2)}`],
        ],
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      })

      // Add footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(
          "SEMS - Smart Energy Management System",
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" },
        )
      }

      // Save the PDF
      doc.save(`allocation_${allocation.getTransactionDto.transactionId}.pdf`)

      toast({
        title: "PDF Downloaded",
        description: "Allocation data has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDownloadingAllocationId(null)
    }
  }

  const handleAddMeter = () => {
    router.push("/dashboard/meters/add")
  }

  // Calculate consumption and cost summary
  const getTotalConsumption = () => {
    if (!meterReadings || meterReadings.length === 0) return 0
    return meterReadings.reduce((sum, reading) => sum + reading.consumptionValue, 0)
  }

  const getEstimatedCost = () => {
    if (!meterReadings || meterReadings.length === 0) return 0
    return meterReadings.reduce((sum, reading) => sum + reading.electricityCost, 0)
  }

  const getConsumptionPercentage = () => {
    if (!selectedMeter || selectedMeter.totalUnits === 0) return 0
    const consumption = getTotalConsumption()
    return (consumption / selectedMeter.totalUnits) * 100
  }

  // Stats for the dashboard tiles
  const totalMeters = meters.length
  const activeMeters = meters.filter((meter) => meter.isActive).length
  const inactiveMeters = meters.filter((meter) => !meter.isActive).length
  const metersWithActiveAllocations = meters.filter((meter) =>
    meter.getMeterUnitAllocationsDto.some((allocation) => allocation.unitAllocationStatus === "Active"),
  ).length

  // Calculate percentages for progress bars
  const activeMetersPercentage = totalMeters > 0 ? (activeMeters / totalMeters) * 100 : 0
  const inactiveMetersPercentage = totalMeters > 0 ? (inactiveMeters / totalMeters) * 100 : 0
  const metersWithActiveAllocationsPercentage = totalMeters > 0 ? (metersWithActiveAllocations / totalMeters) * 100 : 0

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Meters
          </h1>
          <p className="text-muted-foreground">Manage smart meters and monitor their status</p>
        </div>
        <Button onClick={handleAddMeter}>
          <Plus className="mr-2 h-4 w-4" />
          Add Meter
        </Button>
      </div>

      {/* Dashboard Tiles */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meters</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMeters}</div>
            <p className="text-xs text-muted-foreground">Smart meters in the system</p>
            <Progress value={100} className="h-2 mt-2" indicatorColor="bg-gradient-to-r from-blue-400 to-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Meters</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMeters}</div>
            <p className="text-xs text-muted-foreground">
              {meters.length > 0 ? ((activeMeters / totalMeters) * 100).toFixed(0) : 0}% of total meters
            </p>
            <Progress
              value={activeMetersPercentage}
              className="h-2 mt-2"
              indicatorColor="bg-gradient-to-r from-green-400 to-green-600"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Meters</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveMeters}</div>
            <p className="text-xs text-muted-foreground">
              {meters.length > 0 ? ((inactiveMeters / totalMeters) * 100).toFixed(0) : 0}% of total meters
            </p>
            <Progress
              value={inactiveMetersPercentage}
              className="h-2 mt-2"
              indicatorColor="bg-gradient-to-r from-red-400 to-red-600"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Allocations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metersWithActiveAllocations}</div>
            <p className="text-xs text-muted-foreground">Meters with active unit allocations</p>
            <Progress
              value={metersWithActiveAllocationsPercentage}
              className="h-2 mt-2"
              indicatorColor="bg-gradient-to-r from-purple-400 to-purple-600"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Meter List</CardTitle>
          <CardDescription>View and manage all smart meters in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search meters by ID..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {sortBy === option.value && sortDirection === "asc" ? (
                          <SortAsc className="h-4 w-4" />
                        ) : sortBy === option.value && sortDirection === "desc" ? (
                          <SortDesc className="h-4 w-4" />
                        ) : (
                          <SortAsc className="h-4 w-4" />
                        )}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              </Button>
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
                    <TableHead className="text-center">Meter ID</TableHead>
                    <TableHead className="text-center">Customer Name</TableHead>
                    <TableHead className="text-center">Total Units</TableHead>
                    <TableHead className="text-center">Consumed Units</TableHead>
                    <TableHead className="text-center">Date Created</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeters.length > 0 ? (
                    filteredMeters.map((meter) => (
                      <TableRow key={meter.id} className="cursor-pointer" onClick={() => handleMeterSelect(meter)}>
                        <TableCell className="font-medium text-center">{meter.meterId}</TableCell>
                        <TableCell className="text-center">{meter.customerName}</TableCell>
                        <TableCell className="text-center">{meter.totalUnits}</TableCell>
                        <TableCell className="text-center">{meter.consumedUnits}</TableCell>
                        <TableCell className="text-center">{formatDate(meter.dateCreated)}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={meter.isActive ? "default" : "secondary"}
                            className="inline-flex justify-center"
                          >
                            {meter.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMeterSelect(meter)
                            }}
                          >
                            View
                          </Button>
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

      {/* Meter Detail Sidebar */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent side="right" className="w-[85%] max-w-[85%] sm:max-w-[85%] overflow-y-auto p-0">
          <SheetHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Meter Details
              </SheetTitle>
            </div>
            <SheetDescription>Detailed information about the selected meter</SheetDescription>
          </SheetHeader>

          {selectedMeter && (
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="space-y-6 p-6 pt-2">
                {/* Side-by-side layout for meter details and readings */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Left column - Meter properties */}
                  <div className="space-y-6 flex flex-col">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Basic Information
                      </h3>
                      <Separator className="my-2" />
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="col-span-2 sm:col-span-1">
                          <dt className="text-muted-foreground">Meter ID</dt>
                          <dd className="font-medium flex items-center gap-2">
                            {selectedMeter.meterId}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(selectedMeter.meterId, "meterId")}
                            >
                              {copied === "meterId" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </dd>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <dt className="text-muted-foreground">Customer Name</dt>
                          <dd className="font-medium">{selectedMeter.customerName}</dd>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <dt className="text-muted-foreground">Meter Key</dt>
                          <dd className="font-medium flex items-center gap-2">
                            {selectedMeter.meterKey}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(selectedMeter.meterKey, "meterKey")}
                            >
                              {copied === "meterKey" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </dd>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <dt className="text-muted-foreground">Connection Auth</dt>
                          <dd className="font-medium flex items-center gap-2">
                            {selectedMeter.connectionAuth}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(selectedMeter.connectionAuth, "connectionAuth")}
                            >
                              {copied === "connectionAuth" ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </dd>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <dt className="text-muted-foreground">Status</dt>
                          <dd>
                            <Badge variant={selectedMeter.isActive ? "default" : "secondary"}>
                              {selectedMeter.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </dd>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <dt className="text-muted-foreground">Active Load</dt>
                          <dd>
                            <Badge variant={selectedMeter.activeLoad ? "default" : "secondary"}>
                              {selectedMeter.activeLoad ? "Yes" : "No"}
                            </Badge>
                          </dd>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <dt className="text-muted-foreground">Date Created</dt>
                          <dd className="font-medium">{formatDate(selectedMeter.dateCreated)}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Usage Information */}
                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Usage Information
                      </h3>
                      <Separator className="my-2" />
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="col-span-2 sm:col-span-1">
                          <dt className="text-muted-foreground">Total Units</dt>
                          <dd className="font-medium">{selectedMeter.totalUnits}</dd>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <dt className="text-muted-foreground">Consumed Units</dt>
                          <dd className="font-medium">{selectedMeter.consumedUnits}</dd>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <dt className="text-muted-foreground">Base Load</dt>
                          <dd className="font-medium">{selectedMeter.baseLoad}</dd>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <dt className="text-muted-foreground">Available Units</dt>
                          <dd className="font-medium">{selectedMeter.totalUnits - selectedMeter.consumedUnits}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Address Information */}
                    {selectedMeter.getAddressDto && (
                      <div>
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          Address Information
                        </h3>
                        <Separator className="my-2" />
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <dt className="text-muted-foreground">Number Line</dt>
                            <dd className="font-medium">{selectedMeter.getAddressDto.numberLine}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Street</dt>
                            <dd className="font-medium">{selectedMeter.getAddressDto.street}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">City</dt>
                            <dd className="font-medium">{selectedMeter.getAddressDto.city}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Region</dt>
                            <dd className="font-medium">{selectedMeter.getAddressDto.region}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">State</dt>
                            <dd className="font-medium">{selectedMeter.getAddressDto.state}</dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </div>

                  {/* Right column - Meter readings graphs */}
                  <div className="space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Meter Readings</h3>
                      {/* Timeframe selector */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Timeframe:</span>
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
                              {option.value}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </div>

                      <Tabs defaultValue="consumption" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="consumption" className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            <span>Consumption</span>
                          </TabsTrigger>
                          <TabsTrigger value="voltage" className="flex items-center gap-2">
                            <Bolt className="h-4 w-4" />
                            <span>Voltage</span>
                          </TabsTrigger>
                          <TabsTrigger value="cost" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>Cost</span>
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="consumption" className="mt-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Energy Consumption</CardTitle>
                              <CardDescription>Energy consumption over time (kWh)</CardDescription>
                            </CardHeader>
                            <CardContent className="p-3">
                              <div className="h-[250px] w-full">
                                {isReadingsLoading ? (
                                  <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                  </div>
                                ) : chartData.length > 0 ? (
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                      <XAxis
                                        dataKey="timestamp"
                                        tickFormatter={(value) =>
                                          new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                        }
                                      />
                                      <YAxis />
                                      <Tooltip
                                        content={({ active, payload, label }) => {
                                          if (active && payload && payload.length) {
                                            return (
                                              <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
                                                <div className="grid grid-cols-1 gap-2">
                                                  <div className="flex flex-col">
                                                    <span className="font-medium text-muted-foreground">Time</span>
                                                    <span className="font-bold text-foreground">
                                                      {label}
                                                    </span>
                                                  </div>
                                                  <div className="flex flex-col">
                                                    <span className="font-medium text-muted-foreground">
                                                      Consumption
                                                    </span>
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
                                        labelStyle={{ color: "#333" }}
                                        formatter={(value) => [`${value} kWh`, "Consumption"]}
                                        labelFormatter={(label) =>
                                          new Date(label).toLocaleTimeString([], { year: "numeric",
                                          month: "short",
                                          day: "2-digit" })
                                        }
                                      />
                                      <Line
                                        type="monotone"
                                        dataKey="consumption"
                                        name="Consumption (kWh)"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ r: 2 }}
                                        activeDot={{ r: 6 }}
                                        isAnimationActive={false}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                ) : (
                                  <div className="flex justify-center items-center h-full text-muted-foreground">
                                    No consumption data available
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="voltage" className="mt-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Voltage Readings</CardTitle>
                              <CardDescription>Voltage readings over time (V)</CardDescription>
                            </CardHeader>
                            <CardContent className="p-3">
                              <div className="h-[250px] w-full">
                                {isReadingsLoading ? (
                                  <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                  </div>
                                ) : chartData.length > 0 ? (
                                  <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                    key={`voltage-chart-${selectedMeter.id}-${selectedTimeframe}`}
                                  >
                                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                      <XAxis dataKey="timestamp"
                                        tickFormatter={(value) =>
                                          new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                        } />
                                      <YAxis />
                                      <Tooltip
                                        content={({ active, payload, label }) => {
                                          if (active && payload && payload.length) {
                                            return (
                                              <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
                                                <div className="grid grid-cols-1 gap-2">
                                                  <div className="flex flex-col">
                                                    <span className="font-medium text-muted-foreground">Time</span>
                                                    <span className="font-bold text-foreground">
                                                      {label}
                                                    </span>
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
                                        labelFormatter={(label) =>
                                          new Date(label).toLocaleTimeString([], { year: "numeric",
                                          month: "short",
                                          day: "2-digit" })
                                        }
                                      />
                                      <Line
                                        type="monotone"
                                        dataKey="voltage"
                                        name="Voltage (V)"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ r: 2 }}
                                        activeDot={{ r: 6 }}
                                        isAnimationActive={false}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                ) : (
                                  <div className="flex justify-center items-center h-full text-muted-foreground">
                                    No voltage data available
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="cost" className="mt-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Electricity Cost</CardTitle>
                              <CardDescription>Cost of electricity over time (₦)</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="h-[250px] w-full">
                                {isReadingsLoading ? (
                                  <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                  </div>
                                ) : chartData.length > 0 ? (
                                  <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                    key={`cost-chart-${selectedMeter.id}-${selectedTimeframe}`}
                                  >
                                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                      <XAxis dataKey="timestamp"
                                        tickFormatter={(value) =>
                                          new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                        } />
                                      <YAxis />
                                      <Tooltip
                                        content={({ active, payload, label }) => {
                                          if (active && payload && payload.length) {
                                            return (
                                              <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
                                                <div className="grid grid-cols-2 gap-2">
                                                  <div className="flex flex-col">
                                                    <span className="font-medium text-muted-foreground">Time</span>
                                                    <span className="font-bold text-foreground">
                                                      {label}
                                                    </span>
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
                                        labelStyle={{ color: "var(--foreground)" }}
                                        formatter={(value) => [`₦${Number(value).toFixed(2)}`, "Cost"]}
                                        labelFormatter={(label) =>
                                          new Date(label).toLocaleTimeString([], { year: "numeric",
                                          month: "short",
                                          day: "2-digit" })
                                        }
                                      />
                                      <Line
                                        type="monotone"
                                        dataKey="cost"
                                        name="Cost (₦)"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={{ r: 2 }}
                                        activeDot={{ r: 6 }}
                                        isAnimationActive={false}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                ) : (
                                  <div className="flex justify-center items-center h-full text-muted-foreground">
                                    No cost data available
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>

                      {/* Consumption & Cost Summary */}
                      <Card>
                        <div className="rounded-lg">
                          <CardHeader>
                            <h4 className="text-base font-medium flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-blue-400" />
                              Consumption & Cost Summary
                            </h4>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 rounded-md">
                                <h5 className="text-sm font-medium text-slate-300">Total Consumption</h5>
                                <p className="text-2xl font-bold">
                                  {getTotalConsumption().toFixed(2)} <span className="text-sm">kWh</span>
                                </p>
                                <p className="text-xs text-slate-400">
                                  {getConsumptionPercentage().toFixed(2)}% of total units
                                </p>
                              </div>
                              <div className="p-3 rounded-md">
                                <h5 className="text-sm font-medium text-slate-300">Estimated Cost</h5>
                                <p className="text-2xl font-bold">{formatCurrency(getEstimatedCost())}</p>
                                <p className="text-xs text-slate-400">Based on current usage</p>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Unit Allocations Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Unit Allocations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedMeter.getMeterUnitAllocationsDto.length > 0 ? (
                      selectedMeter.getMeterUnitAllocationsDto.map((allocation) => (
                        <Card key={allocation.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                Allocation #{allocation.getTransactionDto.transactionId}
                              </CardTitle>
                              <Badge variant={allocation.unitAllocationStatus === "Active" ? "default" : "secondary"}>
                                {allocation.unitAllocationStatus}
                              </Badge>
                            </div>
                            <CardDescription>
                              Transaction ID: {allocation.getTransactionDto.transactionId}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-4">
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div>
                                <dt className="text-muted-foreground">Allocated Units</dt>
                                <dd className="font-medium">{allocation.allocatedUnits}</dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Consumed Units</dt>
                                <dd className="font-medium">{allocation.consumedUnits}</dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Base Load</dt>
                                <dd className="font-medium">{allocation.baseLoad}</dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Peak Load</dt>
                                <dd className="font-medium">{allocation.peakLoad.toFixed(3)}</dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Off-Peak Load</dt>
                                <dd className="font-medium">{allocation.offPeakLoad.toFixed(3)}</dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Date</dt>
                                <dd className="font-medium">{formatDate(allocation.getTransactionDto.date)}</dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Total</dt>
                                <dd className="font-medium">{formatCurrency(allocation.getTransactionDto.total)}</dd>
                              </div>
                            </dl>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-4 w-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadAllocation(allocation)
                              }}
                              disabled={downloadingAllocationId === allocation.id}
                            >
                              {downloadingAllocationId === allocation.id ? (
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
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 flex h-40 items-center justify-center rounded-md border border-dashed">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">No data to display</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
