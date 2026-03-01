"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const mockData_1 = require("../data/mockData");
const router = (0, express_1.Router)();
// In-memory landing pages store
const landingPages = {
    'title-001': {
        titleId: 'title-001',
        headline: 'The Glass Meridian – A Novel of Fractured Truths',
        description: 'When memory specialist Dr. Sora Lindqvist discovers her own recollections have been surgically altered, she must reconstruct her past before whoever erased it comes back to finish the job.',
        ctaText: 'Buy Now',
        ctaUrl: 'https://www.amazon.com/dp/B0EXAMPLE01',
        coverImageUrl: 'https://picsum.photos/seed/glass-meridian/400/600',
        enabled: true,
        updatedAt: '2024-03-20T10:00:00Z',
    },
    'title-002': {
        titleId: 'title-002',
        headline: 'Starfall Protocol – First Contact Changes Everything',
        description: 'Humanity\'s last colony ship discovers an alien signal buried in a dying star. Kenji Murakami has 48 hours to make first contact the right way.',
        ctaText: 'Get Your Copy',
        ctaUrl: 'https://www.amazon.com/dp/B0EXAMPLE02',
        coverImageUrl: 'https://picsum.photos/seed/starfall/400/600',
        enabled: true,
        updatedAt: '2024-07-05T09:00:00Z',
    },
    'title-003': {
        titleId: 'title-003',
        headline: 'Lead Without Limits – The Executive Field Guide',
        description: 'Discover the 7 counterintuitive principles that separate good managers from transformational leaders.',
        ctaText: 'Order Today',
        ctaUrl: 'https://www.amazon.com/dp/B0EXAMPLE03',
        coverImageUrl: 'https://picsum.photos/seed/lead-limits/400/600',
        enabled: true,
        updatedAt: '2024-02-01T10:00:00Z',
    },
};
// GET /api/titles/:id/landing-page
router.get('/titles/:id/landing-page', (req, res) => {
    const title = mockData_1.titles.find((t) => t.id === req.params.id);
    if (!title) {
        return res.status(404).json({
            error: { code: 'GUT-4041', message: 'Title not found', detail: `No title with id '${req.params.id}'.`, resolution: 'Verify the title ID.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4041' },
        });
    }
    const lpId = req.params.id;
    const lp = landingPages[lpId] || {
        titleId: lpId,
        headline: title.title,
        description: title.description,
        ctaText: 'Buy Now',
        ctaUrl: null,
        coverImageUrl: title.coverImageUrl,
        enabled: false,
        updatedAt: null,
    };
    return res.json(lp);
});
// PUT /api/titles/:id/landing-page
router.put('/titles/:id/landing-page', (req, res) => {
    const title = mockData_1.titles.find((t) => t.id === req.params.id);
    if (!title) {
        return res.status(404).json({
            error: { code: 'GUT-4041', message: 'Title not found', detail: `No title with id '${req.params.id}'.`, resolution: 'Verify the title ID.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4041' },
        });
    }
    const lpPutId = req.params.id;
    const existing = landingPages[lpPutId] || {};
    landingPages[lpPutId] = {
        ...existing,
        ...req.body,
        titleId: lpPutId,
        updatedAt: new Date().toISOString(),
    };
    return res.json(landingPages[lpPutId]);
});
// GET /api/titles/:id/arc
router.get('/titles/:id/arc', (req, res) => {
    const title = mockData_1.titles.find((t) => t.id === req.params.id);
    if (!title) {
        return res.status(404).json({
            error: { code: 'GUT-4041', message: 'Title not found', detail: `No title with id '${req.params.id}'.`, resolution: 'Verify the title ID.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4041' },
        });
    }
    const campaign = mockData_1.arcCampaigns.find((a) => a.titleId === req.params.id);
    if (!campaign) {
        return res.status(404).json({
            error: { code: 'GUT-4044', message: 'No ARC campaign found', detail: `No ARC campaign exists for title '${req.params.id}'.`, resolution: 'Create an ARC campaign via POST /api/titles/:id/arc.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4044' },
        });
    }
    return res.json(campaign);
});
// POST /api/titles/:id/arc
router.post('/titles/:id/arc', (req, res) => {
    const title = mockData_1.titles.find((t) => t.id === req.params.id);
    if (!title) {
        return res.status(404).json({
            error: { code: 'GUT-4041', message: 'Title not found', detail: `No title with id '${req.params.id}'.`, resolution: 'Verify the title ID.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4041' },
        });
    }
    const arcTitleId = req.params.id;
    const campaign = {
        id: `arc-${(0, uuid_1.v4)().slice(0, 8)}`,
        titleId: arcTitleId,
        title: req.body.title || `${title.title} – ARC Campaign`,
        status: 'draft',
        arcCopiesRequested: req.body.arcCopiesRequested || 25,
        arcCopiesSent: 0,
        reviewsReceived: 0,
        launchDate: req.body.launchDate || null,
        netgalleyUrl: null,
        notes: req.body.notes || null,
    };
    mockData_1.arcCampaigns.push(campaign);
    return res.status(201).json(campaign);
});
// GET /api/titles/:id/press-kit
router.get('/titles/:id/press-kit', (req, res) => {
    const title = mockData_1.titles.find((t) => t.id === req.params.id);
    if (!title) {
        return res.status(404).json({
            error: { code: 'GUT-4041', message: 'Title not found', detail: `No title with id '${req.params.id}'.`, resolution: 'Verify the title ID.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4041' },
        });
    }
    return res.json({
        titleId: req.params.id,
        downloadUrl: `/api/titles/${req.params.id}/press-kit/download`,
        assets: [
            { type: 'cover_hi_res', label: 'High-res cover (300 DPI)', url: title.coverImageUrl || null, format: 'JPG', sizeMB: 4.2 },
            { type: 'cover_web', label: 'Web cover (72 DPI)', url: title.coverImageUrl || null, format: 'JPG', sizeMB: 0.8 },
            { type: 'author_photo', label: 'Author headshot', url: `https://i.pravatar.cc/600?u=${title.authorId}`, format: 'JPG', sizeMB: 1.1 },
            { type: 'synopsis_short', label: 'Short synopsis (100 words)', url: null, format: 'TXT', sizeMB: 0.001 },
            { type: 'synopsis_long', label: 'Long synopsis (500 words)', url: null, format: 'TXT', sizeMB: 0.003 },
            { type: 'bio', label: 'Author bio', url: null, format: 'TXT', sizeMB: 0.001 },
            { type: 'review_quotes', label: 'Review quotes', url: null, format: 'TXT', sizeMB: 0.002 },
        ],
        generatedAt: new Date().toISOString(),
    });
});
// POST /api/titles/:id/synopsis
router.post('/titles/:id/synopsis', (req, res) => {
    const title = mockData_1.titles.find((t) => t.id === req.params.id);
    if (!title) {
        return res.status(404).json({
            error: { code: 'GUT-4041', message: 'Title not found', detail: `No title with id '${req.params.id}'.`, resolution: 'Verify the title ID.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4041' },
        });
    }
    const style = req.body.style || 'short';
    const synopses = {
        short: `${title.title} is a compelling work of ${title.genre} that explores themes of identity, resilience, and the human condition. With vivid characters and a propulsive narrative, it will captivate readers from the first page to the last.`,
        long: `In ${title.title}, author ${title.authorId} crafts an unforgettable story set against the backdrop of ${title.genre}. The narrative weaves together richly drawn characters—each carrying secrets that the story slowly, masterfully reveals. At its heart, the book asks profound questions about ${(title.keywords || []).slice(0, 3).join(', ')}, forcing both characters and readers to confront uncomfortable truths. The result is a work that lingers in the imagination long after the final page.`,
        blurb: `"${title.title} is exactly the kind of book that reminds you why you fell in love with reading."`,
    };
    return res.json({
        titleId: req.params.id,
        style,
        synopsis: synopses[style] || synopses.short,
        generatedAt: new Date().toISOString(),
        model: 'guttenberg-synopsis-v2',
        note: 'AI-generated synopsis. Review and personalize before publication.',
    });
});
exports.default = router;
