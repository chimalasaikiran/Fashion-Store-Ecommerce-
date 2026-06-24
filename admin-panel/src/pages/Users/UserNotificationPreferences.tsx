import { useState, type FormEvent } from 'react';
import { useUsers, type NotificationPreference } from './UsersContext';

export default function UserNotificationPreferences() {
  const { notificationPref, saveNotificationPreferences } = useUsers();

  const [emailOrders, setEmailOrders] = useState(notificationPref.email.orders);
  const [emailShipments, setEmailShipments] = useState(notificationPref.email.shipments);
  const [emailPromos, setEmailPromos] = useState(notificationPref.email.promotions);
  const [emailSecurity, setEmailSecurity] = useState(notificationPref.email.security);

  const [pushOrders, setPushOrders] = useState(notificationPref.push.orders);
  const [pushShipments, setPushShipments] = useState(notificationPref.push.shipments);
  const [pushPromos, setPushPromos] = useState(notificationPref.push.promotions);
  const [pushSecurity, setPushSecurity] = useState(notificationPref.push.security);

  const [smsOrders, setSmsOrders] = useState(notificationPref.sms.orders);
  const [smsShipments, setSmsShipments] = useState(notificationPref.sms.shipments);
  const [smsPromos, setSmsPromos] = useState(notificationPref.sms.promotions);
  const [smsSecurity, setSmsSecurity] = useState(notificationPref.sms.security);

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    
    const updatedPref: NotificationPreference = {
      email: {
        orders: emailOrders,
        shipments: emailShipments,
        promotions: emailPromos,
        security: emailSecurity
      },
      push: {
        orders: pushOrders,
        shipments: pushShipments,
        promotions: pushPromos,
        security: pushSecurity
      },
      sms: {
        orders: smsOrders,
        shipments: smsShipments,
        promotions: smsPromos,
        security: smsSecurity
      }
    };

    saveNotificationPreferences(updatedPref);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16]">
          System Notification Preferences
        </h2>
        <p className="text-sm text-[#6F7A70] mt-1">
          Configure notification dispatch channels for customers, admins, and transactional endpoints.
        </p>
      </div>

      {isSaved && (
        <div className="bg-[#E8F8E9] border border-[#00522E]/20 text-[#00522E] rounded-lg px-4 py-3 text-sm font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <svg className="w-5 h-5 text-[#00522E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>Preferences updated and saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {}
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#BEC9BE]/40 text-[#00522E]">
              <svg className="w-5.5 h-5.5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-bold text-[#111E16]">Email Dispatch</h3>
            </div>
            
            <p className="text-xs text-[#6F7A70] leading-relaxed">
              Dispatch notifications via email server relay. Recommended for transaction documentation.
            </p>

            <div className="space-y-3 pt-2 select-none">
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#BEC9BE]/40 hover:bg-[#E8F8E9]/10 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[#111E16] block">Order Updates</span>
                  <span className="text-[10px] text-[#6F7A70] block">Invoices, order statuses</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailOrders}
                  onChange={(e) => setEmailOrders(e.target.checked)}
                  className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E] w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#BEC9BE]/40 hover:bg-[#E8F8E9]/10 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[#111E16] block">Shipments</span>
                  <span className="text-[10px] text-[#6F7A70] block">Delivery updates, tracking</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailShipments}
                  onChange={(e) => setEmailShipments(e.target.checked)}
                  className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E] w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#BEC9BE]/40 hover:bg-[#E8F8E9]/10 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[#111E16] block">Promotions</span>
                  <span className="text-[10px] text-[#6F7A70] block">Discounts, member events</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailPromos}
                  onChange={(e) => setEmailPromos(e.target.checked)}
                  className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E] w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#BEC9BE]/40 hover:bg-[#E8F8E9]/10 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[#111E16] block">Security Alerts</span>
                  <span className="text-[10px] text-[#6F7A70] block">Password changes, IP alerts</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailSecurity}
                  onChange={(e) => setEmailSecurity(e.target.checked)}
                  className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E] w-5 h-5"
                />
              </label>
            </div>
          </div>

          {}
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#BEC9BE]/40 text-[#00522E]">
              <svg className="w-5.5 h-5.5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="text-lg font-bold text-[#111E16]">Push Alerts</h3>
            </div>
            
            <p className="text-xs text-[#6F7A70] leading-relaxed">
              Broadcast updates to browsers or system native devices. Highly optimal for immediate action.
            </p>

            <div className="space-y-3 pt-2 select-none">
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#BEC9BE]/40 hover:bg-[#E8F8E9]/10 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[#111E16] block">Order Updates</span>
                  <span className="text-[10px] text-[#6F7A70] block">Invoices, order statuses</span>
                </div>
                <input
                  type="checkbox"
                  checked={pushOrders}
                  onChange={(e) => setPushOrders(e.target.checked)}
                  className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E] w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#BEC9BE]/40 hover:bg-[#E8F8E9]/10 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[#111E16] block">Shipments</span>
                  <span className="text-[10px] text-[#6F7A70] block">Delivery updates, tracking</span>
                </div>
                <input
                  type="checkbox"
                  checked={pushShipments}
                  onChange={(e) => setPushShipments(e.target.checked)}
                  className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E] w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#BEC9BE]/40 hover:bg-[#E8F8E9]/10 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[#111E16] block">Promotions</span>
                  <span className="text-[10px] text-[#6F7A70] block">Discounts, member events</span>
                </div>
                <input
                  type="checkbox"
                  checked={pushPromos}
                  onChange={(e) => setPushPromos(e.target.checked)}
                  className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E] w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#BEC9BE]/40 hover:bg-[#E8F8E9]/10 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[#111E16] block">Security Alerts</span>
                  <span className="text-[10px] text-[#6F7A70] block">Password changes, IP alerts</span>
                </div>
                <input
                  type="checkbox"
                  checked={pushSecurity}
                  onChange={(e) => setPushSecurity(e.target.checked)}
                  className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E] w-5 h-5"
                />
              </label>
            </div>
          </div>

          {}
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#BEC9BE]/40 text-[#00522E]">
              <svg className="w-5.5 h-5.5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-bold text-[#111E16]">SMS Dispatch</h3>
            </div>
            
            <p className="text-xs text-[#6F7A70] leading-relaxed">
              Connect to telecommunication SMS gateways. Highly effective for instant security warnings.
            </p>

            <div className="space-y-3 pt-2 select-none">
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#BEC9BE]/40 hover:bg-[#E8F8E9]/10 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[#111E16] block">Order Updates</span>
                  <span className="text-[10px] text-[#6F7A70] block">Invoices, order statuses</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsOrders}
                  onChange={(e) => setSmsOrders(e.target.checked)}
                  className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E] w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#BEC9BE]/40 hover:bg-[#E8F8E9]/10 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[#111E16] block">Shipments</span>
                  <span className="text-[10px] text-[#6F7A70] block">Delivery updates, tracking</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsShipments}
                  onChange={(e) => setSmsShipments(e.target.checked)}
                  className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E] w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#BEC9BE]/40 hover:bg-[#E8F8E9]/10 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[#111E16] block">Promotions</span>
                  <span className="text-[10px] text-[#6F7A70] block">Discounts, member events</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsPromos}
                  onChange={(e) => setSmsPromos(e.target.checked)}
                  className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E] w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#BEC9BE]/40 hover:bg-[#E8F8E9]/10 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[#111E16] block">Security Alerts</span>
                  <span className="text-[10px] text-[#6F7A70] block">Password changes, IP alerts</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsSecurity}
                  onChange={(e) => setSmsSecurity(e.target.checked)}
                  className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E] w-5 h-5"
                />
              </label>
            </div>
          </div>

        </div>

        <div className="flex justify-end select-none">
          <button
            type="submit"
            className="px-6 py-3 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-sm font-bold cursor-pointer transition-all shadow-sm hover:shadow-md"
          >
            Save Notification Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
