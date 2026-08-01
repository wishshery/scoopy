/**
 * All written content for the site lives here.
 *
 * Everything below is plain data — editing this file is the intended way to change
 * copy, add a personality trait, extend the timeline, or record a new memory.
 * No markup or styling decisions belong in this file.
 */

export const meta = {
  name: 'Scoopy',
  species: 'Sun Conure',
  tagline: 'The tiny bird with the biggest personality.',
  description:
    "Scoopy's little corner of the world — an interactive tribute to a Sun Conure with endless curiosity and a heart full of affection.",
};

/** Anchors used by the top navigation and the scroll-spy. */
export const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'personality', label: 'Personality' },
  { id: 'routine', label: 'A Day' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'facts', label: 'Facts' },
  { id: 'memories', label: 'Memories' },
  { id: 'follow', label: 'Follow' },
];

/** Instagram. `qr` points at the pre-generated code in public/brand/. */
export const social = {
  instagram: {
    handle: '@scoopsforoops',
    url: 'https://www.instagram.com/scoopsforoops?utm_source=qr',
    qr: 'brand/instagram-qr.png',
    eyebrow: 'Follow along',
    heading: 'More Scoopy, every week.',
    text: 'The daily chirps, the mid-adventure photographs, and the occasional dramatic reaction to a grape — all of it lives on Instagram. Scan the code, or tap through.',
    qrLabel: 'Point your camera here',
  },
};

export const about = {
  eyebrow: 'The story',
  heading: 'A very small bird, running a very large household.',
  paragraphs: [
    "Scoopy is a beautiful Sun Conure with endless curiosity, boundless energy, and a heart full of affection. Every morning begins with cheerful chirps, playful adventures, and moments that brighten everyone's day.",
    'Whether exploring new places, demanding attention, or showing off colourful feathers, Scoopy turns ordinary days into unforgettable memories.',
    'He has opinions about breakfast, strong feelings about closed doors, and an unshakeable belief that every conversation in this house is one he was invited to.',
  ],
  /** Small stat chips shown beside the story. */
  highlights: [
    { value: 'Sunrise', label: 'Preferred alarm clock' },
    { value: 'Everything', label: 'Foods worth investigating' },
    { value: 'Always', label: 'Wants to be included' },
  ],
};

export const personality = [
  {
    icon: 'compass',
    title: 'Curious Explorer',
    body: 'Always searching for something new. Every drawer, pocket and paper bag is an unsolved mystery.',
  },
  {
    icon: 'sparkle',
    title: 'Professional Mischief Maker',
    body: 'Finds creative ways to steal attention. Success rate: uncomfortably high.',
  },
  {
    icon: 'note',
    title: 'Professional Singer',
    body: 'Loves chirping and talking all day. Repertoire ranges from soft morning warbles to full opera at 7am.',
  },
  {
    icon: 'claw',
    title: 'Tiny Dinosaur',
    body: 'Walks with confidence and rules the house. Small in stature, enormous in conviction.',
  },
  {
    icon: 'apple',
    title: 'Food Critic',
    body: "Always interested in whatever everyone else is eating. Especially the thing he already has on his own plate.",
  },
  {
    icon: 'heart',
    title: 'Loyal Companion',
    body: 'Never wants to be left out. Will follow the sound of your voice from three rooms away.',
  },
];

export const routine = [
  {
    time: 'Morning',
    title: 'The wake-up call',
    body: 'Wake everyone up with cheerful chirps. Negotiation is not an option and snoozing is not a concept he recognises.',
  },
  {
    time: 'Breakfast',
    title: 'The most important meal',
    body: 'Fresh fruits and favourite treats, inspected thoroughly, then eaten with great enthusiasm and considerable mess.',
  },
  {
    time: 'Adventure Time',
    title: 'Expedition hours',
    body: 'Play, climb, and explore. Furniture becomes terrain. Shoulders become lookout points.',
  },
  {
    time: 'Nap Time',
    title: 'Recharging',
    body: 'Recharge before the next adventure. One eye stays open, purely for supervisory purposes.',
  },
  {
    time: 'Evening',
    title: 'Family hours',
    body: 'Family cuddles and conversations. He contributes to every topic, whether or not he was consulted.',
  },
];

/**
 * Fun facts. Entries with a `count` animate as a number counter when scrolled
 * into view; entries without one simply fade in.
 */
export const facts = [
  { label: 'Species', value: 'Sun Conure' },
  { label: 'Scientific Name', value: 'Aratinga solstitialis', italic: true },
  { label: 'Life Span', count: { from: 0, to: 30, suffix: '' }, value: '20 to 30 years', note: 'years' },
  { label: 'Favourite Hobby', value: "Getting everyone's attention." },
  { label: 'Special Talent', value: 'Making people smile.' },
  { label: 'Colour Palette', value: 'Sunshine in feather form.' },
];

export const quotes = [
  'Small wings. Endless happiness.',
  'Some companions have feathers instead of words.',
  'Every colourful feather tells a story.',
];

/**
 * Memory wall.
 *
 * Add a new entry to the TOP of this array to record a new memory. If you set
 * `photo` to the id of a processed photo (the filename without its extension,
 * lowercased and hyphenated), the memory renders with that image alongside it.
 */
export const memories = [
  {
    date: 'August 2026',
    title: 'The bow tie incident',
    body: 'Discovered that Scoopy has strong feelings about formalwear — specifically, that he looks excellent in it and everyone should be told immediately.',
    photo: 'scoopy-bowtie',
  },
  {
    date: 'Every morning',
    title: 'The dawn chorus of one',
    body: 'Sunrise arrives, and so does the singing. Neighbours have not complained, which we choose to interpret as appreciation.',
  },
  {
    date: 'Ongoing',
    title: 'Shoulder rights, established',
    body: 'A formal claim was staked on the left shoulder. No counter-offer has been accepted.',
  },
];

export const footer = {
  message:
    'Thank you for visiting Scoopy&rsquo;s little corner of the world. Every chirp, every feather, and every playful moment reminds us how much joy one tiny bird brings.',
  signature: 'Made with a great deal of affection.',
};
