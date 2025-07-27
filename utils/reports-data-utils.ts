// Utility functions for processing report data

// Types for the dashboard data
export interface DashboardData {
  dashboardDto: {
    getTransactionDto: Transaction[]
    getMeterDto: Meter[]
    getCustomerDto: Customer[]
  }
  message: string | null
  status: boolean
}

export interface Transaction {
  date: string
  time: string
  transactionId: string
  rate: number
  baseCharge: number
  taxes: number
  total: number
}

export interface Meter {
  id: number
  customerName: string
  meterId: string
  meterKey: string
  connectionAuth: string
  totalUnits: number
  consumedUnits: number
  baseLoad: number
  getAddressDto: any
  getMeterUnitAllocationsDto: MeterUnitAllocation[]
  getMeterUnitsDto: MeterUnit[]
  isActive: boolean
  activeLoad: boolean
  dateCreated: string
}

export interface MeterUnitAllocation {
  id: number
  meterId: number
  allocatedUnits: number
  consumedUnits: number
  baseLoad: number
  peakLoad: number
  offPeakLoad: number
  getTransactionDto: Transaction
  unitAllocationStatus: string | number
}

export interface MeterUnit {
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

export interface Customer {
  id: number
  customerId: string
  firstName: string
  lastName: string
  userName: string
  email: string
  phoneNumber: string
  pictureUrl: string
  getMeterDto: CustomerMeter[]
  getNotificationDto: any
  createdOn: string
}

export interface CustomerMeter {
  id: number
  customerName: string
  meterId: string
  totalUnits: number
  consumedUnits: number
  isActive: boolean
}

// Revenue data processing functions
export function processRevenueData(data: DashboardData, year: string, period = "monthly") {
  if (!data || !data.dashboardDto || !data.dashboardDto.getTransactionDto) {
    return {
      totalRevenue: 0,
      totalTransactions: 0,
      averageTransactionValue: 0,
      monthlyData: [],
    }
  }

  const transactions = data.dashboardDto.getTransactionDto || []

  // Filter transactions by year and period
  const filteredTransactions = filterTransactionsByYearAndPeriod(transactions, year, period)

  // Calculate total revenue for the filtered period
  const totalRevenue = filteredTransactions.reduce((sum, transaction) => sum + (transaction.total || 0), 0)

  // Calculate total number of transactions
  const totalTransactions = filteredTransactions.length

  // Calculate average transaction value
  const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

  // Group transactions based on period
  let periodData = []
  switch (period) {
    case "quarterly":
      periodData = groupTransactionsByQuarter(filteredTransactions)
      break
    case "yearly":
      periodData = groupTransactionsByYear(filteredTransactions)
      break
    default:
      periodData = groupTransactionsByMonth(filteredTransactions)
  }

  return {
    totalRevenue,
    totalTransactions,
    averageTransactionValue,
    monthlyData: periodData,
  }
}

// Filter transactions by year and period
function filterTransactionsByYearAndPeriod(transactions: Transaction[], year: string, period: string) {
  const now = new Date()
  let startDate = new Date()
  let endDate = new Date()

  switch (period) {
    case "monthly":
      // Current month of the selected year
      if (year === now.getFullYear().toString()) {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = now
      } else {
        startDate = new Date(Number.parseInt(year), 0, 1)
        endDate = new Date(Number.parseInt(year), 11, 31, 23, 59, 59)
      }
      break
    case "quarterly":
      // Current quarter of the selected year
      if (year === now.getFullYear().toString()) {
        const currentQuarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1)
        endDate = now
      } else {
        startDate = new Date(Number.parseInt(year), 0, 1)
        endDate = new Date(Number.parseInt(year), 11, 31, 23, 59, 59)
      }
      break
    case "yearly":
      startDate = new Date(Number.parseInt(year), 0, 1)
      endDate = year === now.getFullYear().toString() ? now : new Date(Number.parseInt(year), 11, 31, 23, 59, 59)
      break
    default:
      startDate = new Date(Number.parseInt(year), 0, 1)
      endDate = year === now.getFullYear().toString() ? now : new Date(Number.parseInt(year), 11, 31, 23, 59, 59)
  }

  return transactions.filter((transaction) => {
    if (!transaction.date) return false
    const transactionDate = new Date(transaction.date)
    return transactionDate >= startDate && transactionDate <= endDate
  })
}

// Group transactions by month
export function groupTransactionsByMonth(transactions: Transaction[]) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Initialize monthly data
  const monthlyData = months.map((month) => ({
    month,
    revenue: 0,
    transactions: 0,
    growth: 0,
  }))

  // Populate monthly data
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date)
    const monthIndex = date.getMonth()

    monthlyData[monthIndex].revenue += transaction.total || 0
    monthlyData[monthIndex].transactions += 1
  })

  // Calculate growth rates
  for (let i = 1; i < monthlyData.length; i++) {
    if (monthlyData[i - 1].revenue > 0) {
      monthlyData[i].growth = ((monthlyData[i].revenue - monthlyData[i - 1].revenue) / monthlyData[i - 1].revenue) * 100
    }
  }

  return monthlyData
}

// Group transactions by quarter
export function groupTransactionsByQuarter(transactions: Transaction[]) {
  const quarters = ["Q1", "Q2", "Q3", "Q4"]

  // Initialize quarterly data
  const quarterlyData = quarters.map((quarter) => ({
    month: quarter, // Using month key for consistency with chart
    revenue: 0,
    transactions: 0,
    growth: 0,
  }))

  // Populate quarterly data
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date)
    const monthIndex = date.getMonth()
    const quarterIndex = Math.floor(monthIndex / 3)

    quarterlyData[quarterIndex].revenue += transaction.total || 0
    quarterlyData[quarterIndex].transactions += 1
  })

  // Calculate growth rates
  for (let i = 1; i < quarterlyData.length; i++) {
    if (quarterlyData[i - 1].revenue > 0) {
      quarterlyData[i].growth =
        ((quarterlyData[i].revenue - quarterlyData[i - 1].revenue) / quarterlyData[i - 1].revenue) * 100
    }
  }

  return quarterlyData
}

// Group transactions by year
export function groupTransactionsByYear(transactions: Transaction[]) {
  const years = ["2023", "2024", "2025"]

  // Initialize yearly data
  const yearlyData = years.map((year) => ({
    month: year, // Using month key for consistency with chart
    revenue: 0,
    transactions: 0,
    growth: 0,
  }))

  // Populate yearly data
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date)
    const year = date.getFullYear().toString()
    const yearIndex = years.indexOf(year)

    if (yearIndex !== -1) {
      yearlyData[yearIndex].revenue += transaction.total || 0
      yearlyData[yearIndex].transactions += 1
    }
  })

  // Calculate growth rates
  for (let i = 1; i < yearlyData.length; i++) {
    if (yearlyData[i - 1].revenue > 0) {
      yearlyData[i].growth = ((yearlyData[i].revenue - yearlyData[i - 1].revenue) / yearlyData[i - 1].revenue) * 100
    }
  }

  return yearlyData
}

// Customer data processing functions with period support
export function processCustomerData(data: DashboardData, year: string, period = "monthly") {
  if (!data || !data.dashboardDto || !data.dashboardDto.getCustomerDto) {
    return {
      totalCustomers: 0,
      customersWithMeters: 0,
      newCustomers: 0,
      newCustomersPercentage: 0,
      customerGrowth: [],
      topCustomers: [],
    }
  }

  const customers = data.dashboardDto.getCustomerDto || []
  const transactions = data.dashboardDto.getTransactionDto || []

  // Calculate total customers
  const totalCustomers = customers.length

  // Calculate customers with meters
  const customersWithMeters = customers.filter(
    (customer) => customer.getMeterDto && customer.getMeterDto.length > 0,
  ).length

  // Calculate new customers (created less than a month ago)
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  const newCustomers = customers.filter((customer) => {
    const createdDate = new Date(customer.createdOn)
    return createdDate >= oneMonthAgo
  }).length

  // Calculate new customers percentage
  const newCustomersPercentage = totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0

  // Calculate customer growth by period
  const customerGrowth = calculateCustomerGrowthByPeriod(customers, year, period)

  // Process top customers data
  const topCustomers = processTopCustomers(customers, transactions)

  return {
    totalCustomers,
    customersWithMeters,
    newCustomers,
    newCustomersPercentage,
    customerGrowth,
    topCustomers,
  }
}

// Calculate customer growth by period with proper filtering
export function calculateCustomerGrowthByPeriod(customers: Customer[], year: string, period: string) {
  const now = new Date()
  let timeUnits = []
  let startDate = new Date()
  let endDate = new Date()

  // Define time units and date range based on period
  switch (period) {
    case "monthly":
      timeUnits = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      if (year === now.getFullYear().toString()) {
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = now
      } else {
        startDate = new Date(Number.parseInt(year), 0, 1)
        endDate = new Date(Number.parseInt(year), 11, 31, 23, 59, 59)
      }
      break
    case "quarterly":
      timeUnits = ["Q1", "Q2", "Q3", "Q4"]
      if (year === now.getFullYear().toString()) {
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = now
      } else {
        startDate = new Date(Number.parseInt(year), 0, 1)
        endDate = new Date(Number.parseInt(year), 11, 31, 23, 59, 59)
      }
      break
    case "yearly":
      timeUnits = ["2023", "2024", "2025"]
      startDate = new Date(Number.parseInt(year), 0, 1)
      endDate = year === now.getFullYear().toString() ? now : new Date(Number.parseInt(year), 11, 31, 23, 59, 59)
      break
    default:
      timeUnits = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      startDate = new Date(Number.parseInt(year), 0, 1)
      endDate = year === now.getFullYear().toString() ? now : new Date(Number.parseInt(year), 11, 31, 23, 59, 59)
  }

  // Filter customers within the date range
  const filteredCustomers = customers.filter((customer) => {
    const customerDate = new Date(customer.createdOn)
    return customerDate >= startDate && customerDate <= endDate
  })

  // Initialize period data
  const periodData = timeUnits.map((unit) => ({
    month: unit, // Using 'month' key for consistency with charts
    customers: 0,
    newCustomers: 0,
    customersWithMeters: 0,
    projectedNewCustomers: 0,
  }))

  // Count customers by time unit
  filteredCustomers.forEach((customer) => {
    const date = new Date(customer.createdOn)
    let unitIndex = 0

    switch (period) {
      case "monthly":
        unitIndex = date.getMonth()
        break
      case "quarterly":
        unitIndex = Math.floor(date.getMonth() / 3)
        break
      case "yearly":
        unitIndex = timeUnits.indexOf(date.getFullYear().toString())
        break
      default:
        unitIndex = date.getMonth()
    }

    if (unitIndex >= 0 && unitIndex < periodData.length) {
      periodData[unitIndex].newCustomers += 1

      // Check if customer has meters
      if (customer.getMeterDto && customer.getMeterDto.length > 0) {
        periodData[unitIndex].customersWithMeters += 1
      }
    }
  })

  // Calculate cumulative customers and projections
  let cumulativeCustomers = 0
  let cumulativeCustomersWithMeters = 0

  for (let i = 0; i < periodData.length; i++) {
    cumulativeCustomers += periodData[i].newCustomers
    cumulativeCustomersWithMeters += periodData[i].customersWithMeters

    periodData[i].customers = cumulativeCustomers
    periodData[i].customersWithMeters = cumulativeCustomersWithMeters

    // Calculate projection based on trend (simple linear projection)
    if (i >= 2) {
      const recentGrowth =
        (periodData[i].newCustomers + periodData[i - 1].newCustomers + periodData[i - 2].newCustomers) / 3
      periodData[i].projectedNewCustomers = Math.round(recentGrowth * 1.1) // 10% optimistic projection
    } else {
      periodData[i].projectedNewCustomers = periodData[i].newCustomers
    }
  }

  return periodData
}

// Process top customers data
export function processTopCustomers(customers: Customer[], transactions: Transaction[]) {
  // Map to store customer spending
  const customerSpending = new Map<
    number,
    {
      id: string
      name: string
      totalSpent: number
      transactions: number
      lastTransaction: string
    }
  >()

  // Process each customer
  customers.forEach((customer) => {
    if (customer.getMeterDto && customer.getMeterDto.length > 0) {
      // Initialize customer data
      customerSpending.set(customer.id, {
        id: customer.customerId,
        name: `${customer.firstName} ${customer.lastName}`,
        totalSpent: 0,
        transactions: 0,
        lastTransaction: "",
      })

      // Find transactions for each meter
      customer.getMeterDto.forEach((meter) => {
        const meterTransactions = transactions.filter((transaction) => {
          // Match transactions to meters (in a real scenario, this would use proper IDs)
          // Here we're using a simplified approach
          return transaction.transactionId.includes(meter.id.toString())
        })

        if (meterTransactions.length > 0) {
          const customerData = customerSpending.get(customer.id)
          if (customerData) {
            // Update total spent
            customerData.totalSpent += meterTransactions.reduce((sum, t) => sum + (t.total || 0), 0)

            // Update transaction count
            customerData.transactions += meterTransactions.length

            // Update last transaction date
            const lastTransaction = meterTransactions.reduce((latest, t) => {
              const currentDate = new Date(t.date)
              const latestDate = latest ? new Date(latest) : new Date(0)
              return currentDate > latestDate ? t.date : latest
            }, "")

            if (
              lastTransaction &&
              (!customerData.lastTransaction || new Date(lastTransaction) > new Date(customerData.lastTransaction))
            ) {
              customerData.lastTransaction = lastTransaction
            }
          }
        }
      })
    }
  })

  // Convert map to array and sort by total spent
  const topCustomersArray = Array.from(customerSpending.values())
    .filter((customer) => customer.totalSpent > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)

  return topCustomersArray
}

// Meter data processing functions
export function processMeterData(data: DashboardData) {
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

// Calculate meter efficiency
export function calculateMeterEfficiency(meters: Meter[]) {
  if (!meters || !meters.length) {
    return []
  }

  // Group meters by type (simplified approach)
  const meterTypes = ["Standard", "Smart", "Industrial", "Commercial", "Residential"]

  return meterTypes.map((type, index) => {
    // Filter meters by type (in a real scenario, this would use actual meter types)
    const typeMeters = meters.filter((_, i) => i % meterTypes.length === index)

    // Calculate efficiency (placeholder - would need actual efficiency data)
    const efficiency = 70 + Math.random() * 30

    return {
      meterType: type,
      efficiency,
      count: typeMeters.length || 1, // Ensure count is at least 1 to avoid chart errors
    }
  })
}

// Process consumption and cost data
export function processConsumptionAndCostData(meters: Meter[]) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Initialize monthly data
  const monthlyData = months.map((month) => ({
    month,
    consumption: 0,
    cost: 0,
  }))

  // Process each meter
  meters.forEach((meter) => {
    if (meter.getMeterUnitsDto && meter.getMeterUnitsDto.length > 0) {
      // Process meter units
      meter.getMeterUnitsDto.forEach((unit) => {
        const date = new Date(unit.timeValue)
        const monthIndex = date.getMonth()

        monthlyData[monthIndex].consumption += unit.consumptionValue || 0
        monthlyData[monthIndex].cost += unit.electricityCost || 0
      })
    }
  })

  return monthlyData
}

// Export data to CSV
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    console.error("No data to export")
    return
  }

  // Get headers from the first object
  const headers = Object.keys(data[0])

  // Create CSV content
  let csvContent = headers.join(",") + "\n"

  // Add data rows
  data.forEach((item) => {
    const row = headers
      .map((header) => {
        const value = item[header]
        // Handle strings with commas by wrapping in quotes
        return typeof value === "string" && value.includes(",") ? `"${value}"` : value
      })
      .join(",")
    csvContent += row + "\n"
  })

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
