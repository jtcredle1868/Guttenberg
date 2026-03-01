import { v4 as uuidv4 } from 'uuid';

// ─── Authors ────────────────────────────────────────────────────────────────

export const authors = [
  {
    id: 'author-001',
    name: 'Eleanor Voss',
    email: 'demo@guttenberg.io',
    bio: 'Eleanor Voss is a USA Today bestselling author of literary fiction and psychological thrillers. Her novels have been translated into 14 languages.',
    website: 'https://eleannorvoss.com',
    publisherRole: 'author',
    avatarUrl: 'https://i.pravatar.cc/150?u=author-001',
    createdAt: '2023-01-15T08:00:00Z',
  },
  {
    id: 'author-002',
    name: 'Marcus Delgado',
    email: 'marcus@guttenberg.io',
    bio: 'Marcus Delgado writes epic fantasy and science fiction. Former NASA engineer who brings hard science to imaginative worlds.',
    website: 'https://marcusdelgado.io',
    publisherRole: 'author',
    avatarUrl: 'https://i.pravatar.cc/150?u=author-002',
    createdAt: '2023-03-22T10:30:00Z',
  },
  {
    id: 'author-003',
    name: 'Priya Anand',
    email: 'priya@guttenberg.io',
    bio: 'Priya Anand is a non-fiction author specializing in business, leadership, and personal development. TED speaker and executive coach.',
    website: 'https://priyanand.com',
    publisherRole: 'author',
    avatarUrl: 'https://i.pravatar.cc/150?u=author-003',
    createdAt: '2023-05-10T14:00:00Z',
  },
  {
    id: 'author-004',
    name: 'James Whitfield',
    email: 'james@guttenberg.io',
    bio: 'James Whitfield writes historical fiction set in 20th-century Europe. History professor at Cornell University.',
    website: 'https://jameswhitfield.net',
    publisherRole: 'author',
    avatarUrl: 'https://i.pravatar.cc/150?u=author-004',
    createdAt: '2023-07-04T09:15:00Z',
  },
  {
    id: 'publisher-001',
    name: 'Meridian Publishing Group',
    email: 'publisher@guttenberg.io',
    bio: 'Meridian Publishing Group is an independent publisher focused on emerging voices in literary fiction, genre fiction, and non-fiction.',
    website: 'https://meridianpublishing.com',
    publisherRole: 'publisher_admin',
    avatarUrl: 'https://i.pravatar.cc/150?u=publisher-001',
    createdAt: '2022-11-01T00:00:00Z',
  },
];

// ─── Titles ──────────────────────────────────────────────────────────────────

export const titles = [
  {
    id: 'title-001',
    title: 'The Glass Meridian',
    subtitle: 'A Novel of Fractured Truths',
    authorId: 'author-001',
    genre: 'Literary Fiction',
    bisacCodes: ['FIC019000', 'FIC014000'],
    keywords: ['psychological', 'identity', 'memory', 'literary fiction', 'debut'],
    description:
      'When memory specialist Dr. Sora Lindqvist discovers her own recollections have been surgically altered, she must reconstruct her past before whoever erased it comes back to finish the job. Set across Berlin, Tokyo, and São Paulo, The Glass Meridian is a dazzling literary thriller about the stories we tell ourselves to survive.',
    wordCount: 94200,
    pageCount: 352,
    publicationDate: '2024-03-15',
    status: 'published',
    coverImageUrl: 'https://picsum.photos/seed/glass-meridian/400/600',
    language: 'en',
    series: null,
    formats: ['paperback', 'ebook', 'hardcover'],
    distributionChannels: ['amazon_kdp', 'ingramspark', 'apple_books', 'kobo'],
    royalties: { totalEarned: 28450.75, ytd: 12300.00 },
    salesData: { totalUnits: 3842, ytdUnits: 1650, lastMonthUnits: 287 },
    refinery: { score: 91, lastSyncedAt: '2024-06-01T12:00:00Z' },
    metadata: { completeness: 95 },
    preflight: { score: 88 },
    createdAt: '2023-09-01T10:00:00Z',
    updatedAt: '2024-06-15T08:30:00Z',
  },
  {
    id: 'title-002',
    title: 'Starfall Protocol',
    subtitle: 'The Cascade Universe: Book One',
    authorId: 'author-002',
    genre: 'Science Fiction',
    bisacCodes: ['FIC028000', 'FIC028020'],
    keywords: ['space opera', 'hard sci-fi', 'first contact', 'AI', 'colony ships'],
    description:
      'Humanity\'s last colony ship discovers an alien signal buried in a dying star—but decoding it might end both civilizations. Engineer Kenji Murakami races against an AI uprising and the heat death of the sun to make first contact the right way.',
    wordCount: 128000,
    pageCount: 482,
    publicationDate: '2024-07-04',
    status: 'published',
    coverImageUrl: 'https://picsum.photos/seed/starfall/400/600',
    language: 'en',
    series: { name: 'The Cascade Universe', position: 1 },
    formats: ['paperback', 'ebook'],
    distributionChannels: ['amazon_kdp', 'ingramspark', 'kobo', 'barnes_noble'],
    royalties: { totalEarned: 19870.40, ytd: 14200.00 },
    salesData: { totalUnits: 2910, ytdUnits: 2100, lastMonthUnits: 412 },
    refinery: { score: 87, lastSyncedAt: '2024-07-10T15:00:00Z' },
    metadata: { completeness: 90 },
    preflight: { score: 82 },
    createdAt: '2023-11-12T14:00:00Z',
    updatedAt: '2024-07-15T11:00:00Z',
  },
  {
    id: 'title-003',
    title: 'Lead Without Limits',
    subtitle: 'The Executive\'s Field Guide to Transformational Leadership',
    authorId: 'author-003',
    genre: 'Business & Leadership',
    bisacCodes: ['BUS071000', 'BUS041000'],
    keywords: ['leadership', 'management', 'executive', 'transformation', 'business'],
    description:
      'Drawing on 200+ interviews with Fortune 500 executives and a decade of coaching data, Priya Anand reveals the seven counterintuitive principles that separate good managers from transformational leaders. Packed with frameworks, case studies, and actionable playbooks.',
    wordCount: 72000,
    pageCount: 288,
    publicationDate: '2024-01-22',
    status: 'published',
    coverImageUrl: 'https://picsum.photos/seed/lead-limits/400/600',
    language: 'en',
    series: null,
    formats: ['paperback', 'ebook', 'audiobook'],
    distributionChannels: ['amazon_kdp', 'ingramspark', 'apple_books', 'kobo', 'barnes_noble'],
    royalties: { totalEarned: 42100.80, ytd: 22000.00 },
    salesData: { totalUnits: 6120, ytdUnits: 3200, lastMonthUnits: 530 },
    refinery: { score: 94, lastSyncedAt: '2024-05-20T09:00:00Z' },
    metadata: { completeness: 98 },
    preflight: { score: 96 },
    createdAt: '2023-07-18T11:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z',
  },
  {
    id: 'title-004',
    title: 'The Vienna Dispatch',
    subtitle: 'A Novel of Espionage and Empire',
    authorId: 'author-004',
    genre: 'Historical Fiction',
    bisacCodes: ['FIC014000', 'FIC031010'],
    keywords: ['wwii', 'spy thriller', 'vienna', 'historical', 'europe'],
    description:
      'Vienna, 1938. As the Third Reich tightens its grip on Austria, a Jewish art historian is recruited by British intelligence to smuggle a cache of stolen masterpieces—and the man who catalogued them—out of Nazi-occupied Europe.',
    wordCount: 108400,
    pageCount: 408,
    publicationDate: '2024-05-01',
    status: 'published',
    coverImageUrl: 'https://picsum.photos/seed/vienna/400/600',
    language: 'en',
    series: null,
    formats: ['paperback', 'hardcover', 'ebook'],
    distributionChannels: ['amazon_kdp', 'ingramspark', 'apple_books'],
    royalties: { totalEarned: 15340.20, ytd: 9800.00 },
    salesData: { totalUnits: 2180, ytdUnits: 1400, lastMonthUnits: 198 },
    refinery: { score: 78, lastSyncedAt: '2024-04-15T16:00:00Z' },
    metadata: { completeness: 85 },
    preflight: { score: 80 },
    createdAt: '2023-12-05T09:00:00Z',
    updatedAt: '2024-05-10T12:00:00Z',
  },
  {
    id: 'title-005',
    title: 'Echoes in the Dark',
    subtitle: '',
    authorId: 'author-001',
    genre: 'Psychological Thriller',
    bisacCodes: ['FIC030000', 'FIC022000'],
    keywords: ['thriller', 'psychological', 'unreliable narrator', 'domestic', 'suspense'],
    description:
      'A woman wakes up in a hospital with no memory of the last six months—and a dead husband the police say she killed. As she pieces together the truth, she discovers some memories are better left buried.',
    wordCount: 86500,
    pageCount: 326,
    publicationDate: null,
    status: 'draft',
    coverImageUrl: null,
    language: 'en',
    series: null,
    formats: [],
    distributionChannels: [],
    royalties: { totalEarned: 0, ytd: 0 },
    salesData: { totalUnits: 0, ytdUnits: 0, lastMonthUnits: 0 },
    refinery: { score: 62, lastSyncedAt: '2024-07-01T10:00:00Z' },
    metadata: { completeness: 55 },
    preflight: { score: 0 },
    createdAt: '2024-04-20T08:00:00Z',
    updatedAt: '2024-07-18T14:00:00Z',
  },
  {
    id: 'title-006',
    title: 'Cascade Falling',
    subtitle: 'The Cascade Universe: Book Two',
    authorId: 'author-002',
    genre: 'Science Fiction',
    bisacCodes: ['FIC028000'],
    keywords: ['space opera', 'sequel', 'alien', 'military sci-fi'],
    description:
      'Six months after first contact, humanity\'s fragile alliance with the Aether Collective fractures—and Kenji Murakami finds himself the only human on an alien warship, racing to prevent an interstellar war.',
    wordCount: 142000,
    pageCount: 534,
    publicationDate: null,
    status: 'draft',
    coverImageUrl: null,
    language: 'en',
    series: { name: 'The Cascade Universe', position: 2 },
    formats: [],
    distributionChannels: [],
    royalties: { totalEarned: 0, ytd: 0 },
    salesData: { totalUnits: 0, ytdUnits: 0, lastMonthUnits: 0 },
    refinery: { score: 55, lastSyncedAt: '2024-07-20T08:00:00Z' },
    metadata: { completeness: 40 },
    preflight: { score: 0 },
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-07-20T08:30:00Z',
  },
  {
    id: 'title-007',
    title: 'The Quiet Season',
    subtitle: 'Poems of Loss and Renewal',
    authorId: 'author-004',
    genre: 'Poetry',
    bisacCodes: ['POE023000'],
    keywords: ['poetry', 'grief', 'nature', 'healing'],
    description:
      'A debut collection of 64 poems charting one year of grief after the loss of a child—raw, luminous, and ultimately transcendent.',
    wordCount: 18000,
    pageCount: 120,
    publicationDate: '2023-09-15',
    status: 'archived',
    coverImageUrl: 'https://picsum.photos/seed/quiet-season/400/600',
    language: 'en',
    series: null,
    formats: ['paperback', 'ebook'],
    distributionChannels: ['amazon_kdp', 'ingramspark'],
    royalties: { totalEarned: 3200.00, ytd: 240.00 },
    salesData: { totalUnits: 820, ytdUnits: 62, lastMonthUnits: 4 },
    refinery: { score: 72, lastSyncedAt: '2023-09-01T10:00:00Z' },
    metadata: { completeness: 80 },
    preflight: { score: 78 },
    createdAt: '2023-06-01T09:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'title-008',
    title: 'Mindful Money',
    subtitle: 'Rewire Your Relationship with Wealth',
    authorId: 'author-003',
    genre: 'Personal Finance',
    bisacCodes: ['BUS050000', 'SEL016000'],
    keywords: ['personal finance', 'mindfulness', 'wealth', 'money mindset'],
    description:
      'Priya Anand blends behavioral economics, mindfulness practice, and real-world financial planning into a radical new approach to building lasting wealth—starting from the inside out.',
    wordCount: 65000,
    pageCount: 258,
    publicationDate: '2024-09-01',
    status: 'draft',
    coverImageUrl: null,
    language: 'en',
    series: null,
    formats: [],
    distributionChannels: [],
    royalties: { totalEarned: 0, ytd: 0 },
    salesData: { totalUnits: 0, ytdUnits: 0, lastMonthUnits: 0 },
    refinery: { score: 83, lastSyncedAt: '2024-07-15T12:00:00Z' },
    metadata: { completeness: 70 },
    preflight: { score: 0 },
    createdAt: '2024-03-10T11:00:00Z',
    updatedAt: '2024-07-15T12:30:00Z',
  },
  {
    id: 'title-009',
    title: 'Iron Compass',
    subtitle: 'A Historical Thriller',
    authorId: 'author-004',
    genre: 'Historical Thriller',
    bisacCodes: ['FIC014000', 'FIC031000'],
    keywords: ['wwi', 'military', 'code breaking', 'thriller', 'historical'],
    description:
      'A deaf code-breaker at the Somme discovers the Allied cipher has been compromised—by someone in his own unit. A race against dawn to expose the traitor before the morning advance.',
    wordCount: 96000,
    pageCount: 362,
    publicationDate: '2024-11-11',
    status: 'draft',
    coverImageUrl: 'https://picsum.photos/seed/iron-compass/400/600',
    language: 'en',
    series: null,
    formats: ['paperback', 'ebook'],
    distributionChannels: [],
    royalties: { totalEarned: 0, ytd: 0 },
    salesData: { totalUnits: 0, ytdUnits: 0, lastMonthUnits: 0 },
    refinery: { score: 76, lastSyncedAt: '2024-07-10T09:00:00Z' },
    metadata: { completeness: 62 },
    preflight: { score: 0 },
    createdAt: '2024-02-14T10:00:00Z',
    updatedAt: '2024-07-10T09:15:00Z',
  },
  {
    id: 'title-010',
    title: 'Neon Requiem',
    subtitle: 'Stories from the Edge',
    authorId: 'author-002',
    genre: 'Short Fiction',
    bisacCodes: ['FIC028000', 'FIC029000'],
    keywords: ['short stories', 'cyberpunk', 'near future', 'dystopia'],
    description:
      'Twelve stories of broken futures and stubborn hope—from the last jazz club in a flooded New Orleans to an AI poet writing elegies in machine code.',
    wordCount: 52000,
    pageCount: 204,
    publicationDate: '2023-11-28',
    status: 'published',
    coverImageUrl: 'https://picsum.photos/seed/neon-requiem/400/600',
    language: 'en',
    series: null,
    formats: ['ebook', 'paperback'],
    distributionChannels: ['amazon_kdp', 'kobo', 'apple_books'],
    royalties: { totalEarned: 8760.30, ytd: 2100.00 },
    salesData: { totalUnits: 1540, ytdUnits: 380, lastMonthUnits: 44 },
    refinery: { score: 82, lastSyncedAt: '2023-11-20T14:00:00Z' },
    metadata: { completeness: 88 },
    preflight: { score: 85 },
    createdAt: '2023-08-22T10:00:00Z',
    updatedAt: '2024-04-01T08:00:00Z',
  },
];

// ─── Formats ─────────────────────────────────────────────────────────────────

export const formats = [
  { id: 'fmt-001', titleId: 'title-001', type: 'paperback', isbn: '978-1-234567-89-0', price: 17.99, printingCost: 4.85, royaltyRate: 0.60, trimSize: '6x9', pageCount: 352, status: 'active', coverUrl: 'https://picsum.photos/seed/fmt001/400/600', interiorUrl: null, createdAt: '2024-02-10T10:00:00Z' },
  { id: 'fmt-002', titleId: 'title-001', type: 'hardcover', isbn: '978-1-234567-90-6', price: 28.99, printingCost: 9.20, royaltyRate: 0.60, trimSize: '6x9', pageCount: 352, status: 'active', coverUrl: 'https://picsum.photos/seed/fmt002/400/600', interiorUrl: null, createdAt: '2024-02-10T10:05:00Z' },
  { id: 'fmt-003', titleId: 'title-001', type: 'ebook', isbn: '978-1-234567-91-3', price: 9.99, printingCost: 0, royaltyRate: 0.70, trimSize: null, pageCount: null, status: 'active', coverUrl: null, interiorUrl: null, createdAt: '2024-02-10T10:10:00Z' },
  { id: 'fmt-004', titleId: 'title-002', type: 'paperback', isbn: '978-1-345678-12-4', price: 19.99, printingCost: 5.80, royaltyRate: 0.60, trimSize: '6x9', pageCount: 482, status: 'active', coverUrl: 'https://picsum.photos/seed/fmt004/400/600', interiorUrl: null, createdAt: '2024-05-20T10:00:00Z' },
  { id: 'fmt-005', titleId: 'title-002', type: 'ebook', isbn: '978-1-345678-13-1', price: 7.99, printingCost: 0, royaltyRate: 0.70, trimSize: null, pageCount: null, status: 'active', coverUrl: null, interiorUrl: null, createdAt: '2024-05-20T10:05:00Z' },
  { id: 'fmt-006', titleId: 'title-003', type: 'paperback', isbn: '978-1-456789-23-5', price: 24.99, printingCost: 5.10, royaltyRate: 0.60, trimSize: '6x9', pageCount: 288, status: 'active', coverUrl: 'https://picsum.photos/seed/fmt006/400/600', interiorUrl: null, createdAt: '2023-11-15T10:00:00Z' },
  { id: 'fmt-007', titleId: 'title-003', type: 'ebook', isbn: '978-1-456789-24-2', price: 12.99, printingCost: 0, royaltyRate: 0.70, trimSize: null, pageCount: null, status: 'active', coverUrl: null, interiorUrl: null, createdAt: '2023-11-15T10:05:00Z' },
  { id: 'fmt-008', titleId: 'title-003', type: 'audiobook', isbn: null, price: 24.95, printingCost: 0, royaltyRate: 0.25, trimSize: null, pageCount: null, status: 'active', coverUrl: null, interiorUrl: null, createdAt: '2023-11-15T10:10:00Z' },
  { id: 'fmt-009', titleId: 'title-004', type: 'paperback', isbn: '978-1-567890-34-6', price: 21.99, printingCost: 5.50, royaltyRate: 0.60, trimSize: '6x9', pageCount: 408, status: 'active', coverUrl: 'https://picsum.photos/seed/fmt009/400/600', interiorUrl: null, createdAt: '2024-03-20T10:00:00Z' },
  { id: 'fmt-010', titleId: 'title-004', type: 'hardcover', isbn: '978-1-567890-35-3', price: 32.99, printingCost: 10.40, royaltyRate: 0.60, trimSize: '6x9', pageCount: 408, status: 'active', coverUrl: 'https://picsum.photos/seed/fmt010/400/600', interiorUrl: null, createdAt: '2024-03-20T10:05:00Z' },
  { id: 'fmt-011', titleId: 'title-004', type: 'ebook', isbn: '978-1-567890-36-0', price: 9.99, printingCost: 0, royaltyRate: 0.70, trimSize: null, pageCount: null, status: 'active', coverUrl: null, interiorUrl: null, createdAt: '2024-03-20T10:10:00Z' },
  { id: 'fmt-012', titleId: 'title-007', type: 'paperback', isbn: '978-1-678901-45-7', price: 14.99, printingCost: 3.20, royaltyRate: 0.60, trimSize: '5.5x8.5', pageCount: 120, status: 'active', coverUrl: 'https://picsum.photos/seed/fmt012/400/600', interiorUrl: null, createdAt: '2023-07-15T10:00:00Z' },
  { id: 'fmt-013', titleId: 'title-007', type: 'ebook', isbn: '978-1-678901-46-4', price: 5.99, printingCost: 0, royaltyRate: 0.70, trimSize: null, pageCount: null, status: 'active', coverUrl: null, interiorUrl: null, createdAt: '2023-07-15T10:05:00Z' },
  { id: 'fmt-014', titleId: 'title-010', type: 'paperback', isbn: '978-1-789012-56-8', price: 16.99, printingCost: 3.80, royaltyRate: 0.60, trimSize: '6x9', pageCount: 204, status: 'active', coverUrl: 'https://picsum.photos/seed/fmt014/400/600', interiorUrl: null, createdAt: '2023-10-01T10:00:00Z' },
  { id: 'fmt-015', titleId: 'title-010', type: 'ebook', isbn: '978-1-789012-57-5', price: 4.99, printingCost: 0, royaltyRate: 0.70, trimSize: null, pageCount: null, status: 'active', coverUrl: null, interiorUrl: null, createdAt: '2023-10-01T10:05:00Z' },
];

// ─── Distribution ─────────────────────────────────────────────────────────────

export const distributionRecords = [
  { id: 'dist-001', titleId: 'title-001', channel: 'amazon_kdp', status: 'live', submittedAt: '2024-03-01T09:00:00Z', liveAt: '2024-03-05T00:00:00Z', channelListingUrl: 'https://www.amazon.com/dp/B0EXAMPLE01', notes: null },
  { id: 'dist-002', titleId: 'title-001', channel: 'ingramspark', status: 'live', submittedAt: '2024-03-01T09:05:00Z', liveAt: '2024-03-10T00:00:00Z', channelListingUrl: null, notes: null },
  { id: 'dist-003', titleId: 'title-001', channel: 'apple_books', status: 'live', submittedAt: '2024-03-02T10:00:00Z', liveAt: '2024-03-08T00:00:00Z', channelListingUrl: 'https://books.apple.com/us/book/example', notes: null },
  { id: 'dist-004', titleId: 'title-001', channel: 'kobo', status: 'live', submittedAt: '2024-03-02T10:05:00Z', liveAt: '2024-03-07T00:00:00Z', channelListingUrl: 'https://www.kobo.com/us/en/ebook/example', notes: null },
  { id: 'dist-005', titleId: 'title-002', channel: 'amazon_kdp', status: 'live', submittedAt: '2024-06-20T09:00:00Z', liveAt: '2024-07-04T00:00:00Z', channelListingUrl: 'https://www.amazon.com/dp/B0EXAMPLE02', notes: null },
  { id: 'dist-006', titleId: 'title-002', channel: 'ingramspark', status: 'live', submittedAt: '2024-06-20T09:05:00Z', liveAt: '2024-07-04T00:00:00Z', channelListingUrl: null, notes: null },
  { id: 'dist-007', titleId: 'title-002', channel: 'kobo', status: 'live', submittedAt: '2024-06-21T10:00:00Z', liveAt: '2024-07-04T00:00:00Z', channelListingUrl: 'https://www.kobo.com/us/en/ebook/example2', notes: null },
  { id: 'dist-008', titleId: 'title-002', channel: 'barnes_noble', status: 'pending', submittedAt: '2024-07-10T10:00:00Z', liveAt: null, channelListingUrl: null, notes: 'Under review' },
  { id: 'dist-009', titleId: 'title-003', channel: 'amazon_kdp', status: 'live', submittedAt: '2023-12-10T09:00:00Z', liveAt: '2024-01-22T00:00:00Z', channelListingUrl: 'https://www.amazon.com/dp/B0EXAMPLE03', notes: null },
  { id: 'dist-010', titleId: 'title-003', channel: 'ingramspark', status: 'live', submittedAt: '2023-12-10T09:05:00Z', liveAt: '2024-01-22T00:00:00Z', channelListingUrl: null, notes: null },
  { id: 'dist-011', titleId: 'title-003', channel: 'apple_books', status: 'live', submittedAt: '2023-12-11T10:00:00Z', liveAt: '2024-01-22T00:00:00Z', channelListingUrl: 'https://books.apple.com/us/book/example3', notes: null },
  { id: 'dist-012', titleId: 'title-003', channel: 'kobo', status: 'live', submittedAt: '2023-12-11T10:05:00Z', liveAt: '2024-01-22T00:00:00Z', channelListingUrl: null, notes: null },
  { id: 'dist-013', titleId: 'title-003', channel: 'barnes_noble', status: 'live', submittedAt: '2023-12-12T10:00:00Z', liveAt: '2024-01-25T00:00:00Z', channelListingUrl: null, notes: null },
  { id: 'dist-014', titleId: 'title-004', channel: 'amazon_kdp', status: 'live', submittedAt: '2024-04-10T09:00:00Z', liveAt: '2024-05-01T00:00:00Z', channelListingUrl: 'https://www.amazon.com/dp/B0EXAMPLE04', notes: null },
  { id: 'dist-015', titleId: 'title-004', channel: 'ingramspark', status: 'live', submittedAt: '2024-04-10T09:05:00Z', liveAt: '2024-05-01T00:00:00Z', channelListingUrl: null, notes: null },
  { id: 'dist-016', titleId: 'title-004', channel: 'apple_books', status: 'live', submittedAt: '2024-04-11T10:00:00Z', liveAt: '2024-05-03T00:00:00Z', channelListingUrl: null, notes: null },
  { id: 'dist-017', titleId: 'title-007', channel: 'amazon_kdp', status: 'live', submittedAt: '2023-09-01T09:00:00Z', liveAt: '2023-09-15T00:00:00Z', channelListingUrl: 'https://www.amazon.com/dp/B0EXAMPLE07', notes: null },
  { id: 'dist-018', titleId: 'title-007', channel: 'ingramspark', status: 'live', submittedAt: '2023-09-01T09:05:00Z', liveAt: '2023-09-15T00:00:00Z', channelListingUrl: null, notes: null },
  { id: 'dist-019', titleId: 'title-010', channel: 'amazon_kdp', status: 'live', submittedAt: '2023-11-10T09:00:00Z', liveAt: '2023-11-28T00:00:00Z', channelListingUrl: 'https://www.amazon.com/dp/B0EXAMPLE10', notes: null },
  { id: 'dist-020', titleId: 'title-010', channel: 'kobo', status: 'live', submittedAt: '2023-11-10T09:05:00Z', liveAt: '2023-11-28T00:00:00Z', channelListingUrl: null, notes: null },
  { id: 'dist-021', titleId: 'title-010', channel: 'apple_books', status: 'live', submittedAt: '2023-11-11T10:00:00Z', liveAt: '2023-11-28T00:00:00Z', channelListingUrl: null, notes: null },
];

// ─── Sales Records (90 days) ──────────────────────────────────────────────────

function generateSales() {
  const records: any[] = [];
  const publishedTitles = [
    { titleId: 'title-001', formats: ['fmt-001', 'fmt-003'], channels: ['amazon_kdp', 'kobo'], avgDailyUnits: 5 },
    { titleId: 'title-002', formats: ['fmt-004', 'fmt-005'], channels: ['amazon_kdp', 'kobo'], avgDailyUnits: 8 },
    { titleId: 'title-003', formats: ['fmt-006', 'fmt-007'], channels: ['amazon_kdp', 'ingramspark', 'apple_books'], avgDailyUnits: 12 },
    { titleId: 'title-004', formats: ['fmt-009', 'fmt-011'], channels: ['amazon_kdp', 'apple_books'], avgDailyUnits: 4 },
    { titleId: 'title-010', formats: ['fmt-014', 'fmt-015'], channels: ['amazon_kdp', 'kobo'], avgDailyUnits: 2 },
  ];
  const prices: Record<string, number> = {
    'fmt-001': 17.99, 'fmt-002': 28.99, 'fmt-003': 9.99,
    'fmt-004': 19.99, 'fmt-005': 7.99,
    'fmt-006': 24.99, 'fmt-007': 12.99,
    'fmt-009': 21.99, 'fmt-010': 32.99, 'fmt-011': 9.99,
    'fmt-012': 14.99, 'fmt-013': 5.99,
    'fmt-014': 16.99, 'fmt-015': 4.99,
  };
  const royaltyRates: Record<string, number> = {
    'fmt-001': 0.60, 'fmt-002': 0.60, 'fmt-003': 0.70,
    'fmt-004': 0.60, 'fmt-005': 0.70,
    'fmt-006': 0.60, 'fmt-007': 0.70,
    'fmt-009': 0.60, 'fmt-010': 0.60, 'fmt-011': 0.70,
    'fmt-012': 0.60, 'fmt-013': 0.70,
    'fmt-014': 0.60, 'fmt-015': 0.70,
  };

  let idCounter = 1;
  const now = new Date();
  for (let d = 90; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];

    for (const title of publishedTitles) {
      for (const fmtId of title.formats) {
        for (const channel of title.channels) {
          const qty = Math.max(0, Math.round(title.avgDailyUnits / title.formats.length / title.channels.length * (0.6 + Math.random() * 0.8)));
          if (qty === 0) continue;
          const price = prices[fmtId] || 9.99;
          const revenue = +(qty * price).toFixed(2);
          const royalty = +(revenue * (royaltyRates[fmtId] || 0.60)).toFixed(2);
          records.push({
            id: `sale-${String(idCounter++).padStart(5, '0')}`,
            titleId: title.titleId,
            formatId: fmtId,
            channel,
            date: dateStr,
            quantity: qty,
            revenue,
            royalty,
          });
        }
      }
    }
  }
  return records;
}

export const salesRecords = generateSales();

// ─── ARC Campaigns ────────────────────────────────────────────────────────────

export const arcCampaigns = [
  {
    id: 'arc-001',
    titleId: 'title-001',
    title: 'The Glass Meridian – ARC Campaign',
    status: 'completed',
    arcCopiesRequested: 50,
    arcCopiesSent: 48,
    reviewsReceived: 31,
    launchDate: '2024-02-15',
    netgalleyUrl: 'https://www.netgalley.com/widget/example',
    notes: 'Strong early response. 31 verified reviews posted.',
  },
  {
    id: 'arc-002',
    titleId: 'title-002',
    title: 'Starfall Protocol – ARC Campaign',
    status: 'active',
    arcCopiesRequested: 75,
    arcCopiesSent: 71,
    reviewsReceived: 22,
    launchDate: '2024-06-01',
    netgalleyUrl: null,
    notes: 'Campaign ongoing. Reviews trickling in ahead of launch.',
  },
  {
    id: 'arc-003',
    titleId: 'title-003',
    title: 'Lead Without Limits – ARC Campaign',
    status: 'completed',
    arcCopiesRequested: 100,
    arcCopiesSent: 98,
    reviewsReceived: 67,
    launchDate: '2023-12-15',
    netgalleyUrl: null,
    notes: 'Exceptional review rate. 67% response rate.',
  },
  {
    id: 'arc-004',
    titleId: 'title-004',
    title: 'The Vienna Dispatch – ARC Campaign',
    status: 'completed',
    arcCopiesRequested: 40,
    arcCopiesSent: 38,
    reviewsReceived: 18,
    launchDate: '2024-03-20',
    netgalleyUrl: null,
    notes: null,
  },
];

// ─── Format Jobs ──────────────────────────────────────────────────────────────

export const formatJobs = [
  { id: 'job-001', titleId: 'title-001', type: 'paperback', status: 'completed', progress: 100, createdAt: '2024-02-08T10:00:00Z', completedAt: '2024-02-08T10:14:32Z', downloadUrl: '/api/formats/job-001/download', errorMessage: null },
  { id: 'job-002', titleId: 'title-001', type: 'ebook', status: 'completed', progress: 100, createdAt: '2024-02-08T10:15:00Z', completedAt: '2024-02-08T10:22:11Z', downloadUrl: '/api/formats/job-002/download', errorMessage: null },
  { id: 'job-003', titleId: 'title-002', type: 'paperback', status: 'completed', progress: 100, createdAt: '2024-05-18T14:00:00Z', completedAt: '2024-05-18T14:17:44Z', downloadUrl: '/api/formats/job-003/download', errorMessage: null },
  { id: 'job-004', titleId: 'title-003', type: 'ebook', status: 'completed', progress: 100, createdAt: '2023-11-12T09:00:00Z', completedAt: '2023-11-12T09:11:22Z', downloadUrl: '/api/formats/job-004/download', errorMessage: null },
  { id: 'job-005', titleId: 'title-005', type: 'paperback', status: 'failed', progress: 34, createdAt: '2024-07-15T11:00:00Z', completedAt: null, downloadUrl: null, errorMessage: 'Image resolution too low on page 42 (required: 300 DPI, found: 96 DPI)' },
  { id: 'job-006', titleId: 'title-006', type: 'ebook', status: 'processing', progress: 68, createdAt: '2024-07-20T08:00:00Z', completedAt: null, downloadUrl: null, errorMessage: null },
  { id: 'job-007', titleId: 'title-008', type: 'paperback', status: 'pending', progress: 0, createdAt: '2024-07-20T09:00:00Z', completedAt: null, downloadUrl: null, errorMessage: null },
];

// ─── Organization ─────────────────────────────────────────────────────────────

export const organization = {
  id: 'org-001',
  name: 'Meridian Publishing Group',
  plan: 'publisher_pro',
  logoUrl: 'https://picsum.photos/seed/meridian/200/200',
  imprints: [
    { id: 'imprint-001', name: 'Meridian Fiction', description: 'Literary and genre fiction imprint', titleCount: 7, createdAt: '2022-11-01T00:00:00Z' },
    { id: 'imprint-002', name: 'Meridian Nonfiction', description: 'Business, leadership, and self-help imprint', titleCount: 3, createdAt: '2023-01-15T00:00:00Z' },
    { id: 'imprint-003', name: 'Meridian Verse', description: 'Poetry and literary arts imprint', titleCount: 1, createdAt: '2023-06-01T00:00:00Z' },
  ],
  members: [
    { id: 'member-001', name: 'Meridian Publishing Group', email: 'publisher@guttenberg.io', role: 'publisher_admin', joinedAt: '2022-11-01T00:00:00Z', avatarUrl: 'https://i.pravatar.cc/150?u=publisher-001' },
    { id: 'member-002', name: 'Eleanor Voss', email: 'demo@guttenberg.io', role: 'author', joinedAt: '2023-01-15T00:00:00Z', avatarUrl: 'https://i.pravatar.cc/150?u=author-001' },
    { id: 'member-003', name: 'Marcus Delgado', email: 'marcus@guttenberg.io', role: 'author', joinedAt: '2023-03-22T00:00:00Z', avatarUrl: 'https://i.pravatar.cc/150?u=author-002' },
    { id: 'member-004', name: 'Priya Anand', email: 'priya@guttenberg.io', role: 'author', joinedAt: '2023-05-10T00:00:00Z', avatarUrl: 'https://i.pravatar.cc/150?u=author-003' },
    { id: 'member-005', name: 'James Whitfield', email: 'james@guttenberg.io', role: 'author', joinedAt: '2023-07-04T00:00:00Z', avatarUrl: 'https://i.pravatar.cc/150?u=author-004' },
    { id: 'member-006', name: 'Sarah Chen', email: 'sarah.chen@guttenberg.io', role: 'editor', joinedAt: '2023-02-01T00:00:00Z', avatarUrl: 'https://i.pravatar.cc/150?u=member-006' },
    { id: 'member-007', name: 'Tom Reeves', email: 'tom.reeves@guttenberg.io', role: 'designer', joinedAt: '2023-04-15T00:00:00Z', avatarUrl: 'https://i.pravatar.cc/150?u=member-007' },
  ],
};

// ─── Activity Feed ────────────────────────────────────────────────────────────

export const activityEvents = [
  { id: 'evt-001', type: 'title_published', description: 'Starfall Protocol went live on Amazon KDP', titleId: 'title-002', userId: 'author-002', createdAt: '2024-07-04T00:00:00Z' },
  { id: 'evt-002', type: 'format_completed', description: 'Paperback format generated for Starfall Protocol', titleId: 'title-002', userId: 'author-002', createdAt: '2024-05-18T14:17:44Z' },
  { id: 'evt-003', type: 'arc_review', description: '22 ARC reviews received for Starfall Protocol', titleId: 'title-002', userId: null, createdAt: '2024-07-15T09:00:00Z' },
  { id: 'evt-004', type: 'sales_milestone', description: 'Lead Without Limits crossed 6,000 total sales', titleId: 'title-003', userId: null, createdAt: '2024-07-10T00:00:00Z' },
  { id: 'evt-005', type: 'distribution_live', description: 'The Glass Meridian is now live on Apple Books', titleId: 'title-001', userId: 'author-001', createdAt: '2024-03-08T00:00:00Z' },
  { id: 'evt-006', type: 'title_created', description: 'Echoes in the Dark manuscript uploaded', titleId: 'title-005', userId: 'author-001', createdAt: '2024-04-20T08:00:00Z' },
  { id: 'evt-007', type: 'isbn_purchased', description: 'ISBN purchased for The Vienna Dispatch (hardcover)', titleId: 'title-004', userId: 'author-004', createdAt: '2024-03-18T11:00:00Z' },
  { id: 'evt-008', type: 'format_failed', description: 'Paperback format failed for Echoes in the Dark – low-res image detected', titleId: 'title-005', userId: null, createdAt: '2024-07-15T11:34:00Z' },
  { id: 'evt-009', type: 'member_invited', description: 'Sarah Chen invited as editor', titleId: null, userId: 'publisher-001', createdAt: '2023-02-01T10:00:00Z' },
  { id: 'evt-010', type: 'royalty_disbursement', description: 'Royalty disbursement of $4,218.50 processed', titleId: null, userId: null, createdAt: '2024-07-01T09:00:00Z' },
  { id: 'evt-011', type: 'title_updated', description: 'Metadata updated for Iron Compass', titleId: 'title-009', userId: 'author-004', createdAt: '2024-07-10T09:15:00Z' },
  { id: 'evt-012', type: 'cover_uploaded', description: 'Cover uploaded for Iron Compass', titleId: 'title-009', userId: 'author-004', createdAt: '2024-07-08T14:00:00Z' },
];

// ─── Version History ──────────────────────────────────────────────────────────

export const versionHistory: Record<string, any[]> = {
  'title-001': [
    { version: '1.0.0', label: 'Initial submission', notes: 'First manuscript draft uploaded from Refinery', createdAt: '2023-09-01T10:00:00Z', createdBy: 'author-001', wordCount: 91200 },
    { version: '1.1.0', label: 'Editorial revisions', notes: 'Incorporated line edits from Sarah Chen', createdAt: '2023-10-15T14:00:00Z', createdBy: 'member-006', wordCount: 93400 },
    { version: '1.2.0', label: 'Final proofread', notes: 'Proofread complete, minor corrections', createdAt: '2023-12-01T10:00:00Z', createdBy: 'author-001', wordCount: 94200 },
    { version: '1.2.1', label: 'Pre-press corrections', notes: 'Corrected 4 typos found in preflight', createdAt: '2024-02-01T09:00:00Z', createdBy: 'member-006', wordCount: 94200 },
  ],
  'title-002': [
    { version: '1.0.0', label: 'Initial draft', notes: 'First complete draft', createdAt: '2023-11-12T14:00:00Z', createdBy: 'author-002', wordCount: 124000 },
    { version: '1.1.0', label: 'Revised draft', notes: 'Expanded chapter 12, rewrote ending', createdAt: '2024-03-01T10:00:00Z', createdBy: 'author-002', wordCount: 128000 },
  ],
  'title-003': [
    { version: '1.0.0', label: 'Manuscript complete', notes: 'Final manuscript, all chapters complete', createdAt: '2023-07-18T11:00:00Z', createdBy: 'author-003', wordCount: 72000 },
    { version: '1.0.1', label: 'Index added', notes: 'Added full index and bibliography', createdAt: '2023-09-01T10:00:00Z', createdBy: 'author-003', wordCount: 72000 },
  ],
};

// ─── Disbursements ────────────────────────────────────────────────────────────

export const disbursements = [
  { id: 'disb-001', amount: 4218.50, date: '2024-07-01', status: 'completed', method: 'ACH Transfer', description: 'June 2024 royalties' },
  { id: 'disb-002', amount: 3940.20, date: '2024-06-01', status: 'completed', method: 'ACH Transfer', description: 'May 2024 royalties' },
  { id: 'disb-003', amount: 4112.80, date: '2024-05-01', status: 'completed', method: 'ACH Transfer', description: 'April 2024 royalties' },
  { id: 'disb-004', amount: 3788.00, date: '2024-04-01', status: 'completed', method: 'ACH Transfer', description: 'March 2024 royalties' },
  { id: 'disb-005', amount: 3622.40, date: '2024-03-01', status: 'completed', method: 'ACH Transfer', description: 'February 2024 royalties' },
  { id: 'disb-006', amount: 5100.00, date: '2024-08-01', status: 'pending', method: 'ACH Transfer', description: 'July 2024 royalties (estimated)' },
];
