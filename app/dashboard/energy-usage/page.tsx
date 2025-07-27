"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Activity, Download, RefreshCcw } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { NoDataMessage } from "@/components/no-data-message"
import * as api from "@/components/apiUrl"
import {
  type MeterReading,
  type AggregatedData,
  groupByDay,
  groupByHour,
  groupByMonth,
  calculateTotalConsumption,
  calculateAverageDailyConsumption,
  calculateTotalCost,
  findPeakUsageTime,
  findLowestUsageTime,
  calculateEfficiencyRating,
  convertToCSV,
  downloadCSV,
  getReportData,
} from "@/utils/energy-data-utils"

// Format currency (Naira)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function EnergyUsagePage() {
  const [timeframe, setTimeframe] = useState("weekly")
  const [meterData, setMeterData] = useState<MeterReading[]>([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<AggregatedData[]>([])
  const [totalConsumption, setTotalConsumption] = useState(0)
  const [avgConsumption, setAvgConsumption] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [peakUsageTime, setPeakUsageTime] = useState("N/A")
  const [lowestUsageTime, setLowestUsageTime] = useState("N/A")
  const [efficiencyRating, setEfficiencyRating] = useState(0)

  // Fetch meter data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // In a real app, this would be an API call
        // For now, we'll use the provided dataset

        // In a real app, you would fetch from API:
        const response = await api.getAllMeterUnits()
        setMeterData(response.data)

        // Calculate metrics
        const totalConsumption = calculateTotalConsumption(response.data, 7)
        const avgConsumption = calculateAverageDailyConsumption(response.data, 7)
        const totalCost = calculateTotalCost(response.data, 7)
        const peakUsageTime = findPeakUsageTime(response.data)
        const lowestUsageTime = findLowestUsageTime(response.data)
        const efficiencyRating = calculateEfficiencyRating(response.data)

        setTotalConsumption(totalConsumption)
        setAvgConsumption(avgConsumption)
        setTotalCost(totalCost)
        setPeakUsageTime(peakUsageTime)
        setLowestUsageTime(lowestUsageTime)
        setEfficiencyRating(efficiencyRating)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching meter data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update chart data when timeframe changes
  useEffect(() => {
    if (meterData.length === 0) return

    // Filter data based on timeframe first with precise date/time checking
    const now = new Date()
    let filteredData: MeterReading[] = []

    switch (timeframe) {
      case "daily":
        // Last 24 hours - check both date and hour
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        filteredData = meterData.filter((reading) => {
          const readingDate = new Date(reading.timeValue)
          return readingDate >= twentyFourHoursAgo
        })
        break
      case "weekly":
        // Last 7 days - check date falls within last 7 complete days
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filteredData = meterData.filter((reading) => {
          const readingDate = new Date(reading.timeValue)
          return readingDate >= sevenDaysAgo && readingDate <= now
        })
        break
      case "monthly":
        // Last 30 days - check date falls within last 30 complete days
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filteredData = meterData.filter((reading) => {
          const readingDate = new Date(reading.timeValue)
          return readingDate >= thirtyDaysAgo && readingDate <= now
        })
        break
      case "yearly":
        // Last 365 days - check date falls within last 365 complete days
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        filteredData = meterData.filter((reading) => {
          const readingDate = new Date(reading.timeValue)
          return readingDate >= oneYearAgo && readingDate <= now
        })
        break
      default:
        filteredData = meterData
    }

    // Then aggregate the filtered data
    let aggregatedData: AggregatedData[] = []

    switch (timeframe) {
      case "daily":
        aggregatedData = groupByHour(filteredData)
        break
      case "weekly":
        aggregatedData = groupByDay(filteredData)
        break
      case "monthly":
        aggregatedData = groupByDay(filteredData)
        break
      case "yearly":
        aggregatedData = groupByMonth(filteredData)
        break
      default:
        aggregatedData = groupByDay(filteredData)
    }

    setChartData(aggregatedData)
  }, [timeframe, meterData])

  const handleDownloadCSV = () => {
    if (meterData.length === 0) return

    const csvContent = convertToCSV(meterData)
    downloadCSV(csvContent, `energy-usage-${timeframe}-${new Date().toISOString().split("T")[0]}.csv`)
  }

  const handleDownloadReport = (reportType: string) => {
    if (meterData.length === 0) return

    const reportData = getReportData(meterData, reportType)
    const csvContent = convertToCSV(reportData)
    downloadCSV(csvContent, `energy-report-${reportType}-${new Date().toISOString().split("T")[0]}.csv`)
  }

  // Calculate percentages for progress bars
  const maxConsumption = Math.max(...chartData.map((item) => item.consumption), 0.001)
  const maxCost = Math.max(...chartData.map((item) => item.cost), 0.001)
  const maxPower = Math.max(...meterData.map((item) => item.powerValue), 0.001)

  let consumptionPercentage = maxConsumption > 0 ? (totalConsumption / maxConsumption) * 100 : 0
  let avgConsumptionPercentage = maxConsumption > 0 ? (avgConsumption / maxConsumption) * 100 : 0
  let costPercentage = maxCost > 0 ? (totalCost / maxCost) * 100 : 0

  // Ensure percentages don't exceed 100%
  consumptionPercentage = Math.min(consumptionPercentage, 100)
  avgConsumptionPercentage = Math.min(avgConsumptionPercentage, 100)
  costPercentage = Math.min(costPercentage, 100)

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Energy Usage
          </h1>
          <p className="text-muted-foreground">Monitor and analyze energy consumption patterns</p>
        </div>
        <Button variant="outline" size="icon" title="Refresh">
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Timeframe:</span>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily (24 hours)</SelectItem>
              <SelectItem value="weekly">Weekly (7 days)</SelectItem>
              <SelectItem value="monthly">Monthly (30 days)</SelectItem>
              <SelectItem value="yearly">Yearly (12 months)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleDownloadReport("monthly")}>
            <Download className="mr-2 h-4 w-4" />
            Monthly Report
          </Button>
          <Button variant="outline" onClick={() => handleDownloadReport("6-month")}>
            <Download className="mr-2 h-4 w-4" />
            6-Month Report
          </Button>
          <Button variant="outline" onClick={() => handleDownloadReport("yearly")}>
            <Download className="mr-2 h-4 w-4" />
            Yearly Report
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Consumption</h2>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Energy Consumption</CardTitle>
              <CardDescription>
                {timeframe === "daily"
                  ? "Hourly energy consumption for the past 24 hours"
                  : timeframe === "weekly"
                    ? "Daily energy consumption for the past week"
                    : timeframe === "monthly"
                      ? "Daily energy consumption for the past month"
                      : "Monthly energy consumption for the past year"}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-lg text-xs">
                              <p className="font-medium text-gray-900">{`Time: ${label}`}</p>
                              <p className="text-blue-600">{`Consumption: ${payload[0].value?.toFixed(2)} kWh`}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="consumption"
                      name="Consumption (kWh)"
                      stroke="#3b82f6"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <NoDataMessage message="No energy usage data available for the selected timeframe." />
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Average Voltage</CardTitle>
                <CardDescription>
                  {timeframe === "daily"
                    ? "Hourly average voltage for the past 24 hours"
                    : timeframe === "weekly"
                      ? "Daily average voltage for the past week"
                      : timeframe === "monthly"
                        ? "Daily average voltage for the past month"
                        : "Monthly average voltage for the past year"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-lg text-xs">
                                <p className="font-medium text-gray-900">{`Time: ${label}`}</p>
                                <p className="text-blue-600">{`Voltage: ${payload[0].value?.toFixed(2)} V`}</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="voltage"
                        name="Voltage (V)"
                        stroke="#3b82f6"
                        activeDot={{ r: 6 }}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <NoDataMessage message="No voltage data available for the selected timeframe." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Current Drawn</CardTitle>
                <CardDescription>
                  {timeframe === "daily"
                    ? "Hourly current drawn for the past 24 hours"
                    : timeframe === "weekly"
                      ? "Daily current drawn for the past week"
                      : timeframe === "monthly"
                        ? "Daily current drawn for the past month"
                        : "Monthly current drawn for the past year"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-lg text-xs">
                                <p className="font-medium text-gray-900">{`Time: ${label}`}</p>
                                <p className="text-green-600">{`Current: ${payload[0].value?.toFixed(2)} A`}</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="current"
                        name="Current (A)"
                        stroke="#10b981"
                        activeDot={{ r: 6 }}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <NoDataMessage message="No current data available for the selected timeframe." />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalConsumption.toFixed(4)} <span className="text-sm">kWh</span>
              </div>
              <p className="text-xs text-muted-foreground">Past 7 days</p>
              <div className="mt-4">
                <Progress value={consumptionPercentage} className="h-2" indicatorColor="bg-green-500" />
                <p className="text-xs text-muted-foreground mt-1">
                  {consumptionPercentage.toFixed(1)}% of maximum consumption
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Average Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgConsumption.toFixed(4)} <span className="text-sm">kWh</span>
              </div>
              <p className="text-xs text-muted-foreground">Per day</p>
              <div className="mt-4">
                <Progress value={avgConsumptionPercentage} className="h-2" indicatorColor="bg-blue-500" />
                <p className="text-xs text-muted-foreground mt-1">
                  {avgConsumptionPercentage.toFixed(1)}% of maximum consumption
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
              <p className="text-xs text-muted-foreground">Past 7 days</p>
              <div className="mt-4">
                <Progress value={costPercentage} className="h-2" indicatorColor="bg-purple-500" />
                <p className="text-xs text-muted-foreground mt-1">{costPercentage.toFixed(1)}% of maximum cost</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Energy Usage Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Peak Usage Time</div>
                  <div className="text-2xl font-bold">{peakUsageTime}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Lowest Usage Time</div>
                  <div className="text-2xl font-bold">{lowestUsageTime}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Efficiency Rating</div>
                  <div className="text-2xl font-bold">{efficiencyRating.toFixed(1)}%</div>
                  <div className="mt-2">
                    <Progress
                      value={efficiencyRating}
                      className="h-2"
                      indicatorColor={
                        efficiencyRating >= 80
                          ? "bg-green-500"
                          : efficiencyRating >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
