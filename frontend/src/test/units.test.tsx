import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BeforeAfterSlider } from '@/components/results/BeforeAfterSlider'
import { formatDuration, formatPrice, humanize } from '@/utils/format'
import { sized, srcSet } from '@/utils/image'

describe('formatting', () => {
  it('formats euro prices, including starting prices', () => {
    expect(formatPrice(190)).toBe('€190')
    expect(formatPrice(150, true)).toBe('from €150')
    expect(formatPrice(89.5)).toBe('€89.50')
  })

  it('formats durations', () => {
    expect(formatDuration(45)).toBe('45 min')
    expect(formatDuration(60)).toBe('1 h')
    expect(formatDuration(75)).toBe('1 h 15')
  })

  it('humanizes enum values', () => {
    expect(humanize('TREATMENT_ROOMS')).toBe('Treatment rooms')
  })
})

describe('image helpers', () => {
  it('resizes placeholder photography and leaves uploads untouched', () => {
    const remote = 'https://images.unsplash.com/photo-1?auto=format&fit=crop&w=1600&h=2000&q=80'
    expect(sized(remote, 800)).toContain('w=800')
    expect(sized(remote, 800)).toContain('h=1000')
    expect(srcSet(remote)).toContain('480w')
    expect(sized('/uploads/gallery/a.webp', 800)).toBe('/uploads/gallery/a.webp')
    expect(srcSet('/uploads/gallery/a.webp')).toBeUndefined()
  })
})

describe('BeforeAfterSlider', () => {
  it('is an accessible slider operable from the keyboard', () => {
    render(<BeforeAfterSlider before="/b.jpg" after="/a.jpg" alt="Peel course" hint={false} />)
    const slider = screen.getByRole('slider', { name: 'Compare before and after' })
    expect(slider).toHaveAttribute('aria-valuenow', '50')
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    expect(slider).toHaveAttribute('aria-valuenow', '46')
    fireEvent.keyDown(slider, { key: 'PageUp' })
    expect(slider).toHaveAttribute('aria-valuenow', '56')
    fireEvent.keyDown(slider, { key: 'End' })
    expect(slider).toHaveAttribute('aria-valuenow', '100')
    expect(screen.getByAltText('Peel course, before')).toBeInTheDocument()
    expect(screen.getByAltText('Peel course, after')).toBeInTheDocument()
  })
})
