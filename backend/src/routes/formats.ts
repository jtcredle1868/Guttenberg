import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { formats, formatJobs, titles } from '../data/mockData';

const router = Router();

const interiorTemplates = [
  { id: 'tpl-001', name: 'Classic Novel', genre: 'Fiction', trimSize: '6x9', description: 'Clean, traditional layout with elegant chapter headers', preview_url: 'https://picsum.photos/seed/tpl001/300/400' },
  { id: 'tpl-002', name: 'Modern Trade', genre: 'Non-Fiction', trimSize: '6x9', description: 'Contemporary layout with pull quotes and callout boxes', preview_url: 'https://picsum.photos/seed/tpl002/300/400' },
  { id: 'tpl-003', name: 'Academic Press', genre: 'Academic', trimSize: '6x9', description: 'Structured layout with footnotes, bibliography, and index support', preview_url: 'https://picsum.photos/seed/tpl003/300/400' },
  { id: 'tpl-004', name: 'Compact Paperback', genre: 'Fiction', trimSize: '5x8', description: 'Economical layout for mass-market paperback sizing', preview_url: 'https://picsum.photos/seed/tpl004/300/400' },
  { id: 'tpl-005', name: 'Large Print', genre: 'Any', trimSize: '8.5x11', description: '16pt font minimum, wide margins, designed for accessibility', preview_url: 'https://picsum.photos/seed/tpl005/300/400' },
  { id: 'tpl-006', name: 'Coffee Table', genre: 'Art / Photography', trimSize: '8x10', description: 'Full-bleed image support, minimal text intrusion', preview_url: 'https://picsum.photos/seed/tpl006/300/400' },
  { id: 'tpl-007', name: 'Children\'s Picture Book', genre: 'Children\'s', trimSize: '8.5x8.5', description: 'Square format with large text zones and image placeholders', preview_url: 'https://picsum.photos/seed/tpl007/300/400' },
  { id: 'tpl-008', name: 'Poetry Collection', genre: 'Poetry', trimSize: '5.5x8.5', description: 'Generous white space, centered layout, ideal for verse', preview_url: 'https://picsum.photos/seed/tpl008/300/400' },
];

const trimSizes = [
  { size: '5x8', name: 'Digest Paperback', description: 'Compact format popular for genre fiction and novellas', widthIn: 5, heightIn: 8 },
  { size: '5.5x8.5', name: 'Small Trade Paperback', description: 'Popular for poetry, novellas, and literary fiction', widthIn: 5.5, heightIn: 8.5 },
  { size: '6x9', name: 'Trade Paperback', description: 'The most common trade paperback size for fiction and non-fiction', widthIn: 6, heightIn: 9 },
  { size: '7x10', name: 'Large Trade', description: 'Ideal for textbooks, workbooks, and illustrated non-fiction', widthIn: 7, heightIn: 10 },
  { size: '8x10', name: 'Illustrated / Reference', description: 'Great for art books, cookbooks, and large-format reference works', widthIn: 8, heightIn: 10 },
  { size: '8.5x8.5', name: 'Square', description: 'Perfect for children\'s books and coffee table titles', widthIn: 8.5, heightIn: 8.5 },
  { size: '8.5x11', name: 'US Letter', description: 'Standard letter size for workbooks, planners, and academic texts', widthIn: 8.5, heightIn: 11 },
];

// GET /api/titles/:id/formats
router.get('/titles/:id/formats', (req: Request, res: Response) => {
  const title = titles.find((t) => t.id === req.params.id);
  if (!title) {
    return res.status(404).json({
      error: { code: 'GUT-4041', message: 'Title not found', detail: `No title with id '${req.params.id}'.`, resolution: 'Verify the title ID.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4041' },
    });
  }
  const titleFormats = formats.filter((f) => f.titleId === req.params.id);
  return res.json({ titleId: req.params.id, formats: titleFormats });
});

// POST /api/titles/:id/formats
router.post('/titles/:id/formats', (req: Request, res: Response) => {
  const title = titles.find((t) => t.id === req.params.id);
  if (!title) {
    return res.status(404).json({
      error: { code: 'GUT-4041', message: 'Title not found', detail: `No title with id '${req.params.id}'.`, resolution: 'Verify the title ID.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4041' },
    });
  }

  const jobId = `job-${uuidv4().slice(0, 8)}`;
  const newJob = {
    id: jobId,
    titleId: req.params.id,
    type: req.body.type || 'paperback',
    status: 'queued',
    progress: 0,
    createdAt: new Date().toISOString(),
    completedAt: null,
    downloadUrl: null,
    errorMessage: null,
  };
  formatJobs.push({ ...newJob, titleId: newJob.titleId as string });

  return res.status(202).json({
    jobId,
    status: 'queued',
    message: 'Format job queued successfully.',
    estimatedMinutes: 10,
    pollUrl: `/api/formats/${jobId}/status`,
  });
});

// GET /api/formats/:jobId/status
router.get('/:jobId/status', (req: Request, res: Response) => {
  const job = formatJobs.find((j) => j.id === req.params.jobId);
  if (!job) {
    return res.status(404).json({
      error: { code: 'GUT-4042', message: 'Format job not found', detail: `No format job with id '${req.params.jobId}'.`, resolution: 'Verify the job ID.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4042' },
    });
  }
  return res.json(job);
});

// GET /api/formats/templates
router.get('/templates', (req: Request, res: Response) => {
  const genreFilter = req.query.genre as string | undefined;
  const filtered = genreFilter
    ? interiorTemplates.filter((t) => t.genre.toLowerCase().includes(genreFilter.toLowerCase()))
    : interiorTemplates;
  return res.json({ templates: filtered });
});

// GET /api/formats/trim-sizes
router.get('/trim-sizes', (req: Request, res: Response) => {
  return res.json({ trimSizes });
});

export default router;
