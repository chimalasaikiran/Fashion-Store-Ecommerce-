import React, { useState, useEffect } from 'react';
import { usePayments, type Invoice, type InvoiceItem } from './PaymentsContext';
import { formatCurrency } from '../../data/mockDb';

export default function InvoiceManagement() {
  const { invoices, generateInvoice, regenerateInvoice, emailInvoice } = usePayments();

  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const [formOrderRef, setFormOrderRef] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerEmail, setFormCustomerEmail] = useState('');
  const [formItems, setFormItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, price: 0 }]);
  const [formError, setFormError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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

  const handleAddItem = () => {
    setFormItems(prev => [...prev, { description: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (formItems.length === 1) return;
    setFormItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setFormItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          [field]: field === 'description' ? value : Number(value)
        };
      }
      return item;
    }));
  };

  const handleGenerateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOrderRef.trim() || !formCustomerName.trim() || !formCustomerEmail.trim()) {
      setFormError('All fields are required.');
      return;
    }

    const invalidItem = formItems.some(item => !item.description.trim() || item.price <= 0 || item.quantity <= 0);
    if (invalidItem) {
      setFormError('All items must have a valid description, price greater than 0, and quantity greater than 0.');
      return;
    }

    const itemTotal = formItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const calculatedTax = parseFloat((itemTotal * 0.18).toFixed(2));
    const calculatedTotal = parseFloat((itemTotal + calculatedTax).toFixed(2));

    generateInvoice({
      orderRef: formOrderRef,
      customerName: formCustomerName,
      customerEmail: formCustomerEmail,
      amount: calculatedTotal,
      tax: calculatedTax,
      items: formItems
    });

    showToast('Invoice generated successfully.', 'success');
    setIsGenerateModalOpen(false);

    setFormOrderRef('');
    setFormCustomerName('');
    setFormCustomerEmail('');
    setFormItems([{ description: '', quantity: 1, price: 0 }]);
    setFormError('');
  };

  const handleEmailInvoice = (inv: Invoice) => {
    const success = emailInvoice(inv.number);
    if (success) {
      showToast(`Invoice email queued to ${inv.customerEmail}`, 'success');
    } else {
      showToast('Error emailing invoice details.', 'error');
    }
  };

  const handleRegenerateInvoice = (inv: Invoice) => {
    regenerateInvoice(inv.number);
    showToast(`Invoice ${inv.number} regenerated with audit update.`, 'success');
  };

  const handlePrintPDF = (inv: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popup blocker prevented print window.', 'error');
      return;
    }

    const itemRows = inv.items.map(item => `
      <tr>
        <td>${item.description}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">${formatCurrency(item.price)}</td>
        <td style="text-align:right">${formatCurrency(item.quantity * item.price)}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Invoice ${inv.number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #00522E; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            .company { font-size: 24px; font-weight: bold; color: #00522E; }
            .inv-title { font-size: 22px; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .lbl { font-size: 11px; text-transform: uppercase; color: #777; font-weight: bold; margin-bottom: 4px; }
            .val { font-size: 14px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { border-bottom: 2px solid #00522E; padding: 12px 8px; text-align: left; background: #E8F8E9; font-size: 12px; }
            td { border-bottom: 1px solid #ddd; padding: 12px 8px; font-size: 13px; }
            .total-section { float: right; width: 300px; text-align: right; font-size: 14px; line-height: 2; }
            .total-amount { font-size: 18px; font-weight: bold; color: #00522E; border-top: 2px solid #00522E; margin-top: 10px; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">Fashion Store E-Commerce</div>
            <div class="inv-title">TAX INVOICE</div>
          </div>
          <div class="grid">
            <div>
              <div class="lbl">Billed To</div>
              <div class="val">${inv.customerName}</div>
              <div class="val">${inv.customerEmail}</div>
            </div>
            <div style="text-align: right">
              <div class="lbl">Invoice Details</div>
              <div class="val">Invoice No: ${inv.number}</div>
              <div class="val">Order Ref: ${inv.orderRef}</div>
              <div class="val">Date: ${inv.date}</div>
              <div class="val">Status: ${inv.status.toUpperCase()}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align:center; width: 80px;">Qty</th>
                <th style="text-align:right; width: 120px;">Unit Price</th>
                <th style="text-align:right; width: 120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>
          <div class="total-section">
            <div>Subtotal: ${formatCurrency(inv.amount - inv.tax)}</div>
            <div>GST (18.0%): ${formatCurrency(inv.tax)}</div>
            <div class="total-amount">Total Invoice Amount: ${formatCurrency(inv.amount)}</div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    showToast('Invoice PDF generated and print dialog opened.', 'success');
  };

  const filteredInvoices = invoices.filter(inv => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      inv.number.toLowerCase().includes(query) ||
      inv.orderRef.toLowerCase().includes(query) ||
      inv.customerName.toLowerCase().includes(query) ||
      inv.customerEmail.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const totalInvoicedSum = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidSum = invoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
  const unpaidSum = invoices.filter(i => i.status === 'Unpaid').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueSum = invoices.filter(i => i.status === 'Overdue').reduce((sum, inv) => sum + inv.amount, 0);

  const getStatusBadgeStyles = (status: Invoice['status']) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Unpaid':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Overdue':
        return 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
    }
  };

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
            Invoice Management
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Manage billing, generate immutable digital customer receipts, and email invoices.
          </p>
        </div>
        
        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-sm font-bold shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7-7H5" />
          </svg>
          <span>Generate Invoice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#E2F2E3] text-[#00522E] rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Billing</span>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Invoiced</span>
            <span className="text-2xl font-extrabold text-[#111E16] block">
              {isLoading ? '...' : formatCurrency(totalInvoicedSum)}
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
              Paid Records
            </span>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Paid Total</span>
            <span className="text-2xl font-extrabold text-[#00522E] block">
              {isLoading ? '...' : formatCurrency(paidSum)}
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
              Pending Flow
            </span>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Unpaid Balance</span>
            <span className="text-2xl font-extrabold text-amber-800 block">
              {isLoading ? '...' : formatCurrency(unpaidSum)}
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
              Critical Audit
            </span>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Overdue Balance</span>
            <span className="text-2xl font-extrabold text-[#BA1A1A] block">
              {isLoading ? '...' : formatCurrency(overdueSum)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6F7A70]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search invoice number, customer or order reference..."
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
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white text-xs font-bold text-[#111E16] border border-[#BEC9BE] rounded-lg px-3 py-2.5 cursor-pointer hover:bg-[#F6F6F6]"
            >
              <option value="All">All Invoices</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                showToast('Filters cleared', 'info');
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
        ) : paginatedInvoices.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#F8B057]/10 text-[#401900] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#111E16]">No invoices found</h3>
            <p className="text-sm text-[#6F7A70] mt-1 max-w-sm">
              We couldn't find any invoices matching your active query parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#E8F8E9]/40 border-b border-[#BEC9BE]/60 text-xs font-bold text-[#6F7A70] tracking-wider uppercase select-none">
                  <th className="px-6 py-4">Invoice Number</th>
                  <th className="px-6 py-4">Order Ref</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total Billing (incl. GST)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Generated Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BEC9BE]/30 text-sm">
                {paginatedInvoices.map((inv) => (
                  <tr key={inv.number} className="hover:bg-[#E8F8E9]/20 transition-all duration-100">
                    <td className="px-6 py-4 font-mono font-bold text-[#00522E]">
                      {inv.number}
                    </td>
                    <td className="px-6 py-4 font-mono text-[#6F7A70]">
                      {inv.orderRef}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#111E16]">{inv.customerName}</span>
                        <span className="text-xs text-[#797979]">{inv.customerEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-[#111E16]">{formatCurrency(inv.amount)}</span>
                        <span className="text-[10px] text-[#6F7A70]">Includes {formatCurrency(inv.tax)} GST</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeStyles(inv.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#6F7A70] font-medium whitespace-nowrap">
                      {new Date(inv.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelectedInvoice(inv); setIsPreviewModalOpen(true); }}
                          className="p-1.5 text-[#6F7A70] hover:text-[#00522E] hover:bg-[#F6F6F6] rounded"
                          title="Preview details"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handlePrintPDF(inv)}
                          className="p-1.5 text-[#6F7A70] hover:text-[#00522E] hover:bg-[#F6F6F6] rounded"
                          title="Download Invoice PDF"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEmailInvoice(inv)}
                          className="p-1.5 text-[#6F7A70] hover:text-[#00522E] hover:bg-[#F6F6F6] rounded"
                          title="Email Invoice"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRegenerateInvoice(inv)}
                          className="p-1.5 text-[#6F7A70] hover:text-[#401900] hover:bg-[#F6F6F6] rounded"
                          title="Regenerate Invoice"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
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
            Showing {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} invoices
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

      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-lg shadow-2xl animate-scale-up overflow-hidden">
            <div className="bg-[#E8F8E9] px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#00522E]">Generate New Invoice</h3>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-[#6F7A70] hover:text-[#00522E] p-1 rounded-full hover:bg-white/60 transition-all cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleGenerateInvoiceSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="bg-red-50 text-[#BA1A1A] border border-red-200 text-xs font-bold rounded-lg p-3">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111E16] mb-1">Order Reference</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ORD-4029"
                    value={formOrderRef}
                    onChange={(e) => setFormOrderRef(e.target.value)}
                    className="w-full bg-[#F6F6F6] text-xs text-[#111E16] rounded-lg p-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111E16] mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    className="w-full bg-[#F6F6F6] text-xs text-[#111E16] rounded-lg p-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] mb-1">Customer Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. customer@domain.in"
                  value={formCustomerEmail}
                  onChange={(e) => setFormCustomerEmail(e.target.value)}
                  className="w-full bg-[#F6F6F6] text-xs text-[#111E16] rounded-lg p-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                />
              </div>

              <div className="space-y-3 border-t border-[#BEC9BE]/40 pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#6F7A70] uppercase tracking-wider">Line Items</h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-[#00522E] hover:underline"
                  >
                    + Add Item
                  </button>
                </div>

                {formItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center bg-[#F6F6F6] p-2.5 rounded-lg border border-[#BEC9BE]/20 relative">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-[#6F7A70] mb-0.5">Description</label>
                      <input
                        type="text"
                        required
                        placeholder="Silk Pashmina Scarf..."
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full bg-white text-[11px] text-[#111E16] rounded p-1.5 border border-[#BEC9BE]/40 focus:outline-none focus:border-[#00522E]"
                      />
                    </div>
                    <div className="w-16">
                      <label className="block text-[10px] font-bold text-[#6F7A70] mb-0.5">Qty</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full bg-white text-[11px] text-[#111E16] rounded p-1.5 border border-[#BEC9BE]/40 focus:outline-none text-center"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-[10px] font-bold text-[#6F7A70] mb-0.5">Price (₹)</label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        required
                        value={item.price || ''}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        className="w-full bg-white text-[11px] text-[#111E16] rounded p-1.5 border border-[#BEC9BE]/40 focus:outline-none text-right"
                      />
                    </div>
                    {formItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700 font-bold text-xs pt-4 pl-1"
                        title="Remove Item"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-[#BEC9BE]/40 pt-4 flex justify-end gap-3 bg-[#F6F6F6] -mx-6 -mb-6 p-4">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 border border-[#BEC9BE] rounded-lg text-xs font-bold text-[#6F7A70] hover:bg-[#F6F6F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-xs font-bold shadow"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPreviewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-up overflow-hidden">
            <div className="bg-[#E8F8E9] px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#00522E]">Invoice Details</h3>
                <span className="text-xs font-mono text-[#6F7A70]">{selectedInvoice.number}</span>
              </div>
              <button
                onClick={() => { setSelectedInvoice(null); setIsPreviewModalOpen(false); }}
                className="text-[#6F7A70] hover:text-[#00522E] p-1 rounded-full hover:bg-white/60 transition-all cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block mb-1">Billed To</span>
                  <span className="font-bold text-[#111E16] block">{selectedInvoice.customerName}</span>
                  <span className="text-xs text-[#797979] block">{selectedInvoice.customerEmail}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block mb-1">Invoice Details</span>
                  <span className="font-semibold text-[#111E16] block">Order Ref: {selectedInvoice.orderRef}</span>
                  <span className="text-xs text-[#797979] block">Date Generated: {selectedInvoice.date}</span>
                  <span className="text-xs text-[#797979] block">Status: {selectedInvoice.status.toUpperCase()}</span>
                </div>
              </div>

              <div className="border border-[#BEC9BE]/40 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#E8F8E9]/30 text-[#6F7A70] font-bold border-b border-[#BEC9BE]/40">
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BEC9BE]/20 font-medium">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="text-[#111E16]">
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-center font-mono">{item.quantity}</td>
                        <td className="p-3 text-right font-mono">{formatCurrency(item.price)}</td>
                        <td className="p-3 text-right font-mono">{formatCurrency(item.quantity * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-end space-y-1.5 text-xs text-[#6F7A70] font-semibold">
                <div className="flex justify-between w-64 border-b border-[#BEC9BE]/20 pb-1">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#111E16]">{formatCurrency(selectedInvoice.amount - selectedInvoice.tax)}</span>
                </div>
                <div className="flex justify-between w-64 border-b border-[#BEC9BE]/20 pb-1">
                  <span>GST (18.0%)</span>
                  <span className="font-mono text-[#111E16]">{formatCurrency(selectedInvoice.tax)}</span>
                </div>
                <div className="flex justify-between w-64 text-sm font-bold text-[#00522E] pt-1">
                  <span>Total Due</span>
                  <span className="font-mono">{formatCurrency(selectedInvoice.amount)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#BEC9BE]/40 p-4 bg-[#F6F6F6] flex justify-between items-center">
              <button
                onClick={() => handleEmailInvoice(selectedInvoice)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F6F6F6] text-[#111E16] border border-[#BEC9BE] rounded-lg text-xs font-bold cursor-pointer"
              >
                <svg className="w-4 h-4 text-[#111E16]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email Customer</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => { setSelectedInvoice(null); setIsPreviewModalOpen(false); }}
                  className="px-4 py-2 border border-[#BEC9BE] rounded-lg text-xs font-bold text-[#6F7A70] hover:bg-white"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => handlePrintPDF(selectedInvoice)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Print / Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
