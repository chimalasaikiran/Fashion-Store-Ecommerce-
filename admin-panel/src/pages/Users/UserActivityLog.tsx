import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from './UsersContext';

export default function UserActivityLog() {
  const navigate = useNavigate();
  const { activities } = useUsers();

  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  
  const filteredActivities = activities.filter((act) => {
    const matchesSearch = 
      act.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.userId.includes(searchQuery);

    const matchesCategory = categoryFilter === 'All' || act.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || act.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  
  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16]">
          Security & Activity Logs
        </h2>
        <p className="text-sm text-[#6F7A70] mt-1">
          Monitor administrative activities, transactional updates, authentication logs, and profile changes.
        </p>
      </div>

      {}
      <div className="bg-white border border-[#BEC9BE] rounded-t-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#6F7A70]">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search user, action..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#E8F8E9] text-sm text-[#111E16] placeholder-[#6F7A70] rounded-lg pl-10 pr-4 py-2 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none transition-all"
            />
          </div>

          {}
          <div className="relative w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto appearance-none bg-white border border-[#BEC9BE] rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-[#111E16] cursor-pointer focus:outline-none focus:border-[#00522E]"
            >
              <option value="All">All Categories</option>
              <option value="Auth">Auth & Sessions</option>
              <option value="Profile">Profile Updates</option>
              <option value="Transaction">Transactions</option>
              <option value="Security">Account Security</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6F7A70]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>

          {}
          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto appearance-none bg-white border border-[#BEC9BE] rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-[#111E16] cursor-pointer focus:outline-none focus:border-[#00522E]"
            >
              <option value="All">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6F7A70]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="text-xs font-semibold text-[#6F7A70] w-full md:w-auto text-right">
          Showing {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} logs
        </div>
      </div>

      {}
      <div className="bg-white border-x border-b border-[#BEC9BE] rounded-b-xl shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm min-w-[900px]">
            <thead>
              <tr className="bg-[#E8F8E9]/50 text-[#6F7A70] border-b border-[#BEC9BE]/60 select-none">
                <th className="py-4 px-6 font-bold text-xs tracking-wider uppercase">Timestamp</th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">User</th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Action Category</th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Action Details</th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">IP Address</th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Device / Agent</th>
                <th className="py-4 px-6 font-bold text-xs tracking-wider uppercase text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BEC9BE]/30">
              {paginatedActivities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6F7A70]">
                    No activity logs match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedActivities.map((act) => {
                  let catBadge = '';
                  if (act.category === 'Auth') catBadge = 'bg-blue-50 text-blue-800 border-blue-200';
                  else if (act.category === 'Profile') catBadge = 'bg-teal-50 text-teal-800 border-teal-200';
                  else if (act.category === 'Transaction') catBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  else catBadge = 'bg-purple-50 text-purple-800 border-purple-200';

                  return (
                    <tr key={act.id} className="hover:bg-[#E8F8E9]/10">
                      <td className="py-3.5 px-6 whitespace-nowrap text-xs font-semibold text-[#111E16]">
                        {formatDate(act.timestamp)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          onClick={() => act.userId !== 'admin' && navigate(`/dashboard/users/details/${act.userId}`)}
                          className={`font-bold ${act.userId !== 'admin' ? 'text-[#00522E] hover:underline cursor-pointer' : 'text-[#111E16]'}`}
                        >
                          {act.userName}
                        </span>
                        <span className="text-[10px] text-[#6F7A70] block">ID: #{act.userId}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${catBadge}`}>
                          {act.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#111E16] max-w-[250px] truncate" title={act.action}>
                        {act.action}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-[#111E16]">
                        {act.ipAddress}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[#6F7A70] truncate max-w-[150px]" title={act.device}>
                        {act.device}
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          act.status === 'Success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                        }`}>
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {}
        <div className="bg-white border-t border-[#BEC9BE] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`flex items-center gap-1.5 px-4 py-2 border border-[#BEC9BE] rounded-lg text-sm font-semibold transition-all ${
              currentPage === 1
                ? 'opacity-40 cursor-not-allowed text-[#6F7A70]'
                : 'text-[#111E16] hover:bg-[#F6F6F6] cursor-pointer'
            }`}
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#00522E] text-white shadow-xs'
                      : 'text-[#111E16] hover:bg-[#F6F6F6]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1.5 px-4 py-2 border border-[#BEC9BE] rounded-lg text-sm font-semibold transition-all ${
              currentPage === totalPages
                ? 'opacity-40 cursor-not-allowed text-[#6F7A70]'
                : 'text-[#111E16] hover:bg-[#F6F6F6] cursor-pointer'
            }`}
          >
            <span>Next</span>
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
