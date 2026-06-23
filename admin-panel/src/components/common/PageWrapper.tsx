import React from 'react';
import { Link } from 'react-router-dom';

interface PageWrapperProps {
  title: string;
  children: React.ReactNode;
}

export default function PageWrapper({ title, children }: PageWrapperProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#242424]">{title}</h2>
          <p className="text-sm text-[#797979] mt-1">Manage all administrative details for your {title.toLowerCase()}.</p>
        </div>
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F6F6F6] border border-[#E0E0E0] rounded-lg text-xs sm:text-sm font-semibold text-[#242424] shadow-xs transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 text-[#242424]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Overview</span>
        </Link>
      </div>

      <div className="bg-white border border-[#E0E0E0]/60 rounded-xl p-8 flex flex-col items-center justify-center min-h-[360px] text-center shadow-xs">
        {children}
      </div>
    </div>
  );
}
