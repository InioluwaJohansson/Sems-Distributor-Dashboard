import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sems.com"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

// Administrator API methods
export const getAllAdmins = async () => {
  try {
    const response = await api.get("/admins")
    return response.data
  } catch (error) {
    console.error("Error fetching admins:", error)
    throw error
  }
}

export const getAllAdministrators = async () => {
  try {
    const response = await api.get("/administrators")
    return response.data
  } catch (error) {
    console.error("Error fetching administrators:", error)
    throw error
  }
}

export const createAdministrator = async (adminData: any) => {
  try {
    const response = await api.post("/administrators", adminData)
    return response.data
  } catch (error) {
    console.error("Error creating administrator:", error)
    throw error
  }
}

export const updateAdministrator = async (id: string, adminData: any) => {
  try {
    const response = await api.put(`/administrators/${id}`, adminData)
    return response.data
  } catch (error) {
    console.error("Error updating administrator:", error)
    throw error
  }
}

export const deleteAdministrator = async (id: string) => {
  try {
    const response = await api.delete(`/administrators/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting administrator:", error)
    throw error
  }
}

// Meter API methods
export const getAllMeters = async () => {
  try {
    const response = await api.get("/meters")
    return response.data
  } catch (error) {
    console.error("Error fetching meters:", error)
    throw error
  }
}

export const createMeter = async (meterData: any) => {
  try {
    const response = await api.post("/meters", meterData)
    return response.data
  } catch (error) {
    console.error("Error creating meter:", error)
    throw error
  }
}

export const updateMeter = async (id: string, meterData: any) => {
  try {
    const response = await api.put(`/meters/${id}`, meterData)
    return response.data
  } catch (error) {
    console.error("Error updating meter:", error)
    throw error
  }
}

export const deleteMeter = async (id: string) => {
  try {
    const response = await api.delete(`/meters/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting meter:", error)
    throw error
  }
}

// Customer API methods
export const getAllCustomers = async () => {
  try {
    const response = await api.get("/customers")
    return response.data
  } catch (error) {
    console.error("Error fetching customers:", error)
    throw error
  }
}

export const createCustomer = async (customerData: any) => {
  try {
    const response = await api.post("/customers", customerData)
    return response.data
  } catch (error) {
    console.error("Error creating customer:", error)
    throw error
  }
}

export const updateCustomer = async (id: string, customerData: any) => {
  try {
    const response = await api.put(`/customers/${id}`, customerData)
    return response.data
  } catch (error) {
    console.error("Error updating customer:", error)
    throw error
  }
}

export const deleteCustomer = async (id: string) => {
  try {
    const response = await api.delete(`/customers/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting customer:", error)
    throw error
  }
}

// Transaction API methods
export const getAllTransactions = async () => {
  try {
    const response = await api.get("/transactions")
    return response.data
  } catch (error) {
    console.error("Error fetching transactions:", error)
    throw error
  }
}

export const getTransactionById = async (id: string) => {
  try {
    const response = await api.get(`/transactions/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching transaction:", error)
    throw error
  }
}

// Price API methods
export const getAllPrices = async () => {
  try {
    const response = await api.get("/prices")
    return response.data
  } catch (error) {
    console.error("Error fetching prices:", error)
    throw error
  }
}

export const updatePrice = async (id: string, priceData: any) => {
  try {
    const response = await api.put(`/prices/${id}`, priceData)
    return response.data
  } catch (error) {
    console.error("Error updating price:", error)
    throw error
  }
}

// Dashboard API methods
export const getDashboardMetrics = async () => {
  try {
    const response = await api.get("/dashboard/metrics")
    return response.data
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error)
    throw error
  }
}

// Reports API methods
export const getReportsData = async (params: any) => {
  try {
    const response = await api.get("/reports", { params })
    return response.data
  } catch (error) {
    console.error("Error fetching reports data:", error)
    throw error
  }
}

// Energy Usage API methods
export const getEnergyUsageData = async (params: any) => {
  try {
    const response = await api.get("/energy-usage", { params })
    return response.data
  } catch (error) {
    console.error("Error fetching energy usage data:", error)
    throw error
  }
}

export default api
