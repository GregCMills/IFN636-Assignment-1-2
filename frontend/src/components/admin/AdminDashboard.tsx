import { useState, useRef, useEffect } from 'react';
import {
  Package, Wrench, Clock, CheckCircle, ArrowRightLeft, Layers,
} from 'lucide-react';
import type { AdminTabProps } from '../../types/assets';
import Tooltip from '../ui/Tooltip';
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
  const [tabState, setTabState] = useState<'full' | 'compact' | 'icons'>('full');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkOverflow = () => {
      const labels = container.querySelectorAll('.tab-label');
      const buttons = container.querySelectorAll('.tab-button');
      
      // Temporarily set overflow hidden to measure scrollHeight accurately
      container.style.overflow = 'hidden';

      // 1. Try FULL state (horizontal)
      buttons.forEach(btn => { btn.classList.remove('flex-col'); btn.classList.add('flex-row'); });
      labels.forEach(el => { el.classList.remove('hidden', 'text-[10px]', 'mt-0.5'); });
      
      if (container.scrollHeight <= 60) {
        setTabState('full');
        container.style.overflow = 'visible';
        return;
      }

      // 2. Try COMPACT state (vertical)
      buttons.forEach(btn => { btn.classList.remove('flex-row'); btn.classList.add('flex-col'); });
      labels.forEach(el => { el.classList.add('text-[10px]', 'mt-0.5'); el.classList.remove('hidden'); });
      
      if (container.scrollHeight <= 80) { // Slightly more height for vertical layout
        setTabState('compact');
        container.style.overflow = 'visible';
        return;
      }

      // 3. Fallback to ICONS state
      setTabState('icons');
      labels.forEach(el => { el.classList.add('hidden'); });
      container.style.overflow = 'visible';
    };

    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(checkOverflow);
    });

    resizeObserver.observe(container);
    checkOverflow();

    return () => resizeObserver.disconnect();
  }, []);

  const activeTab = TABS.find(t => t.id === activeTabId) ?? TABS[TABS.length - 1];
  const ActiveComponent = activeTab.component;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Admin Dashboard</h1>

      {/* Tab bar */}
      <div 
        ref={containerRef}
        className="card p-1 flex flex-wrap gap-1 mb-6 max-h-32 transition-all duration-300"
      >
        {TABS.map(tab => (
          <Tooltip key={tab.id} content={tab.label} className={tabState !== 'full' ? 'flex-1' : ''}>
            <button
              onClick={() => setActiveTabId(tab.id)}
              className={`tab-button flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap w-full ${
                activeTabId === tab.id
                  ? 'bg-surface-elevated text-brand-light shadow-sm'
                  : 'text-text-muted hover:bg-surface-elevated/60 hover:text-text-secondary'
              } ${tabState === 'compact' ? 'flex-col' : 'flex-row'}`}
            >
              {tab.icon}
              <span className={`tab-label ${
                tabState === 'icons' ? 'hidden' : 
                tabState === 'compact' ? 'text-[10px] mt-0.5' : ''
              }`}>
                {tab.label}
              </span>
            </button>
          </Tooltip>
        ))}
      </div>

      {/* Active tab content */}
      <ActiveComponent {...props} />
    </div>
  );
};

export default AdminDashboard;
