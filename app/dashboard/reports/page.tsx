"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Download, FileText, RefreshCcw, TrendingDown, TrendingUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import * as api from "@/components/apiUrl"
import { type DashboardData, processRevenueData, processCustomerData, exportToCSV } from "@/utils/reports-data-utils"
import { generateComprehensiveReport } from "@/utils/reports-pdf-utils"
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Format currency (Naira)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// COLORS for charts and progress bars
const COLORS = {
  revenue: {
    primary: "rgba(34, 197, 94, 1)",
    gradient: "linear-gradient(90deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 1) 100%)",
  },
  transactions: {
    primary: "rgba(59, 130, 246, 1)",
    gradient: "linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 1) 100%)",
  },
  average: {
    primary: "rgba(168, 85, 247, 1)",
    gradient: "linear-gradient(90deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 1) 100%)",
  },
  active: {
    primary: "rgba(34, 197, 94, 1)",
    gradient: "linear-gradient(90deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 1) 100%)",
  },
  inactive: {
    primary: "rgba(245, 158, 11, 1)",
    gradient: "linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 1) 100%)",
  },
  activeLoad: {
    primary: "rgba(20, 30, 40, 1)",
    gradient: "linear-gradient(90deg, rgba(40, 30, 50, 0.2) 0%, rgba(40, 30, 50, 1) 100%)",
  },
  total: {
    primary: "rgba(100, 116, 139, 1)",
    gradient: "linear-gradient(90deg, rgba(100, 116, 139, 0.2) 0%, rgba(100, 116, 139, 1) 100%)",
  },
  customers: {
    primary: "rgba(14, 165, 233, 1)",
    gradient: "linear-gradient(90deg, rgba(14, 165, 233, 0.2) 0%, rgba(14, 165, 233, 1) 100%)",
  },
  newCustomers: {
    primary: "rgba(249, 115, 22, 1)",
    gradient: "linear-gradient(90deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 1) 100%)",
  },
  pieChart: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"],
}

// Custom Tooltip Component with improved styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-xs font-medium text-gray-900 mb-1">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {`${entry.name}: ${
              entry.name === "Revenue" || entry.name.includes("revenue")
                ? formatCurrency(entry.value)
                : entry.value.toLocaleString()
            }`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("monthly")
  const [year, setYear] = useState("2025")
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<any>({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransactionValue: 0,
    monthlyData: [],
  })
  const [customerData, setCustomerData] = useState<any>({
    totalCustomers: 0,
    customerGrowth: [],
    topCustomers: [],
    customersWithMeters: 0,
  })
  const [meterData, setMeterData] = useState<any>({
    status: {
      active: 0,
      inactive: 0,
      activeLoad: 0,
      total: 0,
      unattached: 0,
      withActiveReadings: 0,
      withTransactions: 0,
    },
    averageConsumedUnits: 0,
    efficiency: [],
    consumptionAndCostData: [],
  })

  // Fetch reports data from API
  const fetchReportsData = async () => {
    setIsLoading(true)
    try {
      const response = await api.getDashBoardData()
      console.log("Reports Data:", JSON.stringify(response.data))
      setData(response.data)
    } catch (error) {
      console.error("Error fetching reports data:", error)
      // Set empty data structure on error
      setData({
        dashboardDto: {
          getTransactionDto: [],
          getMeterDto: [],
          getCustomerDto: [],
        },
        message: null,
        status: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch on component mount
  useEffect(() => {
    fetchReportsData()
  }, [])

  // Process data when period or year changes
  useEffect(() => {
    if (!data) return

    try {
      // Process revenue data with period parameter
      const processedRevenueData = processRevenueData(data, year, period)
      setRevenueData(processedRevenueData)

      // Process customer data with period parameter
      const processedCustomerData = processCustomerData(data, year, period)
      setCustomerData(processedCustomerData)

      // Process meter data with new metrics
      const processedMeterData = processEnhancedMeterData(data)
      setMeterData(processedMeterData)
    } catch (error) {
      console.error("Error processing data:", error)
    }
  }, [data, period, year])

  // Enhanced meter data processing with new metrics
  const processEnhancedMeterData = (data: DashboardData) => {
    if (!data || !data.dashboardDto || !data.dashboardDto.getMeterDto) {
      return {
        status: {
          active: 0,
          inactive: 0,
          activeLoad: 0,
          total: 0,
          unattached: 0,
          withActiveReadings: 0,
          withTransactions: 0,
        },
        averageConsumedUnits: 0,
        efficiency: [],
        consumptionAndCostData: [],
      }
    }

    const meters = data.dashboardDto.getMeterDto || []

    // Calculate meter status counts
    const activeMeters = meters.filter((meter) => meter.isActive).length
    const inactiveMeters = meters.filter((meter) => !meter.isActive).length
    const activeLoadMeters = meters.filter((meter) => meter.activeLoad).length
    const totalMeters = meters.length

    // New metrics
    const unattachedMeters = meters.filter((meter) => meter.customerName === "Meter not yet attached").length
    const metersWithActiveReadings = meters.filter(
      (meter) =>
        meter.getMeterUnitsDto &&
        meter.getMeterUnitsDto.length > 0 &&
        meter.getMeterUnitsDto.some((unit) => unit.powerValue > 0 || unit.consumptionValue > 0),
    ).length
    const metersWithTransactions = meters.filter(
      (meter) => meter.getMeterUnitAllocationsDto && meter.getMeterUnitAllocationsDto.length > 0,
    ).length

    // Calculate average consumed units
    const totalConsumedUnits = meters.reduce((sum, meter) => sum + (meter.consumedUnits || 0), 0)
    const averageConsumedUnits = totalMeters > 0 ? totalConsumedUnits / totalMeters : 0

    // Calculate meter efficiency (keeping existing logic)
    const meterEfficiency = calculateMeterEfficiency(meters)

    // Process consumption and cost data
    const consumptionAndCostData = processConsumptionAndCostData(meters)

    return {
      status: {
        active: activeMeters,
        inactive: inactiveMeters,
        activeLoad: activeLoadMeters,
        total: totalMeters,
        unattached: unattachedMeters,
        withActiveReadings: metersWithActiveReadings,
        withTransactions: metersWithTransactions,
      },
      averageConsumedUnits,
      efficiency: meterEfficiency,
      consumptionAndCostData,
    }
  }

  // Calculate meter efficiency (existing function)
  const calculateMeterEfficiency = (meters: any[]) => {
    if (!meters || !meters.length) {
      return []
    }

    const meterTypes = ["Standard", "Smart", "Industrial", "Commercial", "Residential"]

    return meterTypes.map((type, index) => {
      const typeMeters = meters.filter((_, i) => i % meterTypes.length === index)
      const efficiency = 70 + Math.random() * 30

      return {
        meterType: type,
        efficiency,
        count: typeMeters.length || 1,
      }
    })
  }

  // Process consumption and cost data (existing function)
  const processConsumptionAndCostData = (meters: any[]) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const monthlyData = months.map((month) => ({
      month,
      consumption: 0,
      cost: 0,
    }))

    meters.forEach((meter) => {
      if (meter.getMeterUnitsDto && meter.getMeterUnitsDto.length > 0) {
        meter.getMeterUnitsDto.forEach((unit: any) => {
          const date = new Date(unit.timeValue)
          const monthIndex = date.getMonth()

          monthlyData[monthIndex].consumption += unit.consumptionValue
          monthlyData[monthIndex].cost += unit.electricityCost
        })
      }
    })

    return monthlyData
  }

  // Handle CSV download
  const handleDownloadCSV = (reportType: string) => {
    let csvData: any[] = []
    let fileName = ""

    switch (reportType) {
      case "revenue":
        csvData = revenueData?.monthlyData || []
        fileName = `revenue_report_${year}.csv`
        break
      case "customers":
        csvData = customerData?.customerGrowth || []
        fileName = `customer_report_${year}.csv`
        break
      case "top-customers":
        csvData = customerData?.topCustomers || []
        fileName = `top_customers_report_${year}.csv`
        break
      case "meters":
        csvData = meterData?.efficiency || []
        fileName = `meter_efficiency_report_${year}.csv`
        break
    }

    exportToCSV(csvData, fileName)
  }

  // Handle PDF download
  const handleDownloadPDF = (reportType: string) => {
    try {
      if (!data) {
        alert("No data available to generate report. Please try again.")
        return
      }
      const doc = generateComprehensiveReport(data, period, year)
      doc.save(`sems_comprehensive_report_${year}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF report. Please try again.")
    }
  }

  // Refresh data
  const handleRefreshData = async () => {
    console.log(`Refreshing report data for ${period} period in ${year}`)
    await fetchReportsData()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Reports
          </h1>
          <p className="text-muted-foreground">Generate and analyze system reports</p>
        </div>
        <Button variant="outline" size="icon" title="Refresh" onClick={handleRefreshData}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Period:</span>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Year:</span>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleDownloadPDF("comprehensive")}>
            <FileText className="mr-2 h-4 w-4" />
            Download Full Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="meters">Meters</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue and transaction data for {year}</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDownloadCSV("revenue")}>
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </CardHeader>

            <CardContent>
              {revenueData && revenueData.monthlyData && revenueData.monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsLineChart
                    data={revenueData.monthlyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke={COLORS.revenue.primary}
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="transactions"
                      name="Transactions"
                      stroke={COLORS.transactions.primary}
                      strokeWidth={2}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                  <p className="text-muted-foreground">No revenue data available for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {revenueData ? formatCurrency(revenueData.totalRevenue) : formatCurrency(0)}
                </div>
                <p className="text-xs text-muted-foreground">For {year}</p>
                <div className="mt-2">
                  <div
                    className="h-2 w-full rounded-full overflow-hidden bg-gray-200"
                    style={{ background: "rgba(34, 197, 94, 0.2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "100%",
                        background: COLORS.revenue.gradient,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">100%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {revenueData ? revenueData.totalTransactions.toLocaleString() : "0"}
                </div>
                <p className="text-xs text-muted-foreground">For {year}</p>
                <div className="mt-2">
                  <div
                    className="h-2 w-full rounded-full overflow-hidden bg-gray-200"
                    style={{ background: "rgba(59, 130, 246, 0.2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "100%",
                        background: COLORS.transactions.gradient,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">80%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Average Transaction Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {revenueData ? formatCurrency(revenueData.averageTransactionValue) : formatCurrency(0)}
                </div>
                <p className="text-xs text-muted-foreground">Per transaction</p>
                <div className="mt-2">
                  <div
                    className="h-2 w-full rounded-full overflow-hidden bg-gray-200"
                    style={{ background: "rgba(168, 85, 247, 0.2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(revenueData.averageTransactionValue / revenueData.totalRevenue) * 100}%`,
                        background: COLORS.average.gradient,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">
                    {`${Math.ceil((revenueData.averageTransactionValue / revenueData.totalRevenue) * 100)}%`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Month</TableHead>
                    <TableHead className="text-center">Revenue</TableHead>
                    <TableHead className="text-center">Transactions</TableHead>
                    <TableHead className="text-center">Growth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueData &&
                    revenueData.monthlyData &&
                    revenueData.monthlyData.map((item: any) => (
                      <TableRow key={item.month}>
                        <TableCell className="text-center font-medium">{item.month}</TableCell>
                        <TableCell className="text-center">{formatCurrency(item.revenue)}</TableCell>
                        <TableCell className="text-center">{item.transactions.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            {item.growth >= 0 ? (
                              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                            )}
                            <span className={item.growth >= 0 ? "text-green-500" : "text-red-500"}>
                              {item.growth.toFixed(2)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>Monthly customer acquisition and retention for {year}</CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {customerData && customerData.customerGrowth && customerData.customerGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsLineChart
                    data={customerData.customerGrowth}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="customers"
                      name="Total Customers"
                      stroke={COLORS.customers.primary}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="newCustomers"
                      name="New Customers"
                      stroke={COLORS.newCustomers.primary}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="customersWithMeters"
                      name="Customers with Meters"
                      stroke="#10B981"
                      strokeWidth={2}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                  <p className="text-muted-foreground">No customer data available for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customerData ? customerData.totalCustomers.toLocaleString() : "0"}
                </div>
                <p className="text-xs text-muted-foreground">For {year}</p>
                <div className="mt-2">
                  <div
                    className="h-2 w-full rounded-full overflow-hidden bg-gray-200"
                    style={{ background: "rgba(14, 165, 233, 0.2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "100%",
                        background: COLORS.customers.gradient,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">100%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">New Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customerData && customerData.customerGrowth
                    ? customerData.customerGrowth
                        .reduce((sum: number, item: any) => sum + item.newCustomers, 0)
                        .toLocaleString()
                    : "0"}
                </div>
                <p className="text-xs text-muted-foreground">For {year}</p>
                <div className="mt-2">
                  <div
                    className="h-2 w-full rounded-full overflow-hidden bg-gray-200"
                    style={{ background: "rgba(249, 115, 22, 0.2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "75%",
                        background: COLORS.newCustomers.gradient,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">75%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Customers with Meters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customerData ? customerData.customersWithMeters.toLocaleString() : "0"}
                </div>
                <p className="text-xs text-muted-foreground">For {year}</p>
                <div className="mt-2">
                  <div
                    className="h-2 w-full rounded-full overflow-hidden bg-gray-200"
                    style={{ background: "rgba(16, 185, 129, 0.2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width:
                          customerData && customerData.totalCustomers > 0
                            ? `${(customerData.customersWithMeters / customerData.totalCustomers) * 100}%`
                            : "0%",
                        background: "linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 1) 100%)",
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">
                    {customerData && customerData.totalCustomers > 0
                      ? ((customerData.customersWithMeters / customerData.totalCustomers) * 100).toFixed(1)
                      : "0"}
                    %
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="meters" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Meters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{meterData ? meterData.status.total.toLocaleString() : "0"}</div>
                <p className="text-xs text-muted-foreground">Deployed meters</p>
                <div className="mt-2">
                  <div
                    className="h-2 w-full rounded-full overflow-hidden bg-gray-200"
                    style={{ background: "rgba(100, 116, 139, 0.2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "100%",
                        background: COLORS.total.gradient,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">100%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Active Meters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{meterData ? meterData.status.active.toLocaleString() : "0"}</div>
                <p className="text-xs text-muted-foreground">
                  {meterData && meterData.status.total > 0
                    ? ((meterData.status.active / meterData.status.total) * 100).toFixed(1)
                    : "0"}
                  % of total
                </p>
                <div className="mt-2">
                  <div
                    className="h-2 w-full rounded-full overflow-hidden bg-gray-200"
                    style={{ background: "rgba(34, 197, 94, 0.2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width:
                          meterData && meterData.status.total > 0
                            ? `${(meterData.status.active / meterData.status.total) * 100}%`
                            : "0%",
                        background: COLORS.active.gradient,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">
                    {meterData && meterData.status.total > 0
                      ? ((meterData.status.active / meterData.status.total) * 100).toFixed(1)
                      : "0"}
                    %
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Inactive Meters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{meterData ? meterData.status.inactive.toLocaleString() : "0"}</div>
                <p className="text-xs text-muted-foreground">
                  {meterData && meterData.status.total > 0
                    ? ((meterData.status.inactive / meterData.status.total) * 100).toFixed(1)
                    : "0"}
                  % of total
                </p>
                <div className="mt-2">
                  <div
                    className="h-2 w-full rounded-full overflow-hidden bg-gray-200"
                    style={{ background: "rgba(245, 158, 11, 0.2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width:
                          meterData && meterData.status.total > 0
                            ? `${(meterData.status.inactive / meterData.status.total) * 100}%`
                            : "0%",
                        background: COLORS.inactive.gradient,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">
                    {meterData && meterData.status.total > 0
                      ? ((meterData.status.inactive / meterData.status.total) * 100).toFixed(1)
                      : "0"}
                    %
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Active Load Meters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {meterData ? meterData.status.activeLoad.toLocaleString() : "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {meterData && meterData.status.total > 0
                    ? ((meterData.status.activeLoad / meterData.status.total) * 100).toFixed(1)
                    : "0"}
                  % of total
                </p>
                <div className="mt-2">
                  <div
                    className="h-2 w-full rounded-full overflow-hidden bg-gray-200"
                    style={{ background: "rgba(245, 158, 11, 0.2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width:
                          meterData && meterData.status.total > 0
                            ? `${(meterData.status.activeLoad / meterData.status.total) * 100}%`
                            : "0%",
                        background: COLORS.activeLoad.gradient,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">
                    {meterData && meterData.status.total > 0
                      ? ((meterData.status.activeLoad / meterData.status.total) * 100).toFixed(1)
                      : "0"}
                    %
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* New Meter Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Unattached Meters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {meterData ? meterData.status.unattached.toLocaleString() : "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {meterData && meterData.status.total > 0
                    ? ((meterData.status.unattached / meterData.status.total) * 100).toFixed(1)
                    : "0"}
                  % of total
                </p>
                <div className="mt-2">
                  <div className="h-2 w-full rounded-full overflow-hidden bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-200 to-red-500"
                      style={{
                        width:
                          meterData && meterData.status.total > 0
                            ? `${(meterData.status.unattached / meterData.status.total) * 100}%`
                            : "0%",
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Meters with Active Readings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {meterData ? meterData.status.withActiveReadings.toLocaleString() : "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {meterData && meterData.status.total > 0
                    ? ((meterData.status.withActiveReadings / meterData.status.total) * 100).toFixed(1)
                    : "0"}
                  % of total
                </p>
                <div className="mt-2">
                  <div className="h-2 w-full rounded-full overflow-hidden bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-200 to-blue-500"
                      style={{
                        width:
                          meterData && meterData.status.total > 0
                            ? `${(meterData.status.withActiveReadings / meterData.status.total) * 100}%`
                            : "0%",
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Meters with Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {meterData ? meterData.status.withTransactions.toLocaleString() : "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {meterData && meterData.status.total > 0
                    ? ((meterData.status.withTransactions / meterData.status.total) * 100).toFixed(1)
                    : "0"}
                  % of total
                </p>
                <div className="mt-2">
                  <div className="h-2 w-full rounded-full overflow-hidden bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-200 to-purple-500"
                      style={{
                        width:
                          meterData && meterData.status.total > 0
                            ? `${(meterData.status.withTransactions / meterData.status.total) * 100}%`
                            : "0%",
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Average Consumed Units</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {meterData ? meterData.averageConsumedUnits.toFixed(2) : "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">Units per meter</p>
                <div className="mt-2">
                  <div className="h-2 w-full rounded-full overflow-hidden bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-200 to-green-500"
                      style={{
                        width: `${Math.min(((meterData?.averageConsumedUnits || 0) / 100) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
