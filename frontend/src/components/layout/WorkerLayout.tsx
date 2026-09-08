import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNavigation } from './MobileNavigation';

export const WorkerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      {/* Sidebar Desktop */}
      <Sidebar role="worker" />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Topbar role="worker" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav Mobile */}
      <MobileNavigation role="worker" />
    </div>
  );
};
