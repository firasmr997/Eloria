import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Navbar } from '@/components/layout/Navbar'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { AppointmentForm } from '@/components/forms/AppointmentForm'
import CategoriesAdminPage from '@/pages/admin/CategoriesAdminPage'
import LoginPage from '@/pages/admin/LoginPage'
import TreatmentsPage from '@/pages/public/TreatmentsPage'
import { authService } from '@/services/authService'
import { categoryService } from '@/services/categoryService'
import { uploadService } from '@/services/contentService'
import { appointmentService } from '@/services/requestService'
import { treatmentService } from '@/services/treatmentService'
import type { Category, TreatmentSummary } from '@/types/models'
import { page, renderRoute } from './utils'

const categories: Category[] = [
  { id: 1, name: 'Facial', slug: 'facial', description: 'Facials.', displayOrder: 1, active: true, treatmentCount: 2, createdAt: '', updatedAt: '' },
  { id: 2, name: 'Body', slug: 'body', description: null, displayOrder: 2, active: true, treatmentCount: 1, createdAt: '', updatedAt: '' },
]

const treatment = (id: number, name: string, category = categories[0]): TreatmentSummary => ({
  id,
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  shortDescription: `${name} description`,
  category: { id: category.id, name: category.name, slug: category.slug },
  durationMinutes: 60,
  price: 190,
  priceFrom: false,
  technology: null,
  mainImageUrl: null,
  mainImageAlt: null,
  available: true,
  featured: false,
  updatedAt: '',
})

beforeEach(() => {
  vi.spyOn(categoryService, 'list').mockResolvedValue(categories)
})

describe('navigation', () => {
  it('links every main section and the booking page', () => {
    renderRoute(<Navbar />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    for (const label of ['Treatments', 'Results', 'Gallery', 'About', 'Team', 'Contact']) {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: /Book consultation/ })).toHaveAttribute('href', '/book')
  })
})

describe('treatment catalogue', () => {
  it('searches by text and filters by category through the API', async () => {
    const search = vi.spyOn(treatmentService, 'search').mockResolvedValue(page([treatment(1, 'Signature Hydrafacial'), treatment(2, 'Chemical Peels')]))
    const user = userEvent.setup()
    renderRoute(<TreatmentsPage />, { path: '/treatments' })

    expect(await screen.findByText('Signature Hydrafacial')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Search treatments'), 'peel')
    await waitFor(() => expect(search).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'peel' }), expect.anything()))

    await user.click(screen.getByRole('button', { name: /^Body/ }))
    await waitFor(() => expect(search).toHaveBeenLastCalledWith(expect.objectContaining({ category: 'body' }), expect.anything()))
    expect(screen.getByRole('button', { name: /^Body/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows a composed empty state', async () => {
    vi.spyOn(treatmentService, 'search').mockResolvedValue(page([]))
    renderRoute(<TreatmentsPage />, { path: '/treatments' })
    expect(await screen.findByText('No treatments found.')).toBeInTheDocument()
  })
})

describe('appointment request', () => {
  it('validates, then sends the request and confirms it', async () => {
    vi.spyOn(treatmentService, 'options').mockResolvedValue([{ id: 7, name: 'Microneedling', slug: 'microneedling', categoryName: 'Advanced Skin' }])
    const request = vi.spyOn(appointmentService, 'request').mockResolvedValue({
      id: 99, name: 'Léa Martin', treatmentName: 'Microneedling', preferredDate: '2099-01-15', preferredTime: '10:30',
    })
    const user = userEvent.setup()
    renderRoute(<AppointmentForm initialTreatment="microneedling" />)

    await user.click(screen.getByRole('button', { name: 'Send request' }))
    expect(screen.getByText('Your name is required')).toBeInTheDocument()
    expect(request).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText(/Full name/), 'Léa Martin')
    await user.type(screen.getByLabelText(/^Email/), 'lea@example.com')
    await user.type(screen.getByLabelText(/^Phone/), '+33 6 12 34 56 78')
    await user.type(screen.getByLabelText(/Preferred date/), '2099-01-15')
    await user.selectOptions(screen.getByLabelText(/Preferred time/), '10:30')
    await user.click(screen.getByRole('checkbox'))
    await waitFor(() => expect((screen.getByLabelText('Treatment') as HTMLSelectElement).value).toBe('7'))
    await user.click(screen.getByRole('button', { name: 'Send request' }))

    await waitFor(() => expect(request).toHaveBeenCalledWith(expect.objectContaining({ name: 'Léa Martin', treatmentId: 7, preferredTime: '10:30' })))
    expect(await screen.findByText('Thank you, Léa.')).toBeInTheDocument()
  })
})

describe('admin login', () => {
  it('signs in and opens the dashboard', async () => {
    vi.spyOn(authService, 'login').mockResolvedValue({
      token: 'jwt', tokenType: 'Bearer', expiresAt: new Date(Date.now() + 3600_000).toISOString(),
      user: { id: 1, name: 'Éloria Administrator', email: 'admin@eloria.local', role: 'ADMIN' },
    })
    const user = userEvent.setup()
    renderRoute(<LoginPage />, { path: '/admin/login', extra: [{ path: '/admin', element: <p>Dashboard</p> }] })
    await user.type(screen.getByLabelText(/^Email/), 'admin@eloria.local')
    await user.type(screen.getByLabelText(/^Password/), 'Admin123!')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Dashboard')).toBeInTheDocument()
  })

  it('shows the API error on bad credentials', async () => {
    const { ApiError } = await import('@/api/client')
    vi.spyOn(authService, 'login').mockRejectedValue(new ApiError('Invalid email or password', 401))
    const user = userEvent.setup()
    renderRoute(<LoginPage />, { path: '/admin/login' })
    await user.type(screen.getByLabelText(/^Email/), 'admin@eloria.local')
    await user.type(screen.getByLabelText(/^Password/), 'nope')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
  })
})

describe('admin CRUD', () => {
  it('creates a category and deletes another after confirmation', async () => {
    vi.spyOn(categoryService, 'listAll').mockResolvedValue([{ ...categories[1], treatmentCount: 0 }])
    const create = vi.spyOn(categoryService, 'create').mockResolvedValue({ ...categories[0], id: 3, name: 'Scalp Care' })
    const remove = vi.spyOn(categoryService, 'remove').mockResolvedValue(null)
    const user = userEvent.setup()
    renderRoute(<CategoriesAdminPage />)

    await user.click(await screen.findByRole('button', { name: 'New category' }))
    await user.type(screen.getByLabelText(/^Name/), 'Scalp Care')
    await user.click(screen.getByRole('button', { name: 'Create' }))
    await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Scalp Care', active: true })))

    await user.click(await screen.findByRole('button', { name: 'Delete Body' }))
    expect(screen.getByRole('dialog', { name: 'Delete this category?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(remove).toHaveBeenCalledWith(2, undefined))
  })
})

describe('image upload', () => {
  it('uploads an image, previews it, and rejects unsupported files', async () => {
    const upload = vi.spyOn(uploadService, 'upload').mockResolvedValue({ url: '/uploads/gallery/x.webp', storageKey: 'gallery/x.webp', contentType: 'image/webp', size: 10 })
    const onChange = vi.fn()
    const user = userEvent.setup({ applyAccept: false })
    renderRoute(<ImageUploader label="Image" folder="gallery" value={null} onChange={onChange} />)
    const input = document.querySelector('input[type=file]') as HTMLInputElement

    await user.upload(input, new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' }))
    expect(upload).not.toHaveBeenCalled()
    expect(await screen.findByText('Unsupported file')).toBeInTheDocument()

    await user.upload(input, new File(['webp'], 'photo.webp', { type: 'image/webp' }))
    await waitFor(() => expect(upload).toHaveBeenCalledWith(expect.any(File), 'gallery', expect.any(Function)))
    expect(onChange).toHaveBeenCalledWith('/uploads/gallery/x.webp')
  })
})
