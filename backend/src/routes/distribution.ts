import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { distributionRecords, titles, formats } from '../data/mockData';

const router = Router();

const channelDefinitions = [
  {
    id: 'amazon_kdp',
    name: 'Amazon KDP',
    description: 'Kindle Direct Publishing – reach Amazon\'s massive global marketplace for ebook and print.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    supportedFormats: ['paperback', 'hardcover', 'ebook'],
    territories: ['US', 'UK', 'DE', 'FR', 'ES', 'IT', 'JP', 'CA', 'AU', 'IN', 'BR', 'MX'],
    royaltyRates: { ebook_standard: '35%', ebook_premium: '70% ($2.99–$9.99)', print: '60% of net' },
    processingDays: '3–5',
    requirements: { minPrice: 0.99, maxPrice: 9.99, coverDpi: 300, interiorDpi: 300 },
    url: 'https://kdp.amazon.com',
  },
  {
    id: 'ingramspark',
    name: 'IngramSpark',
    description: 'Distribute to 40,000+ retailers, libraries, and schools worldwide through Ingram\'s network.',
    logoUrl: 'https://picsum.photos/seed/ingram/200/60',
    supportedFormats: ['paperback', 'hardcover', 'ebook'],
    territories: ['Global'],
    royaltyRates: { ebook: '45% of list price', print: '40% of net' },
    processingDays: '3–5 business days',
    requirements: { minPrice: 1.99, setupFee: 49.00, coverDpi: 300, interiorDpi: 300 },
    url: 'https://ingramspark.com',
  },
  {
    id: 'apple_books',
    name: 'Apple Books',
    description: 'Reach Apple\'s global audience across iPhone, iPad, and Mac.',
    logoUrl: 'https://picsum.photos/seed/apple/200/60',
    supportedFormats: ['ebook'],
    territories: ['US', 'UK', 'DE', 'FR', 'AU', 'CA', 'JP', '50+ more'],
    royaltyRates: { ebook: '70% of list price' },
    processingDays: '1–3 business days',
    requirements: { minPrice: 0.99, formats: ['EPUB'] },
    url: 'https://authors.apple.com',
  },
  {
    id: 'kobo',
    name: 'Kobo Writing Life',
    description: 'Kobo is the #1 ebook retailer in Canada and has a strong presence in Europe, Japan, and Australia.',
    logoUrl: 'https://picsum.photos/seed/kobo/200/60',
    supportedFormats: ['ebook'],
    territories: ['CA', 'JP', 'AU', 'NL', 'BE', 'IT', '160+ countries'],
    royaltyRates: { ebook_standard: '45%', ebook_premium: '70% ($1.99+)' },
    processingDays: '1–2 business days',
    requirements: { minPrice: 0.99, formats: ['EPUB'] },
    url: 'https://kobowritinglife.com',
  },
  {
    id: 'barnes_noble',
    name: 'Barnes & Noble Press',
    description: 'Publish directly with Barnes & Noble, the leading US brick-and-mortar bookseller.',
    logoUrl: 'https://picsum.photos/seed/bn/200/60',
    supportedFormats: ['paperback', 'hardcover', 'ebook'],
    territories: ['US'],
    royaltyRates: { ebook: '65% of list price', print: '55% of net' },
    processingDays: '2–5 business days',
    requirements: { minPrice: 0.99, formats: ['EPUB'] },
    url: 'https://press.barnesandnoble.com',
  },
];

// GET /api/channels
router.get('/channels', (req: Request, res: Response) => {
  return res.json({ channels: channelDefinitions });
});

// GET /api/titles/:id/distribution
router.get('/titles/:id/distribution', (req: Request, res: Response) => {
  const title = titles.find((t) => t.id === req.params.id);
  if (!title) {
    return res.status(404).json({
      error: { code: 'GUT-4041', message: 'Title not found', detail: `No title with id '${req.params.id}'.`, resolution: 'Verify the title ID.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4041' },
    });
  }
  const records = distributionRecords.filter((d) => d.titleId === req.params.id);
  const enriched = records.map((r) => ({
    ...r,
    channelInfo: channelDefinitions.find((c) => c.id === r.channel) || null,
  }));
  return res.json({ titleId: req.params.id, distribution: enriched });
});

// POST /api/titles/:id/distribution
router.post('/titles/:id/distribution', (req: Request, res: Response) => {
  const title = titles.find((t) => t.id === req.params.id);
  if (!title) {
    return res.status(404).json({
      error: { code: 'GUT-4041', message: 'Title not found', detail: `No title with id '${req.params.id}'.`, resolution: 'Verify the title ID.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4041' },
    });
  }

  const channels: string[] = req.body.channels || [];
  if (channels.length === 0) {
    return res.status(400).json({
      error: { code: 'GUT-4003', message: 'No channels specified', detail: 'Provide at least one channel in the channels array.', resolution: 'Include channel IDs in the request body.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4003' },
    });
  }

  const submitted: any[] = [];
  const jobs: any[] = [];

  for (const channel of channels) {
    const existing = distributionRecords.find((d) => d.titleId === req.params.id && d.channel === channel);
    if (existing) continue;

    const newRecord = {
      id: `dist-${uuidv4().slice(0, 8)}`,
      titleId: req.params.id,
      channel,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      liveAt: null,
      channelListingUrl: null,
      notes: null,
    };
    distributionRecords.push({ ...newRecord, titleId: newRecord.titleId as string });
    submitted.push(newRecord);

    const job = { jobId: `distjob-${uuidv4().slice(0, 8)}`, channel, status: 'queued', estimatedDays: 3 };
    jobs.push(job);
  }

  return res.status(202).json({ titleId: req.params.id, submitted, jobs });
});

// DELETE /api/titles/:id/distribution/:channelId
router.delete('/titles/:id/distribution/:channelId', (req: Request, res: Response) => {
  const idx = distributionRecords.findIndex(
    (d) => d.titleId === req.params.id && d.id === req.params.channelId
  );
  if (idx === -1) {
    return res.status(404).json({
      error: { code: 'GUT-4043', message: 'Distribution record not found', detail: `No record with id '${req.params.channelId}' for this title.`, resolution: 'Verify the distribution record ID.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4043' },
    });
  }
  distributionRecords.splice(idx, 1);
  return res.status(204).send();
});

// GET /api/titles/:id/channel-readiness
router.get('/titles/:id/channel-readiness', (req: Request, res: Response) => {
  const title = titles.find((t) => t.id === req.params.id);
  if (!title) {
    return res.status(404).json({
      error: { code: 'GUT-4041', message: 'Title not found', detail: `No title with id '${req.params.id}'.`, resolution: 'Verify the title ID.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4041' },
    });
  }

  const titleFormats = formats.filter((f) => f.titleId === req.params.id);
  const hasEbook = titleFormats.some((f) => f.type === 'ebook');
  const hasPrint = titleFormats.some((f) => f.type === 'paperback' || f.type === 'hardcover');
  const hasISBN = titleFormats.some((f) => f.isbn !== null);
  const hasCover = title.coverImageUrl !== null;
  const metadataOk = title.metadata.completeness >= 80;

  const baseChecks = [
    { name: 'Metadata completeness ≥80%', passed: metadataOk, message: metadataOk ? 'Metadata complete' : `Metadata only ${title.metadata.completeness}% complete` },
    { name: 'Cover image', passed: hasCover, message: hasCover ? 'Cover image present' : 'Cover image required' },
    { name: 'ISBN assigned', passed: hasISBN, message: hasISBN ? 'ISBN assigned' : 'ISBN required for distribution' },
  ];

  const readiness = channelDefinitions.map((ch) => {
    const formatOk = ch.supportedFormats.some((f) => (f === 'ebook' ? hasEbook : hasPrint));
    const channelChecks = [
      ...baseChecks,
      { name: `Supported format available`, passed: formatOk, message: formatOk ? 'Required format generated' : `No ${ch.supportedFormats.join('/')} format found` },
    ];
    const ready = channelChecks.every((c) => c.passed);
    return { channel: ch.id, channelName: ch.name, ready, checks: channelChecks };
  });

  return res.json({ titleId: req.params.id, channelReadiness: readiness });
});

export default router;
