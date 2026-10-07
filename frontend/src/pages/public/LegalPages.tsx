import type { ReactNode } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useSettings } from '@/context/SettingsContext'
import { disclaimer } from '@/data/content'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

/**
 * Template legal copy for the demo. It must be reviewed by a lawyer and completed with the operator's
 * legal details (company name, registration, data protection officer) before launch.
 */
function LegalLayout({ title, intro, sections }: { title: string; intro: string; sections: { heading: string; body: ReactNode }[] }) {
  return (
    <>
      <PageHeader title={title} intro={intro} />
      <section className="bg-ivory pb-28">
        <div className="shell">
          <div className="max-w-3xl border-t border-espresso">
            {sections.map((s) => (
              <div key={s.heading} className="border-b border-line py-10">
                <h2 className="text-h4 text-ink">{s.heading}</h2>
                <div className="mt-4 space-y-4 text-ink-muted">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export function Privacy() {
  const { settings } = useSettings()
  useDocumentMeta({ title: 'Privacy notice', description: 'How ÉLORIA AESTHETIC collects and uses personal data sent through this website.' })
  return (
    <LegalLayout
      title="Privacy notice"
      intro="How we use the information you send us through this website."
      sections={[
        { heading: 'What we collect', body: <p>When you request an appointment or send a message, we receive your name, email address, phone number, the treatment and time you chose, and anything you write in the message field.</p> },
        { heading: 'Why we use it', body: <p>Only to answer you and organise your appointment. We do not sell your data or use it for advertising.</p> },
        { heading: 'How long we keep it', body: <p>Requests and messages are kept for as long as needed to follow up with you, and deleted when no longer necessary.</p> },
        { heading: 'Health information', body: <p>Please do not send medical records through the website. Health information is discussed and recorded during your consultation, under medical confidentiality.</p> },
        {
          heading: 'Your rights',
          body: <p>You can ask to access, correct or delete your data at any time by writing to {settings.email ?? 'us'}. You may also contact the CNIL, the French data protection authority.</p>,
        },
      ]}
    />
  )
}

export function Terms() {
  useDocumentMeta({ title: 'Terms of use', description: 'Terms of use of the ÉLORIA AESTHETIC website.' })
  return (
    <LegalLayout
      title="Terms of use"
      intro="The conditions for using this website."
      sections={[
        { heading: 'Information, not advice', body: <p>{disclaimer.long}</p> },
        { heading: 'Appointment requests', body: <p>Sending a request through the website does not confirm an appointment. An appointment is confirmed only when our team contacts you to agree on a date and time.</p> },
        { heading: 'Prices', body: <p>Prices are given in euros, including VAT where applicable. Prices marked “from” depend on the area treated and the number of sessions, and are confirmed at consultation.</p> },
        { heading: 'Images', body: <p>Before and after images illustrate the kind of change a treatment can support. They are not a guarantee of results.</p> },
      ]}
    />
  )
}
