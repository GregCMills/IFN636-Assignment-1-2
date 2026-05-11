import { useState } from 'react';
import { Package, CheckCircle, Clock, History } from 'lucide-react';
import type { CustomerTabProps } from '../../types/assets';
import BrowseTab from './tabs/BrowseTab';
import MyRentalsTab from './tabs/MyRentalsTab';
import PendingTab from './tabs/PendingTab';
import RentalHistoryTab from './tabs/RentalHistoryTab';

/** Shape of each entry in the static TABS registry. */
interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * Static tab registry — add new customer tabs here.
 * Each entry maps an id to a label and icon; the active tab id is stored in state
 * and used to conditionally render the matching tab component below.
 */
const TABS: TabConfig[] = [
  { id: 'browse',   label: 'Browse',     icon: <Package size={16} /> },
  { id: 'rentals',  label: 'My Rentals', icon: <CheckCircle size={16} /> },
  { id: 'pending',  label: 'Pending',    icon: <Clock size={16} /> },
  { id: 'history',  label: 'History',    icon: <History size={16} /> },
];

/**
 * Top-level layout component for the customer-facing dashboard.
 * Renders a tab bar and delegates rendering to the appropriate tab component.
 * All data-fetching props are passed straight through to each tab via spread.
 */
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
      {activeTabId === 'history' && <RentalHistoryTab {...props} />}
    </div>
  );
};

export default CustomerDashboard;
