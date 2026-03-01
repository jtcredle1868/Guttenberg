"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const mockData_1 = require("../data/mockData");
const router = (0, express_1.Router)();
const coverTemplates = [
    { id: 'cvr-001', name: 'Midnight Noir', genre: 'Thriller / Mystery', style: 'Dark, atmospheric', thumbnail_url: 'https://picsum.photos/seed/cvr001/300/450', supportedFormats: ['paperback', 'ebook'] },
    { id: 'cvr-002', name: 'Golden Age', genre: 'Literary Fiction', style: 'Elegant, minimalist', thumbnail_url: 'https://picsum.photos/seed/cvr002/300/450', supportedFormats: ['paperback', 'hardcover', 'ebook'] },
    { id: 'cvr-003', name: 'Cosmos', genre: 'Science Fiction', style: 'Futuristic, vibrant', thumbnail_url: 'https://picsum.photos/seed/cvr003/300/450', supportedFormats: ['paperback', 'ebook'] },
    { id: 'cvr-004', name: 'Iron & Stone', genre: 'Fantasy', style: 'Epic, painterly', thumbnail_url: 'https://picsum.photos/seed/cvr004/300/450', supportedFormats: ['paperback', 'hardcover', 'ebook'] },
    { id: 'cvr-005', name: 'Blueprint', genre: 'Business / Non-Fiction', style: 'Clean, professional', thumbnail_url: 'https://picsum.photos/seed/cvr005/300/450', supportedFormats: ['paperback', 'hardcover', 'ebook'] },
    { id: 'cvr-006', name: 'Pastoral', genre: 'Historical Fiction', style: 'Warm, painterly', thumbnail_url: 'https://picsum.photos/seed/cvr006/300/450', supportedFormats: ['paperback', 'hardcover', 'ebook'] },
    { id: 'cvr-007', name: 'Spectrum', genre: 'Children\'s', style: 'Colorful, playful', thumbnail_url: 'https://picsum.photos/seed/cvr007/300/450', supportedFormats: ['paperback', 'hardcover'] },
    { id: 'cvr-008', name: 'Verse', genre: 'Poetry', style: 'Sparse, typographic', thumbnail_url: 'https://picsum.photos/seed/cvr008/300/450', supportedFormats: ['paperback', 'ebook'] },
];
// POST /api/covers/upload
router.post('/upload', (req, res) => {
    // Simulate validation of an uploaded cover image
    const { width = 1600, height = 2400, titleId } = req.body;
    const warnings = [];
    let valid = true;
    if (width < 1600) {
        valid = false;
        warnings.push(`Cover width ${width}px is below the minimum 1600px required by most retailers.`);
    }
    if (width / height > 0.75 || width / height < 0.60) {
        warnings.push('Aspect ratio is outside the recommended 2:3 range. Some retailers may crop or reject the cover.');
    }
    if (width < 2500 || height < 4000) {
        warnings.push('For best print quality, covers should be at least 2500×4000px at 300 DPI.');
    }
    return res.status(valid ? 200 : 422).json({
        valid,
        warnings,
        coverUrl: valid ? `https://picsum.photos/seed/${titleId || 'new'}/400/600` : null,
        uploadId: `upload-${(0, uuid_1.v4)().slice(0, 8)}`,
        dimensions: { width, height, dpi: 300 },
        fileSizeKB: Math.round(width * height * 3 / 1024),
        message: valid ? 'Cover accepted.' : 'Cover rejected due to validation errors.',
    });
});
// GET /api/covers/validate/:titleId
router.get('/validate/:titleId', (req, res) => {
    const title = mockData_1.titles.find((t) => t.id === req.params.titleId);
    if (!title) {
        return res.status(404).json({
            error: { code: 'GUT-4041', message: 'Title not found', detail: `No title with id '${req.params.titleId}'.`, resolution: 'Verify the title ID.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4041' },
        });
    }
    const hasCover = !!title.coverImageUrl;
    const checks = [
        { name: 'Cover image present', passed: hasCover, message: hasCover ? 'Cover image uploaded' : 'No cover image on file' },
        { name: 'Minimum width (1600px)', passed: hasCover, message: hasCover ? 'Width 2560px ✓' : 'Cannot validate – no cover uploaded' },
        { name: 'Minimum height (2400px)', passed: hasCover, message: hasCover ? 'Height 3840px ✓' : 'Cannot validate – no cover uploaded' },
        { name: 'Aspect ratio (2:3)', passed: hasCover, message: hasCover ? 'Ratio 0.667 ✓' : 'Cannot validate – no cover uploaded' },
        { name: 'Color mode (RGB)', passed: hasCover, message: hasCover ? 'RGB confirmed ✓' : 'Cannot validate – no cover uploaded' },
        { name: 'Resolution (300 DPI)', passed: hasCover, message: hasCover ? '300 DPI ✓' : 'Cannot validate – no cover uploaded' },
        { name: 'No bleed required elements', passed: hasCover, message: hasCover ? 'Safe zone respected ✓' : 'Cannot validate – no cover uploaded' },
        { name: 'Text legibility', passed: hasCover, message: hasCover ? 'Title and author name clearly visible ✓' : 'Cannot validate – no cover uploaded' },
    ];
    return res.json({
        titleId: req.params.titleId,
        valid: hasCover,
        score: hasCover ? 100 : 0,
        checks,
    });
});
// GET /api/covers/templates
router.get('/templates', (req, res) => {
    const genreFilter = req.query.genre;
    const filtered = genreFilter
        ? coverTemplates.filter((t) => t.genre.toLowerCase().includes(genreFilter.toLowerCase()))
        : coverTemplates;
    return res.json({ templates: filtered });
});
exports.default = router;
