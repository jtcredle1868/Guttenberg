"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const mockData_1 = require("../data/mockData");
const router = (0, express_1.Router)();
// GET /api/titles
router.get('/', (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const statusFilter = req.query.status;
    const genreFilter = req.query.genre;
    const authorId = req.query.authorId;
    const search = req.query.search?.toLowerCase();
    let filtered = [...mockData_1.titles];
    if (statusFilter)
        filtered = filtered.filter((t) => t.status === statusFilter);
    if (genreFilter)
        filtered = filtered.filter((t) => t.genre.toLowerCase() === genreFilter.toLowerCase());
    if (authorId)
        filtered = filtered.filter((t) => t.authorId === authorId);
    if (search) {
        filtered = filtered.filter((t) => t.title.toLowerCase().includes(search) ||
            t.description.toLowerCase().includes(search) ||
            (t.subtitle && t.subtitle.toLowerCase().includes(search)));
    }
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const data = filtered.slice(offset, offset + limit);
    return res.json({
        data,
        pagination: { page, limit, total, totalPages },
    });
});
// GET /api/titles/:id
router.get('/:id', (req, res) => {
    const title = mockData_1.titles.find((t) => t.id === req.params.id);
    if (!title) {
        return res.status(404).json({
            error: {
                code: 'GUT-4041',
                message: 'Title not found',
                detail: `No title exists with id '${req.params.id}'.`,
                resolution: 'Verify the title ID and try again.',
                docs_url: 'https://docs.guttenberg.io/errors/GUT-4041',
            },
        });
    }
    const titleFormats = mockData_1.formats.filter((f) => f.titleId === req.params.id);
    const titleDist = mockData_1.distributionRecords.filter((d) => d.titleId === req.params.id);
    return res.json({
        ...title,
        formatDetails: titleFormats,
        distributionDetails: titleDist,
    });
});
// POST /api/titles
router.post('/', (req, res) => {
    const { title: titleName, authorId, genre, description } = req.body;
    if (!titleName) {
        return res.status(400).json({
            error: {
                code: 'GUT-4001',
                message: 'Title name is required',
                detail: 'The "title" field must be provided.',
                resolution: 'Include a title field in the request body.',
                docs_url: 'https://docs.guttenberg.io/errors/GUT-4001',
            },
        });
    }
    const newTitle = {
        id: `title-${(0, uuid_1.v4)().slice(0, 8)}`,
        title: titleName,
        subtitle: req.body.subtitle || '',
        authorId: authorId || 'author-001',
        genre: genre || 'Uncategorized',
        bisacCodes: req.body.bisacCodes || [],
        keywords: req.body.keywords || [],
        description: description || '',
        wordCount: req.body.wordCount || 0,
        pageCount: req.body.pageCount || 0,
        publicationDate: null,
        status: 'draft',
        coverImageUrl: null,
        language: req.body.language || 'en',
        series: null,
        formats: [],
        distributionChannels: [],
        royalties: { totalEarned: 0, ytd: 0 },
        salesData: { totalUnits: 0, ytdUnits: 0, lastMonthUnits: 0 },
        refinery: { score: 0, lastSyncedAt: null },
        metadata: { completeness: 20 },
        preflight: { score: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    mockData_1.titles.push(newTitle);
    return res.status(201).json(newTitle);
});
// PUT /api/titles/:id
router.put('/:id', (req, res) => {
    const idx = mockData_1.titles.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
        return res.status(404).json({
            error: {
                code: 'GUT-4041',
                message: 'Title not found',
                detail: `No title exists with id '${req.params.id}'.`,
                resolution: 'Verify the title ID and try again.',
                docs_url: 'https://docs.guttenberg.io/errors/GUT-4041',
            },
        });
    }
    const updatableFields = [
        'title', 'subtitle', 'genre', 'bisacCodes', 'keywords',
        'description', 'wordCount', 'pageCount', 'publicationDate',
        'status', 'language', 'series',
    ];
    const updates = {};
    for (const field of updatableFields) {
        if (req.body[field] !== undefined)
            updates[field] = req.body[field];
    }
    mockData_1.titles[idx] = { ...mockData_1.titles[idx], ...updates, updatedAt: new Date().toISOString() };
    return res.json(mockData_1.titles[idx]);
});
// DELETE /api/titles/:id
router.delete('/:id', (req, res) => {
    const idx = mockData_1.titles.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
        return res.status(404).json({
            error: {
                code: 'GUT-4041',
                message: 'Title not found',
                detail: `No title exists with id '${req.params.id}'.`,
                resolution: 'Verify the title ID and try again.',
                docs_url: 'https://docs.guttenberg.io/errors/GUT-4041',
            },
        });
    }
    mockData_1.titles.splice(idx, 1);
    return res.status(204).send();
});
// GET /api/titles/:id/publishing-readiness
router.get('/:id/publishing-readiness', (req, res) => {
    const title = mockData_1.titles.find((t) => t.id === req.params.id);
    if (!title) {
        return res.status(404).json({
            error: {
                code: 'GUT-4041',
                message: 'Title not found',
                detail: `No title exists with id '${req.params.id}'.`,
                resolution: 'Verify the title ID and try again.',
                docs_url: 'https://docs.guttenberg.io/errors/GUT-4041',
            },
        });
    }
    const refineryScore = title.refinery.score;
    const metadataCompleteness = title.metadata.completeness;
    const preflightScore = title.preflight.score;
    const overall = Math.round(refineryScore * 0.6 + metadataCompleteness * 0.2 + preflightScore * 0.2);
    const titleFormats = mockData_1.formats.filter((f) => f.titleId === req.params.id);
    const titleDist = mockData_1.distributionRecords.filter((d) => d.titleId === req.params.id);
    return res.json({
        titleId: title.id,
        overall,
        refineryScore,
        metadataCompleteness,
        preflightScore,
        breakdown: {
            refinery: {
                score: refineryScore,
                weight: 0.6,
                contribution: Math.round(refineryScore * 0.6),
                status: refineryScore >= 80 ? 'good' : refineryScore >= 60 ? 'needs_work' : 'critical',
                lastSyncedAt: title.refinery.lastSyncedAt,
            },
            metadata: {
                score: metadataCompleteness,
                weight: 0.2,
                contribution: Math.round(metadataCompleteness * 0.2),
                status: metadataCompleteness >= 80 ? 'good' : metadataCompleteness >= 60 ? 'needs_work' : 'critical',
                missingFields: getMissingMetadataFields(title),
            },
            preflight: {
                score: preflightScore,
                weight: 0.2,
                contribution: Math.round(preflightScore * 0.2),
                status: preflightScore >= 80 ? 'good' : preflightScore > 0 ? 'needs_work' : 'not_run',
            },
        },
        checklist: {
            hasManuscript: title.wordCount > 0,
            hasCover: title.coverImageUrl !== null,
            hasISBN: titleFormats.some((f) => f.isbn !== null),
            hasDistributionChannel: titleDist.length > 0,
            metadataComplete: metadataCompleteness >= 80,
            preflightPassed: preflightScore >= 70,
        },
        readyToPublish: overall >= 75,
    });
});
function getMissingMetadataFields(title) {
    const missing = [];
    if (!title.description || title.description.length < 50)
        missing.push('description');
    if (!title.genre)
        missing.push('genre');
    if (!title.bisacCodes || title.bisacCodes.length === 0)
        missing.push('bisacCodes');
    if (!title.keywords || title.keywords.length === 0)
        missing.push('keywords');
    if (!title.language)
        missing.push('language');
    if (!title.publicationDate)
        missing.push('publicationDate');
    return missing;
}
// GET /api/titles/:id/versions
router.get('/:id/versions', (req, res) => {
    const title = mockData_1.titles.find((t) => t.id === req.params.id);
    if (!title) {
        return res.status(404).json({
            error: {
                code: 'GUT-4041',
                message: 'Title not found',
                detail: `No title exists with id '${req.params.id}'.`,
                resolution: 'Verify the title ID and try again.',
                docs_url: 'https://docs.guttenberg.io/errors/GUT-4041',
            },
        });
    }
    const titleId = req.params.id;
    const versions = mockData_1.versionHistory[titleId] || [];
    return res.json({ titleId, versions });
});
// POST /api/titles/:id/versions
router.post('/:id/versions', (req, res) => {
    const title = mockData_1.titles.find((t) => t.id === req.params.id);
    if (!title) {
        return res.status(404).json({
            error: {
                code: 'GUT-4041',
                message: 'Title not found',
                detail: `No title exists with id '${req.params.id}'.`,
                resolution: 'Verify the title ID and try again.',
                docs_url: 'https://docs.guttenberg.io/errors/GUT-4041',
            },
        });
    }
    const titleId = req.params.id;
    if (!mockData_1.versionHistory[titleId])
        mockData_1.versionHistory[titleId] = [];
    const existing = mockData_1.versionHistory[titleId];
    const lastVersion = existing[existing.length - 1]?.version || '0.0.0';
    const [major, minor, patch] = lastVersion.split('.').map(Number);
    const newVersion = {
        version: `${major}.${minor + 1}.0`,
        label: req.body.label || 'New version',
        notes: req.body.notes || '',
        createdAt: new Date().toISOString(),
        createdBy: req.body.createdBy || 'author-001',
        wordCount: req.body.wordCount || title.wordCount,
    };
    existing.push(newVersion);
    return res.status(201).json(newVersion);
});
exports.default = router;
