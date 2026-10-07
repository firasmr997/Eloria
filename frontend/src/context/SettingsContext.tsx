import { createContext, useContext, type ReactNode } from 'react'
import { useQuery } from '@/hooks/useQuery'
import { settingsService } from '@/services/contentService'
import type { CenterSettings } from '@/types/models'

/** Fallback shown while the profile loads or if the API is unreachable, so the footer never collapses. */
const FALLBACK: CenterSettings = {
  centerName: 'ÉLORIA AESTHETIC',
  tagline: 'Aesthetic medicine & skin care',
  addressLine: null,
  postalCode: null,
  city: 'Paris',
  country: 'France',
  phone: null,
  email: null,
  openingHours: [],
  instagramUrl: null,
  facebookUrl: null,
  pinterestUrl: null,
  mapUrl: null,
  updatedAt: '',
}

const SettingsContext = createContext<{ settings: CenterSettings; loaded: boolean }>({ settings: FALLBACK, loaded: false })

export const SETTINGS_KEY = 'settings'

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery(SETTINGS_KEY, (signal) => settingsService.get(signal), { staleTime: 5 * 60_000 })
  return <SettingsContext.Provider value={{ settings: data ?? FALLBACK, loaded: !!data }}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  return useContext(SettingsContext)
}

export function fullAddress(s: CenterSettings): string {
  return [s.addressLine, [s.postalCode, s.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
}
