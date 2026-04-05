import { useState } from 'react';
import { Package, CheckCircle, Clock } from 'lucide-react';
import type { CustomerTabProps } from '../../types/assets';
import BrowseTab from './tabs/BrowseTab';
import MyRentalsTab from './tabs/MyRentalsTab';
import PendingTab from './tabs/PendingTab';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  { id: 'browse',   label: 'Browse',     icon: <Package size={16} /> },
  { id: 'rentals',  label: 'My Rentals', icon: <CheckCircle size={16} /> },
  { id: 'pending',  label: 'Pending',    icon: <Clock size={16} /> },
];

const CustomerDashboard = (props: CustomerTabProps) => {
  const [activeTabId, setActiveTabId] = useState('browse');

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Customer Dashboard</h1>

      {/* Tab bar */}
      <div className="card p-1 flex flex-wrap gap-1 mb-6 w-full md:w-max">
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

      {activeTabId === 'browse'  && <BrowseTab {...props} />}
      {activeTabId === 'rentals' && <MyRentalsTab {...props} />}
      {activeTabId === 'pending' && <PendingTab {...props} />}
    </div>
  );
};

export default CustomerDashboard;
