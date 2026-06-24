import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets, type Ticket } from './TicketsContext';

export default function TicketDashboard() {
  const { tickets, agents, categories, assignTicket, updateStatus } = useTickets();
  const navigate = useNavigate();

  
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');
  const [errorState, setErrorState] = useState<string | null>(null);

  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  
  const [selectedTicketForAssign, setSelectedTicketForAssign] = useState<Ticket | null>(null);
  const [assignAgentSelected, setAssignAgentSelected] = useState('');
  
  const [selectedTicketForStatus, setSelectedTicketForStatus] = useState<Ticket | null>(null);
  const [statusSelected, setStatusSelected] = useState<Ticket['status']>('Open');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAssignAction = () => {
    if (!selectedTicketForAssign || !assignAgentSelected) return;
    assignTicket(selectedTicketForAssign.id, assignAgentSelected);
    showToast(`Ticket ${selectedTicketForAssign.id} assigned to ${assignAgentSelected}`, 'success');
    setSelectedTicketForAssign(null);
    setAssignAgentSelected('');
  };

  const handleStatusAction = () => {
    if (!selectedTicketForStatus) return;
    updateStatus(selectedTicketForStatus.id, statusSelected);
    showToast(`Ticket ${selectedTicketForStatus.id} status updated to ${statusSelected}`, 'success');
    setSelectedTicketForStatus(null);
  };

  
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const escalatedTickets = tickets.filter(t => t.status === 'Escalated').length;
  const closedTickets = tickets.filter(t => t.status === 'Closed' || t.status === 'Resolved').length;

  
  const getPriorityStyles = (p: Ticket['priority']) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'LOW':
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusStyles = (s: Ticket['status']) => {
    switch (s) {
      case 'Open':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Escalated':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Closed':
        return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  if (errorState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-red-200 rounded-2xl bg-red-50/30 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-red-950">Module Error</h3>
        <p className="text-sm text-red-700 max-w-md mt-2">{errorState}</p>
        <button 
          onClick={() => setErrorState(null)} 
          className="mt-6 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-bold shadow transition-all cursor-pointer"
        >
          Dismiss Alert
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-12 select-none">
      {}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3.5 bg-white border border-[#BEC9BE] rounded-xl shadow-xl animate-slide-in-right">
          <div className={`w-3 h-3 rounded-full ${
            toastType === 'success' ? 'bg-[#00522E]' : toastType === 'error' ? 'bg-[#BA1A1A]' : 'bg-[#F8B057]'
          }`}></div>
          <span className="text-sm font-bold text-[#111E16]">{toastMessage}</span>
        </div>
      )}

      {}
      {selectedTicketForAssign && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-2xl p-6 max-w-sm w-full animate-scale-in">
            <h4 className="text-lg font-bold text-[#111E16]">Assign Ticket Agent</h4>
            <p className="text-xs text-[#6F7A70] mt-1">Select an agent for ticket {selectedTicketForAssign.id}.</p>
            <div className="mt-4">
              <select
                value={assignAgentSelected}
                onChange={(e) => setAssignAgentSelected(e.target.value)}
                className="w-full bg-white text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none cursor-pointer"
              >
                <option value="">Choose Agent...</option>
                {agents.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedTicketForAssign(null)}
                className="px-4 py-2 text-xs font-bold text-[#6F7A70] hover:text-[#111E16] bg-white border border-[#BEC9BE] rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignAction}
                disabled={!assignAgentSelected}
                className="px-4 py-2 text-xs font-bold text-white bg-[#00522E] hover:bg-[#003B21] disabled:bg-[#BEC9BE] rounded-lg shadow-sm cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {selectedTicketForStatus && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-2xl p-6 max-w-sm w-full animate-scale-in">
            <h4 className="text-lg font-bold text-[#111E16]">Change Ticket Status</h4>
            <p className="text-xs text-[#6F7A70] mt-1">Update status for ticket {selectedTicketForStatus.id}.</p>
            <div className="mt-4">
              <select
                value={statusSelected}
                onChange={(e) => setStatusSelected(e.target.value as Ticket['status'])}
                className="w-full bg-white text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none cursor-pointer"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Escalated">Escalated</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedTicketForStatus(null)}
                className="px-4 py-2 text-xs font-bold text-[#6F7A70] hover:text-[#111E16] bg-white border border-[#BEC9BE] rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusAction}
                className="px-4 py-2 text-xs font-bold text-white bg-[#00522E] hover:bg-[#003B21] rounded-lg shadow-sm cursor-pointer"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16] flex items-center gap-2">
            Support Ticket Dashboard
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Real-time operational overview of customer grievances, SLA timelines, and helpdesk actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('Exporting reports is simulated.', 'info')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F6F6F6] text-[#111E16] border border-[#BEC9BE] rounded-lg text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <span>Export Reports</span>
          </button>
          <button
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
                showToast('Dashboard metrics refreshed.', 'success');
              }, 400);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-sm font-semibold shadow-md transition-all cursor-pointer"
          >
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[130px]">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-[#00522E]/10 rounded-lg flex items-center justify-center text-[#00522E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8E9] text-[#00522E]">
              +4%
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Tickets</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block">
              {isLoading ? '...' : totalTickets}
            </span>
          </div>
        </div>

        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[130px]">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-blue-50 rounded-lg flex items-center justify-center text-blue-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800">
              Active
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Open Tickets</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block">
              {isLoading ? '...' : openTickets}
            </span>
          </div>
        </div>

        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[130px]">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-red-50 rounded-lg flex items-center justify-center text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
              Critical
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Escalated Tickets</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block">
              {isLoading ? '...' : escalatedTickets}
            </span>
          </div>
        </div>

        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[130px]">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8E9] text-[#00522E]">
              92% CSAT
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Closed Tickets</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block">
              {isLoading ? '...' : closedTickets}
            </span>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {}
        <div className="relative flex-1 min-w-[280px]">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6F7A70]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search tickets by ID, customer name, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F6F6F6] text-sm text-[#111E16] font-semibold rounded-lg pl-11 pr-4 py-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
          />
        </div>

        {}
        <div className="flex flex-wrap items-center gap-3">
          {}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white text-xs font-bold text-[#111E16] border border-[#BEC9BE] rounded-lg px-3 py-2.5 cursor-pointer hover:bg-[#F6F6F6]"
            >
              <option value="All">Status: All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white text-xs font-bold text-[#111E16] border border-[#BEC9BE] rounded-lg px-3 py-2.5 cursor-pointer hover:bg-[#F6F6F6]"
            >
              <option value="All">Priority: All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white text-xs font-bold text-[#111E16] border border-[#BEC9BE] rounded-lg px-3 py-2.5 cursor-pointer hover:bg-[#F6F6F6]"
            >
              <option value="All">Category: All</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {}
          {(searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setPriorityFilter('All');
                setCategoryFilter('All');
                showToast('Filters reset.', 'info');
              }}
              className="px-3 py-2.5 text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {}
      <div className="bg-white border border-[#BEC9BE] rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-1/4"></div>
            <div className="space-y-3 pt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="h-10 bg-gray-50 rounded-lg animate-pulse flex-1"></div>
                  <div className="h-10 bg-gray-50 rounded-lg animate-pulse w-32"></div>
                  <div className="h-10 bg-gray-50 rounded-lg animate-pulse w-24"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredTickets.length === 0 ? (
          
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#F8B057]/10 text-[#401900] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#111E16]">No tickets found</h3>
            <p className="text-sm text-[#6F7A70] mt-1 max-w-sm">
              We couldn't find any tickets matching your search query or selected filter options.
            </p>
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E8F8E9]/40 border-b border-[#BEC9BE]/60 text-xs font-bold text-[#6F7A70] tracking-wider uppercase">
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Subject & Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Assigned Agent</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BEC9BE]/30 text-sm text-[#111E16]">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F6F6F6]/50 transition-colors">
                    {/* ID */}
                    <td className="px-6 py-4 font-bold font-mono text-[#00522E]">
                      {t.id}
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#DCECDE] text-[#00522E] flex items-center justify-center font-bold text-xs">
                          {t.customerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <span className="font-semibold block">{t.customerName}</span>
                          <span className="text-xs text-[#6F7A70] block truncate max-w-[150px]">{t.customerEmail}</span>
                        </div>
                      </div>
                    </td>

                    {/* Subject & Category */}
                    <td className="px-6 py-4 max-w-xs">
                      <div>
                        <span className="font-semibold block truncate">{t.subject}</span>
                        <span className="text-xs font-medium text-emerald-800 bg-[#E8F8E9] px-2 py-0.5 rounded-md mt-1 inline-block">
                          {t.category}
                        </span>
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getPriorityStyles(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>

                    {/* Agent */}
                    <td className="px-6 py-4 font-semibold text-[#3F4941]">
                      {t.assignedAgent === 'Unassigned' ? (
                        <span className="text-gray-400 italic">Unassigned</span>
                      ) : (
                        t.assignedAgent
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(t.status)}`}>
                        {t.status}
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick View Details */}
                        <button
                          onClick={() => navigate(`/dashboard/tickets/details/${t.id.replace('#', '')}`)}
                          title="View Details"
                          className="p-1.5 hover:bg-[#DCECDE] text-[#00522E] rounded-md transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Assign Agent Quick Action */}
                        <button
                          onClick={() => {
                            setSelectedTicketForAssign(t);
                            setAssignAgentSelected(t.assignedAgent === 'Unassigned' ? '' : t.assignedAgent);
                          }}
                          title="Assign Agent"
                          className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-md transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        </button>

                        {}
                        <button
                          onClick={() => {
                            setSelectedTicketForStatus(t);
                            setStatusSelected(t.status);
                          }}
                          title="Change Status"
                          className="p-1.5 hover:bg-blue-50 text-blue-700 rounded-md transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
