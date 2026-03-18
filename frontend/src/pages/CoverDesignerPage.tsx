import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import {
  SwatchIcon,
  PhotoIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  CheckIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import type { CoverTemplate } from '../api/types';

/* ── Mock templates ────────────────────────────────────────────────────────── */
const MOCK_TEMPLATES: (CoverTemplate & { previewGradient: string })[] = [
  { id: 'ct-001', name: 'Modern Minimalist', genre: 'fiction',    style: 'minimalist', primaryColor: '#1a2d4e', secondaryColor: '#c9a227', accentColor: '#c4a882', fontHeading: 'Playfair Display', fontBody: 'Inter', previewGradient: 'linear-gradient(135deg,#1a2d4e,#0a1628)' },
  { id: 'ct-002', name: 'Dark Thriller',     genre: 'thriller',   style: 'dramatic',   primaryColor: '#0a1628', secondaryColor: '#d4af37', accentColor: '#8b0000', fontHeading: 'Oswald',           fontBody: 'Inter', previewGradient: 'linear-gradient(135deg,#1a1a1a,#000000)' },
  { id: 'ct-003', name: 'Romantic Bloom',    genre: 'romance',    style: 'elegant',    primaryColor: '#3d1a2e', secondaryColor: '#e8a0b4', accentColor: '#c9a227', fontHeading: 'Cormorant Garamond',fontBody: 'Inter', previewGradient: 'linear-gradient(135deg,#7f1d3b,#4c1d6e)' },
  { id: 'ct-004', name: 'Cosmic Journey',    genre: 'sci-fi',     style: 'futuristic', primaryColor: '#050d1a', secondaryColor: '#60a5fa', accentColor: '#c9a227', fontHeading: 'Exo 2',            fontBody: 'Inter', previewGradient: 'linear-gradient(135deg,#0b1e3d,#050d1a)' },
  { id: 'ct-005', name: 'Classic Literary',  genre: 'literary',   style: 'classic',    primaryColor: '#2c1810', secondaryColor: '#d4af37', accentColor: '#c4a882', fontHeading: 'EB Garamond',       fontBody: 'Georgia', previewGradient: 'linear-gradient(135deg,#451a03,#292524)' },
  { id: 'ct-006', name: 'Business Leader',   genre: 'business',   style: 'corporate',  primaryColor: '#0a1628', secondaryColor: '#c9a227', accentColor: '#ffffff', fontHeading: 'Montserrat',        fontBody: 'Inter', previewGradient: 'linear-gradient(135deg,#1a2d4e,#0f172a)' },
  { id: 'ct-007', name: 'Enchanted Forest',  genre: 'fantasy',    style: 'mystical',   primaryColor: '#0d2b1d', secondaryColor: '#4ade80', accentColor: '#c9a227', fontHeading: 'Uncial Antiqua',    fontBody: 'Georgia', previewGradient: 'linear-gradient(135deg,#052e16,#064e3b)' },
  { id: 'ct-008', name: 'Mystery & Fog',     genre: 'mystery',    style: 'atmospheric',primaryColor: '#1a1a2e', secondaryColor: '#c9a227', accentColor: '#94a3b8', fontHeading: 'Libre Baskerville', fontBody: 'Inter', previewGradient: 'linear-gradient(135deg,#1e1b4b,#1e293b)' },
  { id: 'ct-009', name: 'Self Help Journey', genre: 'self-help',  style: 'uplifting',  primaryColor: '#1e3a5f', secondaryColor: '#f59e0b', accentColor: '#c4a882', fontHeading: 'Raleway',           fontBody: 'Inter', previewGradient: 'linear-gradient(135deg,#1e3a5f,#0e7490)' },
  { id: 'ct-010', name: 'Historical Epic',   genre: 'historical', style: 'grand',      primaryColor: '#2c1810', secondaryColor: '#c9a227', accentColor: '#8b4513', fontHeading: 'Cinzel',            fontBody: 'Georgia', previewGradient: 'linear-gradient(135deg,#7c2d12,#450a0a)' },
  { id: 'ct-011', name: 'Poetry & Soul',     genre: 'poetry',     style: 'ethereal',   primaryColor: '#1a0a2e', secondaryColor: '#c084fc', accentColor: '#d4af37', fontHeading: 'Cormorant',         fontBody: 'Georgia', previewGradient: 'linear-gradient(135deg,#3b0764,#1e1b4b)' },
  { id: 'ct-012', name: 'Horror Darkness',   genre: 'horror',     style: 'dark',       primaryColor: '#0a0a0a', secondaryColor: '#dc2626', accentColor: '#c9a227', fontHeading: 'Creepster',         fontBody: 'Inter', previewGradient: 'linear-gradient(135deg,#0c0a09,#450a0a)' },
];

const GENRES = ['All', 'fiction', 'thriller', 'romance', 'sci-fi', 'literary', 'business', 'fantasy', 'mystery', 'self-help', 'historical', 'poetry', 'horror'];

const PALETTES = [
  { id: 'p1', colors: ['#1a2d4e', '#c9a227', '#c4a882'] },
  { id: 'p2', colors: ['#0a0a0a', '#dc2626', '#d4af37'] },
  { id: 'p3', colors: ['#3d1a2e', '#e8a0b4', '#c9a227'] },
  { id: 'p4', colors: ['#050d1a', '#60a5fa', '#c9a227'] },
  { id: 'p5', colors: ['#2c1810', '#d4af37', '#c4a882'] },
  { id: 'p6', colors: ['#1e3a5f', '#f59e0b', '#ffffff'] },
  { id: 'p7', colors: ['#0d2b1d', '#4ade80', '#c9a227'] },
  { id: 'p8', colors: ['#1a1a2e', '#c9a227', '#94a3b8'] },
  { id: 'p9', colors: ['#1a0a2e', '#c084fc', '#d4af37'] },
  { id: 'p10', colors: ['#2c1810', '#c9a227', '#8b4513'] },
  { id: 'p11', colors: ['#0a1628', '#e0c060', '#c4a882'] },
  { id: 'p12', colors: ['#0f2040', '#d4af37', '#8aafc8'] },
];

const FONTS = ['Playfair Display', 'Cormorant Garamond', 'EB Garamond', 'Cinzel', 'Montserrat', 'Oswald', 'Raleway', 'Inter'];
const BG_TYPES = ['Solid', 'Gradient', 'Pattern'] as const;
type BgType = typeof BG_TYPES[number];
const COVER_VIEWS = ['Front', 'Back', 'Spine'] as const;
type CoverView = typeof COVER_VIEWS[number];

/* ── Inline styles ─────────────────────────────────────────────────────────── */
const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(26,45,78,0.80) 0%, rgba(15,32,64,0.80) 100%)',
  border: '1px solid rgba(61,96,128,0.25)',
  borderRadius: '1rem',
  backdropFilter: 'blur(8px)',
};

/* ── Book cover SVG preview ─────────────────────────────────────────────────── */
interface CoverPreviewProps {
  template: CoverTemplate;
  title: string;
  author: string;
  subtitle: string;
  palette: string[];
  bgType: BgType;
  titleFont: string;
  view: CoverView;
}
const CoverPreviewSVG: React.FC<CoverPreviewProps> = ({
  template, title, author, subtitle, palette, bgType, titleFont, view,
}) => {
  const primary   = palette[0] || template.primaryColor;
  const secondary = palette[1] || template.secondaryColor;
  const accent    = palette[2] || template.accentColor;

  if (view === 'Spine') {
    return (
      <svg viewBox="0 0 80 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="spine-bg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={primary} />
            <stop offset="100%" stopColor={secondary} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <rect width="80" height="320" fill={bgType === 'Gradient' ? 'url(#spine-bg)' : primary} />
        <rect x="8" y="8" width="64" height="304" fill="none" stroke={secondary} strokeWidth="1" opacity="0.4" />
        <text
          x="40" y="200"
          textAnchor="middle"
          fontSize="10"
          fill={secondary}
          fontFamily={titleFont}
          transform="rotate(-90,40,200)"
          fontWeight="bold"
        >
          {title || 'Book Title'}
        </text>
        <text x="40" y="290" textAnchor="middle" fontSize="7" fill={accent} fontFamily="Inter, sans-serif">
          {author || 'Author Name'}
        </text>
      </svg>
    );
  }

  if (view === 'Back') {
    return (
      <svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="back-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={primary} />
            <stop offset="100%" stopColor={secondary} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <rect width="300" height="400" fill={bgType === 'Gradient' ? 'url(#back-bg)' : primary} />
        <rect x="20" y="20" width="260" height="360" fill="none" stroke={secondary} strokeWidth="1" opacity="0.25" />
        {/* Barcode placeholder */}
        <rect x="95" y="330" width="110" height="50" fill={accent} opacity="0.15" rx="2" />
        <text x="150" y="362" textAnchor="middle" fontSize="8" fill={accent} fontFamily="monospace">ISBN 978-X-XXXXXX</text>
        {/* Synopsis lines */}
        {['A compelling story that', 'challenges the reader to', 'rethink what they know', 'about the world around them.'].map((line, i) => (
          <text key={i} x="150" y={90 + i * 22} textAnchor="middle" fontSize="11" fill={accent} opacity="0.7" fontFamily="Georgia, serif">{line}</text>
        ))}
        <text x="150" y="50" textAnchor="middle" fontSize="12" fill={secondary} fontFamily={titleFont} fontWeight="bold" opacity="0.7">
          {title || 'Book Title'}
        </text>
      </svg>
    );
  }

  /* Front cover */
  const hasPattern = bgType === 'Pattern';
  return (
    <svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="cover-grad" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={primary} />
          <stop offset="60%" stopColor={secondary} stopOpacity="0.25" />
          <stop offset="100%" stopColor={primary} />
        </linearGradient>
        {hasPattern && (
          <pattern id="dot-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill={secondary} opacity="0.18" />
          </pattern>
        )}
        <linearGradient id="title-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={secondary} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="300" height="400" fill={bgType === 'Solid' ? primary : 'url(#cover-grad)'} />
      {hasPattern && <rect width="300" height="400" fill="url(#dot-pattern)" />}

      {/* Top decorative line */}
      <line x1="30" y1="30" x2="270" y2="30" stroke={secondary} strokeWidth="0.5" opacity="0.5" />

      {/* Decorative emblem */}
      <circle cx="150" cy="160" r="55" fill="none" stroke={secondary} strokeWidth="0.75" opacity="0.2" />
      <circle cx="150" cy="160" r="42" fill={secondary} opacity="0.06" />
      <text x="150" y="167" textAnchor="middle" fontSize="40" fill={secondary} opacity="0.12" fontFamily="Georgia, serif">G</text>

      {/* Bottom accent band */}
      <rect x="0" y="340" width="300" height="60" fill={secondary} opacity="0.08" />

      {/* Author name top */}
      {author && (
        <text x="150" y="22" textAnchor="middle" fontSize="9" fill={accent} fontFamily="Inter, sans-serif" letterSpacing="3" opacity="0.8">
          {author.toUpperCase()}
        </text>
      )}

      {/* Title */}
      <text
        x="150" y="260"
        textAnchor="middle"
        fontSize={title.length > 20 ? 20 : title.length > 12 ? 24 : 28}
        fill="url(#title-glow)"
        fontFamily={titleFont}
        fontWeight="bold"
        style={{ textShadow: `0 0 12px ${secondary}` }}
      >
        {title || 'Book Title'}
      </text>

      {/* Subtitle */}
      {subtitle && (
        <text x="150" y="285" textAnchor="middle" fontSize="10" fill={accent} fontFamily="Georgia, serif" fontStyle="italic" opacity="0.8">
          {subtitle}
        </text>
      )}

      {/* Author bottom */}
      <text x="150" y="370" textAnchor="middle" fontSize="11" fill={accent} fontFamily="Inter, sans-serif">
        {author || 'Author Name'}
      </text>

      {/* Bottom rule */}
      <line x1="30" y1="378" x2="270" y2="378" stroke={secondary} strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
};

/* ── Main page ─────────────────────────────────────────────────────────────── */
export const CoverDesignerPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<CoverTemplate>(MOCK_TEMPLATES[0]);
  const [genreFilter, setGenreFilter] = useState('All');
  const [titleText, setTitleText]     = useState('The Glass Meridian');
  const [authorText, setAuthorText]   = useState('Eleanor Voss');
  const [subtitleText, setSubtitleText] = useState('A Novel');
  const [selectedPalette, setSelectedPalette] = useState(PALETTES[0]);
  const [bgType, setBgType]           = useState<BgType>('Gradient');
  const [coverView, setCoverView]     = useState<CoverView>('Front');
  const [titleFont, setTitleFont]     = useState('Playfair Display');
  const [isSaving, setIsSaving]       = useState(false);
  const [savedMsg, setSavedMsg]       = useState('');

  const filteredTemplates = genreFilter === 'All'
    ? MOCK_TEMPLATES
    : MOCK_TEMPLATES.filter(t => t.genre === genreFilter);

  const handleSave = () => {
    setIsSaving(true);
    setSavedMsg('');
    setTimeout(() => {
      setIsSaving(false);
      setSavedMsg('Design saved successfully!');
      setTimeout(() => setSavedMsg(''), 3000);
    }, 900);
  };

  const handleExport = (type: string) => {
    setTimeout(() => {
      alert(`${type} export queued. You'll be notified when it's ready.`);
    }, 300);
  };

  return (
    <Layout title="Cover Designer" breadcrumbs={[{ label: 'Creative Tools' }, { label: 'Cover Designer' }]}>
      <div className="space-y-5">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gold-400 font-playfair">Cover Designer</h1>
            <p className="text-navy-200 text-sm mt-1">Design professional book covers with live preview</p>
          </div>
          <div className="flex items-center gap-2">
            {COVER_VIEWS.map(v => (
              <button
                key={v}
                onClick={() => setCoverView(v)}
                className={clsx(
                  'px-4 py-1.5 rounded-xl text-sm font-medium transition-all',
                  coverView === v
                    ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-navy-900'
                    : 'bg-navy-700/60 border border-navy-600 text-navy-200 hover:border-gold-500/50'
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* ── Three-column workspace ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-5">

          {/* ── Left: template gallery ───────────────────────────────── */}
          <div style={cardStyle} className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <PhotoIcon className="w-4 h-4 text-gold-400" />
              <span className="text-gold-400 font-semibold text-sm">Templates</span>
            </div>

            {/* Genre filter */}
            <div className="flex flex-wrap gap-1">
              {GENRES.slice(0, 7).map(g => (
                <button
                  key={g}
                  onClick={() => setGenreFilter(g)}
                  className={clsx(
                    'px-2 py-0.5 rounded-lg text-xs font-medium transition-all capitalize',
                    genreFilter === g
                      ? 'bg-gold-600 text-navy-900'
                      : 'bg-navy-800/60 text-navy-300 hover:text-gold-400'
                  )}
                >
                  {g}
                </button>
              ))}
              {GENRES.slice(7).map(g => (
                <button
                  key={g}
                  onClick={() => setGenreFilter(g)}
                  className={clsx(
                    'px-2 py-0.5 rounded-lg text-xs font-medium transition-all capitalize',
                    genreFilter === g
                      ? 'bg-gold-600 text-navy-900'
                      : 'bg-navy-800/60 text-navy-300 hover:text-gold-400'
                  )}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Template grid */}
            <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[560px] pr-1">
              {filteredTemplates.map(tmpl => (
                <button
                  key={tmpl.id}
                  onClick={() => { setSelectedTemplate(tmpl); setTitleFont(tmpl.fontHeading); }}
                  className={clsx(
                    'relative rounded-xl overflow-hidden group transition-all duration-200',
                    selectedTemplate.id === tmpl.id ? 'ring-2 ring-gold-400 ring-offset-1 ring-offset-navy-800' : 'hover:ring-1 hover:ring-gold-500/40'
                  )}
                >
                  {/* Gradient preview */}
                  <div
                    className="w-full aspect-[3/4] flex flex-col items-center justify-center p-2"
                    style={{ background: tmpl.previewGradient }}
                  >
                    <span className="text-white text-center font-bold text-xs leading-tight" style={{ fontFamily: tmpl.fontHeading, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                      {tmpl.name}
                    </span>
                    <span
                      className="mt-1 px-1.5 py-0.5 rounded text-xs capitalize"
                      style={{ background: tmpl.secondaryColor + '33', color: tmpl.secondaryColor, fontSize: '0.6rem' }}
                    >
                      {tmpl.genre}
                    </span>
                  </div>
                  {selectedTemplate.id === tmpl.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold-500 flex items-center justify-center">
                      <CheckIcon className="w-2.5 h-2.5 text-navy-900" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Center: live cover preview ───────────────────────────── */}
          <div style={cardStyle} className="p-6 flex flex-col items-center justify-center gap-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-gold-400 font-semibold text-sm flex items-center gap-2">
                <EyeIcon className="w-4 h-4" />
                Live Preview — {coverView} Cover
              </span>
              <span className="text-navy-300 text-xs">{selectedTemplate.name}</span>
            </div>

            {/* Cover canvas */}
            <div
              className="rounded-xl overflow-hidden shadow-2xl"
              style={{
                width: coverView === 'Spine' ? '100px' : '240px',
                boxShadow: '0 20px 60px rgba(5,13,26,0.80), 8px 8px 0 rgba(0,0,0,0.4)',
              }}
            >
              <CoverPreviewSVG
                template={selectedTemplate}
                title={titleText}
                author={authorText}
                subtitle={subtitleText}
                palette={selectedPalette.colors}
                bgType={bgType}
                titleFont={titleFont}
                view={coverView}
              />
            </div>

            {/* Template info */}
            <div className="text-center">
              <p className="text-navy-300 text-xs">Template: <span className="text-gold-400">{selectedTemplate.name}</span></p>
              <p className="text-navy-400 text-xs mt-0.5">Heading font: {selectedTemplate.fontHeading}</p>
            </div>
          </div>

          {/* ── Right: design controls ───────────────────────────────── */}
          <div style={cardStyle} className="p-4 flex flex-col gap-5 overflow-y-auto max-h-[700px]">
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-gold-400" />
              <span className="text-gold-400 font-semibold text-sm">Design Controls</span>
            </div>

            {/* Title text */}
            <div className="space-y-1">
              <label className="text-navy-200 text-xs font-medium">Title</label>
              <input
                value={titleText}
                onChange={e => setTitleText(e.target.value)}
                placeholder="Book title..."
                className="w-full bg-navy-800/60 border border-navy-500 text-white placeholder-navy-300 focus:border-gold-500 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
              />
              <select
                value={titleFont}
                onChange={e => setTitleFont(e.target.value)}
                className="w-full bg-navy-800/60 border border-navy-500 text-navy-200 focus:border-gold-500 rounded-xl px-3 py-1.5 text-xs outline-none"
              >
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Author */}
            <div className="space-y-1">
              <label className="text-navy-200 text-xs font-medium">Author Name</label>
              <input
                value={authorText}
                onChange={e => setAuthorText(e.target.value)}
                placeholder="Author name..."
                className="w-full bg-navy-800/60 border border-navy-500 text-white placeholder-navy-300 focus:border-gold-500 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1">
              <label className="text-navy-200 text-xs font-medium">Subtitle</label>
              <input
                value={subtitleText}
                onChange={e => setSubtitleText(e.target.value)}
                placeholder="Optional subtitle..."
                className="w-full bg-navy-800/60 border border-navy-500 text-white placeholder-navy-300 focus:border-gold-500 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
              />
            </div>

            {/* Color palettes */}
            <div className="space-y-2">
              <label className="text-navy-200 text-xs font-medium flex items-center gap-1">
                <SwatchIcon className="w-3.5 h-3.5" /> Color Palette
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {PALETTES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPalette(p)}
                    title={p.colors.join(' / ')}
                    className={clsx(
                      'rounded-lg overflow-hidden h-8 transition-all',
                      selectedPalette.id === p.id ? 'ring-2 ring-gold-400' : 'hover:ring-1 hover:ring-gold-500/40'
                    )}
                  >
                    <div className="w-full h-full flex">
                      {p.colors.map((c, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Background type */}
            <div className="space-y-2">
              <label className="text-navy-200 text-xs font-medium">Background Style</label>
              <div className="flex gap-2">
                {BG_TYPES.map(bt => (
                  <button
                    key={bt}
                    onClick={() => setBgType(bt)}
                    className={clsx(
                      'flex-1 py-1.5 rounded-xl text-xs font-medium transition-all',
                      bgType === bt
                        ? 'bg-gold-600/20 border border-gold-500 text-gold-400'
                        : 'bg-navy-800/60 border border-navy-600 text-navy-300 hover:border-navy-500'
                    )}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>

            {/* Element visibility */}
            <div className="space-y-2">
              <label className="text-navy-200 text-xs font-medium">Elements</label>
              {['Show Author Name', 'Show Subtitle', 'Show Decorative Ring', 'Show Border Lines'].map(el => (
                <label key={el} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-yellow-400 w-3.5 h-3.5" />
                  <span className="text-navy-300 text-xs">{el}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom action bar ────────────────────────────────────────── */}
        <div style={cardStyle} className="p-4 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-gold-600 to-gold-500 text-navy-900 font-semibold hover:from-gold-500 hover:to-gold-400 rounded-xl px-6 py-2.5 text-sm transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {isSaving ? (
                <><div className="w-4 h-4 rounded-full border-2 border-navy-900/30 border-t-navy-900 animate-spin" /> Saving…</>
              ) : (
                <><CheckIcon className="w-4 h-4" /> Save Design</>
              )}
            </button>
            <button
              onClick={() => handleExport('Print-Ready PDF')}
              className="bg-navy-700/60 border border-navy-500 text-navy-100 hover:border-gold-500/60 rounded-xl px-5 py-2.5 text-sm transition-all flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="w-4 h-4 text-gold-400" /> Export Print-Ready PDF
            </button>
            <button
              onClick={() => handleExport('ePub Cover')}
              className="bg-navy-700/60 border border-navy-500 text-navy-100 hover:border-gold-500/60 rounded-xl px-5 py-2.5 text-sm transition-all flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="w-4 h-4 text-tan-400" /> Export ePub Cover
            </button>
            <button
              onClick={() => handleExport('Full Bleed Preview')}
              className="bg-navy-700/60 border border-navy-500 text-navy-100 hover:border-gold-500/60 rounded-xl px-5 py-2.5 text-sm transition-all flex items-center gap-2"
            >
              <EyeIcon className="w-4 h-4 text-navy-300" /> Preview Full Bleed
            </button>
          </div>
          {savedMsg && (
            <span className="text-gold-400 text-sm font-medium flex items-center gap-1">
              <CheckIcon className="w-4 h-4" /> {savedMsg}
            </span>
          )}
        </div>

      </div>
    </Layout>
  );
};
