import type { ReactNode } from 'react';

interface AssetRowProps {
  children: ReactNode;
}

const AssetRow = ({ children }: AssetRowProps) => (
  <div className="flex flex-wrap sm:flex-nowrap sm:items-center justify-between gap-3
                  bg-surface-elevated/20 border border-border-default p-3 rounded-lg">
    {children}
  </div>
);

export default AssetRow;
