import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

interface DashboardLayoutProps {
  onLogout: () => void;
}

export default function DashboardLayout({ onLogout }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex bg-[#F6F6F6] text-[#242424] overflow-hidden antialiased">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={onLogout}
      />
      <main className="flex-1 h-full flex flex-col overflow-hidden">
        <Header setIsSidebarOpen={setIsSidebarOpen} onLogout={onLogout} />
        <div className="flex-1 overflow-y-auto flex flex-col justify-between">
          <section className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto flex-1">
            <Outlet />
          </section>
          <Footer />
        </div>
      </main>
    </div>
  );
}
