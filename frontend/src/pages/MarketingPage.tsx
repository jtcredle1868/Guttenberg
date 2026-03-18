import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { MOCK_TITLES } from '../mockData';
import { SparklesIcon, DocumentTextIcon, MegaphoneIcon, ClipboardDocumentIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(26,45,78,0.80) 0%, rgba(15,32,64,0.80) 100%)',
  border: '1px solid rgba(61,96,128,0.22)',
  boxShadow: '0 1px 3px rgba(5,13,26,0.35)',
  borderRadius: '1rem',
  padding: '1.5rem',
  backdropFilter: 'blur(8px)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 1rem',
  background: 'rgba(10,22,40,0.60)',
  border: '1px solid rgba(61,96,128,0.40)',
  borderRadius: '0.75rem',
  color: '#c5d8e8',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
};

const mockArcCampaigns = [
  { id: '1', name: 'Launch Team ARC',  expiresAt: '2024-07-15', codesTotal: 50, codesUsed: 37, reviewsReceived: 24, status: 'active'  as const },
  { id: '2', name: 'Blogger Outreach', expiresAt: '2024-06-30', codesTotal: 25, codesUsed: 25, reviewsReceived: 18, status: 'expired' as const },
];

const pressKitItems = [
  'Book Summary & Blurb',
  'Author Bio & Photo',
  'High-Res Cover Image',
  'Book Specifications',
  'Media Contact Sheet',
  'Review Quotes',
];

export const MarketingPage = () => {
  const [selectedTitleId, setSelectedTitleId] = useState(MOCK_TITLES[0].id);
  const [arcModalOpen, setArcModalOpen]       = useState(false);
  const [synopsis, setSynopsis]               = useState('');
  const [isGenerating, setIsGenerating]       = useState(false);
  const [arcForm, setArcForm]                 = useState({ name: '', expiresAt: '', codesTotal: '25' });
  const [selectFocused, setSelectFocused]     = useState(false);
  const toast = useToast();

  const selectedTitle = MOCK_TITLES.find(t => t.id === selectedTitleId) || MOCK_TITLES[0];

  const handleGenerateSynopsis = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setSynopsis(`In the high-stakes world of Silicon Valley, ${selectedTitle.authorName}'s "${selectedTitle.title}" follows a visionary entrepreneur navigating the treacherous landscape of tech innovation. A gripping narrative of ambition, betrayal, and ultimate triumph, this essential read for anyone daring to build the future.`);
      setIsGenerating(false);
      toast.success('Synopsis generated with AI!');
    }, 1800);
  };

  const handleCreateArc = () => {
    toast.success(`ARC campaign "${arcForm.name}" created! ${arcForm.codesTotal} review copies ready.`);
    setArcModalOpen(false);
  };

  const handlePressKit = () => {
    toast.info('Generating press kit… Download will start shortly.');
    setTimeout(() => toast.success('Press kit ready! Check your downloads.'), 2000);
  };

  return (
    <Layout title="Marketing Hub" breadcrumbs={[{ label: 'Marketing Hub' }]}>

      {/* Title selector */}
      <div className="flex items-center gap-3 mb-6">
        <label
          className="text-sm font-medium whitespace-nowrap"
          style={{ color: 'rgba(138,175,200,0.70)', fontFamily: 'Inter, sans-serif' }}
        >
          Active Title:
        </label>
        <select
          value={selectedTitleId}
          onChange={e => setSelectedTitleId(e.target.value)}
          onFocus={() => setSelectFocused(true)}
          onBlur={() => setSelectFocused(false)}
          style={{
            ...inputStyle,
            width: 'auto',
            minWidth: '14rem',
            border: selectFocused ? '1px solid rgba(212,175,55,0.55)' : '1px solid rgba(61,96,128,0.40)',
            boxShadow: selectFocused ? '0 0 0 3px rgba(201,162,39,0.12)' : 'none',
            cursor: 'pointer',
          }}
        >
          {MOCK_TITLES.filter(t => t.status !== 'draft').map(t => (
            <option key={t.id} value={t.id} style={{ background: '#0f2040', color: '#c5d8e8' }}>{t.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        {/* AI Synopsis Generator */}
        <div style={cardStyle}>
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.22)' }}
            >
              <SparklesIcon className="w-4 h-4" style={{ color: '#d4af37' }} />
            </div>
            <h3
              className="text-base font-bold"
              style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
            >
              AI Synopsis Generator
            </h3>
          </div>

          {synopsis ? (
            <div
              className="p-4 rounded-xl mb-4 relative"
              style={{
                background: 'rgba(212,175,55,0.06)',
                border: '1px solid rgba(212,175,55,0.22)',
                boxShadow: '0 0 20px rgba(212,175,55,0.06) inset',
              }}
            >
              <p className="text-sm leading-relaxed" style={{ color: '#c5d8e8', fontFamily: 'Inter, sans-serif' }}>{synopsis}</p>
            </div>
          ) : (
            <div
              className="h-28 rounded-xl flex items-center justify-center mb-4"
              style={{
                background: 'rgba(10,22,40,0.50)',
                border: '1px dashed rgba(61,96,128,0.40)',
              }}
            >
              <p className="text-sm" style={{ color: 'rgba(90,127,160,0.55)', fontFamily: 'Inter, sans-serif' }}>
                Generated synopsis will appear here
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleGenerateSynopsis}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              style={{
                background: isGenerating
                  ? 'rgba(201,162,39,0.60)'
                  : 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
                color: '#0a1628',
                boxShadow: isGenerating ? 'none' : '0 2px 8px rgba(212,175,55,0.30)',
              }}
            >
              <SparklesIcon className="w-4 h-4" />
              {isGenerating ? 'Generating…' : 'Generate with AI'}
            </button>
            {synopsis && (
              <button
                onClick={() => { navigator.clipboard.writeText(synopsis); toast.success('Copied!'); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm transition-colors"
                style={{
                  border: '1px solid rgba(61,96,128,0.40)',
                  color: '#8aafc8',
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.40)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#d4af37';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(61,96,128,0.40)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#8aafc8';
                }}
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
                Copy
              </button>
            )}
          </div>
        </div>

        {/* Press Kit */}
        <div style={cardStyle}>
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(196,168,130,0.12)', border: '1px solid rgba(196,168,130,0.22)' }}
            >
              <DocumentTextIcon className="w-4 h-4" style={{ color: '#c4a882' }} />
            </div>
            <h3
              className="text-base font-bold"
              style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
            >
              Press Kit Generator
            </h3>
          </div>
          <p className="text-sm mb-4" style={{ color: 'rgba(138,175,200,0.65)', fontFamily: 'Inter, sans-serif' }}>
            Generate a professional press kit including book summary, author bio, high-res cover, book specs, and media contact info.
          </p>
          <div className="space-y-2 mb-4">
            {pressKitItems.map(item => (
              <div key={item} className="flex items-center gap-2.5 text-sm">
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: 'rgba(196,168,130,0.15)', color: '#c4a882', border: '1px solid rgba(196,168,130,0.25)' }}
                >
                  ✓
                </span>
                <span style={{ color: 'rgba(197,216,232,0.80)', fontFamily: 'Inter, sans-serif' }}>{item}</span>
              </div>
            ))}
          </div>
          <button
            onClick={handlePressKit}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
              color: '#0a1628',
              boxShadow: '0 2px 8px rgba(212,175,55,0.25)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(212,175,55,0.40)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(212,175,55,0.25)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            ↓ Download Press Kit (PDF)
          </button>
        </div>
      </div>

      {/* ARC Campaigns */}
      <div style={{ ...cardStyle, marginBottom: '1.25rem' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.20)' }}
            >
              <MegaphoneIcon className="w-4 h-4" style={{ color: '#d4af37' }} />
            </div>
            <h3
              className="text-base font-bold"
              style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
            >
              ARC Campaigns
            </h3>
          </div>
          <button
            onClick={() => setArcModalOpen(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
              color: '#0a1628',
              boxShadow: '0 2px 8px rgba(212,175,55,0.25)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(212,175,55,0.38)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(212,175,55,0.25)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            + New Campaign
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockArcCampaigns.map(campaign => (
            <div
              key={campaign.id}
              className="rounded-xl p-4"
              style={{
                background: 'rgba(10,22,40,0.55)',
                border: '1px solid rgba(61,96,128,0.28)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <p
                  className="font-semibold"
                  style={{ color: '#c5d8e8', fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  {campaign.name}
                </p>
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                  style={
                    campaign.status === 'active'
                      ? { background: 'rgba(52,211,153,0.10)', color: '#34d399', border: '1px solid rgba(52,211,153,0.22)' }
                      : { background: 'rgba(61,96,128,0.20)', color: 'rgba(138,175,200,0.60)', border: '1px solid rgba(61,96,128,0.30)' }
                  }
                >
                  {campaign.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center mb-3">
                {[
                  { val: campaign.codesUsed,       lbl: 'Claimed'    },
                  { val: campaign.reviewsReceived,  lbl: 'Reviews'    },
                  { val: `${Math.round(campaign.reviewsReceived / campaign.codesUsed * 100)}%`, lbl: 'Conversion' },
                ].map(stat => (
                  <div
                    key={stat.lbl}
                    className="rounded-lg p-2"
                    style={{ background: 'rgba(26,45,78,0.70)', border: '1px solid rgba(61,96,128,0.18)' }}
                  >
                    <p
                      className="text-lg font-bold"
                      style={{ color: '#d4af37', fontFamily: '"Playfair Display", Georgia, serif' }}
                    >
                      {stat.val}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(90,127,160,0.65)' }}>{stat.lbl}</p>
                  </div>
                ))}
              </div>
              <div>
                <div
                  className="flex items-center justify-between text-xs mb-1.5"
                  style={{ color: 'rgba(90,127,160,0.60)', fontFamily: '"Source Code Pro", monospace' }}
                >
                  <span>{campaign.codesUsed} / {campaign.codesTotal} codes used</span>
                  <span>Expires: {campaign.expiresAt}</span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(15,32,64,0.90)' }}
                >
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${(campaign.codesUsed / campaign.codesTotal) * 100}%`,
                      background: 'linear-gradient(90deg, #c9a227 0%, #d4af37 100%)',
                      boxShadow: '0 0 6px rgba(212,175,55,0.30)',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Landing Page */}
      <div style={cardStyle}>
        <h3
          className="text-base font-bold mb-2"
          style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
        >
          Book Landing Page
        </h3>
        <p className="text-sm mb-4" style={{ color: 'rgba(138,175,200,0.65)', fontFamily: 'Inter, sans-serif' }}>
          Your personalized landing page for{' '}
          <strong style={{ color: '#d4af37' }}>{selectedTitle.title}</strong>
          {' '}is ready to share.
        </p>
        <div
          className="rounded-xl px-4 py-3 font-mono text-sm mb-4 flex items-center gap-2"
          style={{
            background: 'rgba(5,13,26,0.85)',
            border: '1px solid rgba(52,211,153,0.20)',
            color: '#34d399',
            boxShadow: '0 0 16px rgba(52,211,153,0.06) inset',
          }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#34d399', boxShadow: '0 0 6px rgba(52,211,153,0.50)' }} />
          https://guttenberg.io/book/{selectedTitle.id}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => toast.info('Opening page preview…')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-colors"
            style={{
              border: '1px solid rgba(61,96,128,0.40)',
              color: '#8aafc8',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.40)';
              (e.currentTarget as HTMLButtonElement).style.color = '#d4af37';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(61,96,128,0.40)';
              (e.currentTarget as HTMLButtonElement).style.color = '#8aafc8';
            }}
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(`https://guttenberg.io/book/${selectedTitle.id}`); toast.success('Link copied!'); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
              color: '#0a1628',
              boxShadow: '0 2px 8px rgba(212,175,55,0.25)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(212,175,55,0.38)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(212,175,55,0.25)';
            }}
          >
            <ClipboardDocumentIcon className="w-4 h-4" />
            Copy Link
          </button>
        </div>
      </div>

      {/* ARC Campaign Modal */}
      <Modal isOpen={arcModalOpen} onClose={() => setArcModalOpen(false)} title="New ARC Campaign">
        <div className="space-y-4">
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: 'rgba(138,175,200,0.70)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}
            >
              Campaign Name
            </label>
            <input
              value={arcForm.name}
              onChange={e => setArcForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Launch Team ARC"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: 'rgba(138,175,200,0.70)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}
            >
              Number of Review Copies
            </label>
            <input
              type="number"
              value={arcForm.codesTotal}
              onChange={e => setArcForm(f => ({ ...f, codesTotal: e.target.value }))}
              min="1"
              max="500"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: 'rgba(138,175,200,0.70)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}
            >
              Expiry Date
            </label>
            <input
              type="date"
              value={arcForm.expiresAt}
              onChange={e => setArcForm(f => ({ ...f, expiresAt: e.target.value }))}
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setArcModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                border: '1px solid rgba(61,96,128,0.40)',
                color: '#8aafc8',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(61,96,128,0.60)';
                (e.currentTarget as HTMLButtonElement).style.color = '#c5d8e8';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(61,96,128,0.40)';
                (e.currentTarget as HTMLButtonElement).style.color = '#8aafc8';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateArc}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
              style={{
                background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
                color: '#0a1628',
                boxShadow: '0 2px 8px rgba(212,175,55,0.25)',
              }}
            >
              Create Campaign
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
