import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useToast } from '../components/ui/Toast';
import {
  UserCircleIcon,
  CreditCardIcon,
  UserGroupIcon,
  BellIcon,
  PuzzlePieceIcon,
  CheckIcon,
  KeyIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'account', label: 'Account', icon: UserCircleIcon },
  { id: 'subscription', label: 'Subscription', icon: CreditCardIcon },
  { id: 'team', label: 'Team', icon: UserGroupIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'integrations', label: 'Integrations', icon: PuzzlePieceIcon },
] as const;

type TabId = (typeof TABS)[number]['id'];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    features: ['1 title', '2 formats', 'Basic distribution', 'Community support'],
    color: 'bg-gray-100 text-gray-700',
    current: false,
  },
  {
    id: 'author',
    name: 'Author',
    price: '$19/mo',
    features: [
      '10 titles',
      'All formats',
      'Full distribution',
      'AI synopsis tools',
      'Analytics dashboard',
      'Email support',
    ],
    color: 'bg-indigo-100 text-indigo-700',
    current: true,
  },
  {
    id: 'publisher',
    name: 'Publisher',
    price: '$49/mo',
    features: [
      'Unlimited titles',
      'Team accounts (up to 10)',
      'Imprint management',
      'API access',
      'Priority support',
      'Custom landing pages',
    ],
    color: 'bg-purple-100 text-purple-700',
    current: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Unlimited everything',
      'Unlimited team seats',
      'White-label options',
      'Dedicated account manager',
      'SSO / SAML',
      'Custom integrations',
      'SLA guarantee',
    ],
    color: 'bg-amber-100 text-amber-700',
    current: false,
  },
];

const TEAM_MEMBERS = [
  {
    name: 'Alex Rivera',
    email: 'alex@guttenberg.io',
    role: 'Owner',
    avatar: 'A',
  },
  {
    name: 'Sam Chen',
    email: 'sam@guttenberg.io',
    role: 'Editor',
    avatar: 'S',
  },
  {
    name: 'Jordan Blake',
    email: 'jordan@guttenberg.io',
    role: 'Viewer',
    avatar: 'J',
  },
];

const NOTIFICATION_PREFS = [
  {
    key: 'salesAlerts',
    label: 'Sales Alerts',
    desc: 'Get notified when you make a sale',
    defaultOn: true,
  },
  {
    key: 'distributionUpdates',
    label: 'Distribution Updates',
    desc: 'Status changes on channel submissions',
    defaultOn: true,
  },
  {
    key: 'payoutAlerts',
    label: 'Payout Alerts',
    desc: 'When royalty payments are sent',
    defaultOn: true,
  },
  {
    key: 'marketingReminders',
    label: 'Marketing Reminders',
    desc: 'ARC campaign deadlines and milestones',
    defaultOn: true,
  },
  {
    key: 'weeklyDigest',
    label: 'Weekly Digest',
    desc: 'Summary of your publishing activity',
    defaultOn: false,
  },
  {
    key: 'productUpdates',
    label: 'Product Updates',
    desc: 'New features and platform improvements',
    defaultOn: false,
  },
];

interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  icon: React.FC<React.ComponentProps<'svg'>>;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'refinery',
    name: 'The Refinery',
    description: 'Manuscript editing and collaboration platform',
    connected: true,
    icon: PencilIcon,
  },
  {
    id: 'forge',
    name: 'The Forge',
    description: 'Book formatting and layout engine',
    connected: true,
    icon: CubeIcon,
  },
  {
    id: 'scrybe',
    name: 'Scrybe',
    description: 'AI-powered writing assistant and analytics',
    connected: false,
    icon: SparklesIcon,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and royalty disbursement',
    connected: true,
    icon: CreditCardIcon,
  },
];

// ---------------------------------------------------------------------------
// SettingsPage
// ---------------------------------------------------------------------------

export const SettingsPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('account');

  // Account form
  const [accountForm, setAccountForm] = useState({
    name: 'Alex Rivera',
    email: 'alex@guttenberg.io',
  });

  // Notification toggles
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_PREFS.map((p) => [p.key, p.defaultOn])),
  );

  const toggleNotification = (key: string) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Role badge colors
  const roleBadgeClass = (role: string) => {
    switch (role) {
      case 'Owner':
        return 'bg-indigo-100 text-indigo-700';
      case 'Editor':
        return 'bg-emerald-100 text-emerald-700';
      case 'Viewer':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Layout title="Settings" breadcrumbs={[{ label: 'Settings' }]}>
      <div className="max-w-4xl mx-auto">
        {/* ---------------------------------------------------------------- */}
        {/* Tab Navigation                                                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl mb-8 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ================================================================ */}
        {/* Account Tab                                                      */}
        {/* ================================================================ */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-6">
                Account Information
              </h3>

              {/* Avatar + info */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/25">
                  {accountForm.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{accountForm.name}</p>
                  <p className="text-sm text-gray-500">{accountForm.email}</p>
                  <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-700">
                    Author Plan
                  </span>
                </div>
              </div>

              {/* Editable fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    value={accountForm.name}
                    onChange={(e) =>
                      setAccountForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    value={accountForm.email}
                    onChange={(e) =>
                      setAccountForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toast.success('Account information saved!')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/25"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => toast.info('Password change email sent.')}
                  className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  <KeyIcon className="w-4 h-4" />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* Subscription Tab                                                 */}
        {/* ================================================================ */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {/* Current plan card */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-200 font-medium">Current Plan</p>
                  <p className="text-2xl font-bold mt-1">Author</p>
                  <p className="text-indigo-200 text-sm mt-0.5">$19/month</p>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <ShieldCheckIcon className="w-5 h-5" />
                  <span className="text-sm font-semibold">Active</span>
                </div>
              </div>
              <p className="text-sm text-indigo-100 mt-4">
                Your next billing date is April 1, 2026. You have used 3 of 10 title slots.
              </p>
            </div>

            {/* Plan comparison */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-6">
                Compare Plans
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border-2 p-5 transition-all ${
                      plan.current
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {plan.current && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Current
                      </span>
                    )}
                    <p className="text-sm font-bold text-gray-900">{plan.name}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{plan.price}</p>
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2 text-xs text-gray-600"
                        >
                          <CheckIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    {!plan.current && plan.id !== 'starter' && (
                      <button
                        onClick={() =>
                          toast.info(`Upgrade to ${plan.name} coming soon!`)
                        }
                        className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* Team Tab                                                         */}
        {/* ================================================================ */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Team Members
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Manage who has access to your publishing account.
                  </p>
                </div>
                <button
                  onClick={() => toast.info('Team invitation sent!')}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/25"
                >
                  <PlusIcon className="w-4 h-4" />
                  Invite Member
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Member
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {TEAM_MEMBERS.map((member) => (
                      <tr
                        key={member.email}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                              {member.avatar}
                            </div>
                            <span className="font-medium text-gray-900">
                              {member.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{member.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(member.role)}`}
                          >
                            {member.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {member.role !== 'Owner' && (
                            <button
                              onClick={() =>
                                toast.info(`Manage ${member.name}'s permissions`)
                              }
                              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* Notifications Tab                                                */}
        {/* ================================================================ */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Notification Preferences
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Choose which notifications you would like to receive.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {NOTIFICATION_PREFS.map((pref) => (
                  <div
                    key={pref.key}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
                  >
                    <div className="min-w-0 flex-1 mr-4">
                      <p className="text-sm font-medium text-gray-800">
                        {pref.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{pref.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleNotification(pref.key)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                        notifications[pref.key]
                          ? 'bg-indigo-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 bg-white rounded-full mt-1 transition-transform shadow-sm ${
                          notifications[pref.key]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => toast.success('Notification preferences saved!')}
                className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/25"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* Integrations Tab                                                 */}
        {/* ================================================================ */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Integrations
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Connect your publishing tools and services.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {INTEGRATIONS.map((integration) => {
                  const Icon = integration.icon;
                  return (
                    <div
                      key={integration.id}
                      className="flex items-start gap-4 p-5 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          integration.connected
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {integration.name}
                          </p>
                          {integration.connected ? (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              Connected
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                              Not connected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {integration.description}
                        </p>
                        <button
                          onClick={() =>
                            integration.connected
                              ? toast.info(
                                  `${integration.name} settings opened`,
                                )
                              : toast.success(
                                  `${integration.name} connected!`,
                                )
                          }
                          className={`mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                            integration.connected
                              ? 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                              : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                          }`}
                        >
                          {integration.connected ? 'Configure' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
