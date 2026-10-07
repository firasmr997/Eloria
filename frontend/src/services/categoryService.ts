import { adminApi, publicApi, toParams, unwrap } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { Category, CategoryInput } from '@/types/models'

export const categoryService = {
  list: (signal?: AbortSignal) => unwrap(publicApi.get<ApiResponse<Category[]>>('/treatment-categories', { signal })),
  listAll: (signal?: AbortSignal) =>
    unwrap(adminApi.get<ApiResponse<Category[]>>('/treatment-categories', { params: { all: true }, signal })),
  create: (input: CategoryInput) => unwrap(adminApi.post<ApiResponse<Category>>('/treatment-categories', input)),
  update: (id: number, input: CategoryInput) =>
    unwrap(adminApi.put<ApiResponse<Category>>(`/treatment-categories/${id}`, input)),
  remove: (id: number, reassignTo?: number) =>
    unwrap(adminApi.delete<ApiResponse<null>>(`/treatment-categories/${id}`, { params: toParams({ reassignTo }) })),
}
