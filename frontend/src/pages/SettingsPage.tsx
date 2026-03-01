import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

export const SettingsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState({
    salesAlerts: true, distributionUpdates: true, payoutAlerts: true, weeklyDigest: false,
  });

  const tierInfo = {
    indie: { name: 'Indie', color: 'bg-gray-100 text-gray-700', price: 'Free', features: ['3 titles', '2 formats', 'Basic distribution'] },
    pro: { name: 'Pro', color: 'bg-primary-100 text-primary-700', price: '$29/mo', features: ['Unlimited titles', 'All formats', 'Priority distribution', 'Analytics'] },
    publisher: { name: 'Publisher', color: 'bg-accent-100 text-accent-700', price: '$99/mo', features: ['Unlimited titles', 'Team accounts', 'Imprint management', 'API access', 'Dedicated support'] },
  };

  const tier = user?.subscriptionTier || 'pro';
  const info = tierInfo[tier as keyof typeof tierInfo] || tierInfo.pro;

  return (
    <Layout title="Settings" breadcrumbs={[{ label: 'Settings' }]}>
      <div className="max-w-3xl space-y-6">
        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-2xl font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{user?.name || 'Demo User'}</p>
              <p className="text-sm text-gray-500">{user?.email || 'demo@guttenberg.io'}</p>
              <span className={`inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-semibold ${info.color}`}>{info.name}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input defaultValue={user?.name || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input defaultValue={user?.email || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <button onClick={() => toast.success('Account info updated!')} className="mt-4 px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700">
            Save Changes
          </button>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Subscription</h3>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${info.color}`}>{info.name} Plan</span>
                <span className="text-sm text-gray-500">{info.price}</span>
              </div>
              <div className="space-y-1">
                {info.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500">✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => toast.info('Opening upgrade flow…')} className="px-4 py-2.5 border border-primary-300 text-primary-600 text-sm font-medium rounded-xl hover:bg-primary-50">
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Team Management */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Team Members</h3>
            <button onClick={() => toast.info('Team invitations available on Publisher plan')} className="text-sm text-primary-600 font-medium hover:text-primary-700">+ Invite Member</button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Alex Rivera', email: 'alex@guttenberg.io', role: 'Owner', avatar: 'A' },
              { name: 'Sam Chen', email: 'sam@guttenberg.io', role: 'Editor', avatar: 'S' },
              { name: 'Jordan Blake', email: 'jordan@guttenberg.io', role: 'Viewer', avatar: 'J' },
            ].map(member => (
              <div key={member.email} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-xs font-bold text-white">{member.avatar}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">{member.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { key: 'salesAlerts', label: 'Sales Alerts', desc: 'Get notified when you make a sale' },
              { key: 'distributionUpdates', label: 'Distribution Updates', desc: 'Status changes on channel submissions' },
              { key: 'payoutAlerts', label: 'Payout Alerts', desc: 'When royalty payments are sent' },
              { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your publishing activity' },
            ].map(pref => (
              <div key={pref.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{pref.label}</p>
                  <p className="text-xs text-gray-500">{pref.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications(n => ({ ...n, [pref.key]: !n[pref.key as keyof typeof n] }))}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${notifications[pref.key as keyof typeof notifications] ? 'bg-primary-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block w-4 h-4 bg-white rounded-full mt-1 transition-transform ${notifications[pref.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => toast.success('Notification preferences saved!')} className="mt-4 px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700">
            Save Preferences
          </button>
        </div>
      </div>
    </Layout>
  );
};
