import { adminApi, publicApi, unwrap } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { AuthSession, User } from '@/types/models'

export const authService = {
  login: (email: string, password: string) =>
    unwrap(publicApi.post<ApiResponse<AuthSession>>('/auth/login', { email, password })),
  me: () => unwrap(adminApi.get<ApiResponse<User>>('/auth/me')),
  changePassword: (currentPassword: string, newPassword: string) =>
    unwrap(adminApi.put<ApiResponse<null>>('/auth/password', { currentPassword, newPassword })),
}
