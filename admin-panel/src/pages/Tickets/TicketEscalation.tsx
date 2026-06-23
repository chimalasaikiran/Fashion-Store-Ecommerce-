import React, { useState, useEffect } from 'react';
import { useTickets, type Ticket } from './TicketsContext';

export default function TicketEscalation() {
  const { tickets, agents, escalateTicket, assignTicket, updateStatus } = useTickets();

  // Loading and alerts
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  // Escalation Form states
  const [targetTicketId, setTargetTicketId] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [escalateToDept, setEscalateToDept] = useState('Tier-2 Technical Support');

  // Selected ticket states for action modals
  const [selectedTicketForReassign, setSelectedTicketForReassign] = useState<Ticket | null>(null);
  const [reassignAgent, setReassignAgent] = useState('');

  const [selectedTicketForNote, setSelectedTicketForNote] = useState<Ticket | null>(null);
  const [escalationNoteText, setEscalationNoteText] = useState('');

  // Rules mockup config toggle
  const [autoRulesActive, setAutoRulesActive] = useState(true);

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

  const handleEscalateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTicketId || !escalationReason.trim()) {
      showToast('Please select a ticket and state the reason.', 'error');
      return;
    }

    escalateTicket(targetTicketId, escalationReason.trim(), escalateToDept);
    showToast(`Ticket ${targetTicketId} successfully escalated to ${escalateToDept}.`, 'success');
    
    // Reset
    setTargetTicketId('');
    setEscalationReason('');
  };

  const handleReassignAction = () => {
    if (!selectedTicketForReassign || !reassignAgent) return;
    assignTicket(selectedTicketForReassign.id, reassignAgent);
    showToast(`Ticket ${selectedTicketForReassign.id} reassigned to ${reassignAgent}.`, 'success');
    setSelectedTicketForReassign(null);
    setReassignAgent('');
  };

  const handleAddNoteAction = () => {
    if (!selectedTicketForNote || !escalationNoteText.trim()) return;
    // We can simulate adding escalation notes by updating timeline or writing internal notes
    // In our context:
    showToast(`Escalation note added to ${selectedTicketForNote.id}.`, 'success');
    setSelectedTicketForNote(null);
    setEscalationNoteText('');
  };

  const handleResolveAction = (ticketId: string) => {
    updateStatus(ticketId, 'Resolved');
    showToast(`Escalated ticket ${ticketId} resolved successfully.`, 'success');
  };

  const handleNotificationAction = (t: Ticket) => {
    showToast(`Supervisor notification alert dispatched for ticket ${t.id}.`, 'info');
  };

  // Filter escalated tickets
  const escalatedQueue = tickets.filter(t => t.status === 'Escalated' || t.priority === 'CRITICAL');
  const nonEscalatedTickets = tickets.filter(t => t.status !== 'Escalated' && t.status !== 'Closed');

  // SLA statistics
  const activeBreaches = tickets.filter(t => t.slaStatus === 'Breached' && t.status !== 'Closed' && t.status !== 'Resolved');
  const slaWarning = tickets.filter(t => t.slaStatus === 'Warning' && t.status !== 'Closed' && t.status !== 'Resolved');

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

      {/* Reassign Agent Modal */}
      {selectedTicketForReassign && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-2xl p-6 max-w-sm w-full animate-scale-in">
            <h4 className="text-lg font-bold text-[#111E16]">Reassign Agent</h4>
            <p className="text-xs text-[#6F7A70] mt-1">Change owner for escalated ticket {selectedTicketForReassign.id}.</p>
            <div className="mt-4">
              <select
                value={reassignAgent}
                onChange={(e) => setReassignAgent(e.target.value)}
                className="w-full bg-white text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none cursor-pointer"
              >
                <option value="">Select Agent...</option>
                {agents.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedTicketForReassign(null)}
                className="px-4 py-2 text-xs font-bold text-[#6F7A70] hover:text-[#111E16] bg-white border border-[#BEC9BE] rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignAction}
                disabled={!reassignAgent}
                className="px-4 py-2 text-xs font-bold text-white bg-[#00522E] hover:bg-[#003B21] disabled:bg-[#BEC9BE] rounded-lg shadow-sm cursor-pointer"
              >
                Confirm Reassign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Notes Modal */}
      {selectedTicketForNote && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-2xl p-6 max-w-md w-full animate-scale-in">
            <h4 className="text-lg font-bold text-[#111E16]">Add Escalation Notes</h4>
            <p className="text-xs text-[#6F7A70] mt-1">State update details for escalated ticket {selectedTicketForNote.id}.</p>
            <div className="mt-4">
              <textarea
                rows={3}
                value={escalationNoteText}
                onChange={(e) => setEscalationNoteText(e.target.value)}
                placeholder="Log internal details about call logs, customer sentiment, or tech diagnostic update..."
                className="w-full bg-white text-sm text-[#111E16] font-semibold rounded-lg px-4 py-3 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedTicketForNote(null)}
                className="px-4 py-2 text-xs font-bold text-[#6F7A70] hover:text-[#111E16] bg-white border border-[#BEC9BE] rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNoteAction}
                disabled={!escalationNoteText.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-[#00522E] hover:bg-[#003B21] disabled:bg-[#BEC9BE] rounded-lg shadow-sm cursor-pointer"
              >
                Save Log Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16] flex items-center gap-2">
            Ticket Escalation Centre
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Resolve SLA violations, dispatch notifications, and manage high-priority customer complaints.
          </p>
        </div>
      </div>

      {/* SLA Breach Alert Banner */}
      {(activeBreaches.length > 0 || slaWarning.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 text-red-700 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-red-950">SLA Breach Warning Threshold Detected</h4>
              <p className="text-xs text-red-700 mt-0.5">
                We have {activeBreaches.length} ticket(s) currently breaching SLA targets and {slaWarning.length} nearing warning thresholds. Direct operator review is advised.
              </p>
            </div>
          </div>
          <button
            onClick={() => showToast('Dispatched warning broadcasts to online representatives.', 'info')}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer whitespace-nowrap"
          >
            Dispatch Warning Broadcasts
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Grid: Escalation Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-xs overflow-hidden">
            <div className="bg-[#E8F8E9]/20 border-b border-[#BEC9BE]/40 p-4">
              <h3 className="text-sm font-bold text-[#111E16] uppercase tracking-wider">Escalated Queue ({escalatedQueue.length})</h3>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-4">
                <div className="h-10 bg-gray-50 rounded-lg animate-pulse"></div>
                <div className="h-10 bg-gray-50 rounded-lg animate-pulse"></div>
              </div>
            ) : escalatedQueue.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-[#00522E]/10 text-[#00522E] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#111E16]">Escalation Queue is Empty</h3>
                <p className="text-xs text-[#6F7A70] mt-1 max-w-sm">
                  Excellent! No tickets are currently escalated or flagged as Critical.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-[#BEC9BE]/40 text-xs font-bold text-[#6F7A70] tracking-wider uppercase">
                      <th className="px-6 py-4">Ticket</th>
                      <th className="px-6 py-4">SLA status</th>
                      <th className="px-6 py-4">Escalation target / Reason</th>
                      <th className="px-6 py-4 text-right">Queue actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BEC9BE]/30 text-sm text-[#111E16]">
                    {escalatedQueue.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 max-w-[180px]">
                          <div>
                            <span className="font-mono font-bold text-[#00522E] block">{t.id}</span>
                            <span className="font-semibold block truncate mt-0.5">{t.subject}</span>
                            <span className="text-[10px] text-[#6F7A70] block">Owner: {t.assignedAgent}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            t.slaStatus === 'Breached' 
                              ? 'bg-red-50 text-red-800 border-red-200' 
                              : t.slaStatus === 'Warning' 
                              ? 'bg-amber-50 text-amber-800 border-amber-200' 
                              : 'bg-green-50 text-green-800 border-green-200'
                          }`}>
                            {t.slaStatus}
                          </span>
                        </td>

                        <td className="px-6 py-4 max-w-xs">
                          <div>
                            <span className="text-xs font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded-md inline-block">
                              Routed to: {t.escalatedTo || 'Fraud Ops Support Desk'}
                            </span>
                            <p className="text-xs text-[#6F7A70] mt-1.5 leading-relaxed font-semibold italic">
                              "{t.escalationReason || 'High dispute value alert triggered by auto protection daemon.'}"
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Reassign */}
                            <button
                              onClick={() => {
                                setSelectedTicketForReassign(t);
                                setReassignAgent(t.assignedAgent === 'Unassigned' ? '' : t.assignedAgent);
                              }}
                              title="Reassign Ticket"
                              className="px-2 py-1.5 bg-white border border-gray-300 hover:bg-[#F6F6F6] text-gray-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                            >
                              Reassign
                            </button>

                            {/* Add log notes */}
                            <button
                              onClick={() => {
                                setSelectedTicketForNote(t);
                              }}
                              title="Add Note"
                              className="px-2 py-1.5 bg-white border border-gray-300 hover:bg-[#F6F6F6] text-gray-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                            >
                              Add Note
                            </button>

                            {/* Notify */}
                            <button
                              onClick={() => handleNotificationAction(t)}
                              title="Send Warning Alert Notification"
                              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-600 cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>

                            {/* Resolve */}
                            <button
                              onClick={() => handleResolveAction(t.id)}
                              title="Resolve & Remove from Queue"
                              className="px-2.5 py-1.5 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                            >
                              Resolve
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

        {/* Right Grid: Escalation tool & Auto rules panel */}
        <div className="space-y-6">
          {/* Manual Escalation Form Card */}
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              <h4 className="text-sm font-bold text-[#111E16]">Manual Escalation Desk</h4>
            </div>

            <form onSubmit={handleEscalateSubmit} className="space-y-4">
              {/* Select Ticket */}
              <div>
                <label className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider mb-1.5">Select Active Ticket</label>
                <select
                  value={targetTicketId}
                  onChange={(e) => setTargetTicketId(e.target.value)}
                  className="w-full bg-white text-xs font-bold text-[#111E16] rounded-lg px-3 py-2.5 border border-[#BEC9BE]/60 cursor-pointer focus:border-[#00522E] outline-none"
                >
                  <option value="">Choose Ticket...</option>
                  {nonEscalatedTickets.map(t => (
                    <option key={t.id} value={t.id}>{t.id} - {t.customerName} ({t.priority})</option>
                  ))}
                </select>
              </div>

              {/* Escalate to department */}
              <div>
                <label className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider mb-1.5">Escalation Target Dept</label>
                <select
                  value={escalateToDept}
                  onChange={(e) => setEscalateToDept(e.target.value)}
                  className="w-full bg-white text-xs font-bold text-[#111E16] rounded-lg px-3 py-2.5 border border-[#BEC9BE]/60 cursor-pointer focus:border-[#00522E] outline-none"
                >
                  <option value="Tier-2 Technical Support">Tier-2 Technical Support</option>
                  <option value="Fraud Ops & Dispute Desk">Fraud Ops & Dispute Desk</option>
                  <option value="IAM Access Management Team">IAM Access Management Team</option>
                  <option value="Executive Relations Escalations">Executive Relations Escalations</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider mb-1.5">Escalation Reason Notes</label>
                <textarea
                  rows={3}
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="State the justification for upgrading SLA tracking & routing to supervisor desk..."
                  className="w-full bg-white text-xs font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE] focus:border-[#00522E] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!targetTicketId || !escalationReason.trim()}
                className="w-full py-2.5 bg-[#00522E] hover:bg-[#003B21] disabled:bg-[#BEC9BE] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer text-center"
              >
                Trigger Manual Escalation
              </button>
            </form>
          </div>

          {/* Automatic Escalation Engine config Panel */}
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-800" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h4 className="text-sm font-bold text-[#111E16]">Auto-Escalation Engine</h4>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => {
                  setAutoRulesActive(!autoRulesActive);
                  showToast(`Automatic rules engine ${!autoRulesActive ? 'activated' : 'deactivated'}.`, 'info');
                }}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoRulesActive ? 'bg-[#00522E]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    autoRulesActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Rules list */}
            <div className="space-y-3.5">
              {/* Rule 1 */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">SLA Critical Auto-Route</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                    autoRulesActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {autoRulesActive ? 'ACTIVE' : 'MUTED'}
                  </span>
                </div>
                <p className="text-[#6F7A70] mt-1.5 font-semibold">
                  If ticket Priority is <span className="text-red-700 font-bold">CRITICAL</span> and remains unassigned for &gt; 30 mins, trigger supervisor push & assign to Tier-2 Tech queue.
                </p>
              </div>

              {/* Rule 2 */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">Fraud Protection Audit</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                    autoRulesActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {autoRulesActive ? 'ACTIVE' : 'MUTED'}
                  </span>
                </div>
                <p className="text-[#6F7A70] mt-1.5 font-semibold">
                  Automatically route tickets containing "unauthorized refund" or "credentials stolen" keywords to the Risk & Security department instantly.
                </p>
              </div>

              {/* Rule 3 */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">SLA Breach Warning Warning</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                    autoRulesActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {autoRulesActive ? 'ACTIVE' : 'MUTED'}
                  </span>
                </div>
                <p className="text-[#6F7A70] mt-1.5 font-semibold">
                  Send slack webhook alert to Helpdesk Manager if an active ticket enters the 15-minute SLA breach warning threshold window.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
