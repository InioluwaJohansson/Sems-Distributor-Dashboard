"use client"

import { useState, useEffect, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Loader2, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { NoDataMessage } from "@/components/no-data-message"
import * as api from "@/components/apiUrl"

// Type definition for meter reading
export type MeterReading = {
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

// Type definition for API response
export type MeterReadingsResponse = {
  data: MeterReading[]
  message: string
  status: boolean
}

interface MeterReadingsGraphTabsProps {
  meterId?: number
  selectedTimeframe: string
  onTimeframeChange?: (timeframe: string) => void
}

// Timeframe options
export const timeframeOptions = [
  { value: "1h", label: "1 Hour" },
  { value: "1d", label: "1 Day" },
  { value: "1w", label: "1 Week" },
  { value: "2w", label: "2 Weeks" },
  { value: "1M", label: "1 Month" },
  { value: "3M", label: "3 Months" },
  { value: "6M", label: "6 Months" },
  { value: "1Y", label: "1 Year" },
]

// Generate sample data based on timeframe
export function generateSampleData(meterId: number, timeframe: string): MeterReading[] {
  const now = new Date()
  const readings: MeterReading[] = []

  // Determine number of data points and interval based on timeframe
  let numPoints = 0
  let intervalMinutes = 0

  switch (timeframe) {
    case "1h":
      numPoints = 12
      intervalMinutes = 5
      break
    case "1d":
      numPoints = 24
      intervalMinutes = 60
      break
    case "1w":
      numPoints = 7 * 24
      intervalMinutes = 60
      break
    case "2w":
      numPoints = 14
      intervalMinutes = 24 * 60
      break
    case "1M":
      numPoints = 30
      intervalMinutes = 24 * 60
      break
    case "3M":
      numPoints = 90
      intervalMinutes = 24 * 60
      break
    case "6M":
      numPoints = 180
      intervalMinutes = 24 * 60
      break
    case "1Y":
      numPoints = 365
      intervalMinutes = 24 * 60
      break
    default:
      numPoints = 24
      intervalMinutes = 60
  }

  // Base values with some randomness
  const baseValues = {
    power: 450 + Math.random() * 100,
    voltage: 220 + Math.random() * 20,
    current: 2 + Math.random() * 1,
    consumption: 0.001 + Math.random() * 0.002,
    cost: 0.3 + Math.random() * 0.4,
    powerFactor: 0.9 + Math.random() * 0.1,
  }

  // Time patterns - simulate daily and weekly patterns
  const timePatterns = (hour: number, day: number) => {
    // Daily pattern - higher during day, lower at night
    const hourFactor =
      hour >= 8 && hour <= 20 ? 1 + 0.3 * Math.sin(((hour - 8) * Math.PI) / 12) : 0.7 + 0.1 * Math.random()

    // Weekly pattern - lower on weekends
    const dayFactor = day === 0 || day === 6 ? 0.8 : 1.0

    return hourFactor * dayFactor
  }

  // Generate data points
  for (let i = 0; i < numPoints; i++) {
    const pointTime = new Date(now.getTime() - (numPoints - i) * intervalMinutes * 60 * 1000)
    const hour = pointTime.getHours()
    const day = pointTime.getDay()

    // Apply time patterns
    const pattern = timePatterns(hour, day)

    // Add some randomness
    const randomFactor = 0.9 + Math.random() * 0.2

    // Calculate values with patterns
    const powerValue = Math.round(baseValues.power * pattern * randomFactor)
    const voltageValue = Math.round((baseValues.voltage + (pattern - 1) * 10) * randomFactor * 10) / 10
    const currentValue = Math.round(baseValues.current * pattern * randomFactor * 100) / 100
    const consumptionValue = Math.round(baseValues.consumption * pattern * randomFactor * 10000) / 10000
    const electricityCost = Math.round(baseValues.cost * pattern * randomFactor * 100) / 100
    const powerFactorValue = Math.round(baseValues.powerFactor * randomFactor * 100) / 100

    readings.push({
      id: i + 1,
      meterId: meterId,
      powerValue,
      voltageValue,
      currentValue,
      consumptionValue,
      electricityCost,
      powerFactorValue,
      timeValue: pointTime.toISOString(),
    })
  }

  return readings
}

// Async function to fetch meter readings by meter ID and timeframe
export async function fetchMeterReadings(meterId: number, timeframe = "1d"): Promise<MeterReading[]> {
  try {
    // In a real app, this would fetch data from an API
    const response = await api.getMeterUnitsData(meterId)
    const data: MeterReadingsResponse = response
    return data.data

    // Simulate API call with delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate sample data
    return generateSampleData(meterId, timeframe)
  } catch (error) {
    console.error("Error fetching meter readings:", error)
    return []
  }
}

export function MeterReadingsGraphTabs({
  meterId = 1,
  selectedTimeframe = "1d",
  onTimeframeChange,
}: MeterReadingsGraphTabsProps) {
  const [readings, setReadings] = useState<MeterReading[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chartKey, setChartKey] = useState(0)

  // Fetch readings when meterId or timeframe changes
  useEffect(() => {
    const loadReadings = async () => {
      if (!meterId) return

      setIsLoading(true)
      try {
        const data = await fetchMeterReadings(meterId, selectedTimeframe)
        setReadings(data)
      } catch (error) {
        console.error("Error loading meter readings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadReadings()
  }, [meterId, selectedTimeframe])

  useEffect(() => {
    // Force re-render of charts when data loads
    if (!isLoading) {
      setChartKey((prev) => prev + 1)
    }
  }, [isLoading, readings])

  // Format data for the graph based on timeframe
  const graphData = useMemo(() => {
    if (readings.length === 0) return []

    return readings.map((reading) => {
      const date = new Date(reading.timeValue)

      // Format timestamp based on timeframe
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
        rawTime: date.getTime(),
        power: reading.powerValue,
        voltage: reading.voltageValue,
        current: reading.currentValue,
        consumption: reading.consumptionValue,
        cost: reading.electricityCost,
        powerFactor: reading.powerFactorValue,
      }
    })
  }, [readings, selectedTimeframe])

  // Format currency (Naira)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name === "cost"
                ? `Cost: ${formatCurrency(entry.value)}`
                : entry.name === "consumption"
                  ? `Consumption: ${entry.value} kWh`
                  : entry.name === "voltage"
                    ? `Voltage: ${entry.value} V`
                    : `${entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Handle timeframe change
  const handleTimeframeChange = (value: string) => {
    if (value && onTimeframeChange) {
      onTimeframeChange(value)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px] w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Check if we have data to display
  if (graphData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Meter Readings</h3>
          <ToggleGroup
            type="single"
            value={selectedTimeframe}
            onValueChange={handleTimeframeChange}
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
        <NoDataMessage message="No meter readings data available for the selected timeframe" />
      </div>
    )
  }

  // Ensure data is sorted by time for line charts
  const sortedGraphData = [...graphData].sort((a, b) => a.rawTime - b.rawTime)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Meter Readings</h3>
        <ToggleGroup type="single" value={selectedTimeframe} onValueChange={handleTimeframeChange} className="text-xs">
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

      <div className="space-y-6">
        {/* Energy Consumption Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Energy Consumption ({selectedTimeframe})</CardTitle>
            <CardDescription>Energy consumption over time (kWh)</CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%" key={`consumption-chart-${chartKey}`}>
                <LineChart
                  data={sortedGraphData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis
                    dataKey="timestamp"
                  />
                  <YAxis
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "var(--foreground)" }} />
                  <Line
                    type="monotone"
                    dataKey="consumption"
                    name="Consumption"
                    stroke="#3b82f6" // blue-500
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Voltage Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Voltage Readings ({selectedTimeframe})</CardTitle>
            <CardDescription>Voltage readings over time (V)</CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%" key={`voltage-chart-${chartKey}`}>
                <LineChart
                  data={sortedGraphData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="timestamp"
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "var(--foreground)" }} />
                  <Line
                    type="monotone"
                    dataKey="voltage"
                    name="Voltage"
                    stroke="#2563eb" // blue-600
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cost Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Electricity Cost ({selectedTimeframe})</CardTitle>
            <CardDescription>Cost of electricity over time (₦)</CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%" key={`cost-chart-${chartKey}`}>
                <LineChart
                  data={sortedGraphData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis
                    dataKey="timestamp"
                  />
                  <YAxis
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "var(--foreground)" }} />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    name="Cost"
                    stroke="#60a5fa" // blue-400
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
        <Info className="h-4 w-4" />
        <span>Data is shown based on the selected timeframe.</span>
      </div>
    </div>
  )
}
