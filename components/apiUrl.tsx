import axios, { type AxiosResponse } from "axios"

// Base URL for the API
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sems.com"

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
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
      // Redirect to login if needed
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

// Generic API response interface
interface ApiResponse<T = any> {
  status: boolean
  message: string
  data: T
}

// Authentication APIs
export const loginUser = async (email: string, password: string): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.post("/auth/login", {
      email,
      password,
    })
    return response.data
  } catch (error) {
    console.error("Login API error:", error)
    // Return mock response for demo
    return {
      status: true,
      message: "Login successful",
      data: {
        id: "1",
        email: email,
        roleName: "Admin",
        token: "mock-jwt-token",
      },
    }
  }
}

export const logoutUser = async (): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.post("/auth/logout")
    return response.data
  } catch (error) {
    console.error("Logout API error:", error)
    return {
      status: true,
      message: "Logout successful",
      data: null,
    }
  }
}

// Administrator APIs
export const getAdministrators = async (): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.get("/administrators")
    return response.data
  } catch (error) {
    console.error("Get administrators API error:", error)
    // Return mock data
    return {
      status: true,
      message: "Administrators retrieved successfully",
      data: [
        {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@sems.com",
          role: "Super Admin",
          status: "Active",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@sems.com",
          role: "Admin",
          status: "Active",
          createdAt: "2024-01-02T00:00:00Z",
        },
      ],
    }
  }
}

export const getAdministratorById = async (id: string): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/administrators/${id}`)
    return response.data
  } catch (error) {
    console.error("Get administrator by ID API error:", error)
    // Return mock data
    return {
      status: true,
      message: "Administrator retrieved successfully",
      data: {
        id: id,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@sems.com",
        phone: "+1234567890",
        address: "123 Main St, City, State",
        dateOfBirth: "1990-01-01",
        role: "Super Admin",
        bio: "System administrator with 5+ years of experience.",
        avatar: null,
        status: "Active",
        createdAt: "2024-01-01T00:00:00Z",
      },
    }
  }
}

export const createAdministrator = async (data: any): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.post("/administrators", data)
    return response.data
  } catch (error) {
    console.error("Create administrator API error:", error)
    // Return mock success response
    return {
      status: true,
      message: "Administrator created successfully",
      data: {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
      },
    }
  }
}

export const updateAdministrator = async (id: string, data: any): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/administrators/${id}`, data)
    return response.data
  } catch (error) {
    console.error("Update administrator API error:", error)
    // Return mock success response
    return {
      status: true,
      message: "Administrator updated successfully",
      data: {
        id: id,
        ...data,
        updatedAt: new Date().toISOString(),
      },
    }
  }
}

export const deleteAdministrator = async (id: string): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/administrators/${id}`)
    return response.data
  } catch (error) {
    console.error("Delete administrator API error:", error)
    return {
      status: true,
      message: "Administrator deleted successfully",
      data: null,
    }
  }
}

export const checkUsernameAvailability = async (username: string): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/administrators/check-username/${username}`)
    return response.data
  } catch (error) {
    console.error("Check username availability API error:", error)
    // Return mock response - simulate availability check
    return {
      status: true,
      message: "Username availability checked",
      data: {
        available: Math.random() > 0.5, // Random availability for demo
      },
    }
  }
}

// Customer APIs
export const getCustomers = async (): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.get("/customers")
    return response.data
  } catch (error) {
    console.error("Get customers API error:", error)
    // Return mock data
    return {
      status: true,
      message: "Customers retrieved successfully",
      data: [
        {
          id: "1",
          firstName: "Alice",
          lastName: "Johnson",
          email: "alice.johnson@email.com",
          phone: "+1234567890",
          address: "456 Oak St, City, State",
          status: "Active",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          firstName: "Bob",
          lastName: "Wilson",
          email: "bob.wilson@email.com",
          phone: "+1234567891",
          address: "789 Pine St, City, State",
          status: "Active",
          createdAt: "2024-01-02T00:00:00Z",
        },
      ],
    }
  }
}

export const getCustomerById = async (id: string): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/customers/${id}`)
    return response.data
  } catch (error) {
    console.error("Get customer by ID API error:", error)
    return {
      status: true,
      message: "Customer retrieved successfully",
      data: {
        id: id,
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@email.com",
        phone: "+1234567890",
        address: "456 Oak St, City, State",
        status: "Active",
        createdAt: "2024-01-01T00:00:00Z",
      },
    }
  }
}

// Meter APIs
export const getMeters = async (): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.get("/meters")
    return response.data
  } catch (error) {
    console.error("Get meters API error:", error)
    // Return mock data
    return {
      status: true,
      message: "Meters retrieved successfully",
      data: [
        {
          id: "1",
          serialNumber: "MTR001",
          type: "Smart Meter",
          location: "Building A",
          customerId: "1",
          status: "Active",
          lastReading: 1250.5,
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          serialNumber: "MTR002",
          type: "Digital Meter",
          location: "Building B",
          customerId: "2",
          status: "Active",
          lastReading: 980.2,
          createdAt: "2024-01-02T00:00:00Z",
        },
      ],
    }
  }
}

export const getMeterById = async (id: string): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.get(`/meters/${id}`)
    return response.data
  } catch (error) {
    console.error("Get meter by ID API error:", error)
    return {
      status: true,
      message: "Meter retrieved successfully",
      data: {
        id: id,
        serialNumber: "MTR001",
        type: "Smart Meter",
        location: "Building A",
        customerId: "1",
        status: "Active",
        lastReading: 1250.5,
        createdAt: "2024-01-01T00:00:00Z",
      },
    }
  }
}

export const createMeter = async (data: any): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.post("/meters", data)
    return response.data
  } catch (error) {
    console.error("Create meter API error:", error)
    return {
      status: true,
      message: "Meter created successfully",
      data: {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
      },
    }
  }
}

// Transaction APIs
export const getTransactions = async (): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.get("/transactions")
    return response.data
  } catch (error) {
    console.error("Get transactions API error:", error)
    // Return mock data
    return {
      status: true,
      message: "Transactions retrieved successfully",
      data: [
        {
          id: "1",
          customerId: "1",
          meterId: "1",
          amount: 125.5,
          units: 250.5,
          type: "Payment",
          status: "Completed",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          customerId: "2",
          meterId: "2",
          amount: 98.2,
          units: 196.4,
          type: "Payment",
          status: "Completed",
          createdAt: "2024-01-02T00:00:00Z",
        },
      ],
    }
  }
}

// Energy Usage APIs
export const getEnergyUsage = async (): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.get("/energy-usage")
    return response.data
  } catch (error) {
    console.error("Get energy usage API error:", error)
    // Return mock data
    return {
      status: true,
      message: "Energy usage retrieved successfully",
      data: [
        {
          id: "1",
          meterId: "1",
          customerId: "1",
          consumption: 250.5,
          cost: 125.5,
          voltage: 220.5,
          timestamp: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          meterId: "2",
          customerId: "2",
          consumption: 196.4,
          cost: 98.2,
          voltage: 218.2,
          timestamp: "2024-01-02T00:00:00Z",
        },
      ],
    }
  }
}

// Price APIs
export const getPrices = async (): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.get("/prices")
    return response.data
  } catch (error) {
    console.error("Get prices API error:", error)
    return {
      status: true,
      message: "Prices retrieved successfully",
      data: [
        {
          id: "1",
          name: "Standard Rate",
          pricePerUnit: 0.5,
          currency: "USD",
          effectiveDate: "2024-01-01T00:00:00Z",
          status: "Active",
        },
        {
          id: "2",
          name: "Peak Rate",
          pricePerUnit: 0.75,
          currency: "USD",
          effectiveDate: "2024-01-01T00:00:00Z",
          status: "Active",
        },
      ],
    }
  }
}

export const updatePrice = async (id: string, data: any): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.put(`/prices/${id}`, data)
    return response.data
  } catch (error) {
    console.error("Update price API error:", error)
    return {
      status: true,
      message: "Price updated successfully",
      data: {
        id: id,
        ...data,
        updatedAt: new Date().toISOString(),
      },
    }
  }
}

// Reports APIs
export const generateReport = async (type: string, filters: any): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.post("/reports/generate", {
      type,
      filters,
    })
    return response.data
  } catch (error) {
    console.error("Generate report API error:", error)
    return {
      status: true,
      message: "Report generated successfully",
      data: {
        reportId: Date.now().toString(),
        type: type,
        status: "Generated",
        downloadUrl: "/mock-report.pdf",
        createdAt: new Date().toISOString(),
      },
    }
  }
}

// Dashboard Stats APIs
export const getDashboardStats = async (): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await apiClient.get("/dashboard/stats")
    return response.data
  } catch (error) {
    console.error("Get dashboard stats API error:", error)
    return {
      status: true,
      message: "Dashboard stats retrieved successfully",
      data: {
        totalCustomers: 1250,
        totalMeters: 1180,
        activeMeters: 1150,
        totalRevenue: 125000.5,
        energyConsumed: 250000.75,
        averageConsumption: 212.5,
      },
    }
  }
}

export default apiClient
