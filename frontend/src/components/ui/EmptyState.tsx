import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  iconClassName?: string;
  title: string;
  description?: string;
}

const EmptyState = ({ icon: Icon, iconClassName = 'text-text-subtle opacity-40', title, description }: EmptyStateProps) => (
  <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
    {Icon && <Icon size={40} className={iconClassName} />}
    <p className="text-text-muted text-lg font-medium">{title}</p>
    {description && <p className="text-text-subtle text-sm">{description}</p>}
  </div>
);

export default EmptyState;
