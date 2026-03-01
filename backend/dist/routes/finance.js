"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mockData_1 = require("../data/mockData");
const router = (0, express_1.Router)();
// ─── Royalty formulas ────────────────────────────────────────────────────────
function calcRoyalty(channel, formatType, listPrice, printingCost, fileSizeMB = 2) {
    switch (channel) {
        case 'amazon_kdp': {
            if (formatType === 'ebook') {
                if (listPrice >= 2.99 && listPrice <= 9.99) {
                    const delivery = 0.15 * fileSizeMB;
                    const royalty = listPrice * 0.70 - delivery;
                    return { royalty: +royalty.toFixed(2), rate: '70%', formula: `(${listPrice} × 0.70) − $${delivery.toFixed(2)} delivery` };
                }
                const royalty = listPrice * 0.35;
                return { royalty: +royalty.toFixed(2), rate: '35%', formula: `${listPrice} × 0.35 (outside $2.99–$9.99 range)` };
            }
            const royalty = (listPrice - printingCost) * 0.60;
            return { royalty: +royalty.toFixed(2), rate: '60% of net', formula: `(${listPrice} − ${printingCost}) × 0.60` };
        }
        case 'ingramspark': {
            if (formatType === 'ebook') {
                const royalty = listPrice * 0.45;
                return { royalty: +royalty.toFixed(2), rate: '45%', formula: `${listPrice} × 0.45` };
            }
            const royalty = (listPrice - printingCost) * 0.40;
            return { royalty: +royalty.toFixed(2), rate: '40% of net', formula: `(${listPrice} − ${printingCost}) × 0.40` };
        }
        case 'apple_books': {
            const royalty = listPrice * 0.70;
            return { royalty: +royalty.toFixed(2), rate: '70%', formula: `${listPrice} × 0.70` };
        }
        case 'kobo': {
            if (listPrice >= 1.99) {
                const royalty = listPrice * 0.70;
                return { royalty: +royalty.toFixed(2), rate: '70%', formula: `${listPrice} × 0.70 (≥$1.99)` };
            }
            const royalty = listPrice * 0.45;
            return { royalty: +royalty.toFixed(2), rate: '45%', formula: `${listPrice} × 0.45 (<$1.99)` };
        }
        case 'barnes_noble': {
            const royalty = listPrice * 0.65;
            return { royalty: +royalty.toFixed(2), rate: '65%', formula: `${listPrice} × 0.65` };
        }
        default: {
            const royalty = listPrice * 0.50;
            return { royalty: +royalty.toFixed(2), rate: '50%', formula: `${listPrice} × 0.50 (default)` };
        }
    }
}
// GET /api/titles/:id/royalties
router.get('/titles/:id/royalties', (req, res) => {
    const title = mockData_1.titles.find((t) => t.id === req.params.id);
    if (!title) {
        return res.status(404).json({
            error: { code: 'GUT-4041', message: 'Title not found', detail: `No title with id '${req.params.id}'.`, resolution: 'Verify the title ID.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4041' },
        });
    }
    const titleFormats = mockData_1.formats.filter((f) => f.titleId === req.params.id);
    const breakdown = titleFormats.flatMap((fmt) => title.distributionChannels.map((ch) => {
        const calc = calcRoyalty(ch, fmt.type, fmt.price, fmt.printingCost);
        const sales = mockData_1.salesRecords.filter((s) => s.formatId === fmt.id && s.channel === ch);
        const totalUnits = sales.reduce((a, s) => a + s.quantity, 0);
        const totalRoyalties = sales.reduce((a, s) => a + s.royalty, 0);
        return {
            formatId: fmt.id,
            formatType: fmt.type,
            channel: ch,
            listPrice: fmt.price,
            printingCost: fmt.printingCost,
            ...calc,
            royaltyPerUnit: calc.royalty,
            totalUnits,
            totalRoyalties: +totalRoyalties.toFixed(2),
        };
    }));
    const totalEarned = +breakdown.reduce((a, b) => a + b.totalRoyalties, 0).toFixed(2);
    return res.json({ titleId: req.params.id, totalEarned, breakdown });
});
// GET /api/finance/earnings
router.get('/earnings', (req, res) => {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    let filtered = [...mockData_1.salesRecords];
    if (startDate)
        filtered = filtered.filter((s) => new Date(s.date) >= startDate);
    if (endDate)
        filtered = filtered.filter((s) => new Date(s.date) <= endDate);
    const totalRevenue = +filtered.reduce((a, s) => a + s.revenue, 0).toFixed(2);
    const totalRoyalties = +filtered.reduce((a, s) => a + s.royalty, 0).toFixed(2);
    // By month
    const monthMap = {};
    for (const s of filtered) {
        const month = s.date.slice(0, 7);
        if (!monthMap[month])
            monthMap[month] = { month, revenue: 0, royalties: 0, units: 0 };
        monthMap[month].revenue = +(monthMap[month].revenue + s.revenue).toFixed(2);
        monthMap[month].royalties = +(monthMap[month].royalties + s.royalty).toFixed(2);
        monthMap[month].units += s.quantity;
    }
    // By channel
    const channelMap = {};
    for (const s of filtered) {
        if (!channelMap[s.channel])
            channelMap[s.channel] = { channel: s.channel, revenue: 0, royalties: 0, units: 0 };
        channelMap[s.channel].revenue = +(channelMap[s.channel].revenue + s.revenue).toFixed(2);
        channelMap[s.channel].royalties = +(channelMap[s.channel].royalties + s.royalty).toFixed(2);
        channelMap[s.channel].units += s.quantity;
    }
    return res.json({
        totalRevenue,
        totalRoyalties,
        totalUnits: filtered.reduce((a, s) => a + s.quantity, 0),
        byMonth: Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month)),
        byChannel: Object.values(channelMap),
    });
});
// GET /api/finance/sales
router.get('/sales', (req, res) => {
    const { titleId, format: formatType, channel, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    let filtered = [...mockData_1.salesRecords];
    if (titleId)
        filtered = filtered.filter((s) => s.titleId === titleId);
    if (channel)
        filtered = filtered.filter((s) => s.channel === channel);
    if (startDate)
        filtered = filtered.filter((s) => s.date >= startDate);
    if (endDate)
        filtered = filtered.filter((s) => s.date <= endDate);
    if (formatType) {
        const matchingFormats = mockData_1.formats.filter((f) => f.type === formatType).map((f) => f.id);
        filtered = filtered.filter((s) => matchingFormats.includes(s.formatId));
    }
    const total = filtered.length;
    const data = filtered.slice((page - 1) * limit, page * limit);
    return res.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});
// GET /api/finance/disbursements
router.get('/disbursements', (req, res) => {
    return res.json({ disbursements: mockData_1.disbursements });
});
// POST /api/finance/royalty-calculator
router.post('/royalty-calculator', (req, res) => {
    const { listPrice, printingCost = 0, formatType = 'ebook', channels = [], fileSizeMB = 2 } = req.body;
    if (listPrice === undefined || listPrice === null) {
        return res.status(400).json({
            error: { code: 'GUT-4004', message: 'listPrice is required', detail: 'Provide a listPrice in the request body.', resolution: 'Include listPrice as a number.', docs_url: 'https://docs.guttenberg.io/errors/GUT-4004' },
        });
    }
    const targetChannels = channels.length > 0
        ? channels
        : ['amazon_kdp', 'ingramspark', 'apple_books', 'kobo', 'barnes_noble'];
    const breakdown = targetChannels.map((ch) => {
        const calc = calcRoyalty(ch, formatType, listPrice, printingCost, fileSizeMB);
        return { channel: ch, listPrice, printingCost, formatType, ...calc };
    });
    return res.json({
        listPrice,
        printingCost,
        formatType,
        fileSizeMB,
        breakdown,
        bestChannel: breakdown.sort((a, b) => b.royalty - a.royalty)[0]?.channel || null,
    });
});
exports.default = router;
