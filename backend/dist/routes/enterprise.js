"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const mockData_1 = require("../data/mockData");
const router = (0, express_1.Router)();
// GET /api/org/catalog
router.get('/catalog', (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const search = req.query.search?.toLowerCase();
    const genreFilter = req.query.genre;
    const statusFilter = req.query.status;
    const sortField = req.query.sort || 'updatedAt';
    let filtered = [...mockData_1.titles];
    if (search) {
        filtered = filtered.filter((t) => t.title.toLowerCase().includes(search) ||
            (t.subtitle && t.subtitle.toLowerCase().includes(search)) ||
            t.description.toLowerCase().includes(search));
    }
    if (genreFilter)
        filtered = filtered.filter((t) => t.genre.toLowerCase() === genreFilter.toLowerCase());
    if (statusFilter)
        filtered = filtered.filter((t) => t.status === statusFilter);
    filtered.sort((a, b) => {
        if (sortField === 'title')
            return a.title.localeCompare(b.title);
        if (sortField === 'sales')
            return b.salesData.totalUnits - a.salesData.totalUnits;
        if (sortField === 'revenue')
            return b.royalties.totalEarned - a.royalties.totalEarned;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    const total = filtered.length;
    const data = filtered.slice((page - 1) * limit, page * limit);
    return res.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});
// GET /api/org/team
router.get('/team', (req, res) => {
    return res.json({ members: mockData_1.organization.members });
});
// POST /api/org/team
router.post('/team', (req, res) => {
    const { email, role = 'author', name } = req.body;
    if (!email) {
        return res.status(400).json({
            error: { code: 'GUT-4005', message: 'Email is required', detail: 'Provide an email address to invite.', resolution: 'Include email in the request body.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4005' },
        });
    }
    const existing = mockData_1.organization.members.find((m) => m.email === email);
    if (existing) {
        return res.status(409).json({
            error: { code: 'GUT-4090', message: 'Member already exists', detail: `A member with email '${email}' is already in the organization.`, resolution: 'Use a different email address.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4090' },
        });
    }
    const newMember = {
        id: `member-${(0, uuid_1.v4)().slice(0, 8)}`,
        name: name || email.split('@')[0],
        email,
        role,
        status: 'invited',
        joinedAt: new Date().toISOString(),
        avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
    };
    mockData_1.organization.members.push(newMember);
    return res.status(201).json(newMember);
});
// GET /api/org/imprints
router.get('/imprints', (req, res) => {
    return res.json({ imprints: mockData_1.organization.imprints });
});
// POST /api/org/imprints
router.post('/imprints', (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({
            error: { code: 'GUT-4006', message: 'Imprint name is required', detail: 'Provide a name for the new imprint.', resolution: 'Include name in the request body.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4006' },
        });
    }
    const newImprint = {
        id: `imprint-${(0, uuid_1.v4)().slice(0, 8)}`,
        name,
        description: description || '',
        titleCount: 0,
        createdAt: new Date().toISOString(),
    };
    mockData_1.organization.imprints.push(newImprint);
    return res.status(201).json(newImprint);
});
exports.default = router;
