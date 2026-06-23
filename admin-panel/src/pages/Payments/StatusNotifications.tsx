import React, { useState, useEffect } from 'react';
import { usePayments, type StatusNotification, type NotificationTemplate } from './PaymentsContext';

export default function StatusNotifications() {
  const { notifications, templates, sendManualNotification, resendNotification, updateTemplate } = usePayments();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'templates'>('logs');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] = useState<NotificationTemplate | null>(null);

  const [formChannel, setFormChannel] = useState<'Email' | 'SMS' | 'Push'>('Email');
  const [formRecipient, setFormRecipient] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formEvent, setFormEvent] = useState('');
  const [formError, setFormError] = useState('');

  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEventSelect = (tplId: string) => {
    const template = templates.find(t => t.id === tplId);
    if (template) {
      setFormEvent(template.eventName);
      setFormChannel(template.channel);
      setFormTitle(template.subject || `${template.eventName} Notification`);
      setFormBody(template.body);
    }
  };

  const handleSendManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRecipient.trim() || !formBody.trim() || !formTitle.trim() || !formEvent.trim()) {
      setFormError('All fields must be filled.');
      return;
    }

    sendManualNotification({
      type: formChannel,
      recipient: formRecipient,
      title: formTitle,
      body: formBody,
      event: formEvent
    });

    showToast('Notification dispatched to gateway.', 'success');
    setIsSendModalOpen(false);

    setFormChannel('Email');
    setFormRecipient('');
    setFormTitle('');
    setFormBody('');
    setFormEvent('');
    setFormError('');
  };

  const handleResend = (notif: StatusNotification) => {
    resendNotification(notif.id);
    showToast(`Notification ${notif.id} re-dispatched.`, 'success');
  };

  const handleEditTemplateSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateForEdit || !editBody.trim()) return;

    updateTemplate(selectedTemplateForEdit.id, editSubject, editBody);
    showToast(`Template '${selectedTemplateForEdit.eventName}' updated.`, 'success');
    setSelectedTemplateForEdit(null);
  };

  const filteredNotifications = notifications.filter(notif => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      notif.id.toLowerCase().includes(query) ||
      notif.recipient.toLowerCase().includes(query) ||
      notif.title.toLowerCase().includes(query) ||
      notif.event.toLowerCase().includes(query);

    const matchesChannel = channelFilter === 'All' || notif.type === channelFilter;

    return matchesSearch && matchesChannel;
  });

  const totalItems = filteredNotifications.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const totalNotifs = notifications.length;
  const deliveredNotifs = notifications.filter(n => n.status === 'Sent').length;
  const pendingNotifs = notifications.filter(n => n.status === 'Pending').length;
  const failedNotifs = notifications.filter(n => n.status === 'Failed').length;

  return (
    <div className="space-y-6 relative select-none">
      {toast && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3.5 bg-white border border-[#BEC9BE] rounded-xl shadow-xl animate-slide-in-right">
          <div className={`w-3 h-3 rounded-full ${
            toast.type === 'success' ? 'bg-[#00522E]' : toast.type === 'error' ? 'bg-[#BA1A1A]' : 'bg-[#F8B057]'
          }`}></div>
          <span className="text-sm font-bold text-[#111E16]">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16]">
            Status Notifications
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Dispatch alerts and configure communications regarding payments, orders, and delivery statuses.
          </p>
        </div>
        
        <button
          onClick={() => {
            setIsSendModalOpen(true);
            if (templates.length > 0) {
              handleEventSelect(templates[0].id);
            }
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-sm font-bold shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12a3 3 0 10-6 0 3 3 0 006 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z M12 9v2m0 4h.01" />
          </svg>
          <span>Send Custom Alert</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#E2F2E3] text-[#00522E] rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742a3 3 0 11-5.684 0M19.008 19H3v-1a6 6 0 0112 0v1z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase">Log History</span>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Dispatched</span>
            <span className="text-2xl font-extrabold text-[#111E16] block">
              {isLoading ? '...' : totalNotifs}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Delivered
            </span>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Successful</span>
            <span className="text-2xl font-extrabold text-[#00522E] block">
              {isLoading ? '...' : deliveredNotifs}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              In Transit
            </span>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Pending Queue</span>
            <span className="text-2xl font-extrabold text-amber-800 block">
              {isLoading ? '...' : pendingNotifs}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
              Gateway error
            </span>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Failed Deliveries</span>
            <span className="text-2xl font-extrabold text-[#BA1A1A] block">
              {isLoading ? '...' : failedNotifs}
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-[#BEC9BE]/60 flex items-center gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 border-b-2 cursor-pointer transition-all duration-150 ${
            activeTab === 'logs' ? 'border-[#00522E] text-[#00522E]' : 'border-transparent text-[#6F7A70] hover:text-[#111E16]'
          }`}
        >
          Notification Logs Audit
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 border-b-2 cursor-pointer transition-all duration-150 ${
            activeTab === 'templates' ? 'border-[#00522E] text-[#00522E]' : 'border-transparent text-[#6F7A70] hover:text-[#111E16]'
          }`}
        >
          Message Templates Customizer
        </button>
      </div>

      {activeTab === 'logs' ? (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[280px]">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6F7A70]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search audit logs by recipient, title, or event context..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#F6F6F6] text-sm text-[#111E16] font-semibold rounded-lg pl-11 pr-4 py-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <div>
                <select
                  value={channelFilter}
                  onChange={(e) => {
                    setChannelFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white text-xs font-bold text-[#111E16] border border-[#BEC9BE] rounded-lg px-3 py-2.5 cursor-pointer hover:bg-[#F6F6F6]"
                >
                  <option value="All">All Channels</option>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="Push">Push App</option>
                </select>
              </div>

              {(searchQuery || channelFilter !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setChannelFilter('All');
                    showToast('Logs filters reset', 'info');
                  }}
                  className="px-3 py-2 text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#BEC9BE] rounded-xl overflow-hidden shadow-xs">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-1/4"></div>
                <div className="space-y-2 pt-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-50 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ) : paginatedNotifications.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-[#F8B057]/10 text-[#401900] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#111E16]">No notifications logged</h3>
                <p className="text-sm text-[#6F7A70]">There are no delivery log entries matching the filter settings.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#E8F8E9]/40 border-b border-[#BEC9BE]/60 text-xs font-bold text-[#6F7A70] tracking-wider uppercase select-none">
                      <th className="px-6 py-4">Notification ID</th>
                      <th className="px-6 py-4">Event Trigger</th>
                      <th className="px-6 py-4">Channel</th>
                      <th className="px-6 py-4">Recipient Info</th>
                      <th className="px-6 py-4">Message Subject/Header</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Sent Time</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BEC9BE]/30 text-sm">
                    {paginatedNotifications.map((notif) => (
                      <tr key={notif.id} className="hover:bg-[#E8F8E9]/20 transition-all duration-100">
                        <td className="px-6 py-4 font-mono font-bold text-[#00522E] text-xs">
                          {notif.id}
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#111E16]">
                          {notif.event}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            notif.type === 'Email' ? 'bg-blue-50 border-blue-200 text-blue-800' : notif.type === 'SMS' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-purple-50 border-purple-200 text-purple-800'
                          }`}>
                            {notif.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-[#111E16] text-xs">
                          {notif.recipient}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate text-[#6F7A70] text-xs">
                          {notif.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                            {notif.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#6F7A70] font-medium text-xs whitespace-nowrap">
                          {new Date(notif.date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleResend(notif)}
                            className="px-2 py-1 text-xs font-bold text-[#00522E] border border-[#BEC9BE] rounded bg-white hover:bg-[#F6F6F6]"
                            title="Resend Notification Alert"
                          >
                            Resend
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-[#E8F8E9]/10 border-t border-[#BEC9BE] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-semibold text-[#6F7A70]">
                Showing {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} log records
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                  className={`px-3 py-1.5 border border-[#BEC9BE] rounded-lg text-xs font-semibold ${
                    currentPage === 1 || isLoading ? 'opacity-40 cursor-not-allowed text-[#6F7A70]' : 'text-[#111E16] hover:bg-[#F6F6F6]'
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const p = idx + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold ${
                        p === currentPage ? 'bg-[#00522E] text-white' : 'text-[#111E16] hover:bg-[#F6F6F6]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || isLoading}
                  className={`px-3 py-1.5 border border-[#BEC9BE] rounded-lg text-xs font-semibold ${
                    currentPage === totalPages || isLoading ? 'opacity-40 cursor-not-allowed text-[#6F7A70]' : 'text-[#111E16] hover:bg-[#F6F6F6]'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {templates.map(tpl => (
            <div key={tpl.id} className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
              <div>
                <div className="flex items-center justify-between border-b border-[#BEC9BE]/40 pb-2.5 mb-3.5">
                  <div>
                    <h3 className="font-bold text-[#111E16] text-sm">{tpl.eventName}</h3>
                    <span className="text-[10px] text-[#6F7A70] tracking-wider uppercase font-mono">Template ID: {tpl.id}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    tpl.channel === 'Email' ? 'bg-blue-50 border-blue-200 text-blue-800' : tpl.channel === 'SMS' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-purple-50 border-purple-200 text-purple-800'
                  }`}>
                    {tpl.channel}
                  </span>
                </div>

                {tpl.subject && (
                  <div className="mb-2 text-xs">
                    <span className="font-bold text-[#6F7A70] block mb-0.5">Subject Template:</span>
                    <span className="text-[#111E16] font-semibold">{tpl.subject}</span>
                  </div>
                )}

                <div className="text-xs">
                  <span className="font-bold text-[#6F7A70] block mb-0.5">Message Body:</span>
                  <p className="bg-[#F6F6F6] text-[#111E16] font-medium p-2.5 rounded border border-[#BEC9BE]/30 leading-relaxed font-mono whitespace-pre-line text-[11px]">
                    {tpl.body}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-[#BEC9BE]/40 pt-3.5 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedTemplateForEdit(tpl);
                    setEditSubject(tpl.subject || '');
                    setEditBody(tpl.body);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-[#00522E] border border-[#BEC9BE] bg-white rounded-lg hover:bg-[#F6F6F6]"
                >
                  Configure Message Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTemplateForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-md shadow-2xl animate-scale-up overflow-hidden">
            <div className="bg-[#E8F8E9] px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#00522E]">Edit Template</h3>
                <span className="text-xs font-mono text-[#6F7A70]">{selectedTemplateForEdit.eventName}</span>
              </div>
              <button
                onClick={() => setSelectedTemplateForEdit(null)}
                className="text-[#6F7A70] hover:text-[#00522E] p-1 rounded-full hover:bg-white/60 transition-all cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditTemplateSave} className="p-6 space-y-4">
              {selectedTemplateForEdit.channel === 'Email' && (
                <div>
                  <label className="block text-xs font-bold text-[#111E16] mb-1">Subject Header</label>
                  <input
                    type="text"
                    required
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full bg-[#F6F6F6] text-xs text-[#111E16] rounded-lg p-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#111E16] mb-1">Message Body Markup</label>
                <textarea
                  required
                  rows={6}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full bg-[#F6F6F6] text-xs text-[#111E16] rounded-lg p-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none font-mono"
                />
                <span className="text-[10px] text-[#6F7A70] block mt-1.5">
                  Available tags: `{`{customerName}`}`, `{`{orderId}`}`, `{`{amount}`}`.
                </span>
              </div>

              <div className="border-t border-[#BEC9BE]/40 pt-4 flex justify-end gap-3 bg-[#F6F6F6] -mx-6 -mb-6 p-4">
                <button
                  type="button"
                  onClick={() => setSelectedTemplateForEdit(null)}
                  className="px-4 py-2 border border-[#BEC9BE] rounded-lg text-xs font-bold text-[#6F7A70] hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-xs font-bold shadow"
                >
                  Save Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-md shadow-2xl animate-scale-up overflow-hidden">
            <div className="bg-[#E8F8E9] px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#00522E]">Send Status Alert</h3>
              <button
                onClick={() => setIsSendModalOpen(false)}
                className="text-[#6F7A70] hover:text-[#00522E] p-1 rounded-full hover:bg-white/60 transition-all cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSendManualSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-[#BA1A1A] border border-red-200 text-xs font-bold rounded-lg p-3">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#111E16] mb-1">Preset Alert Type</label>
                <select
                  onChange={(e) => handleEventSelect(e.target.value)}
                  className="w-full bg-[#F6F6F6] text-xs font-semibold text-[#111E16] rounded-lg p-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none cursor-pointer"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.eventName} ({t.channel})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] mb-1">Recipient Address / Phone</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. customer@email.in or +91 98123 45678"
                  value={formRecipient}
                  onChange={(e) => setFormRecipient(e.target.value)}
                  className="w-full bg-[#F6F6F6] text-xs text-[#111E16] rounded-lg p-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] mb-1">Subject Header / Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#F6F6F6] text-xs text-[#111E16] rounded-lg p-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] mb-1">Message Body</label>
                <textarea
                  required
                  rows={4}
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  className="w-full bg-[#F6F6F6] text-xs text-[#111E16] rounded-lg p-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none font-mono"
                />
              </div>

              <div className="border-t border-[#BEC9BE]/40 pt-4 flex justify-end gap-3 bg-[#F6F6F6] -mx-6 -mb-6 p-4">
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(false)}
                  className="px-4 py-2 border border-[#BEC9BE] rounded-lg text-xs font-bold text-[#6F7A70] hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-xs font-bold shadow"
                >
                  Send Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
