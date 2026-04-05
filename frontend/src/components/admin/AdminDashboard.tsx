import { useState } from 'react';
import {
  Package, Wrench, Clock, CheckCircle, ArrowRightLeft, Layers,
} from 'lucide-react';
import type { AdminTabProps } from '../../types/assets';
import AssetManagementTab from './tabs/AssetManagementTab';

// ── Tab registry ──────────────────────────────────────────────────────────────
// To add a new tab: add an entry here and create its component file.

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType<AdminTabProps>;
}

/** Placeholder for tabs that are not yet implemented. */
const ComingSoon = ({ label }: { label: string }) => (
  <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
    <p className="text-text-muted text-lg font-medium">{label}</p>
    <p className="text-text-subtle text-sm">This tab will be implemented when the backend is connected.</p>
  </div>
);

const makeStub = (label: string): React.ComponentType<AdminTabProps> =>
  () => <ComingSoon label={label} />;

const TABS: TabConfig[] = [
  { id: 'available',       label: 'Available',        icon: <Package size={16} />,        component: makeStub('Available Assets') },
  { id: 'maintenance',     label: 'Maintenance',      icon: <Wrench size={16} />,         component: makeStub('Assets in Maintenance') },
  { id: 'pendingRental',   label: 'Pending Rental',   icon: <Clock size={16} />,          component: makeStub('Pending Rental Approvals') },
  { id: 'rented',          label: 'Rented',           icon: <CheckCircle size={16} />,    component: makeStub('Currently Rented') },
  { id: 'pendingReturn',   label: 'Pending Return',   icon: <ArrowRightLeft size={16} />, component: makeStub('Pending Return Approvals') },
  { id: 'assetManagement', label: 'Asset Management', icon: <Layers size={16} />,         component: AssetManagementTab },
];

// ── Component ─────────────────────────────────────────────────────────────────

const AdminDashboard = (props: AdminTabProps) => {
  const [activeTabId, setActiveTabId] = useState('assetManagement');

  const activeTab = TABS.find(t => t.id === activeTabId) ?? TABS[TABS.length - 1];
  const ActiveComponent = activeTab.component;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Admin Dashboard</h1>

      {/* Tab bar */}
      <div className="card p-1 flex flex-wrap gap-1 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${
              activeTabId === tab.id
                ? 'bg-surface-elevated text-brand-light shadow-sm'
                : 'text-text-muted hover:bg-surface-elevated/60 hover:text-text-secondary'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <ActiveComponent {...props} />
    </div>
  );
};

export default AdminDashboard;
