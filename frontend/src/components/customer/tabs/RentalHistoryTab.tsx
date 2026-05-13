import { History } from 'lucide-react';
import type { CustomerTabProps } from '../../../types/assets';
import { formatAusDate, formatAusDateFromIso } from '../../../utils/helpers';
import EmptyState from '../../ui/EmptyState';

/**
 * Displays the customer's completed rental history, including details about
 * when an item was rented and when it was returned.
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
            <th className="px-4 py-3 text-left font-semibold text-text-primary">Description</th>
            <th className="px-4 py-3 text-left font-semibold text-text-primary">Rent Date</th>
            <th className="px-4 py-3 text-left font-semibold text-text-primary">Returned</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {rentalHistory.map((entry) => {
            const completedDate = entry.completedAt.split('T')[0];
            const safeRentDate = entry.rentDate && entry.rentDate <= completedDate
              ? entry.rentDate
              : undefined;
            const rentDateDisplay = entry.rentApprovedAt
              ? formatAusDateFromIso(entry.rentApprovedAt)
              : (safeRentDate ? formatAusDate(safeRentDate) : 'Not recorded');

            return (
              <tr key={entry.id} className="hover:bg-bg-secondary/30">
                <td className="px-4 py-3 font-medium text-text-primary">{entry.assetName}</td>
                <td className="px-4 py-3 text-text-secondary">{entry.assetTypeName}</td>
                <td className="px-4 py-3 text-text-secondary">{rentDateDisplay}</td>
                <td className="px-4 py-3 text-text-secondary">{formatAusDateFromIso(entry.completedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RentalHistoryTab;