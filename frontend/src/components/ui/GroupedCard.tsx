import type { ReactNode } from 'react';

interface GroupedCardProps {
  header: ReactNode;
  children: ReactNode;
  /** Override the flex layout on the header strip. Defaults to justify-between. */
  headerClassName?: string;
}

const GroupedCard = ({
  header,
  children,
  headerClassName = 'flex flex-wrap justify-between items-center gap-3',
}: GroupedCardProps) => (
  <div className="card overflow-hidden">
    <div className={`bg-surface-elevated/30 px-6 py-4 border-b border-border-default ${headerClassName}`}>
      {header}
    </div>
    <div className="p-6 space-y-6">
      {children}
    </div>
  </div>
);

export default GroupedCard;
