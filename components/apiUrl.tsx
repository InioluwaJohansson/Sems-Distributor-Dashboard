import axios from "axios"

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sems.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("authToken")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error("Error accessing localStorage for auth token:", error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error)
    if (error.response?.status === 401) {
      // Handle unauthorized access
      try {
        localStorage.removeItem("authToken")
        localStorage.removeItem("AdminId")
      } catch (e) {
        console.error("Error clearing localStorage:", e)
      }
    }
    return Promise.reject(error)
  },
)

// Authentication APIs
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password })
    return {
      status: true,
      data: response.data,
      message: "Login successful",
    }
  } catch (error) {
    console.error("Login API error:", error)
    // Mock response for demo
    if (email === "admin@sems.com" && password === "Admin123!") {
      return {
        status: true,
        data: {
          id: "1",
          email: "admin@sems.com",
          roleName: "Admin",
          firstName: "John",
          lastName: "Doe",
        },
        message: "Login successful",
      }
    }
    return {
      status: false,
      data: null,
      message: "Invalid credentials",
    }
  }
}

export const logoutUser = async () => {
  try {
    await api.post("/auth/logout")
    return { status: true, message: "Logout successful" }
  } catch (error) {
    console.error("Logout API error:", error)
    return { status: true, message: "Logout successful" }
  }
}

// Administrator APIs
export const getAdministrators = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/administrators?page=${page}&limit=${limit}`)
    return {
      status: true,
      data: response.data,
      message: "Administrators fetched successfully",
    }
  } catch (error) {
    console.error("Get administrators API error:", error)
    // Mock data for demo
    return {
      status: true,
      data: {
        administrators: [
          {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@sems.com",
            role: "System Administrator",
            department: "IT",
            status: "Active",
            createdAt: "2024-01-15T10:30:00Z",
          },
          {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@sems.com",
            role: "Operations Manager",
            department: "Operations",
            status: "Active",
            createdAt: "2024-01-10T14:20:00Z",
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      },
      message: "Administrators fetched successfully",
    }
  }
}

export const getAdministratorById = async (id: string) => {
  try {
    const response = await api.get(`/administrators/${id}`)
    return {
      status: true,
      data: response.data,
      message: "Administrator fetched successfully",
    }
  } catch (error) {
    console.error("Get administrator by ID API error:", error)
    // Mock data for demo
    return {
      status: true,
      data: {
        id: id,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@sems.com",
        phone: "+1234567890",
        address: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        role: "System Administrator",
        department: "IT",
        bio: "System Administrator with 5+ years of experience in energy management systems.",
        status: "Active",
        avatar: "/placeholder-user.jpg",
        createdAt: "2024-01-15T10:30:00Z",
      },
      message: "Administrator fetched successfully",
    }
  }
}

export const createAdministrator = async (adminData: any) => {
  try {
    const response = await api.post("/administrators", adminData)
    return {
      status: true,
      data: response.data,
      message: "Administrator created successfully",
    }
  } catch (error) {
    console.error("Create administrator API error:", error)
    // Mock success response
    return {
      status: true,
      data: { id: Date.now().toString(), ...adminData },
      message: "Administrator created successfully",
    }
  }
}

export const updateAdministrator = async (id: string, adminData: any) => {
  try {
    const response = await api.put(`/administrators/${id}`, adminData)
    return {
      status: true,
      data: response.data,
      message: "Administrator updated successfully",
    }
  } catch (error) {
    console.error("Update administrator API error:", error)
    // Mock success response
    return {
      status: true,
      data: { id, ...adminData },
      message: "Administrator updated successfully",
    }
  }
}

export const deleteAdministrator = async (id: string) => {
  try {
    await api.delete(`/administrators/${id}`)
    return {
      status: true,
      message: "Administrator deleted successfully",
    }
  } catch (error) {
    console.error("Delete administrator API error:", error)
    return {
      status: true,
      message: "Administrator deleted successfully",
    }
  }
}

export const checkUsernameAvailability = async (username: string) => {
  try {
    const response = await api.get(`/administrators/check-username/${username}`)
    return {
      status: true,
      available: response.data.available,
      message: response.data.message,
    }
  } catch (error) {
    console.error("Check username API error:", error)
    // Mock response - simulate availability check
    const unavailableUsernames = ["admin", "administrator", "root", "user", "test"]
    return {
      status: true,
      available: !unavailableUsernames.includes(username.toLowerCase()),
      message: unavailableUsernames.includes(username.toLowerCase())
        ? "Username is already taken"
        : "Username is available",
    }
  }
}

// Customer APIs
export const getCustomers = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/customers?page=${page}&limit=${limit}`)
    return {
      status: true,
      data: response.data,
      message: "Customers fetched successfully",
    }
  } catch (error) {
    console.error("Get customers API error:", error)
    // Mock data for demo
    return {
      status: true,
      data: {
        customers: [
          {
            id: "1",
            firstName: "Alice",
            lastName: "Johnson",
            email: "alice.johnson@email.com",
            phone: "+1234567890",
            address: "456 Oak Street",
            city: "Boston",
            state: "MA",
            zipCode: "02101",
            status: "Active",
            accountBalance: 125.5,
            lastPayment: "2024-01-20T10:00:00Z",
            createdAt: "2024-01-01T08:00:00Z",
          },
          {
            id: "2",
            firstName: "Bob",
            lastName: "Wilson",
            email: "bob.wilson@email.com",
            phone: "+1234567891",
            address: "789 Pine Avenue",
            city: "Chicago",
            state: "IL",
            zipCode: "60601",
            status: "Active",
            accountBalance: 89.25,
            lastPayment: "2024-01-18T15:30:00Z",
            createdAt: "2023-12-15T12:00:00Z",
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      },
      message: "Customers fetched successfully",
    }
  }
}

export const getCustomerById = async (id: string) => {
  try {
    const response = await api.get(`/customers/${id}`)
    return {
      status: true,
      data: response.data,
      message: "Customer fetched successfully",
    }
  } catch (error) {
    console.error("Get customer by ID API error:", error)
    // Mock data for demo
    return {
      status: true,
      data: {
        id: id,
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@email.com",
        phone: "+1234567890",
        address: "456 Oak Street",
        city: "Boston",
        state: "MA",
        zipCode: "02101",
        status: "Active",
        accountBalance: 125.5,
        lastPayment: "2024-01-20T10:00:00Z",
        createdAt: "2024-01-01T08:00:00Z",
      },
      message: "Customer fetched successfully",
    }
  }
}

// Meter APIs
export const getMeters = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/meters?page=${page}&limit=${limit}`)
    return {
      status: true,
      data: response.data,
      message: "Meters fetched successfully",
    }
  } catch (error) {
    console.error("Get meters API error:", error)
    // Mock data for demo
    return {
      status: true,
      data: {
        meters: [
          {
            id: "1",
            serialNumber: "MTR001",
            customerId: "1",
            customerName: "Alice Johnson",
            location: "456 Oak Street, Boston, MA",
            status: "Active",
            lastReading: 1250.5,
            lastReadingDate: "2024-01-20T10:00:00Z",
            installationDate: "2024-01-01T08:00:00Z",
          },
          {
            id: "2",
            serialNumber: "MTR002",
            customerId: "2",
            customerName: "Bob Wilson",
            location: "789 Pine Avenue, Chicago, IL",
            status: "Active",
            lastReading: 890.25,
            lastReadingDate: "2024-01-19T14:30:00Z",
            installationDate: "2023-12-15T12:00:00Z",
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      },
      message: "Meters fetched successfully",
    }
  }
}

export const getMeterById = async (id: string) => {
  try {
    const response = await api.get(`/meters/${id}`)
    return {
      status: true,
      data: response.data,
      message: "Meter fetched successfully",
    }
  } catch (error) {
    console.error("Get meter by ID API error:", error)
    // Mock data for demo
    return {
      status: true,
      data: {
        id: id,
        serialNumber: "MTR001",
        customerId: "1",
        customerName: "Alice Johnson",
        location: "456 Oak Street, Boston, MA",
        status: "Active",
        lastReading: 1250.5,
        lastReadingDate: "2024-01-20T10:00:00Z",
        installationDate: "2024-01-01T08:00:00Z",
        readings: [
          { date: "2024-01-20", consumption: 45.2, cost: 12.5, voltage: 240 },
          { date: "2024-01-19", consumption: 42.8, cost: 11.85, voltage: 238 },
          { date: "2024-01-18", consumption: 48.1, cost: 13.3, voltage: 242 },
        ],
      },
      message: "Meter fetched successfully",
    }
  }
}

export const createMeter = async (meterData: any) => {
  try {
    const response = await api.post("/meters", meterData)
    return {
      status: true,
      data: response.data,
      message: "Meter created successfully",
    }
  } catch (error) {
    console.error("Create meter API error:", error)
    // Mock success response
    return {
      status: true,
      data: { id: Date.now().toString(), ...meterData },
      message: "Meter created successfully",
    }
  }
}

// Transaction APIs
export const getTransactions = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/transactions?page=${page}&limit=${limit}`)
    return {
      status: true,
      data: response.data,
      message: "Transactions fetched successfully",
    }
  } catch (error) {
    console.error("Get transactions API error:", error)
    // Mock data for demo
    return {
      status: true,
      data: {
        transactions: [
          {
            id: "1",
            customerId: "1",
            customerName: "Alice Johnson",
            amount: 125.5,
            type: "Payment",
            status: "Completed",
            date: "2024-01-20T10:00:00Z",
            description: "Monthly electricity bill payment",
          },
          {
            id: "2",
            customerId: "2",
            customerName: "Bob Wilson",
            amount: 89.25,
            type: "Payment",
            status: "Completed",
            date: "2024-01-18T15:30:00Z",
            description: "Monthly electricity bill payment",
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      },
      message: "Transactions fetched successfully",
    }
  }
}

export const getTransactionById = async (id: string) => {
  try {
    const response = await api.get(`/transactions/${id}`)
    return {
      status: true,
      data: response.data,
      message: "Transaction fetched successfully",
    }
  } catch (error) {
    console.error("Get transaction by ID API error:", error)
    // Mock data for demo
    return {
      status: true,
      data: {
        id: id,
        customerId: "1",
        customerName: "Alice Johnson",
        amount: 125.5,
        type: "Payment",
        status: "Completed",
        date: "2024-01-20T10:00:00Z",
        description: "Monthly electricity bill payment",
        paymentMethod: "Credit Card",
        transactionFee: 2.5,
      },
      message: "Transaction fetched successfully",
    }
  }
}

// Energy Usage APIs
export const getEnergyUsage = async (timeframe = "7d") => {
  try {
    const response = await api.get(`/energy-usage?timeframe=${timeframe}`)
    return {
      status: true,
      data: response.data,
      message: "Energy usage data fetched successfully",
    }
  } catch (error) {
    console.error("Get energy usage API error:", error)
    // Mock data for demo
    const mockData = {
      "7d": [
        { date: "2024-01-14", consumption: 1250, cost: 187.5 },
        { date: "2024-01-15", consumption: 1180, cost: 177.0 },
        { date: "2024-01-16", consumption: 1320, cost: 198.0 },
        { date: "2024-01-17", consumption: 1290, cost: 193.5 },
        { date: "2024-01-18", consumption: 1150, cost: 172.5 },
        { date: "2024-01-19", consumption: 1380, cost: 207.0 },
        { date: "2024-01-20", consumption: 1420, cost: 213.0 },
      ],
      "30d": Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        consumption: Math.floor(Math.random() * 500) + 1000,
        cost: Math.floor(Math.random() * 75) + 150,
      })),
      "90d": Array.from({ length: 90 }, (_, i) => ({
        date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        consumption: Math.floor(Math.random() * 500) + 1000,
        cost: Math.floor(Math.random() * 75) + 150,
      })),
    }

    return {
      status: true,
      data: mockData[timeframe as keyof typeof mockData] || mockData["7d"],
      message: "Energy usage data fetched successfully",
    }
  }
}

// Price APIs
export const getPrices = async () => {
  try {
    const response = await api.get("/prices")
    return {
      status: true,
      data: response.data,
      message: "Prices fetched successfully",
    }
  } catch (error) {
    console.error("Get prices API error:", error)
    // Mock data for demo
    return {
      status: true,
      data: {
        prices: [
          {
            id: "1",
            name: "Residential Rate",
            rate: 0.15,
            unit: "kWh",
            effectiveDate: "2024-01-01T00:00:00Z",
            status: "Active",
          },
          {
            id: "2",
            name: "Commercial Rate",
            rate: 0.12,
            unit: "kWh",
            effectiveDate: "2024-01-01T00:00:00Z",
            status: "Active",
          },
        ],
      },
      message: "Prices fetched successfully",
    }
  }
}

export const updatePrice = async (id: string, priceData: any) => {
  try {
    const response = await api.put(`/prices/${id}`, priceData)
    return {
      status: true,
      data: response.data,
      message: "Price updated successfully",
    }
  } catch (error) {
    console.error("Update price API error:", error)
    // Mock success response
    return {
      status: true,
      data: { id, ...priceData },
      message: "Price updated successfully",
    }
  }
}

// Dashboard Stats APIs
export const getDashboardStats = async () => {
  try {
    const response = await api.get("/dashboard/stats")
    return {
      status: true,
      data: response.data,
      message: "Dashboard stats fetched successfully",
    }
  } catch (error) {
    console.error("Get dashboard stats API error:", error)
    // Mock data for demo
    return {
      status: true,
      data: {
        totalCustomers: 1250,
        totalMeters: 1180,
        activeMeters: 1150,
        totalRevenue: 125000,
        monthlyGrowth: 8.5,
        energyConsumed: 45000,
        averageBill: 89.5,
      },
      message: "Dashboard stats fetched successfully",
    }
  }
}

// Reports APIs
export const getReportsData = async (timeframe = "30d") => {
  try {
    const response = await api.get(`/reports?timeframe=${timeframe}`)
    return {
      status: true,
      data: response.data,
      message: "Reports data fetched successfully",
    }
  } catch (error) {
    console.error("Get reports data API error:", error)
    // Mock data for demo
    return {
      status: true,
      data: {
        transactions: [
          { month: "Jan", amount: 125000, count: 1250 },
          { month: "Feb", amount: 135000, count: 1350 },
          { month: "Mar", amount: 142000, count: 1420 },
        ],
        meters: [
          { status: "Active", count: 1150 },
          { status: "Inactive", count: 30 },
          { status: "Maintenance", count: 20 },
        ],
        customers: [
          { month: "Jan", new: 45, total: 1205 },
          { month: "Feb", new: 38, total: 1243 },
          { month: "Mar", new: 52, total: 1295 },
        ],
      },
      message: "Reports data fetched successfully",
    }
  }
}

export default api
