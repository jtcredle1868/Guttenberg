import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { MOCK_TITLES } from '../mockData';
import {
  UserCircleIcon, GlobeAltIcon, EnvelopeIcon,
  BookOpenIcon, PencilSquareIcon,
} from '@heroicons/react/24/outline';

const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
  border: '1px solid rgba(61,96,128,0.22)',
  boxShadow: '0 1px 4px rgba(5,13,26,0.40), 0 4px 16px rgba(5,13,26,0.20)',
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

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: '7rem',
  padding: '0.75rem 1rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'rgba(138,175,200,0.75)',
  marginBottom: '0.375rem',
  fontFamily: 'Inter, sans-serif',
};

const SOCIAL_PLATFORMS = [
  { key: 'website',   label: 'Website',   placeholder: 'https://yoursite.com', icon: GlobeAltIcon },
  { key: 'email',     label: 'Media Email', placeholder: 'press@yoursite.com', icon: EnvelopeIcon },
  { key: 'twitter',   label: 'X / Twitter', placeholder: '@yourhandle', icon: null },
  { key: 'instagram', label: 'Instagram',  placeholder: '@yourhandle', icon: null },
  { key: 'goodreads', label: 'Goodreads',  placeholder: 'Profile URL', icon: null },
  { key: 'substack',  label: 'Substack',   placeholder: 'yourname.substack.com', icon: null },
];

const GENRES_LIST = [
  'Fiction', 'Literary Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller',
  'Romance', 'Historical Fiction', 'Horror', 'Non-Fiction', 'Business', 'Self-Help',
  'Biography', 'History', 'Poetry',
];

export const AuthorProfilePage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const publishedTitles = MOCK_TITLES.filter(t => t.status === 'published');
  const totalTitles = MOCK_TITLES.length;

  const [form, setForm] = useState({
    displayName:  user?.name || 'Alex Rivera',
    penName:      '',
    bio:          'Award-winning author of speculative fiction and narrative non-fiction. My work explores the intersection of technology, identity, and what it means to be human in an age of constant change.',
    shortBio:     'Author of speculative fiction. Writing at the intersection of technology and identity.',
    website:      'https://alexrivera.author',
    email:        'press@alexrivera.author',
    twitter:      '@alexrivera_writes',
    instagram:    '',
    goodreads:    '',
    substack:     '',
    genres:       ['Literary Fiction', 'Science Fiction'],
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preview'>('profile');

  const getFocusStyle = (key: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focusedField === key ? 'rgba(212,175,55,0.60)' : 'rgba(61,96,128,0.40)',
    boxShadow: focusedField === key ? '0 0 0 3px rgba(201,162,39,0.12)' : 'none',
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Author profile updated successfully!');
    }, 1000);
  };

  const toggleGenre = (genre: string) => {
    setForm(f => ({
      ...f,
      genres: f.genres.includes(genre)
        ? f.genres.filter(g => g !== genre)
        : [...f.genres, genre],
    }));
  };

  return (
    <Layout title="Author Profile" breadcrumbs={[{ label: 'Author Profile' }]}>

      {/* Tab bar */}
      <div
        className="flex gap-0.5 mb-5 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(5,13,26,0.60)', border: '1px solid rgba(61,96,128,0.22)' }}
      >
        {(['profile', 'preview'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 capitalize"
            style={
              activeTab === tab
                ? {
                    background: 'linear-gradient(135deg, #1a2d4e 0%, #243b55 100%)',
                    border: '1px solid rgba(212,175,55,0.25)',
                    color: '#d4af37',
                    fontFamily: 'Inter, sans-serif',
                  }
                : {
                    color: 'rgba(138,175,200,0.60)',
                    fontFamily: 'Inter, sans-serif',
                    border: '1px solid transparent',
                  }
            }
          >
            {tab === 'profile' ? 'Edit Profile' : 'Public Preview'}
          </button>
        ))}
      </div>

      {activeTab === 'profile' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Left: avatar & stats */}
          <div className="xl:col-span-1 space-y-4">
            <div style={cardStyle}>
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold mb-4 relative"
                  style={{
                    background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 60%, #c4a882 100%)',
                    color: '#0a1628',
                    fontFamily: '"Playfair Display", Georgia, serif',
                    boxShadow: '0 4px 20px rgba(212,175,55,0.30)',
                  }}
                >
                  {(form.displayName || 'A').charAt(0).toUpperCase()}
                  <button
                    onClick={() => toast.info('Photo upload coming soon')}
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: 'rgba(10,22,40,0.90)',
                      border: '2px solid rgba(212,175,55,0.40)',
                      color: '#d4af37',
                    }}
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p
                  className="text-lg font-bold"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
                >
                  {form.displayName}
                </p>
                {form.penName && (
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(138,175,200,0.60)', fontFamily: 'Inter, sans-serif' }}>
                    aka {form.penName}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  {form.genres.slice(0, 3).map(g => (
                    <span
                      key={g}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(212,175,55,0.10)',
                        color: '#d4af37',
                        border: '1px solid rgba(212,175,55,0.25)',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div
                className="grid grid-cols-2 gap-3 mt-5 pt-5"
                style={{ borderTop: '1px solid rgba(61,96,128,0.18)' }}
              >
                {[
                  { label: 'Published', value: publishedTitles.length, icon: BookOpenIcon },
                  { label: 'Total Titles', value: totalTitles, icon: BookOpenIcon },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p
                      className="text-2xl font-bold"
                      style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#d4af37' }}
                    >
                      {s.value}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'rgba(90,127,160,0.60)', fontFamily: 'Inter, sans-serif' }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div style={cardStyle}>
              <h3
                className="text-sm font-bold mb-3"
                style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
              >
                Genre Specialties
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {GENRES_LIST.map(genre => {
                  const active = form.genres.includes(genre);
                  return (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                      style={
                        active
                          ? {
                              background: 'rgba(212,175,55,0.15)',
                              color: '#d4af37',
                              border: '1px solid rgba(212,175,55,0.35)',
                              fontFamily: 'Inter, sans-serif',
                            }
                          : {
                              background: 'rgba(26,45,78,0.60)',
                              color: 'rgba(138,175,200,0.60)',
                              border: '1px solid rgba(61,96,128,0.25)',
                              fontFamily: 'Inter, sans-serif',
                            }
                      }
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: form fields */}
          <div className="xl:col-span-2 space-y-4">

            {/* Identity */}
            <div style={cardStyle}>
              <div className="flex items-center gap-2 mb-4">
                <UserCircleIcon className="w-4 h-4" style={{ color: '#d4af37' }} />
                <h3
                  className="text-sm font-bold"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
                >
                  Identity
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Display Name</label>
                  <input
                    value={form.displayName}
                    onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                    style={getFocusStyle('displayName')}
                    onFocus={() => setFocusedField('displayName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Your real name or primary pen name"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Pen Name <span style={{ color: 'rgba(138,175,200,0.45)', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    value={form.penName}
                    onChange={e => setForm(f => ({ ...f, penName: e.target.value }))}
                    style={getFocusStyle('penName')}
                    onFocus={() => setFocusedField('penName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Alternative publishing name"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div style={cardStyle}>
              <div className="flex items-center gap-2 mb-4">
                <PencilSquareIcon className="w-4 h-4" style={{ color: '#c4a882' }} />
                <h3
                  className="text-sm font-bold"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
                >
                  Biography
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label style={labelStyle}>Full Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    style={{
                      ...textareaStyle,
                      borderColor: focusedField === 'bio' ? 'rgba(212,175,55,0.60)' : 'rgba(61,96,128,0.40)',
                      boxShadow: focusedField === 'bio' ? '0 0 0 3px rgba(201,162,39,0.12)' : 'none',
                    }}
                    onFocus={() => setFocusedField('bio')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Your full author biography (shown on author page)"
                  />
                  <p
                    className="text-xs mt-1 text-right"
                    style={{ color: 'rgba(90,127,160,0.50)', fontFamily: '"Source Code Pro", monospace' }}
                  >
                    {form.bio.length} chars
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>Short Bio <span style={{ color: 'rgba(138,175,200,0.45)', fontWeight: 400 }}>(for press kits)</span></label>
                  <textarea
                    value={form.shortBio}
                    onChange={e => setForm(f => ({ ...f, shortBio: e.target.value }))}
                    style={{
                      ...textareaStyle,
                      minHeight: '4rem',
                      borderColor: focusedField === 'shortBio' ? 'rgba(212,175,55,0.60)' : 'rgba(61,96,128,0.40)',
                      boxShadow: focusedField === 'shortBio' ? '0 0 0 3px rgba(201,162,39,0.12)' : 'none',
                    }}
                    onFocus={() => setFocusedField('shortBio')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="1–2 sentence bio for marketing materials"
                  />
                </div>
              </div>
            </div>

            {/* Social & Web */}
            <div style={cardStyle}>
              <div className="flex items-center gap-2 mb-4">
                <GlobeAltIcon className="w-4 h-4" style={{ color: '#8aafc8' }} />
                <h3
                  className="text-sm font-bold"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
                >
                  Web & Social
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SOCIAL_PLATFORMS.map(platform => (
                  <div key={platform.key}>
                    <label style={labelStyle}>{platform.label}</label>
                    <input
                      value={(form as Record<string, string>)[platform.key] || ''}
                      onChange={e => setForm(f => ({ ...f, [platform.key]: e.target.value }))}
                      style={getFocusStyle(platform.key)}
                      onFocus={() => setFocusedField(platform.key)}
                      onBlur={() => setFocusedField(null)}
                      placeholder={platform.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 50%, #c9a227 100%)',
                  color: '#0a1628',
                  boxShadow: '0 2px 12px rgba(212,175,55,0.35)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {isSaving ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Public profile preview */
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
              border: '1px solid rgba(212,175,55,0.18)',
              boxShadow: '0 4px 24px rgba(5,13,26,0.40)',
            }}
          >
            {/* Hero banner */}
            <div
              className="h-28 relative"
              style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4e 50%, #243b55 100%)' }}
            >
              <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(212,175,55,0.12) 0%, transparent 70%)' }}
              />
            </div>

            {/* Profile section */}
            <div className="px-6 pb-6 relative" style={{ marginTop: '-3rem' }}>
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-3 ring-4"
                style={{
                  background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 60%, #c4a882 100%)',
                  color: '#0a1628',
                  fontFamily: '"Playfair Display", Georgia, serif',
                  boxShadow: '0 4px 16px rgba(212,175,55,0.25)',
                  ringColor: '#0f2040',
                }}
              >
                {(form.displayName || 'A').charAt(0).toUpperCase()}
              </div>

              <h2
                className="text-2xl font-bold mb-0.5"
                style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
              >
                {form.displayName}
              </h2>
              {form.penName && (
                <p className="text-sm mb-2" style={{ color: 'rgba(138,175,200,0.60)', fontFamily: 'Inter, sans-serif' }}>
                  also writes as {form.penName}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 mb-4">
                {form.genres.map(g => (
                  <span
                    key={g}
                    className="text-xs px-2.5 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(212,175,55,0.10)',
                      color: '#d4af37',
                      border: '1px solid rgba(212,175,55,0.25)',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>

              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: 'rgba(197,216,232,0.75)', fontFamily: 'Inter, sans-serif' }}
              >
                {form.bio}
              </p>

              {/* Social links */}
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { href: form.website, label: 'Website' },
                  { href: form.twitter ? `https://x.com/${form.twitter.replace('@', '')}` : '', label: form.twitter || '' },
                  { href: form.goodreads, label: 'Goodreads' },
                ]
                  .filter(l => l.href && l.label)
                  .map(l => (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium transition-colors"
                      style={{ color: '#8aafc8', fontFamily: 'Inter, sans-serif' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#d4af37'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#8aafc8'; }}
                    >
                      {l.label} ↗
                    </a>
                  ))}
              </div>

              {/* Published books */}
              {publishedTitles.length > 0 && (
                <div>
                  <h3
                    className="text-sm font-bold mb-3"
                    style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
                  >
                    Published Books
                  </h3>
                  <div className="space-y-2.5">
                    {publishedTitles.map(t => (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{
                          background: 'rgba(10,22,40,0.40)',
                          border: '1px solid rgba(61,96,128,0.20)',
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: 'rgba(212,175,55,0.10)',
                            border: '1px solid rgba(212,175,55,0.22)',
                          }}
                        >
                          <BookOpenIcon className="w-4 h-4" style={{ color: '#d4af37' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-semibold truncate"
                            style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#c5d8e8' }}
                          >
                            {t.title}
                          </p>
                          {t.publicationDate && (
                            <p
                              className="text-xs"
                              style={{ color: 'rgba(90,127,160,0.60)', fontFamily: '"Source Code Pro", monospace' }}
                            >
                              {t.publicationDate}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <p
            className="text-center text-xs mt-3"
            style={{ color: 'rgba(90,127,160,0.45)', fontFamily: 'Inter, sans-serif' }}
          >
            This is how your public author page appears to readers and press.
          </p>
        </div>
      )}
    </Layout>
  );
};
