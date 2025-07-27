import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import "jspdf-autotable"
import type { DashboardData } from "./reports-data-utils"

// Extend the jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

// Generate a comprehensive report PDF with charts
export function generateComprehensiveReport(data: DashboardData, period: string, year: string) {
  const doc = new jsPDF()
  let currentY = 20

  // Add title
  doc.setFontSize(20)
  doc.setTextColor(41, 128, 185)
  doc.text("SEMS Comprehensive Report", 14, currentY)
  currentY += 15

  // Add report metadata
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, currentY)
  currentY += 5
  doc.text(`Period: ${period}`, 14, currentY)
  currentY += 5
  doc.text(`Year: ${year}`, 14, currentY)
  currentY += 15

  // Add revenue section with charts
  currentY = addRevenueSection(doc, data, year, period, currentY)

  // Check if we need a new page
  if (currentY > 200) {
    doc.addPage()
    currentY = 20
  }

  // Add customer section with charts
  currentY = addCustomerSection(doc, data, year, period, currentY)

  // Check if we need a new page
  if (currentY > 200) {
    doc.addPage()
    currentY = 20
  }

  // Add meter section with charts
  currentY = addMeterSection(doc, data, currentY)

  // Add footer to all pages
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text("SEMS - Smart Energy Management System", 14, doc.internal.pageSize.height - 10)
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10)
  }

  return doc
}

// Add revenue section with bar chart visualization
function addRevenueSection(doc: jsPDF, data: DashboardData, year: string, period: string, startY: number) {
  let currentY = startY

  // Add section title
  doc.setFontSize(16)
  doc.setTextColor(41, 128, 185)
  doc.text("Revenue Analysis", 14, currentY)
  currentY += 10

  // Calculate revenue metrics
  const transactions = data.dashboardDto.getTransactionDto || []
  const filteredTransactions = filterTransactionsByPeriod(transactions, year, period)
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t.total || 0), 0)
  const totalTransactions = filteredTransactions.length
  const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

  // Add metrics summary
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 14, currentY)
  currentY += 7
  doc.text(`Total Transactions: ${totalTransactions.toLocaleString()}`, 14, currentY)
  currentY += 7
  doc.text(`Average Transaction Value: ${formatCurrency(avgTransactionValue)}`, 14, currentY)
  currentY += 15

  // Create simple bar chart representation
  if (filteredTransactions.length > 0) {
    doc.setFontSize(12)
    doc.text("Revenue Distribution:", 14, currentY)
    currentY += 10

    // Group transactions by month for visualization
    const monthlyData = groupTransactionsByMonth(filteredTransactions)
    const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue))

    monthlyData.slice(0, 6).forEach((month, index) => {
      const barWidth = (month.revenue / maxRevenue) * 100
      const yPos = currentY + index * 8

      // Draw bar
      doc.setFillColor(41, 128, 185)
      doc.rect(50, yPos - 3, barWidth, 5, "F")

      // Add label
      doc.setFontSize(8)
      doc.text(`${month.month}: ${formatCurrency(month.revenue)}`, 14, yPos)
    })
    currentY += Math.min(monthlyData.length, 6) * 8 + 10
  }

  // Add transactions table
  if (filteredTransactions.length > 0) {
    const tableData = filteredTransactions
      .slice(0, 10)
      .map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.transactionId.substring(0, 12) + "...",
        formatCurrency(t.rate || 0),
        formatCurrency(t.baseCharge || 0),
        formatCurrency(t.taxes || 0),
        formatCurrency(t.total || 0),
      ])
    autoTable(doc,{
      startY: currentY,
      head: [["Date", "Transaction ID", "Rate", "Base Charge", "Taxes", "Total"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 8 },
      styles: { fontSize: 7 },
      margin: { left: 14, right: 14 },
    })

    currentY = (doc as any).lastAutoTable?.finalY + 15 || currentY + 50
  }

  return currentY
}

// Add customer section with pie chart visualization
function addCustomerSection(doc: jsPDF, data: DashboardData, year: string, period: string, startY: number) {
  let currentY = startY

  // Add section title
  doc.setFontSize(16)
  doc.setTextColor(41, 128, 185)
  doc.text("Customer Analysis", 14, currentY)
  currentY += 10

  // Calculate customer metrics
  const customers = data.dashboardDto.getCustomerDto || []
  const filteredCustomers = filterCustomersByPeriod(customers, year, period)
  const totalCustomers = customers.length
  const newCustomers = filteredCustomers.length
  const customersWithMeters = customers.filter((c) => c.getMeterDto && c.getMeterDto.length > 0).length
  const customersWithoutMeters = totalCustomers - customersWithMeters

  // Add metrics
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text(`Total Customers: ${totalCustomers.toLocaleString()}`, 14, currentY)
  currentY += 7
  doc.text(`New Customers (${period} ${year}): ${newCustomers.toLocaleString()}`, 14, currentY)
  currentY += 7
  doc.text(`Customers with Meters: ${customersWithMeters.toLocaleString()}`, 14, currentY)
  currentY += 7
  doc.text(`Customers without Meters: ${customersWithoutMeters.toLocaleString()}`, 14, currentY)
  currentY += 15

  // Create simple pie chart representation
  doc.setFontSize(12)
  doc.text("Customer Distribution:", 14, currentY)
  currentY += 10

  // Draw simple pie chart representation as bars
  const pieData = [
    { label: "With Meters", value: customersWithMeters, color: [34, 197, 94] },
    { label: "Without Meters", value: customersWithoutMeters, color: [245, 158, 11] },
    { label: "New Customers", value: newCustomers, color: [59, 130, 246] },
  ]

  const maxValue = Math.max(...pieData.map((d) => d.value))
  pieData.forEach((item, index) => {
    const barWidth = maxValue > 0 ? (item.value / maxValue) * 80 : 0
    const yPos = currentY + index * 10

    // Draw bar
    doc.setFillColor(item.color[0], item.color[1], item.color[2])
    doc.rect(60, yPos - 3, barWidth, 6, "F")

    // Add label
    doc.setFontSize(9)
    doc.text(`${item.label}: ${item.value.toLocaleString()}`, 14, yPos)
  })
  currentY += pieData.length * 10 + 15

  // Add customers table
  if (customers.length > 0) {
    const tableData = customers
      .slice(0, 10)
      .map((c) => [
        c.customerId,
        `${c.firstName} ${c.lastName}`,
        c.email,
        (c.getMeterDto?.length || 0).toString(),
        new Date(c.createdOn).toLocaleDateString(),
      ])

    autoTable(doc, {
      startY: currentY,
      head: [["Customer ID", "Name", "Email", "Meters", "Created On"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 8 },
      styles: { fontSize: 7 },
      margin: { left: 14, right: 14 },
    })

    currentY = (doc as any).lastAutoTable?.finalY + 15 || currentY + 50
  }

  return currentY
}

// Add meter section with bar chart visualization
function addMeterSection(doc: jsPDF, data: DashboardData, startY: number) {
  let currentY = startY

  // Add section title
  doc.setFontSize(16)
  doc.setTextColor(41, 128, 185)
  doc.text("Meter Analysis", 14, currentY)
  currentY += 10

  // Calculate meter metrics
  const meters = data.dashboardDto.getMeterDto || []
  const activeMeters = meters.filter((m) => m.isActive).length
  const inactiveMeters = meters.filter((m) => !m.isActive).length
  const unattachedMeters = meters.filter((m) => m.customerName === "Meter not yet attached").length
  const totalMeters = meters.length

  // Add metrics
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text(`Total Meters: ${totalMeters.toLocaleString()}`, 14, currentY)
  currentY += 7
  doc.text(`Active Meters: ${activeMeters.toLocaleString()}`, 14, currentY)
  currentY += 7
  doc.text(`Inactive Meters: ${inactiveMeters.toLocaleString()}`, 14, currentY)
  currentY += 7
  doc.text(`Unattached Meters: ${unattachedMeters.toLocaleString()}`, 14, currentY)
  currentY += 15

  // Create meter status bar chart
  doc.setFontSize(12)
  doc.text("Meter Status Distribution:", 14, currentY)
  currentY += 10

  const meterData = [
    { label: "Active", value: activeMeters, color: [34, 197, 94] },
    { label: "Inactive", value: inactiveMeters, color: [245, 158, 11] },
    { label: "Unattached", value: unattachedMeters, color: [239, 68, 68] },
  ]

  const maxMeterValue = Math.max(...meterData.map((d) => d.value))
  meterData.forEach((item, index) => {
    const barWidth = maxMeterValue > 0 ? (item.value / maxMeterValue) * 80 : 0
    const yPos = currentY + index * 10

    // Draw bar
    doc.setFillColor(item.color[0], item.color[1], item.color[2])
    doc.rect(60, yPos - 3, barWidth, 6, "F")

    // Add label
    doc.setFontSize(9)
    doc.text(`${item.label}: ${item.value.toLocaleString()}`, 14, yPos)
  })
  currentY += meterData.length * 10 + 15

  // Add meters table
  if (meters.length > 0) {
    const tableData = meters
      .slice(0, 10)
      .map((m) => [
        m.meterId,
        m.customerName.length > 20 ? m.customerName.substring(0, 20) + "..." : m.customerName,
        m.totalUnits.toString(),
        m.consumedUnits.toFixed(2),
        m.isActive ? "Active" : "Inactive",
        new Date(m.dateCreated).toLocaleDateString(),
      ])

    autoTable(doc, {
      startY: currentY,
      head: [["Meter ID", "Customer", "Total Units", "Consumed Units", "Status", "Created On"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 8 },
      styles: { fontSize: 7 },
      margin: { left: 14, right: 14 },
    })

    currentY = (doc as any).lastAutoTable?.finalY + 15 || currentY + 50
  }

  return currentY
}

// Helper functions for filtering data by period
function filterTransactionsByPeriod(transactions: any[], year: string, period: string) {
  const now = new Date()
  let startDate = new Date()

  switch (period) {
    case "monthly":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case "quarterly":
      const currentQuarter = Math.floor(now.getMonth() / 3)
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1)
      break
    case "yearly":
      startDate = new Date(Number.parseInt(year), 0, 1)
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  return transactions.filter((t) => {
    const transactionDate = new Date(t.date)
    return transactionDate >= startDate && transactionDate <= now && transactionDate.getFullYear().toString() === year
  })
}

function filterCustomersByPeriod(customers: any[], year: string, period: string) {
  const now = new Date()
  let startDate = new Date()

  switch (period) {
    case "monthly":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case "quarterly":
      const currentQuarter = Math.floor(now.getMonth() / 3)
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1)
      break
    case "yearly":
      startDate = new Date(Number.parseInt(year), 0, 1)
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  return customers.filter((c) => {
    const customerDate = new Date(c.createdOn)
    return customerDate >= startDate && customerDate <= now && customerDate.getFullYear().toString() === year
  })
}

// Group transactions by month for chart representation
function groupTransactionsByMonth(transactions: any[]) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthlyData = months.map((month) => ({ month, revenue: 0, transactions: 0 }))

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date)
    const monthIndex = date.getMonth()
    monthlyData[monthIndex].revenue += transaction.total || 0
    monthlyData[monthIndex].transactions += 1
  })

  return monthlyData.filter((m) => m.revenue > 0)
}

// Format currency
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
