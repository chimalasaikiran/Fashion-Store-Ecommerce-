import React, { useState, useEffect } from 'react';
import { usePayments, type CreditNote } from './PaymentsContext';
import { formatCurrency } from '../../data/mockDb';

export default function CreditNotes() {
  const { creditNotes, invoices, generateCreditNote, emailCreditNote } = usePayments();

  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<CreditNote | null>(null);

  const [formInvoiceRef, setFormInvoiceRef] = useState('');
  const [formRefundAmount, setFormRefundAmount] = useState<number>(0);
  const [formReason, setFormReason] = useState('');
  const [formError, setFormError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

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

  const handleInvoiceSelect = (invNum: string) => {
    setFormInvoiceRef(invNum);
    const invoice = invoices.find(i => i.number === invNum);
    if (invoice) {
      setFormRefundAmount(invoice.amount);
    }
  };

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInvoiceRef || formRefundAmount <= 0 || !formReason.trim()) {
      setFormError('All fields must be correctly filled.');
      return;
    }

    const selectedInv = invoices.find(i => i.number === formInvoiceRef);
    if (!selectedInv) {
      setFormError('Select a valid invoice reference.');
      return;
    }

    generateCreditNote({
      relatedInvoice: formInvoiceRef,
      customerName: selectedInv.customerName,
      refundAmount: formRefundAmount,
      reason: formReason
    });

    showToast('Credit note issued successfully.', 'success');
    setIsGenerateModalOpen(false);

    setFormInvoiceRef('');
    setFormRefundAmount(0);
    setFormReason('');
    setFormError('');
  };

  const handleEmailNote = (note: CreditNote) => {
    const success = emailCreditNote(note.number);
    if (success) {
      showToast(`Credit note email sent to customer.`, 'success');
    } else {
      showToast('Error emailing credit note.', 'error');
    }
  };

  const handlePrintPDF = (note: CreditNote) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popup blocker prevented print window.', 'error');
      return;
    }

    const html = `
      <html>
        <head>
          <title>Credit Note ${note.number}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #222; }
            .header { border-bottom: 2px solid #BA1A1A; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            .company { font-size: 24px; font-weight: bold; color: #BA1A1A; }
            .cn-title { font-size: 22px; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .lbl { font-size: 11px; text-transform: uppercase; color: #777; font-weight: bold; margin-bottom: 4px; }
            .val { font-size: 14px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { border-bottom: 2px solid #BA1A1A; padding: 12px 8px; text-align: left; background: #FFDAD6/30; font-size: 12px; }
            td { border-bottom: 1px solid #ddd; padding: 12px 8px; font-size: 13px; }
            .total-section { float: right; width: 300px; text-align: right; font-size: 14px; line-height: 2; }
            .total-amount { font-size: 18px; font-weight: bold; color: #BA1A1A; border-top: 2px solid #BA1A1A; margin-top: 10px; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">Fashion Store E-Commerce</div>
            <div class="cn-title">CREDIT MEMO / REFUND NOTE</div>
          </div>
          <div class="grid">
            <div>
              <div class="lbl">Customer Details</div>
              <div class="val">${note.customerName}</div>
            </div>
            <div style="text-align: right">
              <div class="lbl">Credit Note Details</div>
              <div class="val">Note No: ${note.number}</div>
              <div class="val">Related Invoice: ${note.relatedInvoice}</div>
              <div class="val">Issued Date: ${note.date}</div>
              <div class="val">Status: ${note.status.toUpperCase()}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Reason for Credit</th>
                <th style="text-align:right">Total Refund Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Refund Adjustment for related Invoice Reference ${note.relatedInvoice}</td>
                <td>${note.reason}</td>
                <td style="text-align:right">${formatCurrency(note.refundAmount)}</td>
              </tr>
            </tbody>
          </table>
          <div class="total-section">
            <div class="total-amount">Total Refunded: ${formatCurrency(note.refundAmount)}</div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    showToast('Credit Note PDF generated and print dialog opened.', 'success');
  };

  const filteredNotes = creditNotes.filter(cn => {
    const query = searchQuery.toLowerCase();
    return (
      cn.number.toLowerCase().includes(query) ||
      cn.relatedInvoice.toLowerCase().includes(query) ||
      cn.customerName.toLowerCase().includes(query) ||
      cn.reason.toLowerCase().includes(query)
    );
  });

  const totalItems = filteredNotes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotes = filteredNotes.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const totalRefundAmount = creditNotes.reduce((sum, cn) => sum + cn.refundAmount, 0);
  const totalNotesCount = creditNotes.length;

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
            Credit Notes
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Manage customer refunds, issue accounting-safe credit notes, and maintain audit trails.
          </p>
        </div>
        
        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#BA1A1A] hover:bg-[#930006] text-white rounded-lg text-sm font-bold shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7-7H5" />
          </svg>
          <span>Generate Credit Note</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-red-50 text-[#BA1A1A] rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase">Audit Memos</span>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Credit Notes</span>
            <span className="text-2xl font-extrabold text-[#111E16] block">
              {isLoading ? '...' : totalNotesCount}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-red-50 text-[#BA1A1A] rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-[#BA1A1A]">
              Refund Capital
            </span>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Refunded</span>
            <span className="text-2xl font-extrabold text-[#BA1A1A] block">
              {isLoading ? '...' : formatCurrency(totalRefundAmount)}
            </span>
          </div>
        </div>

        <div className="bg-[#00522E] text-white border border-[#00522E] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[120px] lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
              Compliance Standard
            </span>
            <span className="text-[10px] font-bold text-[#9CF6BB]">PCI COMPLIANT</span>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-lg font-bold block">Immutable Audit Trails</span>
            <p className="text-xs text-[#E2F2E3] leading-relaxed">
              Every refund generated here establishes a cryptographic link back to its corresponding purchase ledger invoice.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6F7A70]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search credit note reference, related invoice, customer, or reason..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#F6F6F6] text-sm text-[#111E16] font-semibold rounded-lg pl-11 pr-4 py-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
          />
        </div>

        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              showToast('Filters cleared', 'info');
            }}
            className="px-3 py-2 text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="bg-white border border-[#BEC9BE] rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-1/4"></div>
            <div className="space-y-3 pt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="h-10 bg-gray-50 rounded-lg animate-pulse flex-1"></div>
                  <div className="h-10 bg-gray-50 rounded-lg animate-pulse w-32"></div>
                  <div className="h-10 bg-gray-50 rounded-lg animate-pulse w-24"></div>
                </div>
              ))}
            </div>
          </div>
        ) : paginatedNotes.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#F8B057]/10 text-[#401900] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#111E16]">No credit notes found</h3>
            <p className="text-sm text-[#6F7A70] mt-1 max-w-sm">
              No matching credit memo entries were found. Try modifying your search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#E8F8E9]/40 border-b border-[#BEC9BE]/60 text-xs font-bold text-[#6F7A70] tracking-wider uppercase select-none">
                  <th className="px-6 py-4">Credit Note</th>
                  <th className="px-6 py-4">Related Invoice</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Refund Amount</th>
                  <th className="px-6 py-4">Refund Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date Issued</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BEC9BE]/30 text-sm">
                {paginatedNotes.map((cn) => (
                  <tr key={cn.number} className="hover:bg-[#E8F8E9]/20 transition-all duration-100">
                    <td className="px-6 py-4 font-mono font-bold text-[#BA1A1A]">
                      {cn.number}
                    </td>
                    <td className="px-6 py-4 font-mono text-[#6F7A70]">
                      {cn.relatedInvoice}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#111E16]">
                      {cn.customerName}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-[#BA1A1A]">
                      {formatCurrency(cn.refundAmount)}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-[#6F7A70]">
                      {cn.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border bg-red-50 text-[#BA1A1A] border-red-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                        {cn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#6F7A70] font-medium whitespace-nowrap">
                      {cn.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelectedNote(cn); }}
                          className="p-1.5 text-[#6F7A70] hover:text-[#00522E] hover:bg-[#F6F6F6] rounded"
                          title="View Memo Detail"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handlePrintPDF(cn)}
                          className="p-1.5 text-[#6F7A70] hover:text-[#00522E] hover:bg-[#F6F6F6] rounded"
                          title="Download Memo PDF"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEmailNote(cn)}
                          className="p-1.5 text-[#6F7A70] hover:text-[#00522E] hover:bg-[#F6F6F6] rounded"
                          title="Email Customer Note"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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

        <div className="bg-[#E8F8E9]/10 border-t border-[#BEC9BE] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-semibold text-[#6F7A70]">
            Showing {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} credit notes
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
                    p === currentPage ? 'bg-[#BA1A1A] text-white' : 'text-[#111E16] hover:bg-[#F6F6F6]'
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

      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-md shadow-2xl animate-scale-up overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#BA1A1A]">Generate Credit Note</h3>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-[#6F7A70] hover:text-[#BA1A1A] p-1 rounded-full hover:bg-white/60 transition-all cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-[#BA1A1A] border border-red-200 text-xs font-bold rounded-lg p-3">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#111E16] mb-1">Select Related Invoice</label>
                <select
                  value={formInvoiceRef}
                  onChange={(e) => handleInvoiceSelect(e.target.value)}
                  className="w-full bg-[#F6F6F6] text-xs font-semibold text-[#111E16] rounded-lg p-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none cursor-pointer"
                >
                  <option value="">Select Invoice...</option>
                  {invoices.map(inv => (
                    <option key={inv.number} value={inv.number}>
                      {inv.number} - {inv.customerName} ({formatCurrency(inv.amount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] mb-1">Refund / Credit Amount (₹)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="0"
                  value={formRefundAmount || ''}
                  onChange={(e) => setFormRefundAmount(Number(e.target.value))}
                  className="w-full bg-[#F6F6F6] text-xs text-[#111E16] rounded-lg p-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] mb-1">Refund Reason</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide accounting justification for refund adjustment..."
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full bg-[#F6F6F6] text-xs text-[#111E16] rounded-lg p-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                />
              </div>

              <div className="border-t border-[#BEC9BE]/40 pt-4 flex justify-end gap-3 bg-[#F6F6F6] -mx-6 -mb-6 p-4">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 border border-[#BEC9BE] rounded-lg text-xs font-bold text-[#6F7A70] hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#BA1A1A] hover:bg-[#930006] text-white rounded-lg text-xs font-bold shadow"
                >
                  Confirm & Issue Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-lg shadow-2xl animate-scale-up overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#BA1A1A]">Credit Note Preview</h3>
                <span className="text-xs font-mono text-[#6F7A70]">{selectedNote.number}</span>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-[#6F7A70] hover:text-[#BA1A1A] p-1 rounded-full hover:bg-white/60 transition-all cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-[#6F7A70]">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase block mb-1">Customer</span>
                  <span className="text-sm font-bold text-[#111E16] block">{selectedNote.customerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold tracking-wider uppercase block mb-1">Audit Details</span>
                  <span className="text-xs text-[#111E16] block">Related Ref: {selectedNote.relatedInvoice}</span>
                  <span className="text-xs text-[#111E16] block">Date: {selectedNote.date}</span>
                </div>
              </div>

              <div className="border border-[#BEC9BE]/40 rounded-xl p-4 bg-[#F6F6F6]">
                <div className="flex justify-between items-center text-xs border-b border-[#BEC9BE]/20 pb-2">
                  <span className="text-[#6F7A70] font-bold uppercase">Refund Reason</span>
                  <span className="text-[#111E16] font-semibold">{selectedNote.reason}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-[#BA1A1A] pt-2">
                  <span>REFUND CREDIT</span>
                  <span className="font-mono">{formatCurrency(selectedNote.refundAmount)}</span>
                </div>
              </div>

              <p className="text-[10px] text-[#797979] leading-relaxed text-center">
                This credit note is immutable and registered in the internal ledger. Safe for financial audit logs.
              </p>
            </div>

            <div className="border-t border-[#BEC9BE]/40 p-4 bg-[#F6F6F6] flex justify-between items-center">
              <button
                onClick={() => handleEmailNote(selectedNote)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F6F6F6] text-[#111E16] border border-[#BEC9BE] rounded-lg text-xs font-bold cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email Customer</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedNote(null)}
                  className="px-4 py-2 border border-[#BEC9BE] rounded-lg text-xs font-bold text-[#6F7A70] hover:bg-white"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePrintPDF(selectedNote)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#BA1A1A] hover:bg-[#930006] text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Print PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
