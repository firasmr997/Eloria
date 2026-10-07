/**
 * Every static photograph on the public site, in one place. Content managed in the admin (treatments,
 * gallery, results, team) comes from the API instead. To use real photography, replace these URLs with
 * files in /public (e.g. '/media/hero.jpg') or uploaded images; nothing else needs to change.
 *
 * Current images are Unsplash placeholders (free licence), chosen for warm, natural light.
 */
const unsplash = (id: string, w = 1600, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=80`

export const media = {
  hero: { src: unsplash('1509967419530-da38b4704bc6', 1400, 1800), alt: 'Portrait of a woman with natural, luminous skin' },
  introduction: { src: unsplash('1599305090598-fe179d501227', 1200, 1500), alt: 'Jar of cream resting on warm stone in the afternoon light' },
  philosophy: [
    { src: unsplash('1512290923902-8a9f81dc236c', 1400, 1700), alt: 'Practitioner performing a precise manual facial' },
    { src: unsplash('1576426863848-c21f53c60b19', 1400, 1700), alt: 'Serum dropper on white marble' },
    { src: unsplash('1531123897727-8f129e1688ce', 1400, 1700), alt: 'Portrait of a confident woman in warm light' },
  ],
  bookingCta: { src: unsplash('1618221195710-dd6b41faaea6', 2000, 1200), alt: 'The Éloria lounge in soft daylight' },
  location: { src: unsplash('1600566753190-17f0baa2a6c3', 1400, 1700), alt: 'Glass and wood entrance of the center' },
  about: {
    story: { src: unsplash('1618219908412-a29a1bb7b86e', 1400, 1800), alt: 'Arrival area with a round mirror and rattan lamp' },
    approach: { src: unsplash('1552693673-1bf958298935', 1600, 1100), alt: 'Gloved practitioner treating a client’s skin' },
    expertise: { src: unsplash('1515377905703-c4788e51af15', 1400, 1700), alt: 'Hands applying drops of facial oil' },
    environment: [
      { src: unsplash('1556228453-efd6c1ff04f6', 1600, 1100), alt: 'The lounge where consultations begin' },
      { src: unsplash('1631049307264-da0ec9d70304', 1200, 1500), alt: 'Private treatment suite' },
      { src: unsplash('1629079447777-1e605162dc8d', 1200, 1500), alt: 'Washroom finished in stone and white' },
    ],
    commitment: { src: unsplash('1590439471364-192aa70c0b53', 1400, 1400), alt: 'Linen towel, soap and brush laid out' },
  },
  contact: { src: unsplash('1600585154340-be6161a56a0c', 1600, 1100), alt: 'The building at dusk' },
  login: { src: unsplash('1618221195710-dd6b41faaea6', 1400, 1800), alt: 'The Éloria lounge' },
} as const
