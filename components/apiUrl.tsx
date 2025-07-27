import axios from "axios"

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com",
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
      console.error("Error accessing localStorage:", error)
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
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Authentication APIs
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password })
    return response.data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export const logoutUser = async () => {
  try {
    const response = await api.post("/auth/logout")
    return response.data
  } catch (error) {
    console.error("Logout error:", error)
    throw error
  }
}

// Administrator APIs
export const getAdministrators = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/administrators?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    console.error("Get administrators error:", error)
    throw error
  }
}

export const getAdministratorById = async (id: string) => {
  try {
    const response = await api.get(`/administrators/${id}`)
    return response.data
  } catch (error) {
    console.error("Get administrator by ID error:", error)
    throw error
  }
}

export const createAdministrator = async (adminData: {
  firstName: string
  lastName: string
  userName: string
  email: string
  phoneNumber: string
  roleName: string
  password: string
}) => {
  try {
    const response = await api.post("/administrators", adminData)
    return response.data
  } catch (error) {
    console.error("Create administrator error:", error)
    throw error
  }
}

export const updateAdministrator = async (id: string, adminData: any) => {
  try {
    const response = await api.put(`/administrators/${id}`, adminData)
    return response.data
  } catch (error) {
    console.error("Update administrator error:", error)
    throw error
  }
}

export const deleteAdministrator = async (id: string) => {
  try {
    const response = await api.delete(`/administrators/${id}`)
    return response.data
  } catch (error) {
    console.error("Delete administrator error:", error)
    throw error
  }
}

// Customer APIs
export const getCustomers = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/customers?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    console.error("Get customers error:", error)
    throw error
  }
}

export const getCustomerById = async (id: string) => {
  try {
    const response = await api.get(`/customers/${id}`)
    return response.data
  } catch (error) {
    console.error("Get customer by ID error:", error)
    throw error
  }
}

export const createCustomer = async (customerData: any) => {
  try {
    const response = await api.post("/customers", customerData)
    return response.data
  } catch (error) {
    console.error("Create customer error:", error)
    throw error
  }
}

export const updateCustomer = async (id: string, customerData: any) => {
  try {
    const response = await api.put(`/customers/${id}`, customerData)
    return response.data
  } catch (error) {
    console.error("Update customer error:", error)
    throw error
  }
}

export const deleteCustomer = async (id: string) => {
  try {
    const response = await api.delete(`/customers/${id}`)
    return response.data
  } catch (error) {
    console.error("Delete customer error:", error)
    throw error
  }
}

// Meter APIs
export const getMeters = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/meters?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    console.error("Get meters error:", error)
    throw error
  }
}

export const getMeterById = async (id: string) => {
  try {
    const response = await api.get(`/meters/${id}`)
    return response.data
  } catch (error) {
    console.error("Get meter by ID error:", error)
    throw error
  }
}

export const createMeter = async (meterData: any) => {
  try {
    const response = await api.post("/meters", meterData)
    return response.data
  } catch (error) {
    console.error("Create meter error:", error)
    throw error
  }
}

export const updateMeter = async (id: string, meterData: any) => {
  try {
    const response = await api.put(`/meters/${id}`, meterData)
    return response.data
  } catch (error) {
    console.error("Update meter error:", error)
    throw error
  }
}

export const deleteMeter = async (id: string) => {
  try {
    const response = await api.delete(`/meters/${id}`)
    return response.data
  } catch (error) {
    console.error("Delete meter error:", error)
    throw error
  }
}

// Meter Readings APIs
export const getMeterReadings = async (meterId: string, timeframe?: string) => {
  try {
    const params = timeframe ? `?timeframe=${timeframe}` : ""
    const response = await api.get(`/meters/${meterId}/readings${params}`)
    return response.data
  } catch (error) {
    console.error("Get meter readings error:", error)
    throw error
  }
}

export const createMeterReading = async (meterId: string, readingData: any) => {
  try {
    const response = await api.post(`/meters/${meterId}/readings`, readingData)
    return response.data
  } catch (error) {
    console.error("Create meter reading error:", error)
    throw error
  }
}

// Transaction APIs
export const getTransactions = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/transactions?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    console.error("Get transactions error:", error)
    throw error
  }
}

export const getTransactionById = async (id: string) => {
  try {
    const response = await api.get(`/transactions/${id}`)
    return response.data
  } catch (error) {
    console.error("Get transaction by ID error:", error)
    throw error
  }
}

export const createTransaction = async (transactionData: any) => {
  try {
    const response = await api.post("/transactions", transactionData)
    return response.data
  } catch (error) {
    console.error("Create transaction error:", error)
    throw error
  }
}

export const updateTransaction = async (id: string, transactionData: any) => {
  try {
    const response = await api.put(`/transactions/${id}`, transactionData)
    return response.data
  } catch (error) {
    console.error("Update transaction error:", error)
    throw error
  }
}

// Price APIs
export const getPrices = async () => {
  try {
    const response = await api.get("/prices")
    return response.data
  } catch (error) {
    console.error("Get prices error:", error)
    throw error
  }
}

export const updatePrice = async (id: string, priceData: any) => {
  try {
    const response = await api.put(`/prices/${id}`, priceData)
    return response.data
  } catch (error) {
    console.error("Update price error:", error)
    throw error
  }
}

// Reports APIs
export const getReportsData = async (timeframe?: string) => {
  try {
    const params = timeframe ? `?timeframe=${timeframe}` : ""
    const response = await api.get(`/reports${params}`)
    return response.data
  } catch (error) {
    console.error("Get reports data error:", error)
    throw error
  }
}

export const generateReport = async (reportType: string, timeframe?: string) => {
  try {
    const params = new URLSearchParams()
    if (timeframe) params.append("timeframe", timeframe)

    const response = await api.get(`/reports/${reportType}?${params.toString()}`, {
      responseType: "blob",
    })
    return response.data
  } catch (error) {
    console.error("Generate report error:", error)
    throw error
  }
}

// Dashboard APIs
export const getDashboardStats = async () => {
  try {
    const response = await api.get("/dashboard/stats")
    return response.data
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    throw error
  }
}

export const getEnergyUsageData = async (timeframe?: string) => {
  try {
    const params = timeframe ? `?timeframe=${timeframe}` : ""
    const response = await api.get(`/dashboard/energy-usage${params}`)
    return response.data
  } catch (error) {
    console.error("Get energy usage data error:", error)
    throw error
  }
}

// Utility function to check if API is available
export const checkApiHealth = async () => {
  try {
    const response = await api.get("/health")
    return response.data
  } catch (error) {
    console.error("API health check error:", error)
    return { status: false, message: "API unavailable" }
  }
}

export default api
