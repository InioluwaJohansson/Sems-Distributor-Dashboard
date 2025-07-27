"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  BarChart3,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  LineChartIcon,
  ParkingMeter,
  Receipt,
  Settings,
  Tag,
  UserCog,
  Users,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  getHourlyAggregatedDataFromAPI,
  getTotalConsumptionLast24HoursFromAPI,
  getTotalCostLast24HoursFromAPI,
  getAveragePowerLast24HoursFromAPI,
} from "@/utils/shared-energy-data"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"
import * as api from "@/components/apiUrl"
// Dashboard metrics interface with current and previous month data
interface DashboardMetrics {
  totalCustomers: {
    current: number
    previous: number
  }
  activeMeters: {
    current: number
    previous: number
  }
  revenue: {
    current: number
    previous: number
  }
  transactions: {
    current: number
    previous: number
  }
}

// Monthly comparison interface
interface MonthlyComparison {
  customersChange: number
  metersChange: number
  revenueChange: number
  transactionsChange: number
}

// Sample data from the existing pages
const administratorsData =  [
    {
      id: 1,
      adminId: "Admin5a0ae",
      firstName: "Taiwo",
      lastName: "Makinde",
      email: "taiwo.makinde10@gmail.com",
    },
    {
      id: 2,
      adminId: "Admin7b3fc",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@sems.com",
    },
    {
      id: 3,
      adminId: "Admin9c4ed",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@sems.com",
    },
  ]

const customersData =  [
    {
      id: 1,
      customerId: "CUSTOMER4770f",
      firstName: "Inioluwa",
      lastName: "Johansson",
      email: "inioluwa.makinde10@gmail.com",
      getMeterDto: [{ id: 1 }, { id: 2 }, { id: 3 }],
    },
    {
      id: 2,
      customerId: "CUSTOMER71A3DAF4",
      firstName: "Halsey",
      lastName: "Johansson",
      email: "halsey.johansson@gmail.com",
      getMeterDto: [],
    },
    {
      id: 3,
      customerId: "CUSTOMERD2886BB6",
      firstName: "Aurellian",
      lastName: "Johansson",
      email: "inioluwa.johansson10@gmail.com",
      getMeterDto: [],
    },
  ]

const metersData = [
    {
      id: 1,
      meterId: "METERbc566ef5",
      customerName: "Inioluwa Johansson",
      isActive: false,
    },
    {
      id: 2,
      meterId: "METER7DA6900C",
      customerName: "Inioluwa Johansson",
      isActive: true,
    },
    {
      id: 3,
      meterId: "METER8E2690A3",
      customerName: "Inioluwa Johansson",
      isActive: true,
    },
  ]

const transactionsData = [
    {
      id: 1,
      meterId: 1,
      allocatedUnits: 320,
      getTransactionDto: {
        transactionId: "518F9EA9969A43",
        total: 75273.6,
        date: "2025-04-01T00:00:00",
      },
      unitAllocationStatus: "Active",
    },
    {
      id: 2,
      meterId: 1,
      allocatedUnits: 300,
      getTransactionDto: {
        transactionId: "2C252ED4DDEF4D",
        total: 90480,
        date: "2025-04-06T00:00:00",
      },
      unitAllocationStatus: "Active",
    },
    {
      id: 3,
      meterId: 2,
      allocatedUnits: 100,
      getTransactionDto: {
        transactionId: "A39C5080521C4C",
        total: 32160,
        date: "2025-04-06T00:00:00",
      },
      unitAllocationStatus: "Pending",
    },
  ]
const pricesData = {
    rate: 0, 
    baseCharge: 0,
  };
// Async method to fetch total customers from API
async function fetchTotalCustomers(): Promise<{ current: number; previous: number }> {
  try {
    const response = await api.getAllCustomers();
    const customers = response.data;
    customersData = customers;
    const admins = await api.getAllAdmins();
    administratorsData = admins.data;
    const prices = await api.getPrices();
    const pricesNewData = prices.data;
    pricesData = {rate: pricesNewData.rate, baseCharge: pricesNewData.baseCharge};
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentData = customers.filter((c) => {
      const createdDate = new Date(c.createdOn);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    const previousData = customers.filter((c) => {
      const createdDate = new Date(c.createdOn);
      return createdDate.getMonth() === previousMonth && createdDate.getFullYear() === previousYear;
    }).length;

    return { current:currentData || 0, previous: previousData || 0 };
  } catch (error) {
    console.error("Error fetching customers metrics from API:", error)
    return {
      current: customersData.length,
      previous: Math.floor(customersData.length * 0.89), // 12% increase simulation
    }
  }
}

// Async method to fetch active meters from API
async function fetchActiveMeters(): Promise<{ current: number; previous: number }> {
  try {
    const response = await api.getAllMeters();
    const meterData = response.data;
    metersData = meterData;
    const currentActive = meterData.filter((meter) => meter.isActive == true).length
    return {
      current: currentActive,
      previous: response.data.length, // 8% increase simulation
    }
  } catch (error) {
    console.error("Error fetching meters metrics from API:", error)
    const currentActive = metersData.filter((meter) => meter.isActive).length
    return {
      current: currentActive,
      previous: Math.floor(currentActive * 0.93), // 8% increase simulation
    }
  }
}

// Async method to fetch revenue from API
async function fetchRevenue(): Promise<{ current: number; previous: number }> {
  try {
    const response = await api.getDashBoardTransactionData()
    const transactions = response.data;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const previousTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
    });

    const currentT = currentTransactions.reduce(
      (sum, t) => sum + t.total,
      0
    );
    const previousT = previousTransactions.reduce(
      (sum, t) => sum + t.total,
      0
    );

    return { current: currentT, previous: previousT };
  } catch (error) {
    console.error("Error fetching revenue metrics from API:", error)
    const currentRevenue = transactionsData.reduce(
      (sum, transaction) => sum + transaction.total,
      0,
    )
    return {
      current: currentRevenue,
      previous: Math.floor(currentRevenue * 0.83), // 20.1% increase simulation
    }
  }
}

// Async method to fetch total transactions from API
async function fetchTotalTransactions(): Promise<{ current: number; previous: number }> {
  try {
    const response = await api.getDashBoardTransactionData();
    const transactions = response.data;
    const meterAllocation = await api.getAllMeterUnitsAllocation();
    transactionsData = meterAllocation.data;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentT = transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    const previousT = transactions.filter((t) => {
      console.log(t)
      const date = new Date(t.date);
      return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
    }).length;

    return { current: currentT, previous: previousT};
  } catch (error) {
    console.error("Error fetching transactions metrics from API:", error)
    return {
      current: 0,
      previous: 0, // 19% increase simulation
    }
  }
}

// Main method to fetch dashboard metrics from multiple APIs
async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    console.log("Fetching dashboard metrics from multiple APIs...")

    // Fetch all metrics concurrently from different APIs
    const [customersMetrics, metersMetrics, revenueMetrics, transactionsMetrics] = await Promise.all([
      fetchTotalCustomers(),
      fetchActiveMeters(),
      fetchRevenue(),
      fetchTotalTransactions(),
    ])

    return {
      totalCustomers: customersMetrics,
      activeMeters: metersMetrics,
      revenue: revenueMetrics,
      transactions: transactionsMetrics,
    }
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error)
    // Fallback to sample data if all APIs fail
    const currentRevenue = transactionsData.reduce(
      (sum, transaction) => sum + transaction.getTransactionDto.total,
      0,
    )
    const currentActiveMeters = metersData.filter((meter) => meter.isActive == true).length

    return {
      totalCustomers: {
        current: customersData.length,
        previous: Math.floor(customersData.length * 0.89),
      },
      activeMeters: {
        current: currentActiveMeters,
        previous: Math.floor(currentActiveMeters * 0.93),
      },
      revenue: {
        current: currentRevenue,
        previous: Math.floor(currentRevenue * 0.83),
      },
      transactions: {
        current: transactionsData.length,
        previous: Math.floor(transactionsData.length * 0.84),
      },
    }
  }
}

// Method to calculate percentage difference compared to last month
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// Method to calculate monthly comparison from dashboard metrics
function calculateMonthlyComparison(metrics: DashboardMetrics): MonthlyComparison {
  return {
    customersChange: calculatePercentageChange(metrics.totalCustomers.current, metrics.totalCustomers.previous),
    metersChange: calculatePercentageChange(metrics.activeMeters.current, metrics.activeMeters.previous),
    revenueChange: calculatePercentageChange(metrics.revenue.current, metrics.revenue.previous),
    transactionsChange: calculatePercentageChange(metrics.transactions.current, metrics.transactions.previous),
  }
}

export default function DashboardPage() {
  const [energyData, setEnergyData] = useState<any[]>([])
  const [totalConsumption24h, setTotalConsumption24h] = useState(0)
  const [totalCost24h, setTotalCost24h] = useState(0)
  const [averagePower24h, setAveragePower24h] = useState(0)
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    totalCustomers: { current: 0, previous: 0 },
    activeMeters: { current: 0, previous: 0 },
    revenue: { current: 0, previous: 0 },
    transactions: { current: 0, previous: 0 },
  })
  const [monthlyComparison, setMonthlyComparison] = useState<MonthlyComparison>({
    customersChange: 0,
    metersChange: 0,
    revenueChange: 0,
    transactionsChange: 0,
  })
  const [loading, setLoading] = useState(true)

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch energy data and dashboard metrics concurrently
        const [hourlyData, totalConsumption, totalCost, averagePower, metrics] = await Promise.all([
          getHourlyAggregatedDataFromAPI(),
          getTotalConsumptionLast24HoursFromAPI(),
          getTotalCostLast24HoursFromAPI(),
          getAveragePowerLast24HoursFromAPI(),
          fetchDashboardMetrics(),
        ])

        // Calculate monthly comparison from the fetched metrics
        const comparison = calculateMonthlyComparison(metrics)

        setEnergyData(hourlyData)
        setTotalConsumption24h(totalConsumption)
        setTotalCost24h(totalCost)
        setAveragePower24h(averagePower)
        setDashboardMetrics(metrics)
        setMonthlyComparison(comparison)

        console.log("Dashboard metrics loaded:", metrics)
        console.log("Monthly comparison calculated:", comparison)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Format currency (Naira)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Format percentage change
  const formatPercentageChange = (change: number) => {
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(1)}% from last month`
  }

  // Calculate percentages for progress bars
  const customersPercentage = Math.min((dashboardMetrics.totalCustomers.current / 100) * 100, 100)
  const activeMetersPercentage = Math.min((dashboardMetrics.activeMeters.current / 50) * 100, 100)
  const revenuePercentage = Math.min((dashboardMetrics.revenue.current / 1000000) * 100, 100)
  const transactionsPercentage = Math.min((dashboardMetrics.transactions.current / 20) * 100, 100)

  if (loading) {
    return (
      <div className="space-y-6 w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
        <div className="grid gap-4 grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome to the SEMS Admin Dashboard</p>
      </div>

      {/* Compact dashboard tiles - 4 in a row */}
      <div className="grid gap-3 grid-cols-4">
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Customers</CardTitle>
            <Users className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold">{dashboardMetrics.totalCustomers.current}</div>
            <p className="text-xs text-muted-foreground">{formatPercentageChange(monthlyComparison.customersChange)}</p>
            <div className="h-1 mt-2 bg-gradient-to-r from-blue-200 to-blue-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-800 transition-all duration-300"
                style={{ width: `${customersPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Active Meters</CardTitle>
            <Activity className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold">{dashboardMetrics.activeMeters.current}</div>
            <p className="text-xs text-muted-foreground">{formatPercentageChange(monthlyComparison.metersChange)}</p>
            <div className="h-1 mt-2 bg-gradient-to-r from-green-200 to-green-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-800 transition-all duration-300"
                style={{ width: `${activeMetersPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Revenue</CardTitle>
            <DollarSign className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold">{formatCurrency(dashboardMetrics.revenue.current)}</div>
            <p className="text-xs text-muted-foreground">{formatPercentageChange(monthlyComparison.revenueChange)}</p>
            <div className="h-1 mt-2 bg-gradient-to-r from-purple-200 to-purple-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-purple-800 transition-all duration-300"
                style={{ width: `${revenuePercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Transactions</CardTitle>
            <CreditCard className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold">{dashboardMetrics.transactions.current}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentageChange(monthlyComparison.transactionsChange)}
            </p>
            <div className="h-1 mt-2 bg-gradient-to-r from-orange-200 to-orange-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-800 transition-all duration-300"
                style={{ width: `${transactionsPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle>Energy Consumption</CardTitle>
            <CardDescription>Energy consumption over the past 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {energyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energyData}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip content={({ active, payload, label }) => {
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
                    formatter={(value: any, name: string) => [
                      name === "cost" ? formatCurrency(value) : value.toFixed(4),
                      name === "consumption" ? "Consumption (kWh)" : name === "cost" ? "Cost" : "Power (W)",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="consumption"
                    name="Consumption"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full rounded-md bg-muted/50 flex items-center justify-center">
                <p className="text-muted-foreground">No energy data available for the past 24 hours</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mt-8">Quick Access</h2>
      {/* Quick access section - 4 tiles in a row */}
      <div className="grid gap-4 grid-cols-4">
        <Link href="/dashboard/administrators" className="block">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardContent className="flex flex-col p-4">
              <div className="flex items-center justify-between mb-3">
                <UserCog className="h-6 w-6 text-primary" />
                <Badge className="text-xs">{administratorsData.length}</Badge>
              </div>
              <h3 className="text-sm font-medium">Administrators</h3>
              <p className="text-xs text-muted-foreground mb-3">Manage system administrators</p>
              <div className="mt-auto space-y-1">
                {administratorsData.slice(0, 2).map((admin) => (
                  <div key={admin.id} className="text-xs flex justify-between">
                    <span className="font-medium truncate">
                      {admin.firstName} {admin.lastName}
                    </span>
                    <span className="text-muted-foreground text-xs">{admin.adminId}</span>
                  </div>
                ))}
                {administratorsData.length > 2 && (
                  <div className="text-xs text-muted-foreground text-right">
                    +{administratorsData.length - 2} more
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/customers" className="block">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardContent className="flex flex-col p-4">
              <div className="flex items-center justify-between mb-3">
                <Users className="h-6 w-6 text-primary" />
                <Badge className="text-xs">{customersData.length}</Badge>
              </div>
              <h3 className="text-sm font-medium">Customers</h3>
              <p className="text-xs text-muted-foreground mb-3">Manage customer accounts</p>
              <div className="mt-auto space-y-1">
                {customersData.slice(0, 2).map((customer) => (
                  <div className="text-xs flex justify-between">
                    <span className="font-medium truncate">
                      {customer.firstName} {customer.lastName}
                    </span>
                    <span className="text-muted-foreground text-xs">{customer.getMeterDto.length} meters</span>
                  </div>
                ))}
                {customersData.length > 2 && (
                  <div className="text-xs text-muted-foreground text-right">+{customersData.length - 2} more</div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/meters" className="block">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardContent className="flex flex-col p-4">
              <div className="flex items-center justify-between mb-3">
                <ParkingMeter className="h-6 w-6 text-primary" />
                <Badge className="text-xs">{metersData.length}</Badge>
              </div>
              <h3 className="text-sm font-medium">Meters</h3>
              <p className="text-xs text-muted-foreground mb-3">Manage smart meters</p>
              <div className="mt-auto space-y-1">
                {metersData.slice(0, 2).map((meter) => (
                  <div key={meter.id} className="text-xs flex justify-between">
                    <span className="font-medium truncate">{meter.meterId}</span>
                    <Badge variant={meter.isActive ? "default" : "secondary"} className="text-xs">
                      {meter.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
                {metersData.length > 2 && (
                  <div className="text-xs text-muted-foreground text-right">+{metersData.length - 2} more</div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/transactions" className="block">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardContent className="flex flex-col p-4">
              <div className="flex items-center justify-between mb-3">
                <Receipt className="h-6 w-6 text-primary" />
                <Badge className="text-xs">{transactionsData.length}</Badge>
              </div>
              <h3 className="text-sm font-medium">Transactions</h3>
              <p className="text-xs text-muted-foreground mb-3">View payment transactions</p>
              <div className="mt-auto space-y-1">
                {transactionsData.slice(0, 2).map((transaction) => (
                  <div key={transaction.id} className="text-xs flex justify-between">
                    <span className="font-medium truncate">
                      {transaction.getTransactionDto.transactionId.substring(0, 8)}...
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatCurrency(transaction.getTransactionDto.total)}
                    </span>
                  </div>
                ))}
                {transactionsData.length > 2 && (
                  <div className="text-xs text-muted-foreground text-right">
                    +{transactionsData.length - 2} more
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Additional quick access row */}
      <div className="grid gap-4 grid-cols-4">
        <Link href="/dashboard/prices" className="block">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardContent className="flex flex-col p-4">
              <div className="flex items-center justify-between mb-3">
                <Tag className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-medium">Prices</h3>
              <p className="text-xs text-muted-foreground mb-3">Manage energy pricing</p>
              <div className="mt-auto space-y-1">
                <div className="text-xs flex justify-between">
                  <span className="font-medium">Current Rate</span>
                  <span className="text-muted-foreground">₦{pricesData.rate}/unit</span>
                </div>
                <div className="text-xs flex justify-between">
                  <span className="font-medium">Base Charge</span>
                  <span className="text-muted-foreground">₦{pricesData.baseCharge}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/energy-usage" className="block">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardContent className="flex flex-col p-4">
              <div className="flex items-center justify-between mb-3">
                <LineChartIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-medium">Energy Usage</h3>
              <p className="text-xs text-muted-foreground mb-3">Monitor energy consumption</p>
              <div className="mt-auto space-y-1">
                <div className="text-xs flex justify-between">
                  <span className="font-medium">Daily Average</span>
                  <span className="text-muted-foreground">124.5 kWh</span>
                </div>
                <div className="text-xs flex justify-between">
                  <span className="font-medium">Monthly Total</span>
                  <span className="text-muted-foreground">3,735 kWh</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reports" className="block">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardContent className="flex flex-col p-4">
              <div className="flex items-center justify-between mb-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-medium">Reports</h3>
              <p className="text-xs text-muted-foreground mb-3">Generate system reports</p>
              <div className="mt-auto space-y-1">
                <div className="text-xs flex justify-between">
                  <span className="font-medium">Revenue Report</span>
                  <span className="text-muted-foreground">Monthly</span>
                </div>
                <div className="text-xs flex justify-between">
                  <span className="font-medium">Usage Report</span>
                  <span className="text-muted-foreground">Weekly</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/profile" className="block">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardContent className="flex flex-col p-4">
              <div className="flex items-center justify-between mb-3">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-medium">Settings</h3>
              <p className="text-xs text-muted-foreground mb-3">Configure system settings</p>
              <div className="mt-auto space-y-1">
                <div className="text-xs flex justify-between">
                  <span className="font-medium">Profile</span>
                  <span className="text-muted-foreground">Admin5a0ae</span>
                </div>
                <div className="text-xs flex justify-between">
                  <span className="font-medium">Last Login</span>
                  <span className="text-muted-foreground">Today, 10:48 AM</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
