import { Router, Request, Response } from 'express';
import { validate } from '../middleware/validate';

const router = Router();

// ─── Static data ─────────────────────────────────────────────────────────────

const channelRates = [
  {
    id:          'amazon_kdp',
    name:        'Amazon KDP',
    formats:     ['ebook', 'paperback', 'hardcover'],
    ebookRates: [
      { label: 'Standard (35%)',   min: 0.01, max: 2.98,  royaltyPct: 0.35, deliveryFeePerMB: 0 },
      { label: 'Premium (70%)',    min: 2.99, max: 9.99,  royaltyPct: 0.70, deliveryFeePerMB: 0.15 },
      { label: 'Standard (35%)',   min: 10.00, max: null, royaltyPct: 0.35, deliveryFeePerMB: 0 },
    ],
    printRoyaltyPct:  0.60,
    printBasis:       'net' as const,
    notes:            '70% rate requires price $2.99–$9.99; delivery fee deducted from 70% royalties.',
  },
  {
    id:          'ingramspark',
    name:        'IngramSpark',
    formats:     ['ebook', 'paperback', 'hardcover'],
    ebookRates: [
      { label: 'Standard (45%)', min: 0.01, max: null, royaltyPct: 0.45, deliveryFeePerMB: 0 },
    ],
    printRoyaltyPct:  0.40,
    printBasis:       'net' as const,
    notes:            'Broad wholesale distribution to 40,000+ retail partners. Setup fee $49 applies.',
  },
  {
    id:          'apple_books',
    name:        'Apple Books',
    formats:     ['ebook'],
    ebookRates: [
      { label: 'Standard (70%)', min: 0.99, max: null, royaltyPct: 0.70, deliveryFeePerMB: 0 },
    ],
    printRoyaltyPct:  null,
    printBasis:       null,
    notes:            'ebook only. Minimum price $0.99.',
  },
  {
    id:          'kobo',
    name:        'Kobo Writing Life',
    formats:     ['ebook'],
    ebookRates: [
      { label: 'Standard (45%)', min: 0.01, max: 1.98,  royaltyPct: 0.45, deliveryFeePerMB: 0 },
      { label: 'Premium (70%)',  min: 1.99, max: null,  royaltyPct: 0.70, deliveryFeePerMB: 0 },
    ],
    printRoyaltyPct:  null,
    printBasis:       null,
    notes:            '70% rate available at $1.99+. Strong in CA, AU, and Europe.',
  },
  {
    id:          'barnes_noble',
    name:        'Barnes & Noble Press',
    formats:     ['ebook', 'paperback', 'hardcover'],
    ebookRates: [
      { label: 'Standard (65%)', min: 0.99, max: null, royaltyPct: 0.65, deliveryFeePerMB: 0 },
    ],
    printRoyaltyPct:  0.55,
    printBasis:       'net' as const,
    notes:            'Primary US retail presence.',
  },
];

const printingCosts: Record<string, { perPage: number; setup: number }> = {
  '5x8':     { perPage: 0.015, setup: 0.85 },
  '5.5x8.5': { perPage: 0.016, setup: 0.85 },
  '6x9':     { perPage: 0.017, setup: 0.90 },
  '7x10':    { perPage: 0.019, setup: 0.90 },
  '8x10':    { perPage: 0.021, setup: 1.00 },
  '8.5x8.5': { perPage: 0.022, setup: 1.00 },
  '8.5x11':  { perPage: 0.024, setup: 1.10 },
};

const platformServices = [
  { id: 'isbn_single',    name: 'Single ISBN',          price: 125.00,  unit: 'per ISBN' },
  { id: 'isbn_block10',   name: 'Block of 10 ISBNs',    price: 295.00,  unit: 'per block' },
  { id: 'isbn_block100',  name: 'Block of 100 ISBNs',   price: 575.00,  unit: 'per block' },
  { id: 'plan_indie',     name: 'Indie Author Plan',     price: 0,       unit: 'per month', note: 'Free tier' },
  { id: 'plan_pro',       name: 'Pro Author Plan',       price: 19.99,   unit: 'per month' },
  { id: 'plan_publisher', name: 'Publisher Pro Plan',    price: 49.99,   unit: 'per month' },
  { id: 'cover_design',   name: 'Professional Cover Design', price: 299.00, unit: 'per title' },
  { id: 'editing_copy',   name: 'Copyediting',          price: 0.018,   unit: 'per word' },
  { id: 'editing_proof',  name: 'Proofreading',         price: 0.010,   unit: 'per word' },
  { id: 'formatting',     name: 'Interior Formatting',  price: 149.00,  unit: 'per title' },
];

// ─── Royalty calculator ───────────────────────────────────────────────────────

function calcEbookRoyalty(channel: typeof channelRates[number], price: number, fileSizeMB: number): number {
  // Find the last matching rate tier (most specific / highest threshold that qualifies)
  const matching = channel.ebookRates.filter(
    (r) => price >= r.min && (r.max === null || price <= r.max)
  );
  const rate = matching[matching.length - 1] || channel.ebookRates[0];
  const delivery = rate.deliveryFeePerMB * fileSizeMB;
  return Math.max(0, +(price * rate.royaltyPct - delivery).toFixed(2));
}

function calcPrintRoyalty(channel: typeof channelRates[number], price: number, printCost: number): number | null {
  if (channel.printRoyaltyPct === null) return null;
  const net = price - printCost;
  if (net <= 0) return 0;
  return +(net * channel.printRoyaltyPct).toFixed(2);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ok<T>(data: T, meta?: Record<string, unknown>) {
  return { success: true, data, ...(meta ? { meta } : {}) };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/pricing/channels
router.get('/channels', (_req: Request, res: Response) => {
  res.json(ok(channelRates, { total: channelRates.length }));
});

// GET /api/pricing/printing
router.get('/printing', (req: Request, res: Response) => {
  const { trimSize, pageCount: rawPageCount } = req.query as Record<string, string>;

  const costs = Object.entries(printingCosts).map(([size, rates]) => ({
    trimSize: size,
    perPageCost: rates.perPage,
    setupCost:   rates.setup,
    exampleCosts: [100, 200, 300, 400, 500].map((pages) => ({
      pages,
      totalCost: +(rates.perPage * pages + rates.setup).toFixed(2),
    })),
  }));

  let result: typeof costs = costs;
  if (trimSize) result = result.filter((c) => c.trimSize === trimSize);

  if (rawPageCount && trimSize) {
    const pageCount = parseInt(rawPageCount);
    const rates     = printingCosts[trimSize];
    if (rates && !isNaN(pageCount)) {
      const totalCost = +(rates.perPage * pageCount + rates.setup).toFixed(2);
      res.json(ok({ trimSize, pageCount, totalCost, perPageCost: rates.perPage, setupCost: rates.setup }));
      return;
    }
  }

  res.json(ok(result, { total: result.length }));
});

// POST /api/pricing/calculate
router.post(
  '/calculate',
  validate({
    formatType: { type: 'string', required: true, enum: ['ebook', 'paperback', 'hardcover', 'audiobook'] },
    listPrice:  { type: 'number', required: true, min: 0.01 },
  }),
  (req: Request, res: Response) => {
    const {
      formatType,
      listPrice,
      pageCount   = 0,
      trimSize    = '6x9',
      fileSizeMB  = 2,
      channels    = channelRates.map((c) => c.id),
    } = req.body as {
      formatType: string;
      listPrice: number;
      pageCount?: number;
      trimSize?: string;
      fileSizeMB?: number;
      channels?: string[];
    };

    const isPrint = formatType === 'paperback' || formatType === 'hardcover';

    // Print cost calculation
    const printRates = printingCosts[trimSize] || printingCosts['6x9'];
    const printCost  = isPrint && pageCount > 0
      ? +(printRates.perPage * pageCount + printRates.setup).toFixed(2)
      : 0;

    const breakdown = channelRates
      .filter((ch) => channels.includes(ch.id) && ch.formats.includes(formatType))
      .map((ch) => {
        const royalty = isPrint
          ? calcPrintRoyalty(ch, listPrice, printCost)
          : calcEbookRoyalty(ch, listPrice, fileSizeMB);

        const netAfterPrint = isPrint ? +(listPrice - printCost).toFixed(2) : listPrice;

        return {
          channel:      ch.id,
          channelName:  ch.name,
          listPrice,
          printCost:    isPrint ? printCost : 0,
          netRevenue:   netAfterPrint,
          royalty:      royalty ?? 0,
          royaltyRate:  royalty !== null ? +((royalty / listPrice) * 100).toFixed(1) : null,
          supportsFormat: true,
        };
      });

    // Break-even analysis (for print)
    const breakEvenUnits = isPrint && printCost > 0
      ? Math.ceil(printCost / Math.max(0.01, listPrice - printCost))
      : null;

    // Recommended price heuristics
    const competitiveRange = isPrint
      ? { low: +(printCost * 2.5).toFixed(2), high: +(printCost * 4.5).toFixed(2) }
      : { low: 2.99, high: 9.99 };

    const bestChannel = breakdown.sort((a, b) => b.royalty - a.royalty)[0];

    res.json(ok({
      formatType,
      listPrice,
      printCost,
      fileSizeMB: isPrint ? null : fileSizeMB,
      breakdown,
      bestChannel:      bestChannel?.channel || null,
      bestRoyalty:      bestChannel?.royalty || 0,
      breakEvenUnits,
      competitiveRange,
      recommendation:   listPrice < competitiveRange.low
        ? 'Price is below competitive range; consider raising it for better margins.'
        : listPrice > competitiveRange.high
        ? 'Price is above typical range; ensure your positioning justifies the premium.'
        : 'Price is within the competitive range for this format.',
    }));
  }
);

// GET /api/pricing/isbn
router.get('/isbn', (_req: Request, res: Response) => {
  res.json(ok([
    { tier: 'single',    quantity: 1,   price: 125.00, pricePerIsbn: 125.00, savings: null },
    { tier: 'block10',   quantity: 10,  price: 295.00, pricePerIsbn: 29.50,  savings: '76% vs single' },
    { tier: 'block100',  quantity: 100, price: 575.00, pricePerIsbn: 5.75,   savings: '95% vs single' },
  ], {
    currency: 'USD',
    note: 'ISBNs are assigned to your publisher imprint. Each format edition requires its own ISBN.',
  }));
});

// GET /api/pricing/services
router.get('/services', (_req: Request, res: Response) => {
  res.json(ok(platformServices, { total: platformServices.length, currency: 'USD' }));
});

export default router;
