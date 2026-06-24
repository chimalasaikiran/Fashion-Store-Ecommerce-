import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTickets, type Ticket, type TicketAttachment } from './TicketsContext';

export default function TicketDetails() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { 
    tickets, 
    agents, 
    categories, 
    addReply, 
    addNote, 
    assignTicket, 
    updatePriority, 
    updateStatus,
    uploadAttachment 
  } = useTickets();

  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  
  const [activeTab, setActiveTab] = useState<'reply' | 'note'>('reply');
  const [editorText, setEditorText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');
  const [isTimelineOpen, setIsTimelineOpen] = useState(true);

  
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  const chatEndRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    let resolvedTicket: Ticket | undefined;
    if (id) {
      const parsedId = `#TK-${id}`;
      resolvedTicket = tickets.find(t => t.id === parsedId);
    }
    
    if (!resolvedTicket && tickets.length > 0) {
      
      resolvedTicket = tickets[0];
    }

    setSelectedTicket(resolvedTicket || null);
  }, [id, tickets]);

  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages, selectedTicket?.notes]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !editorText.trim()) return;

    if (activeTab === 'reply') {
      addReply(selectedTicket.id, editorText.trim(), 'Agent');
      showToast(`Reply sent to ${selectedTicket.customerName}.`, 'success');
    } else {
      addNote(selectedTicket.id, editorText.trim());
      showToast('Internal note added.', 'success');
    }
    setEditorText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTicket || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const newAttach: TicketAttachment = {
      name: file.name,
      size: `${(file.size / 1024).toFixed(0)} KB`,
      type: file.type
    };

    uploadAttachment(selectedTicket.id, newAttach);
    showToast(`File "${file.name}" uploaded successfully.`, 'success');
  };

  const getPriorityStyles = (p: Ticket['priority']) => {
    switch (p) {
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-green-50 text-green-700 border-green-200';
      case 'LOW': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusStyles = (s: Ticket['status']) => {
    switch (s) {
      case 'Open': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Escalated': return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Closed': return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  if (!selectedTicket) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
        <h3 className="text-lg font-bold text-[#111E16]">No tickets available</h3>
        <p className="text-sm text-[#6F7A70] mt-2">Create tickets or refresh data to view details.</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/tickets')}
            className="p-2 bg-white hover:bg-[#F6F6F6] border border-[#BEC9BE]/60 rounded-lg text-[#111E16] cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-[#111E16] font-mono">{selectedTicket.id}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPriorityStyles(selectedTicket.priority)}`}>
                {selectedTicket.priority}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(selectedTicket.status)}`}>
                {selectedTicket.status}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#6F7A70] mt-1">{selectedTicket.subject}</h3>
          </div>
        </div>

        {}
        <div className="flex items-center gap-2">
          {selectedTicket.status !== 'Escalated' && selectedTicket.status !== 'Closed' && (
            <button
              onClick={() => navigate(`/dashboard/tickets/escalation?id=${selectedTicket.id.replace('#TK-', '')}`)}
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Escalate Ticket
            </button>
          )}
          {selectedTicket.status !== 'Closed' ? (
            <button
              onClick={() => navigate(`/dashboard/tickets/closure?id=${selectedTicket.id.replace('#TK-', '')}`)}
              className="px-4 py-2.5 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
            >
              Close Ticket
            </button>
          ) : (
            <button
              onClick={() => navigate(`/dashboard/tickets/closure?id=${selectedTicket.id.replace('#TK-', '')}`)}
              className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Reopen / Logs
            </button>
          )}
        </div>
      </div>

      {}
      {!id && (
        <div className="bg-[#E8F8E9]/30 border border-[#BEC9BE]/40 p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6F7A70] uppercase">Selected Ticket:</span>
            <select
              value={selectedTicket.id}
              onChange={(e) => {
                const found = tickets.find(t => t.id === e.target.value);
                if (found) setSelectedTicket(found);
              }}
              className="bg-white text-xs font-bold text-[#111E16] border border-[#BEC9BE] rounded-lg px-2.5 py-1.5 cursor-pointer outline-none"
            >
              {tickets.map(t => (
                <option key={t.id} value={t.id}>{t.id} - {t.customerName} ({t.priority})</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-[#6F7A70] italic">Showing general tickets editor interface</span>
        </div>
      )}

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {}
          <div className="bg-white border border-[#BEC9BE] rounded-xl overflow-hidden shadow-xs flex flex-col h-[500px]">
            {}
            <div className="bg-[#E8F8E9]/20 border-b border-[#BEC9BE]/40 p-4 flex items-center justify-between">
              <span className="text-xs font-bold text-[#6F7A70] uppercase tracking-wider">Conversation Log & Activity</span>
              <span className="text-xs text-[#6F7A70] font-mono">SLA Due: {selectedTicket.slaDue}</span>
            </div>

            {}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
              {selectedTicket.messages.map((msg) => {
                const isAgent = msg.sender === 'Agent';
                const isSystem = msg.sender === 'System';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="bg-gray-100/80 border border-gray-200 text-gray-600 rounded-lg px-4 py-2 text-xs font-medium max-w-md text-center">
                        <span className="font-bold">{msg.senderName}:</span> {msg.text}
                        <span className="block text-[9px] text-gray-400 mt-0.5">{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isAgent ? 'ml-auto flex-row-reverse' : ''}`}>
                    {}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isAgent ? 'bg-[#00522E] text-white' : 'bg-[#DCECDE] text-[#00522E]'
                    }`}>
                      {isAgent ? 'AG' : msg.avatar || 'CU'}
                    </div>

                    {}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#111E16]">{msg.senderName}</span>
                        <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                      </div>
                      <div className={`p-3.5 rounded-2xl text-sm leading-relaxed border shadow-xs ${
                        isAgent 
                          ? 'bg-[#00522E] text-white border-[#00522E] rounded-tr-none' 
                          : 'bg-white text-[#111E16] border-[#BEC9BE]/60 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}

              {}
              {selectedTicket.notes.length > 0 && (
                <div className="border-t border-[#BEC9BE]/30 pt-6 mt-6">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-4">Internal Team Notes</span>
                  <div className="space-y-4">
                    {selectedTicket.notes.map(n => (
                      <div key={n.id} className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          NOTE
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-amber-900">{n.author}</span>
                            <span className="text-[10px] text-amber-700">{n.timestamp}</span>
                          </div>
                          <p className="text-sm text-amber-950 leading-relaxed font-medium">{n.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {}
            <form onSubmit={handleSendMessage} className="border-t border-[#BEC9BE]/50 p-4 bg-white space-y-4">
              {}
              <div className="flex items-center justify-between">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveTab('reply')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      activeTab === 'reply' 
                        ? 'bg-[#00522E] text-white shadow-xs' 
                        : 'text-[#6F7A70] hover:text-[#111E16]'
                    }`}
                  >
                    Reply to Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('note')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      activeTab === 'note' 
                        ? 'bg-amber-100 text-amber-900 shadow-xs' 
                        : 'text-[#6F7A70] hover:text-[#111E16]'
                    }`}
                  >
                    Add Internal Note
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,application/pdf,.csv,.json"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 border border-gray-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <span>Attach File</span>
                  </button>
                </div>
              </div>

              {}
              <div className="relative">
                <textarea
                  rows={3}
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  placeholder={activeTab === 'reply' ? 'Type your customer message response here...' : 'Write an internal system note only visible to team staff...'}
                  className={`w-full text-sm font-semibold rounded-lg px-4 py-3 border outline-none ${
                    activeTab === 'reply' 
                      ? 'bg-white border-[#BEC9BE] focus:border-[#00522E]' 
                      : 'bg-amber-50/20 border-amber-200 focus:border-amber-500'
                  }`}
                />
              </div>

              {}
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={!editorText.trim()}
                  className={`px-6 py-2.5 rounded-lg text-xs font-bold shadow transition-all cursor-pointer disabled:bg-[#BEC9BE] disabled:text-white ${
                    activeTab === 'reply' 
                      ? 'bg-[#00522E] hover:bg-[#003B21] text-white' 
                      : 'bg-amber-700 hover:bg-amber-800 text-white'
                  }`}
                >
                  {activeTab === 'reply' ? 'Send Response' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {}
        <div className="space-y-6">
          {}
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#111E16] border-b border-gray-100 pb-3">Ticket Information</h4>

            <div className="space-y-4">
              {}
              <div>
                <label className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={selectedTicket.category}
                  onChange={() => {
                    
                    
                    
                    showToast('Ticket category updated.', 'success');
                  }}
                  className="w-full bg-[#F6F6F6] text-xs font-bold text-[#111E16] rounded-lg px-3 py-2 border border-[#BEC9BE]/60 cursor-pointer focus:border-[#00522E]"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {}
              <div>
                <label className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider mb-1.5">Priority</label>
                <select
                  value={selectedTicket.priority}
                  onChange={(e) => {
                    updatePriority(selectedTicket.id, e.target.value as Ticket['priority']);
                    showToast('Ticket priority modified.', 'success');
                  }}
                  className="w-full bg-[#F6F6F6] text-xs font-bold text-[#111E16] rounded-lg px-3 py-2 border border-[#BEC9BE]/60 cursor-pointer focus:border-[#00522E]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              {}
              <div>
                <label className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider mb-1.5">Assigned Agent</label>
                <select
                  value={selectedTicket.assignedAgent === 'Unassigned' ? '' : selectedTicket.assignedAgent}
                  onChange={(e) => {
                    assignTicket(selectedTicket.id, e.target.value || 'Unassigned');
                    showToast('Ticket owner reassigned.', 'success');
                  }}
                  className="w-full bg-[#F6F6F6] text-xs font-bold text-[#111E16] rounded-lg px-3 py-2 border border-[#BEC9BE]/60 cursor-pointer focus:border-[#00522E]"
                >
                  <option value="">Select Agent...</option>
                  {agents.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {}
              <div>
                <label className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider mb-1.5">Status</label>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => {
                    updateStatus(selectedTicket.id, e.target.value as Ticket['status']);
                    showToast('Ticket status changed.', 'success');
                  }}
                  className="w-full bg-[#F6F6F6] text-xs font-bold text-[#111E16] rounded-lg px-3 py-2 border border-[#BEC9BE]/60 cursor-pointer focus:border-[#00522E]"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {}
            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-[9px] font-bold text-[#6F7A70] uppercase">Created Date</span>
                <span className="font-semibold text-[#111E16] block mt-0.5">{selectedTicket.createdDate}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-[#6F7A70] uppercase">Last Updated</span>
                <span className="font-semibold text-[#111E16] block mt-0.5">{selectedTicket.updatedDate}</span>
              </div>
            </div>
          </div>

          {}
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-[#111E16] border-b border-gray-100 pb-2">Customer Information</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6F7A70] font-medium">Name</span>
                <span className="font-bold text-[#111E16]">{selectedTicket.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6F7A70] font-medium">Email</span>
                <span className="font-semibold text-[#111E16] truncate max-w-[170px]">{selectedTicket.customerEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6F7A70] font-medium">SLA Class</span>
                <span className="px-2 py-0.5 bg-[#E8F8E9] text-[#00522E] rounded-md font-bold text-[10px]">GOLD TIER</span>
              </div>
            </div>
          </div>

          {}
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#111E16] border-b border-gray-100 pb-2">Files & Attachments ({selectedTicket.attachments.length})</h4>
            {selectedTicket.attachments.length === 0 ? (
              <p className="text-xs text-[#6F7A70] italic">No files attached to this ticket.</p>
            ) : (
              <div className="space-y-2">
                {selectedTicket.attachments.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[70%]">
                      <svg className="w-4 h-4 text-[#00522E] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-semibold truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={() => showToast(`File download simulated: ${file.name}`, 'info')}
                      className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded text-[10px] font-bold text-gray-700 cursor-pointer"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {}
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-4">
            <button
              onClick={() => setIsTimelineOpen(!isTimelineOpen)}
              className="w-full flex items-center justify-between text-sm font-bold text-[#111E16] border-b border-gray-100 pb-2 cursor-pointer"
            >
              <span>Audit Trail Timeline</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${isTimelineOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isTimelineOpen && (
              <div className="space-y-4 pt-2">
                {selectedTicket.timeline.map((act) => (
                  <div key={act.id} className="relative pl-5 border-l-2 border-[#DCECDE] pb-2 last:pb-0">
                    {}
                    <div className="absolute -left-[6px] top-1.5 w-[10px] h-[10px] rounded-full bg-[#00522E]"></div>
                    <div className="text-xs">
                      <span className="font-bold text-[#111E16] block">{act.action}</span>
                      <span className="text-[10px] text-[#6F7A70] block mt-0.5">By {act.actor} • {act.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
