import React, { useState, useEffect } from 'react';
import { useTickets, type Ticket } from './TicketsContext';

export default function TicketClosure() {
  const { tickets, closeTicket, reopenTicket } = useTickets();

  // Loading and Alert states
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  // Interactive Close Ticket Form states
  const [targetTicketId, setTargetTicketId] = useState('');
  const [resolutionCategory, setResolutionCategory] = useState('Bug Fix Deployed');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [sendNotification, setSendNotification] = useState(true);

  // CSAT simulation states
  const [csatRating, setCsatRating] = useState(5);
  const [csatComment, setCsatComment] = useState('');

  // Selected ticket for details modal
  const [viewingArchiveTicket, setViewingArchiveTicket] = useState<Ticket | null>(null);
  
  // Re-open confirmation modal
  const [confirmReopenTicketId, setConfirmReopenTicketId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTicketId || !resolutionNotes.trim()) {
      showToast('Please select a ticket and write resolution details.', 'error');
      return;
    }

    closeTicket(
      targetTicketId,
      `[${resolutionCategory}] ${resolutionNotes.trim()}`,
      csatRating,
      csatComment.trim() || 'No customer comments logged.'
    );

    showToast(`Ticket ${targetTicketId} successfully closed and archived.`, 'success');
    if (sendNotification) {
      showToast('Resolution dispatch confirmation email sent to customer.', 'info');
    }

    // Reset Form
    setTargetTicketId('');
    setResolutionNotes('');
    setCsatComment('');
    setCsatRating(5);
  };

  const handleConfirmReopen = () => {
    if (!confirmReopenTicketId) return;
    reopenTicket(confirmReopenTicketId);
    showToast(`Ticket ${confirmReopenTicketId} has been successfully re-opened and queued.`, 'success');
    setConfirmReopenTicketId(null);
  };

  // Filter lists
  const activeTickets = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved');
  const closedArchive = tickets.filter(t => t.status === 'Closed' || t.status === 'Resolved');

  // Compute CSAT metrics
  const csatWithRatings = closedArchive.filter(t => t.feedbackRating !== undefined);
  const averageCsat = csatWithRatings.length > 0 
    ? (csatWithRatings.reduce((sum, t) => sum + (t.feedbackRating || 0), 0) / csatWithRatings.length).toFixed(1)
    : '4.8';

  return (
    <div className="space-y-6 relative pb-12 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3.5 bg-white border border-[#BEC9BE] rounded-xl shadow-xl animate-slide-in-right">
          <div className={`w-3 h-3 rounded-full ${
            toastType === 'success' ? 'bg-[#00522E]' : toastType === 'error' ? 'bg-[#BA1A1A]' : 'bg-[#F8B057]'
          }`}></div>
          <span className="text-sm font-bold text-[#111E16]">{toastMessage}</span>
        </div>
      )}

      {/* Reopen Confirmation Modal */}
      {confirmReopenTicketId && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-2xl p-6 max-w-sm w-full animate-scale-in">
            <h4 className="text-lg font-bold text-[#111E16]">Confirm Ticket Reopen</h4>
            <p className="text-sm text-[#6F7A70] mt-2">
              Are you sure you want to reopen ticket {confirmReopenTicketId}? This will restore active SLA target tracking.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmReopenTicketId(null)}
                className="px-4 py-2 text-xs font-bold text-[#6F7A70] hover:text-[#111E16] bg-white border border-[#BEC9BE] rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
              >
                Keep Closed
              </button>
              <button
                onClick={handleConfirmReopen}
                className="px-4 py-2 text-xs font-bold text-white bg-[#00522E] hover:bg-[#003B21] rounded-lg shadow-sm cursor-pointer"
              >
                Reopen Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Details Modal */}
      {viewingArchiveTicket && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-2xl p-6 max-w-md w-full animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h4 className="text-lg font-bold text-[#111E16] font-mono">{viewingArchiveTicket.id} Resolution Summary</h4>
              <button 
                onClick={() => setViewingArchiveTicket(null)} 
                className="text-[#6F7A70] hover:text-[#111E16] text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-[10px] font-bold text-[#6F7A70] uppercase">Customer</span>
                <span className="font-semibold text-[#111E16]">{viewingArchiveTicket.customerName} ({viewingArchiveTicket.customerEmail})</span>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-[#6F7A70] uppercase">Subject</span>
                <span className="font-medium text-[#111E16]">{viewingArchiveTicket.subject}</span>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-[#6F7A70] uppercase">Resolution Notes Logged</span>
                <p className="bg-[#E8F8E9]/30 border border-[#BEC9BE]/40 rounded-lg p-3 text-xs text-[#111E16] leading-relaxed font-semibold italic mt-1">
                  {viewingArchiveTicket.resolutionNotes || 'No resolution details saved.'}
                </p>
              </div>

              {viewingArchiveTicket.feedbackRating !== undefined && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="block text-[10px] font-bold text-[#6F7A70] uppercase mb-1">Customer CSAT Response</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <svg key={idx} className={`w-3.5 h-3.5 ${idx < (viewingArchiveTicket.feedbackRating || 0) ? 'fill-current' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 italic">"{viewingArchiveTicket.feedbackComment || 'No comment provided.'}"</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setViewingArchiveTicket(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg cursor-pointer"
              >
                Dismiss Dialog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16] flex items-center gap-2">
            Ticket Closure Terminal
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Conduct resolution surveys, verify audits, re-open tickets, and review Helpdesk CSAT scores.
          </p>
        </div>
      </div>

      {/* Resolution Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs flex flex-col justify-between min-h-[110px]">
          <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Customer CSAT Average</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#111E16]">{averageCsat}</span>
            <span className="text-xs text-amber-500 font-bold flex items-center">
              ★ Rating
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs flex flex-col justify-between min-h-[110px]">
          <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Average Resolution Time</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#111E16]">14.5h</span>
            <span className="text-xs text-emerald-800 font-semibold bg-[#E8F8E9] px-2 py-0.5 rounded-md">Optimal</span>
          </div>
        </div>

        <div className="bg-[#00522E] text-white rounded-xl p-5 shadow-xs flex flex-col justify-between min-h-[110px]">
          <span className="text-[10px] font-bold text-white/70 tracking-wider uppercase block">Closure Ratio KPI</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold">94.8%</span>
            <span className="text-xs text-white/80 font-medium">92% Target</span>
          </div>
        </div>
      </div>

      {/* Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Closed Tickets Archive */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-xs overflow-hidden">
            <div className="bg-[#E8F8E9]/20 border-b border-[#BEC9BE]/40 p-4">
              <h3 className="text-sm font-bold text-[#111E16] uppercase tracking-wider">Archived Resolution Audit Logs</h3>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-3">
                <div className="h-10 bg-gray-50 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-50 rounded animate-pulse"></div>
              </div>
            ) : closedArchive.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#111E16]">No Closed Tickets</h3>
                <p className="text-xs text-[#6F7A70] mt-1 max-w-sm">
                  There are no archived closed tickets. Run resolutions to populate.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-[#BEC9BE]/40 text-xs font-bold text-[#6F7A70] tracking-wider uppercase">
                      <th className="px-6 py-4">Ticket</th>
                      <th className="px-6 py-4">Closed Date</th>
                      <th className="px-6 py-4">Feedback score</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BEC9BE]/30 text-sm text-[#111E16]">
                    {closedArchive.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-[#00522E]">
                          <div>
                            <span>{t.id}</span>
                            <span className="text-[10px] text-[#6F7A70] block font-sans font-semibold mt-0.5">{t.customerName}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                          {t.closedDate || t.updatedDate}
                        </td>

                        <td className="px-6 py-4">
                          {t.feedbackRating !== undefined ? (
                            <div className="flex items-center gap-1">
                              <span className="font-bold">{t.feedbackRating}</span>
                              <span className="text-amber-500 text-xs">★</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">No rating</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewingArchiveTicket(t)}
                              className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-[#F6F6F6] text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Summary
                            </button>
                            <button
                              onClick={() => setConfirmReopenTicketId(t.id)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Reopen
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

        {/* Right Column: Interactive Closure Tool */}
        <div className="space-y-6">
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <svg className="w-5 h-5 text-emerald-800" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-sm font-bold text-[#111E16]">Interactive Closure Form</h4>
            </div>

            <form onSubmit={handleCloseSubmit} className="space-y-4">
              {/* Select Ticket */}
              <div>
                <label className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider mb-1.5">Select Active Ticket</label>
                <select
                  value={targetTicketId}
                  onChange={(e) => setTargetTicketId(e.target.value)}
                  className="w-full bg-white text-xs font-bold text-[#111E16] rounded-lg px-3 py-2.5 border border-[#BEC9BE]/60 cursor-pointer focus:border-[#00522E] outline-none"
                >
                  <option value="">Choose Ticket...</option>
                  {activeTickets.map(t => (
                    <option key={t.id} value={t.id}>{t.id} - {t.customerName} ({t.priority})</option>
                  ))}
                </select>
              </div>

              {/* Resolution Category */}
              <div>
                <label className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider mb-1.5">Resolution Category</label>
                <select
                  value={resolutionCategory}
                  onChange={(e) => setResolutionCategory(e.target.value)}
                  className="w-full bg-white text-xs font-bold text-[#111E16] rounded-lg px-3 py-2.5 border border-[#BEC9BE]/60 cursor-pointer focus:border-[#00522E] outline-none"
                >
                  <option value="Bug Fix Deployed">Bug Fix Deployed</option>
                  <option value="Tenant Config Adjusted">Tenant Config Adjusted</option>
                  <option value="Refund Actioned">Refund Actioned</option>
                  <option value="Billing Corrected">Billing Corrected</option>
                  <option value="Customer Educated">Customer Educated / FAQ</option>
                </select>
              </div>

              {/* Resolution Summary */}
              <div>
                <label className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider mb-1.5">Resolution Summary Notes</label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Summarize the action taken to resolve this ticket in the database..."
                  className="w-full bg-white text-xs font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE] focus:border-[#00522E] outline-none"
                />
              </div>

              {/* Survey Simulation */}
              <div className="pt-2 border-t border-gray-100">
                <span className="block text-[10px] font-bold text-[#6F7A70] uppercase mb-1.5">Mock Customer Survey Rating</span>
                <div className="flex items-center gap-3">
                  <div className="flex text-amber-500 gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCsatRating(star)}
                        className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <svg className={`w-5 h-5 ${star <= csatRating ? 'fill-current' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-700">{csatRating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider mb-1.5">Mock Customer Comment</label>
                <input
                  type="text"
                  value={csatComment}
                  onChange={(e) => setCsatComment(e.target.value)}
                  placeholder="Simulated feedback (e.g. 'Very fast reply!')"
                  className="w-full bg-white text-xs font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE] focus:border-[#00522E] outline-none"
                />
              </div>

              {/* Notification Switch */}
              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-bold text-[#6F7A70]">Send Resolution Notification</span>
                <button
                  type="button"
                  onClick={() => setSendNotification(!sendNotification)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    sendNotification ? 'bg-[#00522E]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      sendNotification ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                disabled={!targetTicketId || !resolutionNotes.trim()}
                className="w-full py-2.5 bg-[#00522E] hover:bg-[#003B21] disabled:bg-[#BEC9BE] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer text-center"
              >
                Action Resolution & Close
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
