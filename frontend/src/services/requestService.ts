import { adminApi, publicApi, toParams, unwrap } from '@/api/client'
import type { ApiResponse, Page } from '@/types/api'
import type {
  Appointment,
  AppointmentReceipt,
  AppointmentRequest,
  AppointmentStatus,
  ContactMessage,
  ContactRequest,
  Dashboard,
  MessageStatus,
} from '@/types/models'

export const appointmentService = {
  request: (input: AppointmentRequest) =>
    unwrap(publicApi.post<ApiResponse<AppointmentReceipt>>('/appointments', input)),
  list: (search: { status?: AppointmentStatus; q?: string; from?: string; to?: string; page?: number; size?: number }, signal?: AbortSignal) =>
    unwrap(adminApi.get<ApiResponse<Page<Appointment>>>('/appointments', { params: toParams(search), signal })),
  update: (id: number, status: AppointmentStatus, adminNotes: string | null) =>
    unwrap(adminApi.put<ApiResponse<Appointment>>(`/appointments/${id}`, { status, adminNotes })),
  remove: (id: number) => unwrap(adminApi.delete<ApiResponse<null>>(`/appointments/${id}`)),
}

export const messageService = {
  send: (input: ContactRequest) => unwrap(publicApi.post<ApiResponse<null>>('/contact', input)),
  list: (search: { status?: MessageStatus; inbox?: boolean; q?: string; page?: number; size?: number }, signal?: AbortSignal) =>
    unwrap(adminApi.get<ApiResponse<Page<ContactMessage>>>('/messages', { params: toParams(search), signal })),
  unreadCount: (signal?: AbortSignal) =>
    unwrap(adminApi.get<ApiResponse<{ count: number }>>('/messages/unread-count', { signal })),
  update: (id: number, status: MessageStatus) =>
    unwrap(adminApi.put<ApiResponse<ContactMessage>>(`/messages/${id}`, { status })),
  remove: (id: number) => unwrap(adminApi.delete<ApiResponse<null>>(`/messages/${id}`)),
}

export const dashboardService = {
  get: (signal?: AbortSignal) => unwrap(adminApi.get<ApiResponse<Dashboard>>('/dashboard', { signal })),
}
