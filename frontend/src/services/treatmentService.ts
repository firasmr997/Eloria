import { adminApi, publicApi, toParams, unwrap } from '@/api/client'
import type { ApiResponse, Page } from '@/types/api'
import type { Treatment, TreatmentInput, TreatmentOption, TreatmentSummary } from '@/types/models'

export type TreatmentSort = 'curated' | 'name' | 'price-asc' | 'price-desc' | 'duration' | 'newest' | 'updated'

export interface TreatmentSearch {
  q?: string
  category?: string
  categoryId?: number
  featured?: boolean
  available?: boolean
  sort?: TreatmentSort
  page?: number
  size?: number
}

export const treatmentService = {
  search: (search: TreatmentSearch, signal?: AbortSignal, admin = false) =>
    unwrap((admin ? adminApi : publicApi).get<ApiResponse<Page<TreatmentSummary>>>('/treatments', {
      params: toParams(search),
      signal,
    })),
  bySlug: (slug: string, signal?: AbortSignal) =>
    unwrap(publicApi.get<ApiResponse<Treatment>>(`/treatments/slug/${encodeURIComponent(slug)}`, { signal })),
  byId: (id: number, signal?: AbortSignal) => unwrap(adminApi.get<ApiResponse<Treatment>>(`/treatments/${id}`, { signal })),
  options: (signal?: AbortSignal, admin = false) =>
    unwrap((admin ? adminApi : publicApi).get<ApiResponse<TreatmentOption[]>>('/treatments/options', { signal })),
  create: (input: TreatmentInput) => unwrap(adminApi.post<ApiResponse<Treatment>>('/treatments', input)),
  update: (id: number, input: TreatmentInput) => unwrap(adminApi.put<ApiResponse<Treatment>>(`/treatments/${id}`, input)),
  remove: (id: number) => unwrap(adminApi.delete<ApiResponse<null>>(`/treatments/${id}`)),
}
