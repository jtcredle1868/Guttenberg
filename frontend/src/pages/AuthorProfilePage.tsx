import React, { useState, useRef } from 'react';
import { Layout } from '../components/layout/Layout';
import {
  UserCircleIcon,
  GlobeAltIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  BookOpenIcon,
  TrophyIcon,
  PhotoIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import type { AuthorProfile } from '../api/types';
import { MOCK_TITLES } from '../mockData';

/* ── Mock author data ──────────────────────────────────────────────────────── */
const MOCK_AUTHOR: AuthorProfile = {
  id: 'auth-001',
  name: 'Eleanor Voss',
  penName: 'E.K. Voss',
  tagline: 'USA Today Bestselling Author of Literary Fiction',
  genres: ['Literary Fiction', 'Psychological Thriller'],
  location: 'New York, NY',
  website: 'https://eleanor-voss.com',
  twitter: '@EleanorVoss',
  instagram: '@evoss_writes',
  goodreads: 'Eleanor_Voss',
  totalTitles: 6,
  totalSales: 48200,
  countriesReached: 24,
  reviews: 1847,
  bio: {
    short: 'Eleanor Voss is a USA Today bestselling author of literary fiction and psychological thrillers. Her debut novel won the PEN/Faulkner Award.',
    medium: "Eleanor Voss is a USA Today bestselling author known for her intricate narratives and psychologically complex characters. Her debut novel, The Glass Meridian, won the PEN/Faulkner Award and spent 14 weeks on the New York Times bestseller list. She holds an MFA from the Iowa Writers' Workshop.",
    full: "Eleanor Voss is a USA Today bestselling author of literary fiction and psychological thrillers, celebrated for her nuanced prose and deeply human storytelling. Her debut novel, The Glass Meridian, was awarded the PEN/Faulkner Award for Fiction and spent fourteen weeks on the New York Times bestseller list. Her subsequent works have been translated into 24 languages and distributed in 38 countries. Voss holds an MFA from the Iowa Writers' Workshop and a BA in Comparative Literature from Yale University. She divides her time between New York City and her writing retreat in Vermont, where she is at work on her fifth novel.",
  },
  awards: [
    { year: 2022, award: 'PEN/Faulkner Award for Fiction', book: 'The Glass Meridian' },
    { year: 2021, award: 'New York Times Bestseller #3',   book: 'The Glass Meridian' },
    { year: 2023, award: 'USA Today Bestseller',           book: 'Lead Without Limits' },
  ],
};

/* ── Inline styles ─────────────────────────────────────────────────────────── */
const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(26,45,78,0.80) 0%, rgba(15,32,64,0.80) 100%)',
  border: '1px solid rgba(61,96,128,0.25)',
  borderRadius: '1rem',
  backdropFilter: 'blur(8px)',
};

type Tab = 'about' | 'portfolio' | 'awards' | 'mediakit';
type BioVariant = 'short' | 'medium' | 'full';

const TABS: { id: Tab; label: string; icon: React.FC<any> }[] = [
  { id: 'about',     label: 'About',              icon: PencilSquareIcon },
  { id: 'portfolio', label: 'Portfolio',           icon: BookOpenIcon },
  { id: 'awards',    label: 'Awards & Recognition',icon: TrophyIcon },
  { id: 'mediakit',  label: 'Media Kit',           icon: ArrowDownTrayIcon },
];

/* ── Main page ─────────────────────────────────────────────────────────────── */
export const AuthorProfilePage = () => {
  const [author, setAuthor]       = useState<AuthorProfile>(MOCK_AUTHOR);
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [bioVariant, setBioVariant] = useState<BioVariant>('medium');
  const [bioEdits, setBioEdits]   = useState({ ...MOCK_AUTHOR.bio });
  const [isSaving, setIsSaving]   = useState(false);
  const [savedMsg, setSavedMsg]   = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = () => {
    setIsSaving(true);
    setSavedMsg('');
    setTimeout(() => {
      setAuthor(prev => ({ ...prev, bio: bioEdits }));
      setIsSaving(false);
      setSavedMsg('Profile saved!');
      setTimeout(() => setSavedMsg(''), 3000);
    }, 800);
  };

  const handleDownload = (type: string) => {
    alert(`Downloading ${type}… (mock)`);
  };

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  const QUICK_STATS = [
    { label: 'Total Titles',      value: author.totalTitles,              icon: BookOpenIcon,   color: '#d4af37' },
    { label: 'Total Sales',       value: author.totalSales.toLocaleString(), icon: StarIcon,    color: '#4ade80' },
    { label: 'Countries Reached', value: author.countriesReached,         icon: GlobeAltIcon,   color: '#60a5fa' },
    { label: 'Reviews',           value: author.reviews.toLocaleString(), icon: TrophyIcon,     color: '#c084fc' },
  ];

  const SOCIAL_LINKS = [
    { label: 'Website',    value: author.website,   icon: GlobeAltIcon,  href: author.website  },
    { label: 'Twitter/X',  value: author.twitter,   icon: GlobeAltIcon,  href: `https://twitter.com/${author.twitter?.replace('@', '')}` },
    { label: 'Instagram',  value: author.instagram, icon: GlobeAltIcon,  href: `https://instagram.com/${author.instagram?.replace('@', '')}` },
    { label: 'Goodreads',  value: author.goodreads, icon: BookOpenIcon,  href: `https://goodreads.com/${author.goodreads}` },
  ];

  return (
    <Layout title="Author Profile" breadcrumbs={[{ label: 'Author Tools' }, { label: 'Author Profile' }]}>
      <div className="space-y-5">

        {/* ── Profile hero header ──────────────────────────────────── */}
        <div style={cardStyle} className="p-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold font-playfair"
                style={{
                  background: 'linear-gradient(135deg, #1a2d4e, #0a1628)',
                  border: '3px solid #c9a227',
                  boxShadow: '0 0 0 4px rgba(201,162,39,0.15), 0 8px 32px rgba(5,13,26,0.6)',
                  color: '#c9a227',
                }}
              >
                {author.name.split(' ').map(n => n[0]).join('')}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gold-600 flex items-center justify-center shadow-lg hover:bg-gold-500 transition-colors"
              >
                <PhotoIcon className="w-3.5 h-3.5 text-navy-900" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
            </div>

            {/* Name + info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gold-400 font-playfair">{author.name}</h1>
              {author.penName && (
                <p className="text-tan-400 text-sm mt-0.5">Writing as <span className="font-medium">{author.penName}</span></p>
              )}
              {author.tagline && (
                <p className="text-navy-200 text-sm mt-1 italic">{author.tagline}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {author.genres.map(g => (
                  <span key={g} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold-600/15 border border-gold-500/30 text-gold-300">
                    {g}
                  </span>
                ))}
                {author.location && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs text-navy-300 bg-navy-700/60 border border-navy-600">
                    {author.location}
                  </span>
                )}
              </div>
            </div>

            {/* Save button */}
            <div className="flex items-center gap-3">
              {savedMsg && <span className="text-gold-400 text-sm font-medium">{savedMsg}</span>}
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-gradient-to-r from-gold-600 to-gold-500 text-navy-900 font-semibold hover:from-gold-500 hover:to-gold-400 rounded-xl px-5 py-2 text-sm transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {isSaving ? <><div className="w-4 h-4 rounded-full border-2 border-navy-900/30 border-t-navy-900 animate-spin" /> Saving…</> : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Two-column: sidebar + main ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">

          {/* ── Sidebar ────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Quick stats */}
            <div style={cardStyle} className="p-4">
              <h3 className="text-gold-400 font-semibold text-xs uppercase tracking-wider mb-3">Quick Stats</h3>
              <div className="space-y-3">
                {QUICK_STATS.map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.color + '18', border: `1px solid ${stat.color}33` }}>
                        <Icon className="w-4 h-4" style={{ color: stat.color }} />
                      </div>
                      <div>
                        <p className="text-navy-100 font-bold text-sm leading-none">{stat.value}</p>
                        <p className="text-navy-400 text-xs mt-0.5">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Social links */}
            <div style={cardStyle} className="p-4">
              <h3 className="text-gold-400 font-semibold text-xs uppercase tracking-wider mb-3">Social Links</h3>
              <div className="space-y-2">
                {SOCIAL_LINKS.map(link => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.href ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm text-navy-200 hover:text-gold-400 transition-colors group"
                    >
                      <Icon className="w-4 h-4 text-navy-400 group-hover:text-gold-400 transition-colors shrink-0" />
                      <span className="truncate">{link.value ?? '—'}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Photo upload drop area */}
            <div
              style={cardStyle}
              className="p-4 border-dashed flex flex-col items-center gap-2 cursor-pointer hover:border-gold-500/40 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <PhotoIcon className="w-8 h-8 text-navy-400" />
              <p className="text-navy-300 text-xs text-center">Drag & drop author photo or click to upload</p>
              <p className="text-navy-500 text-xs">JPG, PNG · max 10 MB</p>
            </div>
          </div>

          {/* ── Main content ────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border',
                      activeTab === tab.id
                        ? 'bg-gold-600/15 border-gold-500/50 text-gold-400'
                        : 'bg-navy-700/40 border-navy-600 text-navy-300 hover:border-navy-500 hover:text-navy-100'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ── About tab ────────────────────────────────────────── */}
            {activeTab === 'about' && (
              <div style={cardStyle} className="p-5 space-y-5">
                <h2 className="text-gold-400 font-semibold text-sm">Author Bio</h2>

                {/* Bio variant switcher */}
                <div className="flex gap-2">
                  {(['short', 'medium', 'full'] as BioVariant[]).map(v => (
                    <button
                      key={v}
                      onClick={() => setBioVariant(v)}
                      className={clsx(
                        'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all capitalize',
                        bioVariant === v
                          ? 'border-gold-500 bg-gold-600/10 text-gold-400'
                          : 'border-navy-600 bg-navy-800/40 text-navy-300 hover:border-navy-500'
                      )}
                    >
                      {v} {v === 'short' ? '(50w)' : v === 'medium' ? '(150w)' : '(Full)'}
                    </button>
                  ))}
                </div>

                {/* Bio textarea */}
                <div className="space-y-1">
                  <textarea
                    rows={bioVariant === 'full' ? 8 : bioVariant === 'medium' ? 5 : 3}
                    value={bioEdits[bioVariant]}
                    onChange={e => setBioEdits(prev => ({ ...prev, [bioVariant]: e.target.value }))}
                    className="w-full bg-navy-800/60 border border-navy-500 text-white placeholder-navy-300 focus:border-gold-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none leading-relaxed"
                  />
                  <div className="flex justify-between text-xs text-navy-400">
                    <span>{bioEdits[bioVariant].length} characters</span>
                    <span>{wordCount(bioEdits[bioVariant])} words</span>
                  </div>
                </div>

                {/* Profile fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-navy-600 pt-4">
                  {[
                    { label: 'Full Name',  key: 'name',      value: author.name },
                    { label: 'Pen Name',   key: 'penName',   value: author.penName ?? '' },
                    { label: 'Tagline',    key: 'tagline',   value: author.tagline ?? '' },
                    { label: 'Location',   key: 'location',  value: author.location ?? '' },
                    { label: 'Website',    key: 'website',   value: author.website ?? '' },
                    { label: 'Twitter/X',  key: 'twitter',   value: author.twitter ?? '' },
                    { label: 'Instagram',  key: 'instagram', value: author.instagram ?? '' },
                    { label: 'Goodreads',  key: 'goodreads', value: author.goodreads ?? '' },
                  ].map(field => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-navy-300 text-xs font-medium">{field.label}</label>
                      <input
                        defaultValue={field.value}
                        className="w-full bg-navy-800/60 border border-navy-500 text-white placeholder-navy-300 focus:border-gold-500 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Portfolio tab ─────────────────────────────────────── */}
            {activeTab === 'portfolio' && (
              <div style={cardStyle} className="p-5">
                <h2 className="text-gold-400 font-semibold text-sm mb-4">Published Works</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {MOCK_TITLES.filter(t => t.status === 'published').map(title => (
                    <div key={title.id} className="bg-navy-800/40 border border-navy-600/60 rounded-xl p-4 hover:border-navy-500 transition-colors">
                      {/* Cover placeholder */}
                      <div
                        className="w-full aspect-[3/4] rounded-lg mb-3 flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #1a2d4e, #0a1628)', border: '1px solid rgba(201,162,39,0.15)' }}
                      >
                        <BookOpenIcon className="w-10 h-10 text-gold-600/40" />
                      </div>
                      <p className="text-navy-100 font-semibold text-sm leading-tight">{title.title}</p>
                      {title.publicationDate && (
                        <p className="text-navy-400 text-xs mt-1">{new Date(title.publicationDate).getFullYear()}</p>
                      )}
                      {title.genre && (
                        <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-xs bg-gold-600/10 border border-gold-500/25 text-gold-400">
                          {title.genre}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Awards tab ────────────────────────────────────────── */}
            {activeTab === 'awards' && (
              <div style={cardStyle} className="p-5">
                <h2 className="text-gold-400 font-semibold text-sm mb-4">Awards &amp; Recognition</h2>
                <div className="space-y-3">
                  {author.awards.map((award, i) => (
                    <div key={i} className="flex items-start gap-4 bg-navy-800/40 border border-navy-600/60 rounded-xl p-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm font-playfair"
                        style={{ background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.30)', color: '#c9a227' }}
                      >
                        {award.year}
                      </div>
                      <div>
                        <p className="text-navy-100 font-semibold text-sm">{award.award}</p>
                        <p className="text-tan-400 text-xs mt-0.5 italic">{award.book}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Media Kit tab ─────────────────────────────────────── */}
            {activeTab === 'mediakit' && (
              <div style={cardStyle} className="p-5">
                <h2 className="text-gold-400 font-semibold text-sm mb-4">Media Kit Downloads</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Author Photo (Hi-Res)', desc: 'TIFF · 300 DPI · 3000×3000px', type: 'author-photo.tiff' },
                    { label: 'Author Bio (PDF)',       desc: 'All bio lengths, formatted',    type: 'author-bio.pdf'  },
                    { label: 'Author Page Tearsheet',  desc: 'One-page press kit PDF',        type: 'press-kit.pdf'   },
                    { label: 'Book Covers (ZIP)',       desc: 'All published titles, hi-res',  type: 'covers.zip'      },
                  ].map(item => (
                    <button
                      key={item.type}
                      onClick={() => handleDownload(item.label)}
                      className="flex items-center gap-4 bg-navy-800/40 border border-navy-600/60 rounded-xl p-4 text-left hover:border-gold-500/40 transition-all group"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(201,162,39,0.10)', border: '1px solid rgba(201,162,39,0.25)' }}
                      >
                        <ArrowDownTrayIcon className="w-5 h-5 text-gold-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-navy-100 text-sm font-medium group-hover:text-gold-400 transition-colors">{item.label}</p>
                        <p className="text-navy-400 text-xs mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
