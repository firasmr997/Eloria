import axios, { type AxiosResponse } from 'axios'
import type { ApiErrorBody, ApiFieldError, ApiResponse } from '@/types/api'
import { tokenStorage } from '@/utils/tokenStorage'

/** `/api` in development (Vite proxy) and behind Nginx; an absolute URL when the API lives elsewhere. */
export const API_BASE_URL: string = import.meta.env.VITE_API_URL || '/api'

/** Requests from the public website: never authenticated, so visitors and staff see the same site. */
export const publicApi = axios.create({ baseURL: API_BASE_URL, timeout: 15_000 })

/** Requests from the admin dashboard: carry the staff JWT. */
export const adminApi = axios.create({ baseURL: API_BASE_URL, timeout: 30_000 })

adminApi.interceptors.request.use((config) => {
  const session = tokenStorage.get()
  if (session) config.headers.Authorization = `Bearer ${session.token}`
  return config
})

type UnauthorizedListener = () => void
const unauthorizedListeners = new Set<UnauthorizedListener>()

/** The auth provider subscribes here to sign the user out when the API rejects their token. */
export function onUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = String(error?.config?.url ?? '').includes('/auth/login')
    if (axios.isAxiosError(error) && error.response?.status === 401 && !isLogin) {
      unauthorizedListeners.forEach((listener) => listener())
    }
    return Promise.reject(error)
  },
)

/** Normalised API failure with the server's message and field errors. */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: ApiFieldError[]

  constructor(message: string, status: number, fieldErrors: ApiFieldError[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }

  /** Field errors keyed by field name, for form display. */
  get byField(): Record<string, string> {
    return Object.fromEntries(this.fieldErrors.map((e) => [e.field, e.message]))
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_CANCELED') return new ApiError('Request cancelled', 0)
    const body = error.response?.data as Partial<ApiErrorBody> | undefined
    if (!error.response) {
      return new ApiError('We could not reach the server. Please check your connection and try again.', 0)
    }
    return new ApiError(
      body?.message || 'Something went wrong. Please try again.',
      error.response.status,
      Array.isArray(body?.errors) ? body.errors : [],
    )
  }
  return new ApiError('Something went wrong. Please try again.', 0)
}

/** Awaits an axios call and returns the envelope's `data`, throwing an {@link ApiError} on failure. */
export async function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  try {
    const response = await request
    return response.data.data
  } catch (error) {
    throw toApiError(error)
  }
}

/** Serialises query params, dropping empty values. */
export function toParams(params: object): URLSearchParams {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) value.forEach((v) => search.append(key, String(v)))
    else search.append(key, String(value))
  })
  return search
}
