import { useState } from 'react';
import {
  Package, Wrench, Clock, CheckCircle, ArrowRightLeft, Layers,
} from 'lucide-react';
import type { AdminTabProps } from '../../types/assets';
import AssetManagementTab from './tabs/AssetManagementTab';
import MaintenanceTab     from './tabs/MaintenanceTab';
import OverviewTab        from './tabs/OverviewTab';
import PendingRentalTab   from './tabs/PendingRentalTab';
import PendingReturnTab   from './tabs/PendingReturnTab';
import RentedTab          from './tabs/RentedTab';

// ── Tab registry ──────────────────────────────────────────────────────────────
// To add a new tab: add an entry here and create its component file.

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType<AdminTabProps>;
}


const TABS: TabConfig[] = [
  { id: 'overview',       label: 'Overview',         icon: <Package size={16} />,        component: OverviewTab },
  { id: 'maintenance',     label: 'Maintenance',      icon: <Wrench size={16} />,         component: MaintenanceTab },
  { id: 'pendingRental',   label: 'Pending Rental',   icon: <Clock size={16} />,          component: PendingRentalTab },
  { id: 'rented',          label: 'Rented',           icon: <CheckCircle size={16} />,    component: RentedTab },
  { id: 'pendingReturn',   label: 'Pending Return',   icon: <ArrowRightLeft size={16} />, component: PendingReturnTab },
  { id: 'assetManagement', label: 'Asset Management', icon: <Layers size={16} />,         component: AssetManagementTab },
];

// ── Component ─────────────────────────────────────────────────────────────────

const AdminDashboard = (props: AdminTabProps) => {
  const [activeTabId, setActiveTabId] = useState('overview');

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
