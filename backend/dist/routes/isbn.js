"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
// POST /api/isbn/purchase
router.post('/purchase', (req, res) => {
    const { titleId, formatType, quantity = 1 } = req.body;
    const generateIsbn13 = () => {
        const prefix = '978';
        const group = '1';
        const publisher = String(Math.floor(100000 + Math.random() * 899999));
        const title = String(Math.floor(10 + Math.random() * 89));
        const partial = `${prefix}${group}${publisher}${title}`;
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(partial[i]) * (i % 2 === 0 ? 1 : 3);
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        return `${partial}${checkDigit}`;
    };
    const isbns = Array.from({ length: quantity }, () => generateIsbn13());
    return res.status(201).json({
        titleId: titleId || null,
        formatType: formatType || null,
        quantity,
        isbns: isbns.map((isbn) => ({
            isbn,
            formatted: `${isbn.slice(0, 3)}-${isbn[3]}-${isbn.slice(4, 10)}-${isbn.slice(10, 12)}-${isbn[12]}`,
            purchasedAt: new Date().toISOString(),
            receiptId: `rcpt-${(0, uuid_1.v4)().slice(0, 10).toUpperCase()}`,
        })),
        purchasedAt: new Date().toISOString(),
        receiptId: `rcpt-${(0, uuid_1.v4)().slice(0, 10).toUpperCase()}`,
    });
});
// POST /api/isbn/validate
router.post('/validate', (req, res) => {
    const { isbn } = req.body;
    if (!isbn) {
        return res.status(400).json({
            error: {
                code: 'GUT-4002',
                message: 'ISBN is required',
                detail: 'Provide an isbn field in the request body.',
                resolution: 'Include isbn in the request body.',
                docs_url: 'https://docs.guttenberg.io/errors/GUT-4002',
            },
        });
    }
    // Strip hyphens and spaces
    const cleaned = String(isbn).replace(/[-\s]/g, '');
    if (cleaned.length === 13) {
        // ISBN-13 validation (ISO 2108)
        if (!/^\d{13}$/.test(cleaned)) {
            return res.json({ valid: false, isbn: cleaned, message: 'ISBN-13 must contain exactly 13 digits.' });
        }
        if (!cleaned.startsWith('978') && !cleaned.startsWith('979')) {
            return res.json({ valid: false, isbn: cleaned, message: 'ISBN-13 must begin with 978 or 979.' });
        }
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cleaned[i]) * (i % 2 === 0 ? 1 : 3);
        }
        const expectedCheck = (10 - (sum % 10)) % 10;
        const actualCheck = parseInt(cleaned[12]);
        if (expectedCheck !== actualCheck) {
            return res.json({
                valid: false,
                isbn: cleaned,
                message: `Invalid check digit. Expected ${expectedCheck}, got ${actualCheck}.`,
            });
        }
        return res.json({ valid: true, isbn: cleaned, format: 'ISBN-13', message: 'Valid ISBN-13.' });
    }
    if (cleaned.length === 10) {
        // ISBN-10 validation
        if (!/^\d{9}[\dX]$/.test(cleaned)) {
            return res.json({ valid: false, isbn: cleaned, message: 'ISBN-10 must be 9 digits followed by a digit or X.' });
        }
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleaned[i]) * (10 - i);
        }
        const lastChar = cleaned[9];
        sum += lastChar === 'X' ? 10 : parseInt(lastChar);
        if (sum % 11 !== 0) {
            return res.json({ valid: false, isbn: cleaned, message: 'Invalid ISBN-10 check digit.' });
        }
        return res.json({ valid: true, isbn: cleaned, format: 'ISBN-10', message: 'Valid ISBN-10. Note: ISBN-10 is deprecated; use ISBN-13 for new titles.' });
    }
    return res.json({ valid: false, isbn: cleaned, message: `Invalid length: ${cleaned.length} digits (expected 10 or 13).` });
});
// GET /api/isbn/pricing
router.get('/pricing', (req, res) => {
    return res.json({
        currency: 'USD',
        tiers: [
            { id: 'single', label: 'Single ISBN', quantity: 1, price: 125.00, pricePerIsbn: 125.00 },
            { id: 'block10', label: 'Block of 10', quantity: 10, price: 295.00, pricePerIsbn: 29.50, savings: '76% off single price' },
            { id: 'block100', label: 'Block of 100', quantity: 100, price: 575.00, pricePerIsbn: 5.75, savings: '95% off single price' },
        ],
        notes: [
            'ISBNs are purchased from Bowker (US) and assigned to your publisher imprint.',
            'ISBN assignment is permanent and non-transferable.',
            'Each format (paperback, hardcover, ebook, audiobook) requires its own ISBN.',
        ],
    });
});
exports.default = router;
