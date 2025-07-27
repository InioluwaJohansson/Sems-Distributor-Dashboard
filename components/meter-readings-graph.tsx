"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface MeterReadingsGraphProps {
  title: string
  description?: string
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string
      borderColor?: string
      borderWidth?: number
    }[]
  }
}

export function MeterReadingsGraph({ title, description, data }: MeterReadingsGraphProps) {
  const [chartData, setChartData] = useState(data)
  const [chartKey, setChartKey] = useState(Date.now())

  // Enhanced dataset with proper line chart styling
  useEffect(() => {
    if (data && data.datasets) {
      const enhancedDatasets = data.datasets.map((dataset, index) => {
        // Generate colors if not provided
        const colors = [
          { border: "rgb(53, 162, 235)", background: "rgba(53, 162, 235, 0.5)" },
          { border: "rgb(255, 99, 132)", background: "rgba(255, 99, 132, 0.5)" },
          { border: "rgb(75, 192, 192)", background: "rgba(75, 192, 192, 0.5)" },
          { border: "rgb(255, 159, 64)", background: "rgba(255, 159, 64, 0.5)" },
        ]

        const colorIndex = index % colors.length

        return {
          ...dataset,
          borderColor: dataset.borderColor || colors[colorIndex].border,
          backgroundColor: dataset.backgroundColor || colors[colorIndex].background,
          borderWidth: dataset.borderWidth || 2,
          tension: 0.3,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 5,
        }
      })

      setChartData({
        labels: data.labels,
        datasets: enhancedDatasets,
      })

      // Force re-render of chart when data changes
      setChartKey(Date.now())
    }
  }, [data])

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    elements: {
      line: {
        tension: 0.3,
      },
    },
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {chartData.datasets.length > 0 && chartData.labels.length > 0 ? (
            <Line key={chartKey} data={chartData} options={options} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export async function fetchMeterReadings(meterId: number) {
  // This is a placeholder, replace with actual implementation if needed
  return []
}
