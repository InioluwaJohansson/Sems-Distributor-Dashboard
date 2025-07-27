// Shared energy data utilities for dashboard and energy usage page
import * as api from "@/components/apiUrl"
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

export interface EnergyChartData {
  time: string
  consumption: number
  cost: number
  power: number
}

// Sample energy data - this would come from API in production
export const sampleEnergyData: MeterReading[] = [
  {
    id: 1,
    meterId: 1,
    powerValue: 460,
    voltageValue: 230,
    currentValue: 2,
    consumptionValue: 0.0012777777777777779,
    electricityCost: 0.34500000000000003,
    powerFactorValue: 2,
    timeValue: "2025-01-29T12:58:44",
  },
  {
    id: 2,
    meterId: 1,
    powerValue: 560,
    voltageValue: 234,
    currentValue: 2,
    consumptionValue: 0.0015555555555555557,
    electricityCost: 0.42000000000000004,
    powerFactorValue: 2,
    timeValue: "2025-01-29T13:12:44",
  },
  {
    id: 3,
    meterId: 1,
    powerValue: 560,
    voltageValue: 234,
    currentValue: 2,
    consumptionValue: 0.0015555555555555557,
    electricityCost: 0.42000000000000004,
    powerFactorValue: 2,
    timeValue: "2025-01-29T13:13:44",
  },
  {
    id: 4,
    meterId: 1,
    powerValue: 420,
    voltageValue: 228,
    currentValue: 1.8,
    consumptionValue: 0.0011666666666666667,
    electricityCost: 0.315,
    powerFactorValue: 1.8,
    timeValue: "2025-01-29T14:00:00",
  },
  {
    id: 5,
    meterId: 1,
    powerValue: 380,
    voltageValue: 225,
    currentValue: 1.7,
    consumptionValue: 0.0010555555555555556,
    electricityCost: 0.285,
    powerFactorValue: 1.7,
    timeValue: "2025-01-29T15:30:00",
  },
  {
    id: 6,
    meterId: 1,
    powerValue: 520,
    voltageValue: 232,
    currentValue: 2.2,
    consumptionValue: 0.0014444444444444444,
    electricityCost: 0.39,
    powerFactorValue: 2.2,
    timeValue: "2025-01-29T16:45:00",
  },
  {
    id: 7,
    meterId: 1,
    powerValue: 480,
    voltageValue: 230,
    currentValue: 2.1,
    consumptionValue: 0.0013333333333333333,
    electricityCost: 0.36,
    powerFactorValue: 2.1,
    timeValue: "2025-01-29T18:20:00",
  },
  {
    id: 8,
    meterId: 1,
    powerValue: 350,
    voltageValue: 220,
    currentValue: 1.6,
    consumptionValue: 0.0009722222222222222,
    electricityCost: 0.262,
    powerFactorValue: 1.6,
    timeValue: "2025-01-29T20:10:00",
  },
  {
    id: 9,
    meterId: 1,
    powerValue: 300,
    voltageValue: 218,
    currentValue: 1.4,
    consumptionValue: 0.0008333333333333334,
    electricityCost: 0.225,
    powerFactorValue: 1.4,
    timeValue: "2025-01-29T22:30:00",
  },
  {
    id: 10,
    meterId: 1,
    powerValue: 250,
    voltageValue: 215,
    currentValue: 1.2,
    consumptionValue: 0.0006944444444444445,
    electricityCost: 0.187,
    powerFactorValue: 1.2,
    timeValue: "2025-01-30T01:15:00",
  },
]

// Async method to fetch energy data from API
export async function fetchEnergyDataFromAPI(): Promise<MeterReading[]> {
  try {
    // Replace with your actual API endpoint
    const response = await api.getAllMeterUnits()

    return response.data as MeterReading[]
  } catch (error) {
    console.error("Error fetching energy data from API:", error)
    // Fallback to sample data if API fails
    return sampleEnergyData
  }
}

// Get energy data for the last 24 hours
export function getLast24HoursEnergyData(): MeterReading[] {
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  return sampleEnergyData.filter((reading) => {
    try {
      const readingDate = new Date(reading.timeValue)
      return !isNaN(readingDate.getTime()) && readingDate >= twentyFourHoursAgo && readingDate <= now
    } catch {
      return false
    }
  })
}

// Async method to get energy data for the last 24 hours from API
export async function getLast24HoursEnergyDataFromAPI(): Promise<MeterReading[]> {
  try {
    const data = await fetchEnergyDataFromAPI()
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    return data.filter((reading) => {
      try {
        const readingDate = new Date(reading.timeValue)
        return !isNaN(readingDate.getTime()) && readingDate >= twentyFourHoursAgo && readingDate <= now
      } catch {
        return false
      }
    })
  } catch (error) {
    console.error("Error fetching last 24 hours energy data:", error)
    return getLast24HoursEnergyData()
  }
}

// Process energy data for chart display
export function processEnergyDataForChart(data: MeterReading[]): EnergyChartData[] {
  return data.map((reading) => ({
    time: new Date(reading.timeValue).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    consumption: reading.consumptionValue,
    cost: reading.electricityCost,
    power: reading.powerValue,
  }))
}

// Get hourly aggregated data for dashboard
export function getHourlyAggregatedData(): EnergyChartData[] {
  const last24Hours = getLast24HoursEnergyData()
  const hourlyData: { [key: string]: { consumption: number; cost: number; power: number; count: number } } = {}

  // Group by hour
  last24Hours.forEach((reading) => {
    try {
      const hour = new Date(reading.timeValue).getHours()
      const hourKey = `${hour.toString().padStart(2, "0")}:00`

      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = { consumption: 0, cost: 0, power: 0, count: 0 }
      }

      hourlyData[hourKey].consumption += reading.consumptionValue || 0
      hourlyData[hourKey].cost += reading.electricityCost || 0
      hourlyData[hourKey].power += reading.powerValue || 0
      hourlyData[hourKey].count += 1
    } catch (error) {
      console.warn("Error processing reading:", reading, error)
    }
  })

  // Convert to array and calculate averages
  return Object.entries(hourlyData)
    .map(([time, data]) => ({
      time,
      consumption: data.consumption,
      cost: data.cost,
      power: data.count > 0 ? data.power / data.count : 0,
    }))
    .sort((a, b) => a.time.localeCompare(b.time))
}

// Async method to get hourly aggregated data from API
export async function getHourlyAggregatedDataFromAPI(): Promise<EnergyChartData[]> {
  try {
    const last24Hours = await getLast24HoursEnergyDataFromAPI()
    const hourlyData: { [key: string]: { consumption: number; cost: number; power: number; count: number } } = {}

    // Group by hour
    last24Hours.forEach((reading) => {
      try {
        const hour = new Date(reading.timeValue).getHours()
        const hourKey = `${hour.toString().padStart(2, "0")}:00`

        if (!hourlyData[hourKey]) {
          hourlyData[hourKey] = { consumption: 0, cost: 0, power: 0, count: 0 }
        }

        hourlyData[hourKey].consumption += reading.consumptionValue || 0
        hourlyData[hourKey].cost += reading.electricityCost || 0
        hourlyData[hourKey].power += reading.powerValue || 0
        hourlyData[hourKey].count += 1
      } catch (error) {
        console.warn("Error processing reading:", reading, error)
      }
    })

    // Convert to array and calculate averages
    return Object.entries(hourlyData)
      .map(([time, data]) => ({
        time,
        consumption: data.consumption,
        cost: data.cost,
        power: data.count > 0 ? data.power / data.count : 0,
      }))
      .sort((a, b) => a.time.localeCompare(b.time))
  } catch (error) {
    console.error("Error fetching hourly aggregated data from API:", error)
    return getHourlyAggregatedData()
  }
}

// Calculate total consumption for last 24 hours
export function getTotalConsumptionLast24Hours(): number {
  const data = getLast24HoursEnergyData()
  return data.reduce((sum, reading) => sum + reading.consumptionValue, 0)
}

// Calculate total cost for last 24 hours
export function getTotalCostLast24Hours(): number {
  const data = getLast24HoursEnergyData()
  return data.reduce((sum, reading) => sum + reading.electricityCost, 0)
}

// Calculate average power for last 24 hours
export function getAveragePowerLast24Hours(): number {
  const data = getLast24HoursEnergyData()
  if (data.length === 0) return 0
  return data.reduce((sum, reading) => sum + reading.powerValue, 0) / data.length
}

// Async methods for API data
export async function getTotalConsumptionLast24HoursFromAPI(): Promise<number> {
  try {
    const data = await getLast24HoursEnergyDataFromAPI()
    return data.reduce((sum, reading) => sum + reading.consumptionValue, 0)
  } catch (error) {
    console.error("Error fetching total consumption from API:", error)
    return getTotalConsumptionLast24Hours()
  }
}

export async function getTotalCostLast24HoursFromAPI(): Promise<number> {
  try {
    const data = await getLast24HoursEnergyDataFromAPI()
    return data.reduce((sum, reading) => sum + reading.electricityCost, 0)
  } catch (error) {
    console.error("Error fetching total cost from API:", error)
    return getTotalCostLast24Hours()
  }
}

export async function getAveragePowerLast24HoursFromAPI(): Promise<number> {
  try {
    const data = await getLast24HoursEnergyDataFromAPI()
    if (data.length === 0) return 0
    return data.reduce((sum, reading) => sum + reading.powerValue, 0) / data.length
  } catch (error) {
    console.error("Error fetching average power from API:", error)
    return getAveragePowerLast24Hours()
  }
}
