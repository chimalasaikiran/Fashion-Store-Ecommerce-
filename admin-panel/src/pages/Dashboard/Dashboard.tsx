import { useState } from 'react';
import { useOrders } from '../Orders/OrdersContext';
import { useUsers } from '../Users/UsersContext';
import { useTickets } from '../Tickets/TicketsContext';
import { usePayments } from '../Payments/PaymentsContext';
import { useProducts } from '../Products/ProductsContext';
import { formatCurrency } from '../../data/mockDb';

export default function Dashboard() {
  const [selectedRange, setSelectedRange] = useState('Last 30 Days');

  const { orders } = useOrders();
  const { users } = useUsers();
  const { tickets } = useTickets();
  const { transactions } = usePayments();
  const { products, categories: categoriesList } = useProducts();

  const paidOrders = orders.filter(o => o.paymentStatus === 'Paid');
  const totalRevenueVal = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalSalesVal = orders.filter(o => o.orderStatus !== 'Cancelled').length;
  const totalCustomersVal = users.filter(u => u.role === 'Customer').length;

  const kpis = [
    {
      title: 'TOTAL REVENUE',
      value: formatCurrency(totalRevenueVal),
      change: '+12%',
      isPositive: true,
      color: 'rgba(248, 176, 87, 0.12)',
      iconColor: '#401900',
      icon: (
        <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'TOTAL SALES',
      value: totalSalesVal.toLocaleString(),
      change: '+8%',
      isPositive: true,
      color: 'rgba(64, 25, 0, 0.08)',
      iconColor: '#401900',
      icon: (
        <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      title: 'TOTAL ORDERS',
      value: orders.length.toLocaleString(),
      change: '-2%',
      isPositive: false,
      color: 'rgba(248, 176, 87, 0.08)',
      iconColor: '#797979',
      icon: (
        <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      title: 'TOTAL CUSTOMERS',
      value: totalCustomersVal.toLocaleString(),
      change: '+15%',
      isPositive: true,
      color: 'rgba(64, 25, 0, 0.06)',
      iconColor: '#F8B057',
      icon: (
        <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  const successTxns = transactions.filter(t => t.status === 'SUCCESS');
  let maxDate = new Date();
  if (successTxns.length > 0) {
    const dates = successTxns.map(t => new Date(t.date).getTime());
    const maxTime = Math.max(...dates);
    if (maxTime < Date.now()) {
      maxDate = new Date(maxTime);
    }
  }

  const dailyData: { date: string; amount: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(maxDate.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const dayAmount = successTxns
      .filter(t => t.date.split('T')[0] === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);
    dailyData.push({ date: dateStr, amount: dayAmount });
  }

  const maxAmount = Math.max(...dailyData.map(d => d.amount), 1);
  const points = dailyData.map((d, i) => {
    const x = (i * 600) / 29;
    const y = 200 - (d.amount / maxAmount) * 180;
    return { x, y };
  });

  const linePath = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const areaPath = `${linePath} L600,200 L0,200 Z`;

  const prevPoints = points.map(p => ({
    x: p.x,
    y: 200 - ((200 - p.y) * 0.75) + 10
  }));
  const prevLinePath = prevPoints.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const prevAreaPath = `${prevLinePath} L600,200 L0,200 Z`;

  const categorySalesMap: { [catName: string]: number } = {};
  orders.forEach(order => {
    if (order.paymentStatus === 'Paid') {
      order.items.forEach(item => {
        const prod = products.find(p => p.name === item.name);
        const catName = prod ? prod.category : 'Accessories';
        categorySalesMap[catName] = (categorySalesMap[catName] || 0) + (item.price * item.quantity);
      });
    }
  });

  const totalCatSales = Object.values(categorySalesMap).reduce((sum, v) => sum + v, 0) || 1;
  const categoriesData = categoriesList.map(cat => {
    const val = categorySalesMap[cat.name] || 0;
    return {
      name: cat.name,
      value: formatCurrency(val),
      percent: `${Math.round((val / totalCatSales) * 100)}%`
    };
  }).sort((a, b) => {
    const valA = parseFloat(a.value.replace(/[^0-9.-]+/g, '')) || 0;
    const valB = parseFloat(b.value.replace(/[^0-9.-]+/g, '')) || 0;
    return valB - valA;
  }).slice(0, 4);

  const recentOrders = orders.slice(0, 4);
  const recentTickets = tickets.slice(0, 3);

  const getOrderStatusStyles = (status: string) => {
    switch (status) {
      case 'Delivered':
        return { bg: 'rgba(248, 176, 87, 0.15)', text: '#401900' };
      case 'Processing':
        return { bg: 'rgba(248, 176, 87, 0.1)', text: '#797979' };
      case 'Cancelled':
        return { bg: 'rgba(255, 218, 214, 0.2)', text: '#BA1A1A' };
      default:
        return { bg: 'rgba(248, 176, 87, 0.05)', text: '#F8B057' };
    }
  };

  const getTicketPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return { bg: 'rgba(255, 218, 214, 0.2)', text: '#BA1A1A' };
      case 'MEDIUM':
        return { bg: 'rgba(248, 176, 87, 0.15)', text: '#401900' };
      default:
        return { bg: '#E0E0E0/50', text: '#797979' };
    }
  };

  const getRelativeTime = (createdDateStr: string) => {
    const parts = createdDateStr.split(',');
    if (parts.length > 1) {
      return parts[1].trim();
    }
    return createdDateStr;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#242424]">
            Dashboard Overview
          </h2>
          <p className="text-sm text-[#797979] mt-1">
            Real-time performance metrics and operational tracking.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative inline-block">
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="appearance-none flex items-center gap-2 pl-3.5 pr-8 py-2 bg-white hover:bg-[#F6F6F6] border border-[#E0E0E0] rounded-lg text-xs sm:text-sm font-semibold text-[#242424] shadow-xs cursor-pointer focus:outline-none transition-all duration-150"
            >
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Year">This Year</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#242424]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>

          <button 
            onClick={() => alert('Exporting analytics report...')}
            className="flex items-center gap-2 px-4 py-2 bg-[#401900] hover:bg-[#2D1100] text-white border border-transparent rounded-lg text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi) => (
          <article
            key={kpi.title}
            className="bg-white border border-[#E0E0E0]/60 hover:border-[#F8B057]/50 shadow-xs hover:shadow-md rounded-xl p-5 flex flex-col justify-between transition-all duration-200 group"
          >
            <div className="flex items-center justify-between w-full">
              <div
                className="p-2.5 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 duration-200"
                style={{ backgroundColor: kpi.color, color: kpi.iconColor }}
              >
                {kpi.icon}
              </div>

              <div
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  kpi.isPositive
                    ? 'bg-[#F8B057]/10 text-[#401900] border border-[#F8B057]/20'
                    : 'bg-red-50 text-[#BA1A1A] border border-red-100'
                }`}
              >
                <svg
                  className={`w-3 h-3 ${kpi.isPositive ? '' : 'transform rotate-180'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="3.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>{kpi.change}</span>
              </div>
            </div>

            <div className="mt-5 space-y-1">
              <span className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block select-none">
                {kpi.title}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#242424] tracking-tight block">
                {kpi.value}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <article className="lg:col-span-2 bg-white border border-[#E0E0E0]/60 shadow-xs rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
            <div>
              <h3 className="text-lg font-bold text-[#242424]">Revenue Trend</h3>
              <p className="text-xs text-[#797979] mt-0.5">
                Daily gross revenue over the last 30 days
              </p>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#797979] tracking-wider uppercase">
                <span className="w-3 h-3 rounded-full bg-[#401900] block"></span>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#797979] tracking-wider uppercase">
                <span className="w-3 h-3 rounded-full bg-[#E0E0E0] block"></span>
                <span>Previous</span>
              </div>
            </div>
          </div>

          <div className="w-full relative bg-[#F6F6F6]/50 rounded-lg p-2 border border-[#E0E0E0]/40">
            <svg className="w-full h-[220px]" viewBox="0 0 600 220" preserveAspectRatio="none">
              <line x1="0" y1="36" x2="600" y2="36" stroke="rgba(121, 121, 121, 0.15)" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="0" y1="88" x2="600" y2="88" stroke="rgba(121, 121, 121, 0.15)" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(121, 121, 121, 0.15)" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="0" y1="192" x2="600" y2="192" stroke="rgba(121, 121, 121, 0.15)" strokeDasharray="4 4" strokeWidth="1" />
              
              <defs>
                <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#401900" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#401900" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="previousGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#797979" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#797979" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path
                d={prevAreaPath}
                fill="url(#previousGradient)"
              />
              <path
                d={prevLinePath}
                fill="none"
                stroke="#E0E0E0"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              <path
                d={areaPath}
                fill="url(#currentGradient)"
              />
              <path
                d={linePath}
                fill="none"
                stroke="#401900"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>

            <div className="flex justify-between items-center px-1 pt-1.5 border-t border-[#E0E0E0]/30 select-none text-[10px] font-semibold text-[#797979] tracking-wider uppercase">
              <span>Day 01</span>
              <span>Day 10</span>
              <span>Day 20</span>
              <span>Day 30</span>
            </div>
          </div>
        </article>

        <article className="bg-white border border-[#E0E0E0]/60 shadow-xs rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#242424]">Sales by Category</h3>
            <p className="text-xs text-[#797979] mt-0.5">
              Distribution across product lines
            </p>
          </div>

          <div className="py-2.5 space-y-4">
            {categoriesData.length === 0 ? (
              <div className="text-center py-8 text-xs font-semibold text-[#797979]">
                <div className="flex flex-col items-center justify-center gap-2 select-none">
                  <svg className="w-7 h-7 text-[#797979]/65" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>No sales by category to display</span>
                </div>
              </div>
            ) : (
              categoriesData.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-[#242424]">{cat.name}</span>
                    <span className="text-[#797979] font-mono text-xs">{cat.value}</span>
                  </div>
                  <div className="h-2 w-full bg-[#F6F6F6] rounded-full overflow-hidden border border-[#E0E0E0]/30">
                    <div
                      className="h-full bg-[#401900] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: cat.percent }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => alert('Redirecting to Category Analytics...')}
              className="w-full text-center py-2.5 text-xs sm:text-sm font-bold text-[#401900] hover:text-[#2D1100] border border-[#401900]/25 hover:border-[#401900]/60 hover:bg-[#F6F6F6] rounded-lg transition-all cursor-pointer"
            >
              View All Categories
            </button>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <article className="lg:col-span-2 min-w-0 bg-white border border-[#E0E0E0]/60 shadow-xs hover:shadow-md rounded-xl p-5 flex flex-col justify-start space-y-4 transition-all duration-200">
          <div className="flex items-center justify-between select-none">
            <h3 className="text-lg font-bold text-[#242424]">Recent Orders</h3>
            <button
              onClick={() => alert('Navigating to full orders view...')}
              className="text-xs sm:text-sm font-bold text-[#401900] hover:text-[#2D1100] cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="w-full overflow-x-auto rounded-lg border border-[#E0E0E0]/50 bg-white">
            <table className="w-full border-collapse text-left text-sm min-w-[500px]">
              <thead>
                <tr className="bg-[#F6F6F6] text-[#797979] border-b border-[#E0E0E0]/50">
                  <th className="py-3 px-4 font-bold text-xs tracking-wider uppercase whitespace-nowrap">Order ID</th>
                  <th className="py-3 px-4 font-bold text-xs tracking-wider uppercase whitespace-nowrap">Customer</th>
                  <th className="py-3 px-4 font-bold text-xs tracking-wider uppercase whitespace-nowrap">Amount</th>
                  <th className="py-3 px-4 font-bold text-xs tracking-wider uppercase whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 font-bold text-xs tracking-wider uppercase whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]/30">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-center text-sm font-semibold text-[#797979]">
                      <div className="flex flex-col items-center justify-center gap-2 select-none">
                        <svg className="w-8 h-8 text-[#797979]/65" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>No recent orders to display</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const initial = order.customerName.split(' ').map(n => n[0]).join('');
                    const orderStyles = getOrderStatusStyles(order.orderStatus);
                    const displayId = order.id.startsWith('ORD-') ? order.id : `ORD-${order.id}`;
                    return (
                      <tr key={order.id} className="hover:bg-[#F6F6F6]/40 transition-colors duration-100">
                        <td className="py-3 px-4 font-mono font-bold text-[#401900] whitespace-nowrap">
                          {displayId}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <span
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-[#401900] shadow-xs select-none"
                              style={{ backgroundColor: 'rgba(248, 176, 87, 0.25)' }}
                            >
                              {initial}
                            </span>
                            <span className="font-semibold text-[#242424]">{order.customerName}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-[#242424] whitespace-nowrap">
                          {formatCurrency(order.totalAmount)}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: orderStyles.bg, color: orderStyles.text }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: orderStyles.text }}
                            ></span>
                            {order.orderStatus}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => alert(`Details for order ${order.id}`)}
                            className="p-1.5 text-[#797979] hover:text-[#401900] hover:bg-[#F6F6F6] rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                            aria-label="View Order"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="bg-white border border-[#E0E0E0]/60 shadow-xs hover:shadow-md rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200">
          <div className="flex items-center justify-between select-none">
            <h3 className="text-lg font-bold text-[#242424]">Recent Tickets</h3>
            <button className="p-1 rounded-lg text-[#797979] hover:bg-[#F6F6F6] cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M12 5a1 1 0 110-2 1 1 0 010 2zm0 14a1 1 0 110-2 1 1 0 010 2zm0-7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>

          <div className="space-y-3.5">
            {recentTickets.length === 0 ? (
              <div className="border border-[#E0E0E0]/30 rounded-xl p-6 text-center text-sm font-semibold text-[#797979]">
                <div className="flex flex-col items-center justify-center gap-2 select-none">
                  <svg className="w-8 h-8 text-[#797979]/65" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span>No recent tickets to display</span>
                </div>
              </div>
            ) : (
              recentTickets.map((ticket) => {
                const priorityStyles = getTicketPriorityStyles(ticket.priority);
                const messageText = ticket.messages[0]?.text || ticket.subject;
                return (
                  <div
                    key={ticket.id}
                    className="border border-[#E0E0E0]/30 hover:border-[#F8B057]/45 rounded-xl p-3.5 space-y-2.5 transition-all duration-150 hover:bg-[#F8B057]/5"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-bold text-[#242424] line-clamp-1">{ticket.subject}</h4>
                      <span className="text-[10px] font-medium text-[#797979] font-mono whitespace-nowrap">{getRelativeTime(ticket.createdDate)}</span>
                    </div>

                    <p className="text-xs text-[#797979] leading-4 line-clamp-2">
                      {messageText}
                    </p>

                    <div className="flex items-center justify-between pt-1 select-none">
                      <span
                        className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: priorityStyles.bg, color: priorityStyles.text }}
                      >
                        {ticket.priority}
                      </span>
                      <span className="text-[10px] font-bold text-[#797979] opacity-75">
                        Assigned: {ticket.assignedAgent || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => alert('Navigating to Ticket Center...')}
              className="w-full text-center py-2.5 text-xs sm:text-sm font-bold text-[#401900] hover:text-[#2D1100] border-t border-[#E0E0E0]/30 hover:bg-[#F6F6F6]/40 transition-all cursor-pointer"
            >
              Go to Ticket Center
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
