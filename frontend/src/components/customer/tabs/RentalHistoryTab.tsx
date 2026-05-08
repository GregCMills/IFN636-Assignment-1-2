import { History } from 'lucide-react';
import type { CustomerTabProps } from '../../../types/assets';
import EmptyState from '../../ui/EmptyState';

const RentalHistoryTab = (_props: CustomerTabProps) => (
  <EmptyState
    icon={History}
    title="No Rental History"
    description="Completed rentals will appear here once the backend history flow is connected."
  />
);

export default RentalHistoryTab;