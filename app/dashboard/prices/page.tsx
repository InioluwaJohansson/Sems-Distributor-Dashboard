"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Pencil, RefreshCcw, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import * as api from "@/components/apiUrl"
// Price data based on the provided JSON
const priceData = {
  data: {
    id: 1,
    itemName: "Defaults",
    rate: 270,
    taxes: 8,
    baseCharge: 3000,
  },
  message: "Data Retrieved!",
  status: true,
}

// Type definition for price
type Price = {
  id: number
  itemName: string
  rate: number
  taxes: number
  baseCharge: number
}

// Then, update the component to fetch prices and include update buttons
export default function PricesPage() {
  const router = useRouter()
  const [prices, setPrices] = useState<Price[]>([priceData.data])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch prices data
  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would fetch data from an API
        const response = await api.getPrices()
        setPrices(response.data)

        // Simulate API call
        // const data = await apiMethods.getPrices()
        await new Promise((resolve) => setTimeout(resolve, 1000))
        //setPrices([priceData.data])
      } catch (error) {
        console.error("Error fetching prices:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrices()
  }, [])

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch fresh data from the API
      const response = await api.getPrices()
      setPrices(response.data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      //setPrices([priceData.data])
    } catch (error) {
      console.error("Error refreshing prices:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePrice = (price: Price) => {
    router.push(`/dashboard/prices/update/${price.id}`)
  }

  // Format currency (Naira)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" />
            Prices
          </h1>
          <p className="text-muted-foreground">View energy unit pricing and rates</p>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Energy Pricing</CardTitle>
          <CardDescription>View and manage energy pricing</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Taxes</TableHead>
                  <TableHead>Base Charge</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  <TableRow key={prices.id}>
                    <TableCell className="font-medium">{prices.itemName}</TableCell>
                    <TableCell>{formatCurrency(prices.rate)}</TableCell>
                    <TableCell>{prices.taxes}%</TableCell>
                    <TableCell>{formatCurrency(prices.baseCharge)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleUpdatePrice(prices)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
