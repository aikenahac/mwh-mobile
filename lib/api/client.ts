import axios, { AxiosInstance, AxiosError } from 'axios'
import { useAuth } from '@clerk/clerk-expo'
import React from 'react'
import { ApiError } from './schemas'

// Get the API URL from environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'

class ApiClient {
  private axiosInstance: AxiosInstance
  private getToken: (() => Promise<string | null>) | null = null

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        if (this.getToken) {
          const token = await this.getToken()
          if (token) {
            // Clerk expects the token in the Authorization header without 'Bearer'
            // or in the __clerk_session_token cookie
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.data) {
          // API returned a structured error
          return Promise.reject(error.response.data)
        }
        // Network or other error
        return Promise.reject({
          success: false,
          error: {
            message: error.message || 'An unexpected error occurred',
            code: 'NETWORK_ERROR',
          },
        } as ApiError)
      }
    )
  }

  setAuthTokenGetter(getToken: () => Promise<string | null>) {
    this.getToken = getToken
  }

  get instance() {
    return this.axiosInstance
  }
}

const apiClientInstance = new ApiClient()

export const apiClient = apiClientInstance

// Hook to initialize API client with Clerk auth
export function useApiClient() {
  const { getToken } = useAuth()

  // Set the token getter on mount
  React.useEffect(() => {
    apiClientInstance.setAuthTokenGetter(getToken)
  }, [getToken])

  return apiClientInstance.instance
}

export default apiClientInstance.instance
