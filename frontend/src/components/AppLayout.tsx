import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-base">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar — only visible below md breakpoint */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface-raised border-b border-border-default shrink-0">
          <div className="flex items-center gap-2">
            <img src="/rental_manager_logo_small.png" alt="Logo" className="h-7 w-auto" />
            <span className="font-bold text-text-primary">Rental Manager</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-text-muted hover:bg-surface-elevated hover:text-text-primary transition"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AppLayout;
