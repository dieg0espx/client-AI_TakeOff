import { useAuth } from '@/context/AuthContext'

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean
}

export class ApiClient {
  private refreshAccessToken: (() => Promise<boolean>) | null = null

  constructor(refreshTokenFn?: () => Promise<boolean>) {
    this.refreshAccessToken = refreshTokenFn || null
  }

  async request(url: string, options: ApiRequestOptions = {}): Promise<Response> {
    const { requireAuth = true, ...fetchOptions } = options

    // If auth is required, add the access token
    if (requireAuth && this.refreshAccessToken) {
      const accessToken = this.getAccessToken()
      if (accessToken) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    }

    let response = await fetch(url, fetchOptions)

    // If we get a 401 and have refresh capability, try to refresh the token
    if (response.status === 401 && requireAuth && this.refreshAccessToken) {
      console.log('Token expired, attempting refresh...')
      const refreshSuccess = await this.refreshAccessToken()
      
      if (refreshSuccess) {
        // Retry the request with the new token
        const newAccessToken = this.getAccessToken()
        if (newAccessToken) {
          fetchOptions.headers = {
            ...fetchOptions.headers,
            'Authorization': `Bearer ${newAccessToken}`,
          }
          response = await fetch(url, fetchOptions)
        }
      }
    }

    return response
  }

  private getAccessToken(): string | null {
    // Get token from cookies (same way AuthContext does)
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('google_access_token='))
      if (tokenCookie) {
        return tokenCookie.split('=')[1]
      }
    }
    return null
  }

  // Convenience methods
  async get(url: string, options: ApiRequestOptions = {}) {
    return this.request(url, { ...options, method: 'GET' })
  }

  async post(url: string, data?: any, options: ApiRequestOptions = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(url: string, data?: any, options: ApiRequestOptions = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(url: string, options: ApiRequestOptions = {}) {
    return this.request(url, { ...options, method: 'DELETE' })
  }
}

// Hook to get an API client instance with refresh capability
export function useApiClient() {
  const { refreshAccessToken } = useAuth()
  return new ApiClient(refreshAccessToken)
}
