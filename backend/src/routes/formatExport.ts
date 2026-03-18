import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { titles, formatJobs } from '../data/mockData';
import { validate } from '../middleware/validate';

const router = Router();

// ─── Static data ─────────────────────────────────────────────────────────────

const interiorTemplates = [
  {
    id: 'tpl-001', name: 'Classic Novel', genre: 'Fiction', trimSize: '6x9',
    description: 'Clean, traditional layout with elegant chapter headers and generous leading.',
    fonts: { body: 'Garamond', heading: 'Garamond' },
    margins: { top: 0.875, bottom: 0.875, inner: 0.875, outer: 0.625 },
    preview_url: 'https://picsum.photos/seed/tpl001/300/400',
  },
  {
    id: 'tpl-002', name: 'Modern Trade', genre: 'Non-Fiction', trimSize: '6x9',
    description: 'Contemporary layout with pull quotes, callout boxes, and clear hierarchy.',
    fonts: { body: 'Palatino', heading: 'Helvetica Neue' },
    margins: { top: 1.0, bottom: 1.0, inner: 1.0, outer: 0.75 },
    preview_url: 'https://picsum.photos/seed/tpl002/300/400',
  },
  {
    id: 'tpl-003', name: 'Academic Press', genre: 'Academic', trimSize: '6x9',
    description: 'Structured layout with footnotes, bibliography, and index support.',
    fonts: { body: 'Caslon', heading: 'Gill Sans' },
    margins: { top: 1.0, bottom: 1.0, inner: 1.125, outer: 0.875 },
    preview_url: 'https://picsum.photos/seed/tpl003/300/400',
  },
  {
    id: 'tpl-004', name: 'Compact Paperback', genre: 'Fiction', trimSize: '5x8',
    description: 'Economical layout for mass-market paperback sizing.',
    fonts: { body: 'Garamond', heading: 'Garamond' },
    margins: { top: 0.75, bottom: 0.75, inner: 0.75, outer: 0.5 },
    preview_url: 'https://picsum.photos/seed/tpl004/300/400',
  },
  {
    id: 'tpl-005', name: 'Large Print', genre: 'Any', trimSize: '8.5x11',
    description: '16pt font minimum, wide margins, designed for accessibility.',
    fonts: { body: 'Palatino', heading: 'Helvetica Neue' },
    margins: { top: 1.25, bottom: 1.25, inner: 1.25, outer: 1.0 },
    preview_url: 'https://picsum.photos/seed/tpl005/300/400',
  },
  {
    id: 'tpl-006', name: 'Coffee Table', genre: 'Art / Photography', trimSize: '8x10',
    description: 'Full-bleed image support with minimal text intrusion.',
    fonts: { body: 'Futura', heading: 'Futura' },
    margins: { top: 0.5, bottom: 0.5, inner: 0.5, outer: 0.5 },
    preview_url: 'https://picsum.photos/seed/tpl006/300/400',
  },
  {
    id: 'tpl-007', name: "Children's Picture Book", genre: "Children's", trimSize: '8.5x8.5',
    description: 'Square format with large text zones and image placeholders.',
    fonts: { body: 'Gill Sans', heading: 'Futura' },
    margins: { top: 0.75, bottom: 0.75, inner: 0.75, outer: 0.75 },
    preview_url: 'https://picsum.photos/seed/tpl007/300/400',
  },
  {
    id: 'tpl-008', name: 'Poetry Collection', genre: 'Poetry', trimSize: '5.5x8.5',
    description: 'Generous white space, centred layout, ideal for verse.',
    fonts: { body: 'Caslon', heading: 'Caslon' },
    margins: { top: 1.0, bottom: 1.0, inner: 0.875, outer: 0.875 },
    preview_url: 'https://picsum.photos/seed/tpl008/300/400',
  },
];

const trimSizes = [
  { size: '5x8',    name: 'Digest Paperback',       description: 'Compact format popular for genre fiction and novellas',         widthIn: 5,   heightIn: 8,    printCostPerPage: 0.015, setupCost: 0.85 },
  { size: '5.5x8.5',name: 'Small Trade Paperback',  description: 'Popular for poetry, novellas, and literary fiction',            widthIn: 5.5, heightIn: 8.5,  printCostPerPage: 0.016, setupCost: 0.85 },
  { size: '6x9',    name: 'Trade Paperback',         description: 'The most common trade paperback for fiction and non-fiction',   widthIn: 6,   heightIn: 9,    printCostPerPage: 0.017, setupCost: 0.90 },
  { size: '7x10',   name: 'Large Trade',             description: 'Ideal for textbooks, workbooks, and illustrated non-fiction',   widthIn: 7,   heightIn: 10,   printCostPerPage: 0.019, setupCost: 0.90 },
  { size: '8x10',   name: 'Illustrated / Reference', description: 'Great for art books, cookbooks, and large-format reference',    widthIn: 8,   heightIn: 10,   printCostPerPage: 0.021, setupCost: 1.00 },
  { size: '8.5x8.5',name: 'Square',                 description: "Perfect for children's books and coffee table titles",          widthIn: 8.5, heightIn: 8.5,  printCostPerPage: 0.022, setupCost: 1.00 },
  { size: '8.5x11', name: 'US Letter',               description: 'Standard letter size for workbooks, planners, and academic',   widthIn: 8.5, heightIn: 11,   printCostPerPage: 0.024, setupCost: 1.10 },
];

const exportFormats = [
  { id: 'pdf_print',  label: 'PDF (Print-ready)',   ext: 'pdf',  note: '300 DPI, CMYK, bleed marks included',           estimatedMinutes: 8  },
  { id: 'epub3',      label: 'ePub 3.0',            ext: 'epub', note: 'Reflowable, WCAG 2.1 accessible',              estimatedMinutes: 5  },
  { id: 'mobi',       label: 'MOBI (Kindle)',        ext: 'mobi', note: 'Amazon KDP optimised',                         estimatedMinutes: 6  },
  { id: 'docx',       label: 'DOCX',                ext: 'docx', note: 'Microsoft Word format for further editing',     estimatedMinutes: 3  },
  { id: 'html5',      label: 'HTML5',               ext: 'zip',  note: 'Standalone HTML package with embedded assets',  estimatedMinutes: 4  },
];

const interiorFonts = [
  { id: 'font-garamond',    name: 'Garamond',      category: 'serif',      bestFor: ['fiction', 'literary', 'poetry'],     licenseType: 'open' },
  { id: 'font-caslon',      name: 'Caslon',        category: 'serif',      bestFor: ['literary', 'academic', 'poetry'],    licenseType: 'open' },
  { id: 'font-palatino',    name: 'Palatino',      category: 'serif',      bestFor: ['fiction', 'nonfiction', 'business'], licenseType: 'open' },
  { id: 'font-times',       name: 'Times New Roman', category: 'serif',    bestFor: ['academic', 'nonfiction'],            licenseType: 'system' },
  { id: 'font-georgia',     name: 'Georgia',       category: 'serif',      bestFor: ['nonfiction', 'business'],            licenseType: 'system' },
  { id: 'font-helv-neue',   name: 'Helvetica Neue',category: 'sans-serif', bestFor: ['business', 'self-help', 'design'],   licenseType: 'licensed' },
  { id: 'font-gill-sans',   name: 'Gill Sans',     category: 'sans-serif', bestFor: ['nonfiction', 'business'],            licenseType: 'licensed' },
  { id: 'font-futura',      name: 'Futura',        category: 'sans-serif', bestFor: ['design', 'children', 'modern'],     licenseType: 'licensed' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ok<T>(data: T, meta?: Record<string, unknown>) {
  return { success: true, data, ...(meta ? { meta } : {}) };
}

function titleNotFound(id: string) {
  return {
    success: false,
    error: {
      code:       'GUT-4041',
      message:    'Title not found',
      detail:     `No title exists with id '${id}'.`,
      resolution: 'Verify the title ID and try again.',
      docs_url:   'https://docs.guttenberg.io/errors/GUT-4041',
    },
  };
}

function jobNotFound(jobId: string) {
  return {
    success: false,
    error: {
      code:       'GUT-4042',
      message:    'Export job not found',
      detail:     `No export job exists with id '${jobId}'.`,
      resolution: 'Verify the job ID or list all exports via GET /api/titles/:id/exports.',
      docs_url:   'https://docs.guttenberg.io/errors/GUT-4042',
    },
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/formats/templates
router.get('/templates', (req: Request, res: Response) => {
  const { genre, trimSize } = req.query as Record<string, string>;
  let filtered = [...interiorTemplates];
  if (genre)    filtered = filtered.filter((t) => t.genre.toLowerCase().includes(genre.toLowerCase()));
  if (trimSize) filtered = filtered.filter((t) => t.trimSize === trimSize);
  res.json(ok(filtered, { total: filtered.length }));
});

// GET /api/formats/trim-sizes
router.get('/trim-sizes', (_req: Request, res: Response) => {
  res.json(ok(trimSizes, { total: trimSizes.length }));
});

// GET /api/formats/fonts
router.get('/fonts', (req: Request, res: Response) => {
  const { category } = req.query as Record<string, string>;
  const fonts = category
    ? interiorFonts.filter((f) => f.category.toLowerCase() === category.toLowerCase())
    : interiorFonts;
  res.json(ok(fonts, { total: fonts.length }));
});

// POST /api/formats/preview
router.post(
  '/preview',
  validate({
    templateId: { type: 'string', required: true, min: 1 },
    pageCount:  { type: 'number', required: true, min: 1, max: 2000, integer: true },
  }),
  (req: Request, res: Response) => {
    const { templateId, pageCount, trimSize = '6x9' } = req.body as {
      templateId: string; pageCount: number; trimSize?: string;
    };

    const template = interiorTemplates.find((t) => t.id === templateId);
    if (!template) {
      res.status(404).json({
        success: false,
        error: {
          code:       'GUT-4046',
          message:    'Interior template not found',
          detail:     `No template with id '${templateId}'.`,
          resolution: 'List templates via GET /api/formats/templates.',
          docs_url:   'https://docs.guttenberg.io/errors/GUT-4046',
        },
      });
      return;
    }

    const size = trimSizes.find((s) => s.size === trimSize) || trimSizes[2];
    const printCost = +(size.printCostPerPage * pageCount + size.setupCost).toFixed(2);

    res.json(ok({
      templateId,
      templateName: template.name,
      trimSize:     size.size,
      pageCount,
      estimatedPrintCost: printCost,
      previewPages: [
        { page: 1,        label: 'Title Page',  previewUrl: `https://picsum.photos/seed/${templateId}-title/600/900` },
        { page: 2,        label: 'Copyright',   previewUrl: `https://picsum.photos/seed/${templateId}-copy/600/900` },
        { page: 3,        label: 'Chapter 1',   previewUrl: `https://picsum.photos/seed/${templateId}-ch1/600/900` },
        { page: pageCount, label: 'Last Page',  previewUrl: `https://picsum.photos/seed/${templateId}-last/600/900` },
      ],
      fonts:   template.fonts,
      margins: template.margins,
    }));
  }
);

// POST /api/titles/:id/export
router.post(
  '/titles/:id/export',
  validate({
    format:     { type: 'string', required: true, enum: ['pdf_print', 'epub3', 'mobi', 'docx', 'html5'] },
    templateId: { type: 'string', required: false, min: 1 },
    trimSize:   { type: 'string', required: false },
  }),
  (req: Request, res: Response) => {
    const titleId = String(req.params.id);
    const title   = titles.find((t) => t.id === titleId);
    if (!title) { res.status(404).json(titleNotFound(titleId)); return; }

    const { format, templateId, trimSize = '6x9' } = req.body as {
      format: string; templateId?: string; trimSize?: string;
    };

    const formatDef = exportFormats.find((f) => f.id === format);
    const jobId     = `expjob-${uuidv4().slice(0, 8)}`;
    const newJob = {
      id:           jobId,
      titleId,
      type:         format,
      status:       'pending' as const,
      progress:     0,
      createdAt:    new Date().toISOString(),
      completedAt:  null as string | null,
      downloadUrl:  null as string | null,
      errorMessage: null as string | null,
    };

    formatJobs.push(newJob);

    res.status(202).json(ok({
      jobId,
      titleId,
      format,
      formatLabel:      formatDef?.label || format,
      templateId:       templateId || null,
      trimSize,
      status:           'pending',
      estimatedMinutes: formatDef?.estimatedMinutes || 10,
      pollUrl:          `/api/titles/${titleId}/export/${jobId}`,
      queuedAt:         new Date().toISOString(),
    }));
  }
);

// GET /api/titles/:id/export/:jobId
router.get('/titles/:id/export/:jobId', (req: Request, res: Response) => {
  const titleId = String(req.params.id);
  const jobId   = String(req.params.jobId);
  const title   = titles.find((t) => t.id === titleId);
  if (!title) { res.status(404).json(titleNotFound(titleId)); return; }

  const job = formatJobs.find((j) => j.id === jobId && j.titleId === titleId);
  if (!job) { res.status(404).json(jobNotFound(jobId)); return; }

  res.json(ok(job));
});

// GET /api/titles/:id/exports
router.get('/titles/:id/exports', (req: Request, res: Response) => {
  const titleId = String(req.params.id);
  const title   = titles.find((t) => t.id === titleId);
  if (!title) { res.status(404).json(titleNotFound(titleId)); return; }

  const jobs = formatJobs.filter((j) => j.titleId === titleId);
  res.json(ok(jobs, { total: jobs.length }));
});

// DELETE /api/titles/:id/exports/:jobId
router.delete('/titles/:id/exports/:jobId', (req: Request, res: Response) => {
  const titleId = String(req.params.id);
  const jobId   = String(req.params.jobId);
  const title   = titles.find((t) => t.id === titleId);
  if (!title) { res.status(404).json(titleNotFound(titleId)); return; }

  const idx = formatJobs.findIndex((j) => j.id === jobId && j.titleId === titleId);
  if (idx === -1) { res.status(404).json(jobNotFound(jobId)); return; }

  const job = formatJobs[idx];
  if (job.status === 'processing') {
    res.status(409).json({
      success: false,
      error: {
        code:       'GUT-4091',
        message:    'Job is currently processing',
        detail:     'Cannot cancel a job that is actively processing. Wait for it to complete.',
        resolution: 'Poll the job status and retry cancellation once the status is no longer "processing".',
        docs_url:   'https://docs.guttenberg.io/errors/GUT-4091',
      },
    });
    return;
  }

  formatJobs.splice(idx, 1);
  res.status(204).send();
});

export default router;
