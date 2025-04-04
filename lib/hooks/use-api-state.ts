import { useState, useEffect } from 'react'

interface ApiState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
}

interface ApiStateOptions {
  fallbackData?: any
  retryCount?: number
  retryDelay?: number
}

export function useApiState<T>(
  fetchFn: () => Promise<T>,
  options: ApiStateOptions = {}
): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let retries = options.retryCount || 3
    let mounted = true

    async function fetchData() {
      while (retries > 0) {
        try {
          const data = await fetchFn()
          
          if (mounted) {
            setState({
              data,
              isLoading: false,
              error: null,
            })
          }
          return // Success, exit retry loop
        } catch (error) {
          console.error('API fetch error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            retriesLeft: retries - 1,
            timestamp: new Date().toISOString()
          })

          retries--
          
          if (retries > 0) {
            // Wait before retrying
            await new Promise(resolve => 
              setTimeout(resolve, options.retryDelay || 1000)
            )
            continue
          }

          if (mounted) {
            setState({
              data: options.fallbackData || null,
              isLoading: false,
              error: error instanceof Error ? error : new Error('Unknown error'),
            })
          }
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [fetchFn, options.fallbackData, options.retryCount, options.retryDelay])

  return state
}