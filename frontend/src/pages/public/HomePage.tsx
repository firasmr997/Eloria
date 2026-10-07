import { BookingCTA } from '@/components/home/BookingCTA'
import { FeaturedTreatments } from '@/components/home/FeaturedTreatments'
import { GalleryPreview } from '@/components/home/GalleryPreview'
import { Hero } from '@/components/home/Hero'
import { Introduction } from '@/components/home/Introduction'
import { Journey } from '@/components/home/Journey'
import { LocationSection } from '@/components/home/LocationSection'
import { Philosophy } from '@/components/home/Philosophy'
import { ResultsPreview } from '@/components/home/ResultsPreview'
import { SocialGrid } from '@/components/home/SocialGrid'
import { SpecialistsPreview } from '@/components/home/SpecialistsPreview'
import { Testimonials } from '@/components/home/Testimonials'
import { WhyEloria } from '@/components/home/WhyEloria'
import { fullAddress, useSettings } from '@/context/SettingsContext'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

export default function HomePage() {
  const { settings } = useSettings()
  useDocumentMeta({
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'MedicalBusiness',
      name: 'ÉLORIA AESTHETIC',
      description: 'Aesthetic medicine and skin care center in Paris.',
      url: window.location.origin,
      telephone: settings.phone ?? undefined,
      email: settings.email ?? undefined,
      address: fullAddress(settings) || undefined,
      openingHours: settings.openingHours.map((h) => `${h.label} ${h.hours}`),
    },
  })

  return (
    <>
      <Hero />
      <Introduction />
      <FeaturedTreatments />
      <Philosophy />
      <Journey />
      <ResultsPreview />
      <WhyEloria />
      <SpecialistsPreview />
      <GalleryPreview />
      <Testimonials />
      <SocialGrid />
      <BookingCTA />
      <LocationSection />
    </>
  )
}
