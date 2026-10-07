/**
 * Editorial copy that is part of the brand rather than managed content. Treatments, team, results,
 * testimonials, gallery and the center's address and hours come from the API.
 */
export const disclaimer = {
  short: 'Individual results vary. Suitability is always assessed by a qualified professional.',
  long:
    'Individual results vary from person to person. Every treatment is preceded by a consultation with a qualified professional, who will assess whether it is suitable for you. The information on this website does not replace personal medical advice.',
}

export const navigation = [
  { to: '/treatments', label: 'Treatments' },
  { to: '/results', label: 'Results' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/team', label: 'Team' },
  { to: '/contact', label: 'Contact' },
] as const

export const hero = {
  /** Two lines: the second ends on the underlined accent word. */
  lines: ['Where beauty', 'meets'],
  accent: 'precision.',
  body: 'A Paris center for aesthetic medicine and skin care, where every treatment begins with an honest conversation and is carried out with clinical care.',
}

export const introduction = {
  title: 'Considered care, never a menu of promises.',
  paragraphs: [
    'Éloria brings aesthetic physicians, nurses and skin therapists under one roof in the 8th arrondissement. We work slowly and precisely, with medical-grade technology and products we trust.',
    'Before any treatment, you meet a specialist who listens, examines your skin and tells you plainly what is realistic. Sometimes the best recommendation is a simpler one.',
  ],
  facts: [
    { value: 'Consultation', label: 'before every first treatment' },
    { value: 'Medical team', label: 'physicians, nurses and therapists' },
    { value: 'Paris 8e', label: 'a quiet street near the Champs-Élysées' },
  ],
}

export const philosophy = [
  {
    title: 'Listen first.',
    body: 'Your goals, your history, your daily life. A good plan starts with understanding why you came, not with a list of treatments.',
  },
  {
    title: 'Measure precisely.',
    body: 'Skin analysis, conservative settings and documented protocols. We change one thing at a time and review what it did.',
  },
  {
    title: 'Respect the face.',
    body: 'We aim for skin that looks healthy and rested, and for results that still look like you. Restraint is part of the craft.',
  },
] as const

export const journey = [
  { title: 'Consultation', body: 'A private conversation with a specialist about your concerns, history and expectations.' },
  { title: 'Skin assessment', body: 'A close examination of your skin to understand its type, its condition and what it tolerates.' },
  { title: 'Your protocol', body: 'A written plan: the treatments, their order, the number of sessions, the cost and the downtime.' },
  { title: 'Treatment', body: 'Carried out by the right practitioner, in a calm room, with the time it deserves.' },
  { title: 'Aftercare', body: 'Clear instructions, a follow-up call and a review of how your skin responded.' },
] as const

export const whyEloria = [
  { title: 'A personalised approach', body: 'No standard packages. Your plan is built around your skin and adjusted at every visit.' },
  { title: 'Advanced, proven technology', body: 'Medical-grade lasers, radiofrequency and LED, chosen for safety and evidence, not novelty.' },
  { title: 'Medical expertise', body: 'Physicians lead every medical consultation; nurses and therapists are trained on each protocol.' },
  { title: 'A calm, private experience', body: 'Appointments that run on time, private rooms and the attention you would expect from a fine hotel.' },
] as const

export const about = {
  story: {
    title: 'Our story',
    body: [
      'Éloria was founded on a simple observation: many people want to look after their skin but feel lost between beauty salons that promise too much and medical clinics that feel cold.',
      'We set out to create a third place. A center with the rigour of medicine and the warmth of a private house, where the first question is always what you want, and the second is whether it is right for you.',
    ],
  },
  philosophy: {
    title: 'Our philosophy',
    body: 'Healthy, well-cared-for skin ages better and looks more like you. We favour progressive treatments, sensible intervals and good daily habits over dramatic change.',
  },
  approach: {
    title: 'Our approach',
    points: [
      { title: 'One plan, one specialist', body: 'You are followed by the same person from consultation to aftercare.' },
      { title: 'Written protocols', body: 'Every plan states the treatments, the sessions, the cost and the expected downtime.' },
      { title: 'Review, then adjust', body: 'Each visit starts by looking at how your skin responded to the last one.' },
    ],
  },
  expertise: {
    title: 'Our expertise',
    body: 'Our team brings together aesthetic physicians, a dermatology-trained nurse and senior skin therapists. Laser and medical treatments are performed or supervised by our physicians, and every device is maintained and calibrated to the manufacturer’s schedule.',
  },
  environment: {
    title: 'Our environment',
    body: 'Stone, linen and soft daylight. Private treatment rooms, a quiet lounge and nothing that hurries you.',
  },
  commitment: {
    title: 'Our commitment',
    points: [
      'We never present a result as guaranteed.',
      'We tell you when a treatment is not right for you.',
      'We explain prices before you commit to anything.',
      'We protect your privacy and your photographs.',
    ],
  },
}

export const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
] as const
