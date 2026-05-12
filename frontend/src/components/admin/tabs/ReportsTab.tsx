import { useEffect, useState } from 'react';
import { BarChart3, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import axiosInstance from '../../../axiosConfig';
import type { AdminTabProps } from '../../../types/assets';

interface StatusCounts {
  [status: string]: number;
}

interface TopRentedItem {
  typeId: string;
  typeName: string;
  count: number;
}

interface ReportData {
  statusCounts: StatusCounts;
  topRented: TopRentedItem[];
  overdueCount: number;
  totalAssets: number;
  totalRented: number;
  generatedAt: string;
}

const STATUS_COLOURS: Record<string, string> = {
  'Available':      'text-status-success',
  'Rented':         'text-brand-light',
  'Pending Rental': 'text-status-warning',
  'Pending Return': 'text-status-warning',
  'Maintenance':    'text-status-danger',
};

const ReportsTab = (_props: AdminTabProps) => {
  const [data, setData]       = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/api/assets/reports/overview');
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="card p-12 text-center text-text-muted">
        Loading reports...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-12 text-center">
        <AlertTriangle size={32} className="mx-auto mb-3 text-status-danger" />
        <p className="text-status-danger font-medium">{error}</p>
        <button
          onClick={fetchReports}
          className="mt-4 px-4 py-2 bg-surface-elevated border border-border-default rounded-md text-text-secondary hover:bg-surface-raised"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <BarChart3 size={20} className="text-brand-light" /> Reports Overview
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Generated {new Date(data.generatedAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="px-3 py-1.5 text-sm bg-surface-elevated border border-border-default rounded-md text-text-secondary hover:bg-surface-raised"
        >
          Refresh
        </button>
      </div>

      {/* Top-level summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 border border-border-default">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <Package size={16} /> <span className="text-xs uppercase tracking-wider">Total Assets</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{data.totalAssets}</p>
        </div>

        <div className="card p-4 border border-border-default">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <TrendingUp size={16} /> <span className="text-xs uppercase tracking-wider">Currently Rented</span>
          </div>
          <p className="text-3xl font-bold text-brand-light">{data.totalRented}</p>
        </div>

        <div className={`card p-4 border ${data.overdueCount > 0 ? 'border-status-danger' : 'border-border-default'}`}>
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <AlertTriangle size={16} /> <span className="text-xs uppercase tracking-wider">Overdue Rentals</span>
          </div>
          <p className={`text-3xl font-bold ${data.overdueCount > 0 ? 'text-status-danger' : 'text-text-primary'}`}>
            {data.overdueCount}
          </p>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="card p-4 border border-border-default">
        <h3 className="text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">
          Assets by Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(data.statusCounts).map(([status, count]) => (
            <div key={status} className="bg-surface-elevated p-3 rounded-md border border-border-default">
              <p className="text-xs text-text-muted">{status}</p>
              <p className={`text-2xl font-bold ${STATUS_COLOURS[status] || 'text-text-primary'}`}>
                {count}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top-rented types */}
      <div className="card p-4 border border-border-default">
        <h3 className="text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">
          Top Rented Asset Types
        </h3>
        {data.topRented.length === 0 ? (
          <p className="text-text-muted text-sm py-4 text-center">No assets currently rented.</p>
        ) : (
          <div className="space-y-2">
            {data.topRented.map((item, idx) => {
              const maxCount = data.topRented[0].count;
              const barWidth = `${(item.count / maxCount) * 100}%`;
              return (
                <div key={item.typeId} className="flex items-center gap-3">
                  <span className="text-text-muted text-xs w-6">{idx + 1}.</span>
                  <span className="text-text-secondary text-sm flex-1 truncate">{item.typeName}</span>
                  <div className="flex-1 bg-surface-elevated rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand h-full rounded-full transition-all"
                      style={{ width: barWidth }}
                    />
                  </div>
                  <span className="text-text-primary font-bold text-sm w-8 text-right">{item.count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsTab;