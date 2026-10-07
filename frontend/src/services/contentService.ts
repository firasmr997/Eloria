import { adminApi, publicApi, toParams, unwrap } from '@/api/client'
import type { ApiResponse, Page } from '@/types/api'
import type {
  CenterSettings,
  GalleryCategory,
  GalleryCollection,
  GalleryImage,
  GalleryImageInput,
  Result,
  ResultInput,
  SettingsInput,
  Specialist,
  SpecialistInput,
  Testimonial,
  TestimonialInput,
  UploadFolder,
  UploadResult,
} from '@/types/models'

export interface GallerySearch {
  collection?: GalleryCollection
  category?: GalleryCategory
  featured?: boolean
  q?: string
  page?: number
  size?: number
}

export const galleryService = {
  list: (search: GallerySearch, signal?: AbortSignal) =>
    unwrap(publicApi.get<ApiResponse<Page<GalleryImage>>>('/gallery', { params: toParams(search), signal })),
  create: (input: GalleryImageInput) => unwrap(adminApi.post<ApiResponse<GalleryImage>>('/gallery', input)),
  update: (id: number, input: GalleryImageInput) => unwrap(adminApi.put<ApiResponse<GalleryImage>>(`/gallery/${id}`, input)),
  remove: (id: number) => unwrap(adminApi.delete<ApiResponse<null>>(`/gallery/${id}`)),
}

export const resultService = {
  list: (search: { treatmentId?: number; featured?: boolean; page?: number; size?: number }, signal?: AbortSignal) =>
    unwrap(publicApi.get<ApiResponse<Page<Result>>>('/results', { params: toParams(search), signal })),
  create: (input: ResultInput) => unwrap(adminApi.post<ApiResponse<Result>>('/results', input)),
  update: (id: number, input: ResultInput) => unwrap(adminApi.put<ApiResponse<Result>>(`/results/${id}`, input)),
  remove: (id: number) => unwrap(adminApi.delete<ApiResponse<null>>(`/results/${id}`)),
}

export const specialistService = {
  list: (search: { q?: string; page?: number; size?: number }, signal?: AbortSignal) =>
    unwrap(publicApi.get<ApiResponse<Page<Specialist>>>('/specialists', { params: toParams(search), signal })),
  get: (idOrSlug: string, signal?: AbortSignal) =>
    unwrap(publicApi.get<ApiResponse<Specialist>>(`/specialists/${encodeURIComponent(idOrSlug)}`, { signal })),
  create: (input: SpecialistInput) => unwrap(adminApi.post<ApiResponse<Specialist>>('/specialists', input)),
  update: (id: number, input: SpecialistInput) => unwrap(adminApi.put<ApiResponse<Specialist>>(`/specialists/${id}`, input)),
  remove: (id: number) => unwrap(adminApi.delete<ApiResponse<null>>(`/specialists/${id}`)),
}

export const testimonialService = {
  list: (signal?: AbortSignal) => unwrap(publicApi.get<ApiResponse<Testimonial[]>>('/testimonials', { signal })),
  listAll: (signal?: AbortSignal) =>
    unwrap(adminApi.get<ApiResponse<Testimonial[]>>('/testimonials', { params: { all: true }, signal })),
  create: (input: TestimonialInput) => unwrap(adminApi.post<ApiResponse<Testimonial>>('/testimonials', input)),
  update: (id: number, input: TestimonialInput) => unwrap(adminApi.put<ApiResponse<Testimonial>>(`/testimonials/${id}`, input)),
  remove: (id: number) => unwrap(adminApi.delete<ApiResponse<null>>(`/testimonials/${id}`)),
}

export const settingsService = {
  get: (signal?: AbortSignal) => unwrap(publicApi.get<ApiResponse<CenterSettings>>('/settings', { signal })),
  update: (input: SettingsInput) => unwrap(adminApi.put<ApiResponse<CenterSettings>>('/settings', input)),
}

export const uploadService = {
  upload: (file: File, folder: UploadFolder, onProgress?: (percent: number) => void) => {
    const body = new FormData()
    body.append('file', file)
    return unwrap(adminApi.post<ApiResponse<UploadResult>>('/uploads', body, {
      params: { folder },
      onUploadProgress: (event) => {
        if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100))
      },
    }))
  },
  /** Removes an upload that was never saved on any content (e.g. a cancelled form). */
  discard: (url: string) => unwrap(adminApi.delete<ApiResponse<null>>('/uploads', { params: { url } })),
}
