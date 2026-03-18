import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
  border: '1px solid rgba(61,96,128,0.22)',
  boxShadow: '0 1px 3px rgba(5,13,26,0.35)',
  borderRadius: '1rem',
  padding: '1.5rem',
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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'rgba(197,216,232,0.75)',
  marginBottom: '0.375rem',
  fontFamily: 'Inter, sans-serif',
};

export const SettingsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState({
    salesAlerts: true, distributionUpdates: true, payoutAlerts: true, weeklyDigest: false,
  });

  const tierInfo = {
    indie: {
      name: 'Indie',
      badgeStyle: { background: 'rgba(61,96,128,0.25)', color: '#8aafc8', border: '1px solid rgba(61,96,128,0.35)' },
      price: 'Free',
      features: ['3 titles', '2 formats', 'Basic distribution'],
    },
    pro: {
      name: 'Pro',
      badgeStyle: { background: 'rgba(212,175,55,0.12)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.30)' },
      price: '$29/mo',
      features: ['Unlimited titles', 'All formats', 'Priority distribution', 'Analytics'],
    },
    publisher: {
      name: 'Publisher',
      badgeStyle: { background: 'rgba(196,168,130,0.12)', color: '#c4a882', border: '1px solid rgba(196,168,130,0.30)' },
      price: '$99/mo',
      features: ['Unlimited titles', 'Team accounts', 'Imprint management', 'API access', 'Dedicated support'],
    },
  };

  const tier = user?.subscriptionTier || 'pro';
  const info = tierInfo[tier as keyof typeof tierInfo] || tierInfo.pro;

  return (
    <Layout title="Settings" breadcrumbs={[{ label: 'Settings' }]}>
      <div className="max-w-3xl space-y-5">
        {/* Account Info */}
        <div style={cardStyle}>
          <h3
            className="text-base font-bold text-white mb-4"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Account Information
          </h3>
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 60%, #c4a882 100%)',
                color: '#0a1628',
                fontFamily: '"Playfair Display", Georgia, serif',
                boxShadow: '0 4px 16px rgba(212,175,55,0.25)',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p
                className="text-lg font-bold"
                style={{ color: '#e8f1f8', fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                {user?.name || 'Demo User'}
              </p>
              <p className="text-sm" style={{ color: 'rgba(138,175,200,0.65)' }}>{user?.email || 'demo@guttenberg.io'}</p>
              <span
                className="inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold"
                style={info.badgeStyle}
              >
                {info.name}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Full Name</label>
              <input defaultValue={user?.name || ''} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input defaultValue={user?.email || ''} style={inputStyle} />
            </div>
          </div>
          <button
            onClick={() => toast.success('Account info updated!')}
            className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
              color: '#0a1628',
              boxShadow: '0 2px 8px rgba(212,175,55,0.25)',
            }}
          >
            Save Changes
          </button>
        </div>

        {/* Subscription */}
        <div style={cardStyle}>
          <h3
            className="text-base font-bold text-white mb-4"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Subscription
          </h3>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-sm font-bold px-3 py-1 rounded-full"
                  style={info.badgeStyle}
                >
                  {info.name} Plan
                </span>
                <span className="text-sm" style={{ color: 'rgba(138,175,200,0.60)', fontFamily: '"Source Code Pro", monospace' }}>
                  {info.price}
                </span>
              </div>
              <div className="space-y-1.5">
                {info.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(197,216,232,0.75)' }}>
                    <span style={{ color: '#c4a882' }}>✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => toast.info('Opening upgrade flow…')}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                border: '1px solid rgba(61,96,128,0.40)',
                color: '#8aafc8',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.35)';
                (e.currentTarget as HTMLButtonElement).style.color = '#d4af37';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(61,96,128,0.40)';
                (e.currentTarget as HTMLButtonElement).style.color = '#8aafc8';
              }}
            >
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Team Management */}
        <div style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-bold text-white"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Team Members
            </h3>
            <button
              onClick={() => toast.info('Team invitations available on Publisher plan')}
              className="text-sm font-medium transition-colors"
              style={{ color: '#d4af37' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e0c060'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#d4af37'; }}
            >
              + Invite Member
            </button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Alex Rivera', email: 'alex@guttenberg.io', role: 'Owner', avatar: 'A' },
              { name: 'Sam Chen', email: 'sam@guttenberg.io', role: 'Editor', avatar: 'S' },
              { name: 'Jordan Blake', email: 'jordan@guttenberg.io', role: 'Viewer', avatar: 'J' },
            ].map(member => (
              <div
                key={member.email}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: 'rgba(10,22,40,0.40)',
                  border: '1px solid rgba(61,96,128,0.20)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #c9a227 0%, #d4b896 100%)',
                    color: '#0a1628',
                    fontFamily: '"Playfair Display", Georgia, serif',
                  }}
                >
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#c5d8e8' }}>{member.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(90,127,160,0.60)' }}>{member.email}</p>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: 'rgba(26,45,78,0.80)',
                    color: 'rgba(138,175,200,0.70)',
                    border: '1px solid rgba(61,96,128,0.25)',
                  }}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div style={cardStyle}>
          <h3
            className="text-base font-bold text-white mb-4"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Notification Preferences
          </h3>
          <div className="space-y-4">
            {[
              { key: 'salesAlerts', label: 'Sales Alerts', desc: 'Get notified when you make a sale' },
              { key: 'distributionUpdates', label: 'Distribution Updates', desc: 'Status changes on channel submissions' },
              { key: 'payoutAlerts', label: 'Payout Alerts', desc: 'When royalty payments are sent' },
              { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your publishing activity' },
            ].map(pref => {
              const isOn = notifications[pref.key as keyof typeof notifications];
              return (
                <div key={pref.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#c5d8e8' }}>{pref.label}</p>
                    <p className="text-xs" style={{ color: 'rgba(90,127,160,0.60)' }}>{pref.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(n => ({ ...n, [pref.key]: !n[pref.key as keyof typeof n] }))}
                    className="relative inline-flex h-6 w-11 rounded-full transition-all duration-200 flex-shrink-0"
                    style={{
                      background: isOn
                        ? 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)'
                        : 'rgba(26,45,78,0.80)',
                      border: isOn ? '1px solid rgba(212,175,55,0.40)' : '1px solid rgba(61,96,128,0.35)',
                    }}
                  >
                    <span
                      className="inline-block w-4 h-4 bg-white rounded-full mt-0.5 transition-transform duration-200"
                      style={{ transform: isOn ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => toast.success('Notification preferences saved!')}
            className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
              color: '#0a1628',
              boxShadow: '0 2px 8px rgba(212,175,55,0.25)',
            }}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </Layout>
  );
};
