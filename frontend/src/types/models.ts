export type Role = 'ADMIN' | 'EDITOR'

export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface AuthSession {
  token: string
  tokenType: string
  expiresAt: string
  user: User
}

export interface CategoryRef {
  id: number
  name: string
  slug: string
}

export interface Category extends CategoryRef {
  description: string | null
  displayOrder: number
  active: boolean
  treatmentCount: number
  createdAt: string
  updatedAt: string
}

export interface CategoryInput {
  name: string
  description?: string | null
  displayOrder?: number
  active?: boolean
}

export interface TreatmentSummary {
  id: number
  name: string
  slug: string
  shortDescription: string
  category: CategoryRef
  durationMinutes: number
  price: number
  priceFrom: boolean
  technology: string | null
  mainImageUrl: string | null
  mainImageAlt: string | null
  available: boolean
  featured: boolean
  updatedAt: string
}

export interface TreatmentImage {
  id: number
  imageUrl: string
  altText: string | null
}

export interface Faq {
  id: number
  question: string
  answer: string
}

export interface Treatment extends Omit<TreatmentSummary, 'updatedAt'> {
  description: string
  sessions: string | null
  downtime: string | null
  benefits: string[]
  preparation: string[]
  aftercare: string[]
  contraindications: string[]
  additionalImages: TreatmentImage[]
  faqs: Faq[]
  createdAt: string
  updatedAt: string
}

export interface TreatmentInput {
  name: string
  categoryId: number
  shortDescription: string
  description: string
  durationMinutes: number
  sessions?: string | null
  downtime?: string | null
  price: number
  priceFrom: boolean
  benefits: string[]
  preparation: string[]
  aftercare: string[]
  contraindications: string[]
  technology?: string | null
  mainImageUrl?: string | null
  mainImageAlt?: string | null
  additionalImages: { imageUrl: string; altText?: string | null }[]
  faqs: { question: string; answer: string }[]
  available: boolean
  featured: boolean
}

export interface TreatmentOption {
  id: number
  name: string
  slug: string
  categoryName: string
}

export type TreatmentRef = Pick<TreatmentSummary, 'id' | 'name' | 'slug'>

export const EDITORIAL_CATEGORIES = ['TREATMENTS', 'SKIN', 'BEAUTY', 'ATMOSPHERE'] as const
export const CENTER_CATEGORIES = [
  'RECEPTION',
  'TREATMENT_ROOMS',
  'WAITING_AREA',
  'EQUIPMENT',
  'INTERIOR',
  'EXTERIOR',
  'DETAILS',
  'TEAM',
] as const
export type GalleryCategory = (typeof EDITORIAL_CATEGORIES)[number] | (typeof CENTER_CATEGORIES)[number]
export type GalleryCollection = 'EDITORIAL' | 'CENTER'

export interface GalleryImage {
  id: number
  title: string
  description: string | null
  imageUrl: string
  category: GalleryCategory
  collection: GalleryCollection
  displayOrder: number
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface GalleryImageInput {
  title: string
  description?: string | null
  imageUrl: string
  category: GalleryCategory
  displayOrder?: number
  featured?: boolean
}

export interface Result {
  id: number
  treatment: TreatmentRef | null
  beforeImageUrl: string
  afterImageUrl: string
  title: string
  description: string | null
  durationLabel: string | null
  featured: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface ResultInput {
  treatmentId?: number | null
  beforeImageUrl: string
  afterImageUrl: string
  title: string
  description?: string | null
  durationLabel?: string | null
  displayOrder?: number
  featured?: boolean
}

export interface Specialist {
  id: number
  name: string
  slug: string
  role: string
  bio: string
  photo: string | null
  experience: string | null
  specialties: string[]
  socialLinks: { instagram: string | null; linkedin: string | null }
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface SpecialistInput {
  name: string
  role: string
  bio: string
  photo?: string | null
  experience?: string | null
  specialties: string[]
  instagramUrl?: string | null
  linkedinUrl?: string | null
  displayOrder?: number
}

export interface Testimonial {
  id: number
  authorName: string
  authorDetail: string | null
  quote: string
  treatmentName: string | null
  displayOrder: number
  published: boolean
  createdAt: string
  updatedAt: string
}

export interface TestimonialInput {
  authorName: string
  authorDetail?: string | null
  quote: string
  treatmentName?: string | null
  displayOrder?: number
  published?: boolean
}

export const APPOINTMENT_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]

export interface AppointmentRequest {
  name: string
  email: string
  phone: string
  treatmentId?: number | null
  preferredDate: string
  preferredTime: string
  message?: string
  website?: string
}

export interface AppointmentReceipt {
  id: number | null
  name: string
  treatmentName: string | null
  preferredDate: string
  preferredTime: string
}

export interface Appointment {
  id: number
  name: string
  email: string
  phone: string
  treatment: TreatmentRef | null
  treatmentName: string | null
  preferredDate: string
  preferredTime: string
  message: string | null
  status: AppointmentStatus
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

export const MESSAGE_STATUSES = ['NEW', 'READ', 'ARCHIVED'] as const
export type MessageStatus = (typeof MESSAGE_STATUSES)[number]

export interface ContactRequest {
  name: string
  email: string
  phone?: string
  message: string
  website?: string
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  phone: string | null
  message: string
  status: MessageStatus
  createdAt: string
  updatedAt: string
}

export interface HoursLine {
  label: string
  hours: string
}

export interface CenterSettings {
  centerName: string
  tagline: string | null
  addressLine: string | null
  postalCode: string | null
  city: string | null
  country: string | null
  phone: string | null
  email: string | null
  openingHours: HoursLine[]
  instagramUrl: string | null
  facebookUrl: string | null
  pinterestUrl: string | null
  mapUrl: string | null
  updatedAt: string
}

export type SettingsInput = Omit<CenterSettings, 'updatedAt'>

export interface Dashboard {
  totalTreatments: number
  featuredTreatments: number
  availableTreatments: number
  galleryImages: number
  teamMembers: number
  results: number
  pendingAppointments: number
  unreadMessages: number
  appointmentsByStatus: Record<AppointmentStatus, number>
  requestsLast30Days: { date: string; count: number }[]
  mostRequestedTreatments: { name: string; count: number }[]
  recentAppointments: Appointment[]
  recentMessages: ContactMessage[]
}

export interface UploadResult {
  url: string
  storageKey: string
  contentType: string
  size: number
}

export type UploadFolder = 'treatments' | 'gallery' | 'results' | 'team'
