// We need to ensure date-fns is available
// If you don't have date-fns installed, you'll need to add it to your dependencies

// Define types for our data
export interface MeterReading {
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

export interface AggregatedData {
  date: string
  consumption: number
  cost: number
  power: number
  voltage: number
  current: number
  powerFactor: number
  count: number
}

// Filter data for the last N days
export function getLastNDaysData(data: MeterReading[], days: number): MeterReading[] {
  const now = new Date()
  const cutoffDate = new Date()
  cutoffDate.setDate(now.getDate() - days)

  return data.filter((reading) => {
    const readingDate = new Date(reading.timeValue)
    return readingDate >= cutoffDate
  })
}

// Group data by day
export function groupByDay(data: MeterReading[]): AggregatedData[] {
  const groupedData: { [key: string]: AggregatedData } = {}

  data.forEach((reading) => {
    const date = new Date(reading.timeValue)
    const dateKey = date.toISOString().split("T")[0] // YYYY-MM-DD format
    const displayDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

    if (!groupedData[dateKey]) {
      groupedData[dateKey] = {
        date: displayDate,
        consumption: 0,
        cost: 0,
        power: 0,
        voltage: 0,
        current: 0,
        powerFactor: 0,
        count: 0,
      }
    }

    // Sum consumption and cost
    groupedData[dateKey].consumption += reading.consumptionValue || 0
    groupedData[dateKey].cost += reading.electricityCost || 0

    // Sum for averaging power, voltage, current, powerFactor
    groupedData[dateKey].power += reading.powerValue || 0
    groupedData[dateKey].voltage += reading.voltageValue || 0
    groupedData[dateKey].current += reading.currentValue || 0
    groupedData[dateKey].powerFactor += reading.powerFactorValue || 0
    groupedData[dateKey].count++
  })

  // Calculate averages for power, voltage, current, and power factor
  const result = Object.entries(groupedData).map(([dateKey, group]) => ({
    ...group,
    power: group.count > 0 ? group.power / group.count : 0,
    voltage: group.count > 0 ? group.voltage / group.count : 0,
    current: group.count > 0 ? group.current / group.count : 0,
    powerFactor: group.count > 0 ? group.powerFactor / group.count : 0,
    sortKey: dateKey, // Keep the original date key for sorting
  }))

  // Sort by the original date key to maintain chronological order
  return result.sort((a, b) => a.sortKey.localeCompare(b.sortKey)).map(({ sortKey, ...rest }) => rest)
}

// Group data by hour (for daily view)
export function groupByHour(data: MeterReading[]): AggregatedData[] {
  const groupedData: { [key: string]: AggregatedData } = {}

  data.forEach((reading) => {
    const date = new Date(reading.timeValue)
    // Create a unique key that includes both date and hour for precise grouping
    const dateKey = date.toISOString().split("T")[0] // YYYY-MM-DD
    const hour = date.getHours()
    const hourKey = `${dateKey}-${hour.toString().padStart(2, "0")}`
    const displayHour = `${hour.toString().padStart(2, "0")}:00`

    if (!groupedData[hourKey]) {
      groupedData[hourKey] = {
        date: displayHour,
        consumption: 0,
        cost: 0,
        power: 0,
        voltage: 0,
        current: 0,
        powerFactor: 0,
        count: 0,
      }
    }

    // Sum consumption and cost
    groupedData[hourKey].consumption += reading.consumptionValue || 0
    groupedData[hourKey].cost += reading.electricityCost || 0

    // Sum for averaging power, voltage, current, powerFactor
    groupedData[hourKey].power += reading.powerValue || 0
    groupedData[hourKey].voltage += reading.voltageValue || 0
    groupedData[hourKey].current += reading.currentValue || 0
    groupedData[hourKey].powerFactor += reading.powerFactorValue || 0
    groupedData[hourKey].count++
  })

  // Calculate averages for power, voltage, current, and power factor
  const result = Object.values(groupedData).map((group) => ({
    ...group,
    power: group.count > 0 ? group.power / group.count : 0,
    voltage: group.count > 0 ? group.voltage / group.count : 0,
    current: group.count > 0 ? group.current / group.count : 0,
    powerFactor: group.count > 0 ? group.powerFactor / group.count : 0,
  }))

  // Sort by the original hour key to maintain chronological order
  return result.sort((a, b) => {
    const hourA = Number.parseInt(a.date.split(":")[0])
    const hourB = Number.parseInt(b.date.split(":")[0])
    return hourA - hourB
  })
}

// Group data by week
export function groupByWeek(data: MeterReading[]): AggregatedData[] {
  const groupedData: { [key: string]: AggregatedData } = {}

  data.forEach((reading) => {
    const date = new Date(reading.timeValue)
    // Get the start of the week (Monday)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const weekStart = new Date(date)
    weekStart.setDate(diff)
    const weekKey = `Week of ${weekStart.toISOString().split("T")[0]}`

    if (!groupedData[weekKey]) {
      groupedData[weekKey] = {
        date: weekKey,
        consumption: 0,
        cost: 0,
        power: 0,
        voltage: 0,
        current: 0,
        powerFactor: 0,
        count: 0,
      }
    }

    groupedData[weekKey].consumption += reading.consumptionValue
    groupedData[weekKey].cost += reading.electricityCost
    groupedData[weekKey].power += reading.powerValue
    groupedData[weekKey].voltage += reading.voltageValue
    groupedData[weekKey].current += reading.currentValue
    groupedData[weekKey].powerFactor += reading.powerFactorValue
    groupedData[weekKey].count++
  })

  // Calculate averages for power, voltage, current, and power factor
  Object.values(groupedData).forEach((group) => {
    if (group.count > 0) {
      group.power = group.power / group.count
      group.voltage = group.voltage / group.count
      group.current = group.current / group.count
      group.powerFactor = group.powerFactor / group.count
    }
  })

  return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date))
}

// Group data by month
export function groupByMonth(data: MeterReading[]): AggregatedData[] {
  const groupedData: { [key: string]: AggregatedData } = {}

  data.forEach((reading) => {
    const date = new Date(reading.timeValue)
    const monthKey = date.toISOString().substring(0, 7) // YYYY-MM format
    const monthName = date.toLocaleString("default", { month: "short", year: "numeric" })

    if (!groupedData[monthKey]) {
      groupedData[monthKey] = {
        date: monthName,
        consumption: 0,
        cost: 0,
        power: 0,
        voltage: 0,
        current: 0,
        powerFactor: 0,
        count: 0,
      }
    }

    // Sum consumption and cost
    groupedData[monthKey].consumption += reading.consumptionValue || 0
    groupedData[monthKey].cost += reading.electricityCost || 0

    // Sum for averaging power, voltage, current, powerFactor
    groupedData[monthKey].power += reading.powerValue || 0
    groupedData[monthKey].voltage += reading.voltageValue || 0
    groupedData[monthKey].current += reading.currentValue || 0
    groupedData[monthKey].powerFactor += reading.powerFactorValue || 0
    groupedData[monthKey].count++
  })

  // Calculate averages for power, voltage, current, and power factor
  const result = Object.entries(groupedData).map(([monthKey, group]) => ({
    ...group,
    power: group.count > 0 ? group.power / group.count : 0,
    voltage: group.count > 0 ? group.voltage / group.count : 0,
    current: group.count > 0 ? group.current / group.count : 0,
    powerFactor: group.count > 0 ? group.powerFactor / group.count : 0,
    sortKey: monthKey, // Keep the original month key for sorting
  }))

  // Sort by the original month key to maintain chronological order
  return result.sort((a, b) => a.sortKey.localeCompare(b.sortKey)).map(({ sortKey, ...rest }) => rest)
}

// Calculate total consumption for the last N days
export function calculateTotalConsumption(data: MeterReading[], days: number): number {
  const filteredData = getLastNDaysData(data, days)
  return filteredData.reduce((sum, reading) => sum + reading.consumptionValue, 0)
}

// Calculate average daily consumption
export function calculateAverageDailyConsumption(data: MeterReading[], days: number): number {
  const totalConsumption = calculateTotalConsumption(data, days)
  return totalConsumption / days
}

// Calculate total cost for the last N days
export function calculateTotalCost(data: MeterReading[], days: number): number {
  const filteredData = getLastNDaysData(data, days)
  return filteredData.reduce((sum, reading) => sum + reading.electricityCost, 0)
}

// Find peak usage time
export function findPeakUsageTime(data: MeterReading[]): string {
  if (data.length === 0) return "N/A"

  // Group data by hour
  const hourlyData: { [key: number]: { power: number; count: number } } = {}

  data.forEach((reading) => {
    const date = new Date(reading.timeValue)
    const hour = date.getHours()

    if (!hourlyData[hour]) {
      hourlyData[hour] = { power: 0, count: 0 }
    }

    hourlyData[hour].power += reading.powerValue
    hourlyData[hour].count++
  })

  // Calculate average power for each hour
  const hourlyAverages = Object.entries(hourlyData).map(([hour, data]) => ({
    hour: Number.parseInt(hour),
    avgPower: data.count > 0 ? data.power / data.count : 0,
  }))

  if (hourlyAverages.length === 0) return "N/A"

  // Find hour with highest average power
  const peakHour = hourlyAverages.reduce(
    (max, current) => (current.avgPower > max.avgPower ? current : max),
    hourlyAverages[0],
  )

  // Format the peak hour range
  const startHour = peakHour.hour
  const endHour = (startHour + 1) % 24

  return `${startHour}:00 - ${endHour}:00`
}

// Find lowest usage time
export function findLowestUsageTime(data: MeterReading[]): string {
  if (data.length === 0) return "N/A"

  // Group data by hour
  const hourlyData: { [key: number]: { power: number; count: number } } = {}

  data.forEach((reading) => {
    const date = new Date(reading.timeValue)
    const hour = date.getHours()

    if (!hourlyData[hour]) {
      hourlyData[hour] = { power: 0, count: 0 }
    }

    hourlyData[hour].power += reading.powerValue
    hourlyData[hour].count++
  })

  // Calculate average power for each hour
  const hourlyAverages = Object.entries(hourlyData)
    .map(([hour, data]) => ({
      hour: Number.parseInt(hour),
      avgPower: data.count > 0 ? data.power / data.count : 0,
    }))
    .filter((item) => item.avgPower > 0) // Filter out hours with zero power

  if (hourlyAverages.length === 0) return "N/A"

  // Find hour with lowest average power
  const lowestHour = hourlyAverages.reduce(
    (min, current) => (current.avgPower < min.avgPower ? current : min),
    hourlyAverages[0],
  )

  // Format the lowest hour range
  const startHour = lowestHour.hour
  const endHour = (startHour + 1) % 24

  return `${startHour}:00 - ${endHour}:00`
}

// Calculate efficiency rating
export function calculateEfficiencyRating(data: MeterReading[]): number {
  if (data.length === 0) return 0

  // 1. Power Factor Score (40% weight)
  // Ideal power factor is 1.0 (unity)
  const avgPowerFactor = data.reduce((sum, reading) => sum + (reading.powerFactorValue || 0), 0) / data.length
  const powerFactorScore = Math.min(avgPowerFactor / 1.0, 1.0) * 40

  // 2. Load Balance Factor (30% weight)
  // Calculate peak and off-peak loads
  const peakHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] // 9am to 8pm

  let peakLoad = 0
  let peakCount = 0
  let offPeakLoad = 0
  let offPeakCount = 0

  data.forEach((reading) => {
    const date = new Date(reading.timeValue)
    const hour = date.getHours()

    if (peakHours.includes(hour)) {
      peakLoad += reading.powerValue
      peakCount++
    } else {
      offPeakLoad += reading.powerValue
      offPeakCount++
    }
  })

  const avgPeakLoad = peakCount > 0 ? peakLoad / peakCount : 0
  const avgOffPeakLoad = offPeakCount > 0 ? offPeakLoad / offPeakCount : 0

  // Calculate load balance (1.0 is perfect balance)
  const totalLoad = avgPeakLoad + avgOffPeakLoad
  const loadBalance = totalLoad > 0 ? 1.0 - Math.abs(avgPeakLoad - avgOffPeakLoad) / totalLoad : 0

  const loadBalanceScore = loadBalance * 30

  // 3. Consumption Rate (30% weight)
  // For this, we'd need to know the total allocated units, but we don't have that in our dataset
  // So we'll use a placeholder value of 80% efficiency for this component
  const consumptionScore = 30 * 0.8

  // Calculate total efficiency rating
  const totalScore = powerFactorScore + loadBalanceScore + consumptionScore

  return Math.min(Math.max(totalScore, 0), 100)
}

// Convert data to CSV format
export function convertToCSV(data: MeterReading[]): string {
  // Define CSV headers
  const headers = [
    "ID",
    "Meter ID",
    "Time",
    "Power (W)",
    "Voltage (V)",
    "Current (A)",
    "Consumption (kWh)",
    "Cost",
    "Power Factor",
  ]

  // Create CSV content
  let csvContent = headers.join(",") + "\n"

  // Add data rows
  data.forEach((reading) => {
    const row = [
      reading.id,
      reading.meterId,
      reading.timeValue,
      reading.powerValue,
      reading.voltageValue,
      reading.currentValue,
      reading.consumptionValue,
      reading.electricityCost,
      reading.powerFactorValue,
    ]

    csvContent += row.join(",") + "\n"
  })

  return csvContent
}

// Download CSV file
export function downloadCSV(csvContent: string, filename: string): void {
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

// Filter data by timeframe
export function filterDataByTimeframe(data: MeterReading[], timeframe: string): MeterReading[] {
  const now = new Date()
  let startDate: Date

  switch (timeframe) {
    case "daily":
      startDate = new Date(now)
      startDate.setHours(0, 0, 0, 0)
      break
    case "weekly":
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
    case "monthly":
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 1)
      break
    case "yearly":
      startDate = new Date(now)
      startDate.setFullYear(now.getFullYear() - 1)
      break
    case "6-month":
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 6)
      break
    default:
      startDate = new Date(now)
      startDate.setHours(0, 0, 0, 0)
  }

  return data.filter((reading) => {
    const readingDate = new Date(reading.timeValue)
    return readingDate >= startDate
  })
}

// Get data for report
export function getReportData(data: MeterReading[], reportType: string): MeterReading[] {
  return filterDataByTimeframe(data, reportType)
}
