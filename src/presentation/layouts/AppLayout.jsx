import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Toaster } from 'sonner';

export default function AppLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sonner Toast Notification Host */}
      <Toaster
        richColors
        position="top-right"
        closeButton
        toastOptions={{
          className: 'font-sans text-sm rounded-xl shadow-lg border',
          duration: 4500,
        }}
      />

      {/* Sidebar Component */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar setIsMobileOpen={setIsMobileOpen} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
