import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  coverDesignTemplates,
  fontCatalog,
  colorPalettes,
  titleCoverDesigns,
} from '../data/mockData';
import { titles } from '../data/mockData';
import { validate } from '../middleware/validate';

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function ok<T>(data: T, meta?: Record<string, unknown>) {
  return { success: true, data, ...(meta ? { meta } : {}) };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/cover-design/templates
router.get('/templates', (req: Request, res: Response) => {
  const { genre, style, page: rawPage, limit: rawLimit } = req.query as Record<string, string>;
  const page  = Math.max(1, parseInt(rawPage)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(rawLimit) || 20));

  let filtered = [...coverDesignTemplates];
  if (genre) filtered = filtered.filter((t) => t.genre.toLowerCase().includes(genre.toLowerCase()));
  if (style) filtered = filtered.filter((t) => t.style.toLowerCase().includes(style.toLowerCase()));

  const total      = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const data       = filtered.slice((page - 1) * limit, page * limit);

  res.json(ok(data, { page, limit, total, totalPages }));
});

// GET /api/cover-design/templates/:id
router.get('/templates/:id', (req: Request, res: Response) => {
  const template = coverDesignTemplates.find((t) => t.id === req.params.id);
  if (!template) {
    res.status(404).json({
      success: false,
      error: {
        code:       'GUT-4045',
        message:    'Cover template not found',
        detail:     `No cover template exists with id '${req.params.id}'.`,
        resolution: 'List available templates via GET /api/cover-design/templates.',
        docs_url:   'https://docs.guttenberg.io/errors/GUT-4045',
      },
    });
    return;
  }
  res.json(ok(template));
});

// POST /api/cover-design/generate
router.post(
  '/generate',
  validate({
    templateId: { type: 'string', required: true, min: 1, max: 128 },
    titleText:  { type: 'string', required: true, min: 1, max: 200 },
    authorName: { type: 'string', required: true, min: 1, max: 200 },
  }),
  (req: Request, res: Response) => {
    const { templateId, titleText, authorName, subtitle, tagline, paletteId } = req.body as Record<string, string>;

    const template = coverDesignTemplates.find((t) => t.id === templateId);
    if (!template) {
      res.status(404).json({
        success: false,
        error: {
          code:       'GUT-4045',
          message:    'Cover template not found',
          detail:     `No cover template with id '${templateId}'.`,
          resolution: 'Check available templates via GET /api/cover-design/templates.',
          docs_url:   'https://docs.guttenberg.io/errors/GUT-4045',
        },
      });
      return;
    }

    const palette = paletteId
      ? colorPalettes.find((p) => p.id === paletteId) || template.colorPalette
      : template.colorPalette;

    const designId = `design-${uuidv4().slice(0, 8)}`;
    const spec = {
      id:         designId,
      templateId,
      templateName: template.name,
      createdAt:  new Date().toISOString(),
      dimensions: template.dimensions,
      printSpec:  template.printSpec,
      layers: {
        background: {
          type:    'color',
          value:   palette.background,
          opacity: 1,
        },
        title: {
          text:     titleText,
          font:     template.fonts.heading,
          color:    palette.primary,
          size:     template.layers.title.fontSize,
          position: template.layers.title.position,
          weight:   'bold',
        },
        subtitle: subtitle ? {
          text:     subtitle,
          font:     template.fonts.body,
          color:    palette.secondary,
          size:     template.layers.subtitle?.fontSize || 18,
          position: template.layers.subtitle?.position || { x: 50, y: 28 },
        } : null,
        author: {
          text:     authorName,
          font:     template.fonts.body,
          color:    palette.accent,
          size:     template.layers.author.fontSize,
          position: template.layers.author.position,
        },
        tagline: tagline ? {
          text:  tagline,
          font:  template.fonts.body,
          color: palette.secondary,
          size:  14,
        } : null,
        spine: {
          titleText,
          authorName,
          font:  template.fonts.body,
          color: palette.primary,
        },
        backCover: {
          backgroundColor: palette.background,
          textColor:       palette.secondary,
          font:            template.fonts.body,
        },
      },
      svgPreviewUrl: `https://picsum.photos/seed/${designId}/400/600`,
    };

    res.status(201).json(ok(spec));
  }
);

// POST /api/cover-design/validate
router.post(
  '/validate',
  validate({
    width:  { type: 'number', required: true, min: 1 },
    height: { type: 'number', required: true, min: 1 },
    dpi:    { type: 'number', required: false, min: 1 },
  }),
  (req: Request, res: Response) => {
    const { width, height, dpi = 72, colorMode = 'RGB', fileFormat = 'JPEG' } = req.body as {
      width: number; height: number; dpi?: number; colorMode?: string; fileFormat?: string;
    };

    const issues: Array<{ severity: 'error' | 'warning'; field: string; message: string }> = [];

    if (width < 1600)
      issues.push({ severity: 'error', field: 'width', message: `Width ${width}px is below minimum 1600px.` });
    if (height < 2400)
      issues.push({ severity: 'error', field: 'height', message: `Height ${height}px is below minimum 2400px.` });

    const ratio = width / height;
    if (ratio < 0.60 || ratio > 0.75)
      issues.push({ severity: 'warning', field: 'aspectRatio', message: `Aspect ratio ${ratio.toFixed(3)} is outside recommended 2:3 range (0.60–0.75).` });

    if (dpi < 300)
      issues.push({ severity: 'error', field: 'dpi', message: `DPI ${dpi} is below minimum 300 required for print.` });
    else if (dpi < 300)
      issues.push({ severity: 'warning', field: 'dpi', message: `DPI ${dpi} meets minimum but 300+ is recommended for best print quality.` });

    if (colorMode !== 'RGB' && colorMode !== 'CMYK')
      issues.push({ severity: 'warning', field: 'colorMode', message: `Color mode '${colorMode}' is non-standard. Use RGB (ebook) or CMYK (print).` });

    const supportedFormats = ['JPEG', 'JPG', 'PNG', 'TIFF', 'PDF'];
    if (!supportedFormats.includes(fileFormat.toUpperCase()))
      issues.push({ severity: 'error', field: 'fileFormat', message: `File format '${fileFormat}' is not supported. Use: ${supportedFormats.join(', ')}.` });

    // Print-ready recommendations
    if (width < 2500 || height < 4000)
      issues.push({ severity: 'warning', field: 'resolution', message: 'For best print quality, covers should be at least 2500×4000px at 300 DPI.' });

    const errors   = issues.filter((i) => i.severity === 'error');
    const warnings = issues.filter((i) => i.severity === 'warning');
    const valid    = errors.length === 0;

    res.status(valid ? 200 : 422).json(ok({
      valid,
      dimensions: { width, height, dpi, aspectRatio: +(width / height).toFixed(4) },
      colorMode,
      fileFormat,
      errors,
      warnings,
      printReady: valid && dpi >= 300 && width >= 2500,
      message: valid
        ? `Cover passes validation with ${warnings.length} warning(s).`
        : `Cover failed validation with ${errors.length} error(s).`,
    }));
  }
);

// GET /api/cover-design/fonts
router.get('/fonts', (req: Request, res: Response) => {
  const { category } = req.query as Record<string, string>;
  const fonts = category
    ? fontCatalog.filter((f) => f.category.toLowerCase() === category.toLowerCase())
    : fontCatalog;
  res.json(ok(fonts, { total: fonts.length }));
});

// GET /api/cover-design/palettes
router.get('/palettes', (req: Request, res: Response) => {
  const { mood, genre } = req.query as Record<string, string>;
  let palettes = [...colorPalettes];
  if (mood)  palettes = palettes.filter((p) => p.mood.toLowerCase().includes(mood.toLowerCase()));
  if (genre) palettes = palettes.filter((p) => p.genre.toLowerCase().includes(genre.toLowerCase()));
  res.json(ok(palettes, { total: palettes.length }));
});

// POST /api/cover-design/export
router.post(
  '/export',
  validate({
    designId: { type: 'string', required: true, min: 1 },
    format:   { type: 'string', required: true, enum: ['PDF', 'PNG', 'JPEG'] },
  }),
  (req: Request, res: Response) => {
    const { designId, format, quality = 'high' } = req.body as {
      designId: string; format: 'PDF' | 'PNG' | 'JPEG'; quality?: string;
    };

    const jobId = `export-${uuidv4().slice(0, 8)}`;
    const formatSpecs: Record<string, { colorMode: string; dpi: number; note: string }> = {
      PDF:  { colorMode: 'CMYK', dpi: 300, note: 'Print-ready PDF with bleed marks and crop lines.' },
      PNG:  { colorMode: 'RGB',  dpi: 150, note: 'Web-optimised PNG for digital storefronts.' },
      JPEG: { colorMode: 'RGB',  dpi: 300, note: 'High-quality JPEG for digital distribution.' },
    };

    res.status(202).json(ok({
      jobId,
      designId,
      format,
      quality,
      spec:         formatSpecs[format],
      status:       'queued',
      estimatedSec: 15,
      downloadUrl:  null,
      pollUrl:      `/api/cover-design/export/${jobId}/status`,
      queuedAt:     new Date().toISOString(),
    }));
  }
);

// GET /api/titles/:id/cover-design
router.get('/titles/:id/cover-design', (req: Request, res: Response) => {
  const titleId = String(req.params.id);
  const title   = titles.find((t) => t.id === titleId);
  if (!title) { res.status(404).json(titleNotFound(titleId)); return; }

  const design = titleCoverDesigns[titleId] || null;
  res.json(ok(design ?? {
    titleId,
    designId:  null,
    status:    'not_started',
    message:   'No cover design on file. Use POST /api/cover-design/generate to create one.',
  }));
});

// PUT /api/titles/:id/cover-design
router.put(
  '/titles/:id/cover-design',
  validate({ designId: { type: 'string', required: true, min: 1 } }),
  (req: Request, res: Response) => {
    const titleId = String(req.params.id);
    const title   = titles.find((t) => t.id === titleId);
    if (!title) { res.status(404).json(titleNotFound(titleId)); return; }

    const existing = titleCoverDesigns[titleId] || {};
    titleCoverDesigns[titleId] = {
      ...existing,
      ...req.body,
      titleId,
      updatedAt: new Date().toISOString(),
    };

    res.json(ok(titleCoverDesigns[titleId]));
  }
);

export default router;
