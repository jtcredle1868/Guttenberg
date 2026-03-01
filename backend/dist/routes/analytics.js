"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mockData_1 = require("../data/mockData");
const router = (0, express_1.Router)();
// GET /api/analytics/overview
router.get('/overview', (req, res) => {
    const totalTitles = mockData_1.titles.length;
    const publishedTitles = mockData_1.titles.filter((t) => t.status === 'published').length;
    const totalSales = mockData_1.salesRecords.reduce((a, s) => a + s.quantity, 0);
    const totalRevenue = +mockData_1.salesRecords.reduce((a, s) => a + s.revenue, 0).toFixed(2);
    const totalRoyalties = +mockData_1.salesRecords.reduce((a, s) => a + s.royalty, 0).toFixed(2);
    const channels = new Set();
    for (const t of mockData_1.titles) {
        for (const ch of t.distributionChannels)
            channels.add(ch);
    }
    return res.json({
        totalTitles,
        publishedTitles,
        draftTitles: mockData_1.titles.filter((t) => t.status === 'draft').length,
        archivedTitles: mockData_1.titles.filter((t) => t.status === 'archived').length,
        totalSales,
        totalRevenue,
        totalRoyalties,
        activeChannels: channels.size,
        averageRoyaltyRate: totalRevenue > 0 ? +((totalRoyalties / totalRevenue) * 100).toFixed(1) : 0,
        lastUpdated: new Date().toISOString(),
    });
});
// GET /api/analytics/sales-chart
router.get('/sales-chart', (req, res) => {
    const granularity = req.query.granularity || 'daily';
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    let filtered = [...mockData_1.salesRecords];
    if (startDate)
        filtered = filtered.filter((s) => s.date >= startDate);
    if (endDate)
        filtered = filtered.filter((s) => s.date <= endDate);
    const grouped = {};
    for (const s of filtered) {
        let period;
        if (granularity === 'monthly') {
            period = s.date.slice(0, 7);
        }
        else if (granularity === 'weekly') {
            const d = new Date(s.date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            d.setDate(diff);
            period = d.toISOString().split('T')[0];
        }
        else {
            period = s.date;
        }
        if (!grouped[period])
            grouped[period] = { period, units: 0, revenue: 0, royalties: 0 };
        grouped[period].units += s.quantity;
        grouped[period].revenue = +(grouped[period].revenue + s.revenue).toFixed(2);
        grouped[period].royalties = +(grouped[period].royalties + s.royalty).toFixed(2);
    }
    const data = Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
    return res.json({ granularity, data });
});
// GET /api/analytics/top-titles
router.get('/top-titles', (req, res) => {
    const metric = req.query.metric || 'revenue';
    const limit = Math.min(20, parseInt(req.query.limit) || 5);
    const titleStats = {};
    for (const s of mockData_1.salesRecords) {
        if (!titleStats[s.titleId])
            titleStats[s.titleId] = { titleId: s.titleId, units: 0, revenue: 0, royalties: 0 };
        titleStats[s.titleId].units += s.quantity;
        titleStats[s.titleId].revenue = +(titleStats[s.titleId].revenue + s.revenue).toFixed(2);
        titleStats[s.titleId].royalties = +(titleStats[s.titleId].royalties + s.royalty).toFixed(2);
    }
    const sorted = Object.values(titleStats).sort((a, b) => metric === 'units' ? b.units - a.units : b.revenue - a.revenue);
    const topTitles = sorted.slice(0, limit).map((stat) => {
        const title = mockData_1.titles.find((t) => t.id === stat.titleId);
        return { ...stat, title: title?.title || 'Unknown', genre: title?.genre || 'Unknown', coverImageUrl: title?.coverImageUrl || null };
    });
    return res.json({ metric, topTitles });
});
// GET /api/analytics/channel-breakdown
router.get('/channel-breakdown', (req, res) => {
    const channelStats = {};
    for (const s of mockData_1.salesRecords) {
        if (!channelStats[s.channel])
            channelStats[s.channel] = { channel: s.channel, units: 0, revenue: 0, royalties: 0 };
        channelStats[s.channel].units += s.quantity;
        channelStats[s.channel].revenue = +(channelStats[s.channel].revenue + s.revenue).toFixed(2);
        channelStats[s.channel].royalties = +(channelStats[s.channel].royalties + s.royalty).toFixed(2);
    }
    const total = Object.values(channelStats).reduce((a, c) => a + c.revenue, 0);
    const breakdown = Object.values(channelStats).map((c) => ({
        ...c,
        revenueShare: total > 0 ? +((c.revenue / total) * 100).toFixed(1) : 0,
    })).sort((a, b) => b.revenue - a.revenue);
    return res.json({ breakdown });
});
// GET /api/analytics/territory-breakdown
router.get('/territory-breakdown', (req, res) => {
    // Mock territory data based on channel proxies
    const territoryMap = {
        US: { territory: 'United States', code: 'US', units: 0, revenue: 0 },
        UK: { territory: 'United Kingdom', code: 'UK', units: 0, revenue: 0 },
        CA: { territory: 'Canada', code: 'CA', units: 0, revenue: 0 },
        AU: { territory: 'Australia', code: 'AU', units: 0, revenue: 0 },
        DE: { territory: 'Germany', code: 'DE', units: 0, revenue: 0 },
        OTHER: { territory: 'Rest of World', code: 'OTHER', units: 0, revenue: 0 },
    };
    const channelTerritory = {
        amazon_kdp: ['US', 'UK', 'DE'],
        ingramspark: ['US', 'UK', 'AU'],
        apple_books: ['US', 'UK', 'CA', 'AU'],
        kobo: ['CA', 'AU', 'OTHER'],
        barnes_noble: ['US'],
    };
    for (const s of mockData_1.salesRecords) {
        const territories = channelTerritory[s.channel] || ['OTHER'];
        const share = 1 / territories.length;
        for (const t of territories) {
            if (territoryMap[t]) {
                territoryMap[t].units += Math.round(s.quantity * share);
                territoryMap[t].revenue = +(territoryMap[t].revenue + s.revenue * share).toFixed(2);
            }
        }
    }
    const breakdown = Object.values(territoryMap).sort((a, b) => b.revenue - a.revenue);
    return res.json({ breakdown });
});
// GET /api/analytics/events
router.get('/events', (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const typeFilter = req.query.type;
    let events = [...mockData_1.activityEvents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (typeFilter)
        events = events.filter((e) => e.type === typeFilter);
    const total = events.length;
    const data = events.slice((page - 1) * limit, page * limit);
    return res.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});
exports.default = router;
