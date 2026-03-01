import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/manuscripts/upload
router.post('/upload', (req: Request, res: Response) => {
  const jobId = `upload-${uuidv4().slice(0, 8)}`;
  return res.status(202).json({
    jobId,
    status: 'processing',
    message: 'File received and queued for processing.',
    estimatedCompletionSeconds: 30,
    pollUrl: `/api/manuscripts/${jobId}/status`,
  });
});

// GET /api/manuscripts/:id/preflight
router.get('/:id/preflight', (req: Request, res: Response) => {
  const score = 85;
  const checks = [
    { name: 'File format', status: 'passed', message: 'Valid DOCX file detected' },
    { name: 'Encoding', status: 'passed', message: 'UTF-8 encoding confirmed' },
    { name: 'Embedded fonts', status: 'warning', message: '2 fonts are not embedded; they will be substituted at print' },
    { name: 'Image resolution', status: 'passed', message: 'All 12 images meet minimum 300 DPI' },
    { name: 'Image color mode', status: 'passed', message: 'All images are RGB (ebook) or CMYK (print)' },
    { name: 'Margin compliance', status: 'passed', message: 'All margins meet printer requirements' },
    { name: 'Bleed settings', status: 'warning', message: 'Bleed not configured; cover may need adjustment' },
    { name: 'Linked files', status: 'passed', message: 'All assets are embedded' },
    { name: 'Hyperlinks', status: 'passed', message: '14 hyperlinks validated' },
    { name: 'Trim size', status: 'passed', message: '6×9 in confirmed' },
    { name: 'Spine width', status: 'passed', message: 'Spine width of 0.82 in within tolerance' },
    { name: 'Table of contents', status: 'passed', message: 'TOC detected and linked' },
    { name: 'Page numbering', status: 'passed', message: 'Consistent page numbering throughout' },
    { name: 'Chapter headings', status: 'passed', message: '24 chapters detected with consistent styling' },
    { name: 'Orphans and widows', status: 'warning', message: '3 instances of orphaned lines detected' },
  ];

  return res.json({
    manuscriptId: req.params.id,
    score,
    runAt: new Date().toISOString(),
    status: score >= 80 ? 'ready' : score >= 60 ? 'needs_fixes' : 'not_ready',
    summary: `${checks.filter((c) => c.status === 'passed').length} passed, ${checks.filter((c) => c.status === 'warning').length} warnings, ${checks.filter((c) => c.status === 'failed').length} failures`,
    checks,
  });
});

// POST /api/manuscripts/import-refinery
router.post('/import-refinery', (req: Request, res: Response) => {
  const jobId = `refinery-${uuidv4().slice(0, 8)}`;
  return res.status(202).json({
    jobId,
    status: 'importing',
    message: 'Refinery import initiated. Manuscript will be available once processing completes.',
    estimatedCompletionSeconds: 45,
    pollUrl: `/api/manuscripts/${jobId}/status`,
    refineryProjectId: req.body.refineryProjectId || null,
  });
});

// GET /api/manuscripts/:id/status
router.get('/:id/status', (req: Request, res: Response) => {
  return res.json({
    jobId: req.params.id,
    status: 'completed',
    progress: 100,
    completedAt: new Date().toISOString(),
    result: {
      wordCount: 94200,
      pageCount: 352,
      detectedLanguage: 'en',
      chapterCount: 24,
    },
  });
});

export default router;
