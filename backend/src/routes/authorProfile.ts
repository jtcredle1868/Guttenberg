import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authorProfiles, titles } from '../data/mockData';
import { validate } from '../middleware/validate';

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ok<T>(data: T, meta?: Record<string, unknown>) {
  return { success: true, data, ...(meta ? { meta } : {}) };
}

/** Truncate to word boundary at approximately `wordLimit` words. */
function truncateToWords(text: string, wordLimit: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(' ') + '…';
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/author/profile
router.get('/profile', (req: Request, res: Response) => {
  // In a real system this would use req.user.id; for mock we use query param or default
  const authorId = (req.query.authorId as string) || 'author-001';
  const profile  = authorProfiles[authorId];

  if (!profile) {
    res.status(404).json({
      success: false,
      error: {
        code:       'GUT-4047',
        message:    'Author profile not found',
        detail:     `No profile found for author id '${authorId}'.`,
        resolution: 'Check the author ID or create a profile via PUT /api/author/profile.',
        docs_url:   'https://docs.guttenberg.io/errors/GUT-4047',
      },
    });
    return;
  }

  res.json(ok(profile));
});

// PUT /api/author/profile
router.put(
  '/profile',
  validate({
    name:     { type: 'string', required: false, min: 1, max: 200 },
    website:  { type: 'string', required: false, max: 500 },
    location: { type: 'string', required: false, max: 200 },
    genres:   { type: 'array',  required: false },
  }),
  (req: Request, res: Response) => {
    const authorId = (req.query.authorId as string) || 'author-001';

    const updatableFields = [
      'name', 'website', 'location', 'genres', 'socialLinks',
      'awards', 'education', 'publicEmail', 'avatarUrl',
    ];

    const existing = authorProfiles[authorId] || {
      id:        authorId,
      createdAt: new Date().toISOString(),
    };

    const updates: Record<string, unknown> = {};
    for (const field of updatableFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    authorProfiles[authorId] = {
      ...existing,
      ...updates,
      id:        authorId,
      updatedAt: new Date().toISOString(),
    };

    res.json(ok(authorProfiles[authorId]));
  }
);

// GET /api/author/bio
router.get('/bio', (req: Request, res: Response) => {
  const authorId = (req.query.authorId as string) || 'author-001';
  const profile  = authorProfiles[authorId];

  if (!profile || !profile.bio) {
    res.status(404).json({
      success: false,
      error: {
        code:       'GUT-4047',
        message:    'Author bio not found',
        detail:     `No bio found for author '${authorId}'.`,
        resolution: 'Add a bio via PUT /api/author/bio.',
        docs_url:   'https://docs.guttenberg.io/errors/GUT-4047',
      },
    });
    return;
  }

  const fullBio: string = profile.bio;

  res.json(ok({
    authorId,
    short:  truncateToWords(fullBio, 50),
    medium: truncateToWords(fullBio, 150),
    full:   fullBio,
    wordCounts: {
      short:  50,
      medium: 150,
      full:   fullBio.trim().split(/\s+/).length,
    },
  }));
});

// PUT /api/author/bio
router.put(
  '/bio',
  validate({
    bio: { type: 'string', required: true, min: 10, max: 5000 },
  }),
  (req: Request, res: Response) => {
    const authorId = (req.query.authorId as string) || 'author-001';
    const { bio }  = req.body as { bio: string };

    if (!authorProfiles[authorId]) {
      authorProfiles[authorId] = { id: authorId, createdAt: new Date().toISOString() };
    }

    authorProfiles[authorId].bio       = bio;
    authorProfiles[authorId].updatedAt = new Date().toISOString();

    res.json(ok({
      authorId,
      bio,
      wordCount: bio.trim().split(/\s+/).length,
      updatedAt: authorProfiles[authorId].updatedAt,
    }));
  }
);

// GET /api/author/portfolio
router.get('/portfolio', (req: Request, res: Response) => {
  const authorId = (req.query.authorId as string) || 'author-001';

  const published = titles.filter(
    (t) => t.authorId === authorId && t.status === 'published'
  ).map((t) => ({
    id:              t.id,
    title:           t.title,
    subtitle:        t.subtitle,
    genre:           t.genre,
    publicationDate: t.publicationDate,
    coverImageUrl:   t.coverImageUrl,
    formats:         t.formats,
    salesData:       t.salesData,
    royalties:       { totalEarned: t.royalties.totalEarned },
  }));

  const drafts = titles.filter(
    (t) => t.authorId === authorId && t.status === 'draft'
  ).length;

  res.json(ok({
    authorId,
    publishedCount: published.length,
    draftCount:     drafts,
    totalSalesUnits: published.reduce((sum, t) => sum + t.salesData.totalUnits, 0),
    totalEarnings:   +published.reduce((sum, t) => sum + t.royalties.totalEarned, 0).toFixed(2),
    publishedTitles: published,
  }));
});

// POST /api/author/photo
router.post('/photo', (req: Request, res: Response) => {
  const {
    width     = 800,
    height    = 800,
    fileSizeKB = 500,
    mimeType  = 'image/jpeg',
  } = req.body as {
    width?: number; height?: number; fileSizeKB?: number; mimeType?: string;
  };

  const issues: Array<{ severity: 'error' | 'warning'; message: string }> = [];

  const supported = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supported.includes(mimeType.toLowerCase()))
    issues.push({ severity: 'error', message: `Format '${mimeType}' not supported. Use JPEG, PNG, or WebP.` });

  if (width < 400 || height < 400)
    issues.push({ severity: 'error', message: 'Image must be at least 400×400 pixels.' });

  if (Math.abs(width - height) / Math.max(width, height) > 0.2)
    issues.push({ severity: 'warning', message: 'Non-square photos may be cropped. A 1:1 ratio is recommended.' });

  if (fileSizeKB > 10240)
    issues.push({ severity: 'error', message: 'File size exceeds 10 MB limit.' });

  const errors   = issues.filter((i) => i.severity === 'error');
  const valid    = errors.length === 0;
  const uploadId = `photo-${uuidv4().slice(0, 8)}`;

  res.status(valid ? 201 : 422).json(ok({
    valid,
    uploadId: valid ? uploadId : null,
    photoUrl: valid ? `https://i.pravatar.cc/600?u=${uploadId}` : null,
    dimensions: { width, height },
    fileSizeKB,
    errors,
    warnings: issues.filter((i) => i.severity === 'warning'),
    message: valid ? 'Author photo accepted.' : 'Author photo rejected due to validation errors.',
  }));
});

export default router;
