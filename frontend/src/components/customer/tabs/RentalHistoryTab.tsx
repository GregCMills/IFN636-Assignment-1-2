import { History, CheckCircle, Wrench } from 'lucide-react';
import type { CustomerTabProps } from '../../../types/assets';
import { formatAusDate } from '../../../utils/helpers';
import EmptyState from '../../ui/EmptyState';

/**
 * Displays the customer's completed rental history, including details about
 * each returned asset and its final status (Available or Maintenance).
 */
const RentalHistoryTab = ({ rentalHistory }: CustomerTabProps) => {
  if (rentalHistory.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No Rental History"
        description="Completed rentals will appear here once you return your first asset."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle bg-bg-secondary">
            <th className="px-4 py-3 text-left font-semibold text-text-primary">Asset</th>
            <th className="px-4 py-3 text-left font-semibold text-text-primary">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-text-primary">Returned</th>
            <th className="px-4 py-3 text-left font-semibold text-text-primary">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {rentalHistory.map((entry) => {
            const statusBadge = entry.finalStatus === 'Available'
              ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-status-success/10 text-status-success rounded">
                  <CheckCircle size={14} />
                  <span className="text-xs font-medium">Available</span>
                </div>
              )
              : (
                <div className="flex items-center gap-1 px-2 py-1 bg-status-warning/10 text-status-warning rounded">
                  <Wrench size={14} />
                  <span className="text-xs font-medium">Maintenance</span>
                </div>
              );

            return (
              <tr key={entry.id} className="hover:bg-bg-secondary/30">
                <td className="px-4 py-3 font-medium text-text-primary">{entry.assetName}</td>
                <td className="px-4 py-3 text-text-secondary">{entry.assetTypeName}</td>
                <td className="px-4 py-3 text-text-secondary">{formatAusDate(entry.returnDate)}</td>
                <td className="px-4 py-3">{statusBadge}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RentalHistoryTab;