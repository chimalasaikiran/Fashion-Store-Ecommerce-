import React, { useState, useEffect, useRef } from 'react';
import { useRoleAccess } from '../../context/RoleAccessContext';


const TAB_KEYWORDS: Record<string, string[]> = {
  general: ['application name', 'app name', 'company', 'logo', 'favicon', 'timezone', 'time zone', 'language', 'currency'],
  store: ['store name', 'description', 'address', 'contact', 'phone', 'email', 'social', 'instagram', 'facebook', 'twitter', 'linkedin'],
  users: ['role', 'permission', 'session settings', 'password policy', 'security access', 'session lifetime', 'max concurrent'],
  notifications: ['notification', 'email', 'sms', 'push', 'whatsapp', 'alerts', 'order confirmation', 'otp templates'],
  payments: ['payment gateway', 'razorpay', 'stripe', 'upi', 'cash on delivery', 'cod', 'credentials', 'api keys'],
  shipping: ['shipping zone', 'charges', 'courier', 'delivery rules', 'fedex', 'dhl', 'bluedart', 'delhivery'],
  tax: ['gst', 'tax rates', 'regional rules', 'cgst', 'sgst', 'igst', 'gstin'],
  security: ['two-factor', '2fa', 'session timeout', 'login security', 'ip restrictions', 'whitelist', 'attempts'],
  templates: ['templates', 'order confirmation email', 'shipment notification', 'refund template', 'otp body', 'variables'],
  audit: ['audit logs', 'user activity', 'permission change', 'login history', 'events', 'logs'],
  backup: ['backup', 'restore', 'backup history', 'create backup', 'restore backup', 'database dump']
};

interface BackupItem {
  id: string;
  filename: string;
  size: string;
  date: string;
  status: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  ipWhitelist: string[];
}

export default function Settings() {
  const { auditLogs, logAction, roles } = useRoleAccess();

  
  const [activeTab, setActiveTab] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTabChanging, setIsTabChanging] = useState<boolean>(false);

  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    destructive?: boolean;
  } | null>(null);

  const [setup2FAModal, setSetup2FAModal] = useState<boolean>(false);
  const [otpCode2FA, setOtpCode2FA] = useState<string>('');
  const [otpError2FA, setOtpError2FA] = useState<string>('');

  
  const [saveLoading, setSaveLoading] = useState<Record<string, boolean>>({});

  
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState<boolean>(false);
  const [faviconUploading, setFaviconUploading] = useState<boolean>(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  
  const [general, setGeneral] = useState(() => {
    const saved = localStorage.getItem('settings_general');
    return saved ? JSON.parse(saved) : {
      appName: 'Fashion Store Admin',
      companyName: 'Chimalasai Kiran Ltd',
      timeZone: 'Asia/Kolkata',
      language: 'en',
      currency: 'INR'
    };
  });

  const [store, setStore] = useState(() => {
    const saved = localStorage.getItem('settings_store');
    return saved ? JSON.parse(saved) : {
      storeName: 'Fashion Store - Premium Collection',
      storeDescription: 'High quality trending apparel and accessories for men, women and children.',
      storeAddress: '123 Elegance Blvd, Fashion District, Hyderabad, India',
      contactPhone: '+91 98765 43210',
      contactEmail: 'support@fashionstore.com',
      socialInstagram: 'https://instagram.com/fashionstore',
      socialFacebook: 'https://facebook.com/fashionstore',
      socialTwitter: 'https://twitter.com/fashionstore',
      socialLinkedIn: 'https://linkedin.com/company/fashionstore'
    };
  });

  const [userAccess, setUserAccess] = useState(() => {
    const saved = localStorage.getItem('settings_user_access');
    return saved ? JSON.parse(saved) : {
      sessionLifetime: 60,
      maxConcurrentSessions: 3,
      requireCapital: true,
      requireNumber: true,
      requireSpecial: true,
      minLength: 8
    };
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('settings_notifications');
    return saved ? JSON.parse(saved) : {
      emailOrders: true,
      emailTickets: true,
      emailSecurity: true,
      smsOrders: true,
      smsOTP: true,
      pushOffers: false,
      pushTickets: true,
      whatsappOrders: true,
      whatsappSupport: false
    };
  });

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('settings_payments');
    return saved ? JSON.parse(saved) : {
      razorpayEnabled: true,
      razorpayKeyId: 'rzp_live_8FnsKDk8s9',
      razorpaySecret: '••••••••••••••••••••••••',
      stripeEnabled: true,
      stripePublishableKey: 'pk_live_51Msz79S...',
      stripeSecretKey: '••••••••••••••••••••••••',
      upiEnabled: true,
      upiId: 'fashionstore@ybl',
      upiMerchantName: 'Fashion Store Ecommerce',
      codEnabled: true,
      codMaxLimit: 10000
    };
  });

  const [shipping, setShipping] = useState(() => {
    const saved = localStorage.getItem('settings_shipping');
    return saved ? JSON.parse(saved) : {
      flatRate: 50,
      freeShippingThreshold: 999,
      courierFedex: true,
      courierDHL: true,
      courierBlueDart: true,
      courierDelhivery: true,
      estimatedDelivery: '3-5 Business Days',
      handlingFee: 20
    };
  });

  const [shippingZones, setShippingZones] = useState<Array<{ id: string; name: string; regions: string; rate: number }>>(() => {
    const saved = localStorage.getItem('settings_shipping_zones');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Domestic (India)', regions: 'All States', rate: 50 },
      { id: '2', name: 'International', regions: 'US, EU, UK, UAE', rate: 750 },
      { id: '3', name: 'Express Local', regions: 'Hyderabad metro', rate: 100 }
    ];
  });

  const [tax, setTax] = useState(() => {
    const saved = localStorage.getItem('settings_tax');
    return saved ? JSON.parse(saved) : {
      gstEnabled: true,
      gstin: '36AAAAA1111A1Z1',
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 18,
      regionalTaxRules: 'Standard state GST rules apply.'
    };
  });

  const [security, setSecurity] = useState<SecuritySettings>(() => {
    const saved = localStorage.getItem('settings_security');
    return saved ? JSON.parse(saved) : {
      twoFactorEnabled: false,
      sessionTimeoutMinutes: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      ipWhitelist: ['192.168.1.1', '103.241.12.85']
    };
  });

  const [emailTemplates, setEmailTemplates] = useState(() => {
    const saved = localStorage.getItem('settings_email_templates');
    return saved ? JSON.parse(saved) : {
      selectedTemplate: 'order_confirmation',
      order_confirmation: {
        subject: 'Order Confirmed - #{{order_id}}',
        body: 'Dear {{customer_name}},\n\nThank you for shopping at Fashion Store! We are pleased to confirm your order #{{order_id}} has been received and is currently being processed.\n\nOrder Summary:\nTotal: {{order_total}}\n\nWe will send you a shipment notification with tracking details once your package leaves our warehouse.\n\nBest Regards,\nFashion Store Team'
      },
      shipment_notification: {
        subject: 'Your Order #{{order_id}} Has Been Shipped!',
        body: 'Hi {{customer_name}},\n\nGood news! Your order #{{order_id}} has been shipped via {{courier_partner}}.\n\nTracking Link: {{tracking_url}}\nEstimated Delivery: {{est_delivery}}\n\nTrack your package to see real-time updates.\n\nBest,\nFashion Store Team'
      },
      refund_notification: {
        subject: 'Refund Processed - Order #{{order_id}}',
        body: 'Dear {{customer_name}},\n\nWe have processed a refund of {{refund_amount}} for your order #{{order_id}}.\n\nThe amount has been credited back to your original payment method. Depending on your bank, it may take 5-7 business days to reflect in your account.\n\nSincerely,\nFashion Store Accounts'
      },
      otp_template: {
        subject: 'Your One-Time Password (OTP) - Action Required',
        body: 'Hello,\n\nYour One-Time Password (OTP) for admin panel access is: {{otp_code}}.\n\nThis OTP is valid for 5 minutes. Do not share this code with anyone, including Fashion Store support agents.\n\nIf you did not request this, please change your credentials immediately.\n\nRegards,\nSecurity Operations'
      }
    };
  });

  const [backups, setBackups] = useState<BackupItem[]>(() => {
    const saved = localStorage.getItem('settings_backups');
    return saved ? JSON.parse(saved) : [
      { id: 'b1', filename: 'backup_full_2026-06-20_0200.sql', size: '48.2 MB', date: '2026-06-20 02:00:00', status: 'Success' },
      { id: 'b2', filename: 'backup_db_2026-06-15_0200.sql', size: '47.9 MB', date: '2026-06-15 02:00:00', status: 'Success' },
      { id: 'b3', filename: 'backup_media_2026-06-10_0200.tar.gz', size: '1.42 GB', date: '2026-06-10 02:00:00', status: 'Success' }
    ];
  });

  
  const [newIpInput, setNewIpInput] = useState<string>('');
  const [ipError, setIpError] = useState<string>('');

  
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newZoneRegions, setNewZoneRegions] = useState<string>('');
  const [newZoneRate, setNewZoneRate] = useState<string>('');

  
  const [showStripeSecret, setShowStripeSecret] = useState<boolean>(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState<boolean>(false);

  
  useEffect(() => {
    localStorage.setItem('settings_general', JSON.stringify(general));
  }, [general]);

  useEffect(() => {
    localStorage.setItem('settings_store', JSON.stringify(store));
  }, [store]);

  useEffect(() => {
    localStorage.setItem('settings_user_access', JSON.stringify(userAccess));
  }, [userAccess]);

  useEffect(() => {
    localStorage.setItem('settings_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('settings_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('settings_shipping', JSON.stringify(shipping));
  }, [shipping]);

  useEffect(() => {
    localStorage.setItem('settings_shipping_zones', JSON.stringify(shippingZones));
  }, [shippingZones]);

  useEffect(() => {
    localStorage.setItem('settings_tax', JSON.stringify(tax));
  }, [tax]);

  useEffect(() => {
    localStorage.setItem('settings_security', JSON.stringify(security));
  }, [security]);

  useEffect(() => {
    localStorage.setItem('settings_email_templates', JSON.stringify(emailTemplates));
  }, [emailTemplates]);

  useEffect(() => {
    localStorage.setItem('settings_backups', JSON.stringify(backups));
  }, [backups]);

  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  
  const handleTabClick = (tabId: string) => {
    if (tabId === activeTab) return;
    setIsTabChanging(true);
    setTimeout(() => {
      setActiveTab(tabId);
      setIsTabChanging(false);
    }, 350);
  };

  
  const handleFileUpload = (type: 'logo' | 'favicon', file: File) => {
    if (type === 'logo') {
      setLogoUploading(true);
      setTimeout(() => {
        setLogoFile(URL.createObjectURL(file));
        setLogoUploading(false);
        showToast('Logo image uploaded successfully!', 'success');
        logAction('Upload Store Asset', 'Uploaded new store logo: ' + file.name);
      }, 1200);
    } else {
      setFaviconUploading(true);
      setTimeout(() => {
        setFaviconFile(URL.createObjectURL(file));
        setFaviconUploading(false);
        showToast('Favicon uploaded successfully!', 'success');
        logAction('Upload Store Asset', 'Uploaded new favicon: ' + file.name);
      }, 1000);
    }
  };

  
  const handleSaveSection = (sectionName: string, stateData: any, logMsg: string) => {
    
    if (sectionName === 'tax' && stateData.gstEnabled) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (stateData.gstin && !gstinRegex.test(stateData.gstin)) {
        showToast('Invalid GSTIN format. Expected: 36AAAAA1111A1Z1', 'error');
        return;
      }
    }

    if (sectionName === 'store') {
      if (!stateData.contactEmail.includes('@')) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }
    }

    setSaveLoading(prev => ({ ...prev, [sectionName]: true }));
    setTimeout(() => {
      setSaveLoading(prev => ({ ...prev, [sectionName]: false }));
      showToast(`${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} Settings saved successfully!`, 'success');
      logAction('Update Settings', logMsg);
    }, 800);
  };

  
  const handleAddIp = () => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(newIpInput)) {
      setIpError('Please enter a valid IPv4 address.');
      return;
    }
    if (security.ipWhitelist.includes(newIpInput)) {
      setIpError('IP address is already whitelisted.');
      return;
    }

    setIpError('');
    const updatedWhitelist = [...security.ipWhitelist, newIpInput];
    setSecurity(prev => ({ ...prev, ipWhitelist: updatedWhitelist }));
    setNewIpInput('');
    showToast(`IP ${newIpInput} whitelisted.`, 'success');
    logAction('IP Access Modification', `Added IP ${newIpInput} to administrator whitelist.`);
  };

  const handleRemoveIp = (ip: string) => {
    setConfirmModal({
      show: true,
      title: 'Remove IP Whitelist Restriction',
      message: `Are you sure you want to remove the IP ${ip} from the whitelist? Users on this address may lose access depending on routing blocks.`,
      destructive: true,
      onConfirm: () => {
        const updatedWhitelist = security.ipWhitelist.filter(item => item !== ip);
        setSecurity(prev => ({ ...prev, ipWhitelist: updatedWhitelist }));
        showToast(`IP ${ip} removed from whitelist.`, 'info');
        logAction('IP Access Modification', `Removed IP ${ip} from administrator whitelist.`);
        setConfirmModal(null);
      }
    });
  };

  
  const handleToggle2FA = (checked: boolean) => {
    if (checked) {
      
      setSetup2FAModal(true);
    } else {
      setConfirmModal({
        show: true,
        title: 'Disable Two-Factor Authentication',
        message: 'Are you sure you want to disable 2FA? This will lower the login security requirements for your administrator panel accounts.',
        destructive: true,
        onConfirm: () => {
          setSecurity(prev => ({ ...prev, twoFactorEnabled: false }));
          showToast('Two-factor authentication disabled.', 'info');
          logAction('Security Policy Update', 'Disabled Two-Factor Authentication (2FA) for administrators.');
          setConfirmModal(null);
        }
      });
    }
  };

  const handleVerify2FA = () => {
    if (otpCode2FA.length !== 6 || isNaN(Number(otpCode2FA))) {
      setOtpError2FA('Please enter a valid 6-digit verification code.');
      return;
    }
    
    setOtpError2FA('');
    setSecurity(prev => ({ ...prev, twoFactorEnabled: true }));
    setSetup2FAModal(false);
    setOtpCode2FA('');
    showToast('Two-factor authentication enabled successfully!', 'success');
    logAction('Security Policy Update', 'Activated Two-Factor Authentication (2FA) for administrators.');
  };

  
  const handleAddShippingZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName || !newZoneRegions || !newZoneRate) {
      showToast('Please fill out all shipping zone fields.', 'error');
      return;
    }
    const newZone = {
      id: Date.now().toString(),
      name: newZoneName,
      regions: newZoneRegions,
      rate: parseFloat(newZoneRate) || 0
    };
    const updatedZones = [...shippingZones, newZone];
    setShippingZones(updatedZones);
    setNewZoneName('');
    setNewZoneRegions('');
    setNewZoneRate('');
    showToast(`Shipping zone "${newZoneName}" added.`, 'success');
    logAction('Shipping Rate Modification', `Added new shipping zone: ${newZoneName} with rate ₹${newZone.rate}.`);
  };

  const handleRemoveShippingZone = (id: string, name: string) => {
    setConfirmModal({
      show: true,
      title: 'Delete Shipping Zone',
      message: `Are you sure you want to delete the shipping zone "${name}"? Delivery policies associated with this region will be removed.`,
      destructive: true,
      onConfirm: () => {
        const updatedZones = shippingZones.filter(z => z.id !== id);
        setShippingZones(updatedZones);
        showToast(`Shipping zone "${name}" removed.`, 'info');
        logAction('Shipping Rate Modification', `Deleted shipping zone: ${name}.`);
        setConfirmModal(null);
      }
    });
  };

  
  const handleCreateBackup = () => {
    setSaveLoading(prev => ({ ...prev, backup: true }));
    showToast('Starting system database backup dump...', 'info');

    setTimeout(() => {
      const now = new Date();
      const pad = (num: number) => String(num).padStart(2, '0');
      const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
      const newBackup: BackupItem = {
        id: 'b' + Date.now(),
        filename: `backup_manual_${stamp}.sql`,
        size: (Math.random() * 5 + 45).toFixed(1) + ' MB',
        date: now.toISOString().replace('T', ' ').substring(0, 19),
        status: 'Success'
      };

      setBackups(prev => [newBackup, ...prev]);
      setSaveLoading(prev => ({ ...prev, backup: false }));
      showToast('System database backup created successfully!', 'success');
      logAction('Database Backup Lifecycle', `Created manual system backup: ${newBackup.filename} (${newBackup.size})`);
    }, 1800);
  };

  const handleRestoreBackup = (filename: string) => {
    setConfirmModal({
      show: true,
      title: 'Restore Database Backup',
      message: `Are you sure you want to restore the system database to state: "${filename}"? This is a destructive action. All current product data, orders, and configurations will be overwritten and replaced.`,
      destructive: true,
      onConfirm: () => {
        setConfirmModal(null);
        showToast('Restoring database schema and settings...', 'info');
        setIsTabChanging(true);

        setTimeout(() => {
          setIsTabChanging(false);
          showToast(`System restore completed successfully from: ${filename}!`, 'success');
          logAction('Database Backup Lifecycle', `Restored system configuration and tables to backup state: ${filename}`);
        }, 2000);
      }
    });
  };

  const handleDeleteBackup = (id: string, filename: string) => {
    setConfirmModal({
      show: true,
      title: 'Delete Backup File',
      message: `Are you sure you want to permanently delete the backup file "${filename}"? This action cannot be undone.`,
      destructive: true,
      onConfirm: () => {
        setBackups(prev => prev.filter(b => b.id !== id));
        showToast(`Backup ${filename} deleted from disk.`, 'info');
        logAction('Database Backup Lifecycle', `Deleted backup file from server disk: ${filename}`);
        setConfirmModal(null);
      }
    });
  };

  
  const getFilteredTabs = () => {
    const tabs = [
      { id: 'general', name: 'General Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
      { id: 'store', name: 'Store Settings', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
      { id: 'users', name: 'Users & Access', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { id: 'notifications', name: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
      { id: 'payments', name: 'Payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { id: 'shipping', name: 'Shipping Settings', icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 9h4l3 3v4H3V9h10z' },
      { id: 'tax', name: 'Tax Settings', icon: 'M9 14l2-2 4 4m6-2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { id: 'security', name: 'Security Settings', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
      { id: 'templates', name: 'Templates', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { id: 'audit', name: 'Audit Logs', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
      { id: 'backup', name: 'Backup & Restore', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3 3-3m-3-2v6' }
    ];

    if (!searchQuery) return tabs;

    const lowerQuery = searchQuery.toLowerCase();
    return tabs.filter(tab => {
      
      if (tab.name.toLowerCase().includes(lowerQuery)) return true;
      
      const keywords = TAB_KEYWORDS[tab.id] || [];
      return keywords.some(kw => kw.toLowerCase().includes(lowerQuery));
    });
  };

  const filteredTabs = getFilteredTabs();

  
  useEffect(() => {
    if (searchQuery && filteredTabs.length > 0) {
      const match = filteredTabs.find(t => t.id === activeTab);
      if (!match) {
        setActiveTab(filteredTabs[0].id);
      }
    }
  }, [searchQuery, filteredTabs, activeTab]);

  return (
    <div className="space-y-6 relative pb-12 select-none">
      {}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3.5 bg-white border border-[#BEC9BE] rounded-xl shadow-xl animate-slide-in-right">
          <div className={`w-3 h-3 rounded-full ${
            toast.type === 'success' ? 'bg-[#00522E]' : toast.type === 'error' ? 'bg-[#BA1A1A]' : 'bg-[#F8B057]'
          }`}></div>
          <span className="text-sm font-bold text-[#111E16]">{toast.message}</span>
        </div>
      )}

      {}
      {confirmModal && confirmModal.show && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-2xl p-6 max-w-sm w-full animate-scale-in">
            <h4 className="text-lg font-bold text-[#111E16]">{confirmModal.title}</h4>
            <p className="text-xs text-[#6F7A70] mt-2 leading-relaxed">{confirmModal.message}</p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-xs font-bold text-[#6F7A70] hover:text-[#111E16] bg-white border border-[#BEC9BE] rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm cursor-pointer ${
                  confirmModal.destructive ? 'bg-[#BA1A1A] hover:bg-[#930006]' : 'bg-[#00522E] hover:bg-[#003B21]'
                }`}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {setup2FAModal && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-2xl p-6 max-w-md w-full animate-scale-in space-y-4">
            <div>
              <h4 className="text-lg font-bold text-[#111E16]">Configure Authenticator App</h4>
              <p className="text-xs text-[#6F7A70] mt-1">Scan the QR code below using your Google Authenticator or Authy application.</p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-[#F6F6F6] rounded-xl border border-[#BEC9BE]/40">
              {}
              <div className="w-40 h-40 bg-white border-4 border-white p-2 rounded flex flex-wrap justify-between gap-1 shadow-sm relative">
                {}
                <div className="w-12 h-12 border-4 border-black"></div>
                <div className="w-12 h-12 border-4 border-black ml-auto"></div>
                <div className="w-12 h-12 border-4 border-black mt-auto"></div>
                {}
                <div className="absolute inset-0 m-auto w-8 h-8 bg-[#00522E] rounded-md flex items-center justify-center text-[10px] text-white font-bold">FS</div>
                <div className="w-full flex flex-wrap gap-1.5 p-1 mt-auto">
                  <div className="w-4 h-4 bg-black"></div>
                  <div className="w-6 h-3 bg-black"></div>
                  <div className="w-3 h-5 bg-black"></div>
                  <div className="w-5 h-4 bg-black"></div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#6F7A70] mt-3">Secret Key: FSAD 2618 KMNA O17L YZ4X</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6F7A70] uppercase">Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otpCode2FA}
                onChange={(e) => setOtpCode2FA(e.target.value)}
                className="w-full text-center text-lg font-mono tracking-widest bg-[#F6F6F6] rounded-lg border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none py-2"
              />
              {otpError2FA && <p className="text-[11px] text-[#BA1A1A] font-semibold mt-1">{otpError2FA}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setSetup2FAModal(false);
                  setOtpCode2FA('');
                  setOtpError2FA('');
                }}
                className="px-4 py-2 text-xs font-bold text-[#6F7A70] hover:text-[#111E16] bg-white border border-[#BEC9BE] rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify2FA}
                className="px-4 py-2 text-xs font-bold text-white bg-[#00522E] hover:bg-[#003B21] rounded-lg shadow-sm cursor-pointer"
              >
                Verify & Enable
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16] flex items-center gap-2">
            System & Store Settings
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Maintain general configurations, security parameters, payment configurations, and logs.
          </p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-[#00522E]/10 rounded-lg flex items-center justify-center text-[#00522E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8E9] text-[#00522E]">
              Normal
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Active Admin Users</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block">
              14 Active
            </span>
          </div>
        </div>

        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-blue-50 rounded-lg flex items-center justify-center text-blue-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800">
              8 Connected
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">System Integrations</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block">
              8 / 8 Online
            </span>
          </div>
        </div>

        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8E9] text-[#00522E]">
              Secure
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Active Threats</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block">
              0 Alerts
            </span>
          </div>
        </div>

        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-amber-50 rounded-lg flex items-center justify-center text-amber-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800">
              99.98%
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Server Performance</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block">
              Excellent
            </span>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {}
        <div className="space-y-4 lg:col-span-1">
          {}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6F7A70]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-xs text-[#111E16] font-semibold rounded-lg pl-9 pr-4 py-2 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6F7A70] hover:text-[#111E16]"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {}
          <div className="hidden lg:flex flex-col gap-1.5 bg-white border border-[#BEC9BE] rounded-xl p-3 shadow-xs">
            {filteredTabs.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#6F7A70] font-semibold italic">
                No matching settings found
              </div>
            ) : (
              filteredTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 text-left cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#E2F2E3] text-[#00522E] border-r-4 border-[#00522E]'
                      : 'text-[#797979] hover:bg-[#F6F6F6] hover:text-[#401900]'
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                  </svg>
                  <span>{tab.name}</span>
                </button>
              ))
            )}
          </div>

          {}
          <div className="flex lg:hidden overflow-x-auto whitespace-nowrap scrollbar-none pb-2 border-b border-[#BEC9BE]/60 gap-2">
            {filteredTabs.length === 0 ? (
              <div className="py-2 text-xs text-[#6F7A70] font-semibold italic">
                No results matching "{searchQuery}"
              </div>
            ) : (
              filteredTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer inline-flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-[#00522E] text-white shadow-sm'
                      : 'bg-white border border-[#BEC9BE] text-[#797979] hover:bg-[#F6F6F6]'
                  }`}
                >
                  <span>{tab.name}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {}
        <div className="lg:col-span-3">
          {isTabChanging ? (
            
            <div className="bg-white border border-[#BEC9BE] rounded-xl p-6 space-y-6 shadow-xs min-h-[420px]">
              <div className="space-y-2">
                <div className="h-6 bg-gray-100 rounded-md animate-pulse w-1/3"></div>
                <div className="h-4 bg-gray-50 rounded-md animate-pulse w-2/3"></div>
              </div>
              <hr className="border-[#BEC9BE]/30" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded-md animate-pulse w-1/4"></div>
                  <div className="h-9 bg-gray-50 rounded-lg animate-pulse w-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded-md animate-pulse w-1/4"></div>
                  <div className="h-9 bg-gray-50 rounded-lg animate-pulse w-full"></div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <div className="h-4 bg-gray-100 rounded-md animate-pulse w-1/4"></div>
                  <div className="h-20 bg-gray-50 rounded-lg animate-pulse w-full"></div>
                </div>
              </div>
            </div>
          ) : (
            
            <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-xs min-h-[420px] overflow-hidden">
              
              {}
              {activeTab === 'general' && (
                <div className="p-6 space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-bold text-[#111E16]">General Settings</h3>
                    <p className="text-xs text-[#6F7A70]">Modify core corporate details and configure system locales.</p>
                  </div>
                  <hr className="border-[#BEC9BE]/40" />

                  {}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Logo Upload</label>
                      <div className="border border-dashed border-[#BEC9BE] hover:border-[#00522E] rounded-lg p-4 flex flex-col items-center justify-center text-center bg-[#F6F6F6]/50 transition-colors">
                        {logoUploading ? (
                          <div className="w-12 h-12 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-[#00522E]/20 border-t-[#00522E] rounded-full animate-spin"></div>
                          </div>
                        ) : logoFile ? (
                          <div className="space-y-3 flex flex-col items-center">
                            <img src={logoFile} alt="Logo preview" className="h-10 object-contain" />
                            <span className="text-[10px] text-[#6F7A70] font-semibold truncate max-w-[150px]">Custom Logo Loaded</span>
                          </div>
                        ) : (
                          <div className="space-y-1 text-center">
                            <svg className="w-8 h-8 text-[#797979] mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[11px] font-bold text-[#00522E] block cursor-pointer hover:underline" onClick={() => logoInputRef.current?.click()}>
                              Browse Files
                            </span>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={logoInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload('logo', e.target.files[0]);
                          }}
                        />
                      </div>
                    </div>

                    {}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Favicon Upload</label>
                      <div className="border border-dashed border-[#BEC9BE] hover:border-[#00522E] rounded-lg p-4 flex flex-col items-center justify-center text-center bg-[#F6F6F6]/50 transition-colors">
                        {faviconUploading ? (
                          <div className="w-12 h-12 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-[#00522E]/20 border-t-[#00522E] rounded-full animate-spin"></div>
                          </div>
                        ) : faviconFile ? (
                          <div className="space-y-3 flex flex-col items-center">
                            <img src={faviconFile} alt="Favicon preview" className="w-8 h-8 object-contain" />
                            <span className="text-[10px] text-[#6F7A70] font-semibold">Custom Favicon Loaded</span>
                          </div>
                        ) : (
                          <div className="space-y-1 text-center">
                            <svg className="w-8 h-8 text-[#797979] mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-[11px] font-bold text-[#00522E] block cursor-pointer hover:underline" onClick={() => faviconInputRef.current?.click()}>
                              Browse Files
                            </span>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={faviconInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload('favicon', e.target.files[0]);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Application Name</label>
                      <input
                        type="text"
                        value={general.appName}
                        onChange={(e) => setGeneral({ ...general, appName: e.target.value })}
                        className="w-full bg-[#F6F6F6] text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Company Name</label>
                      <input
                        type="text"
                        value={general.companyName}
                        onChange={(e) => setGeneral({ ...general, companyName: e.target.value })}
                        className="w-full bg-[#F6F6F6] text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Time Zone</label>
                      <select
                        value={general.timeZone}
                        onChange={(e) => setGeneral({ ...general, timeZone: e.target.value })}
                        className="w-full bg-white text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none cursor-pointer"
                      >
                        <option value="UTC">UTC / Greenwich Mean Time</option>
                        <option value="Asia/Kolkata">IST / Asia/Kolkata (GMT+5:30)</option>
                        <option value="America/New_York">EST / America/New_York (GMT-5:00)</option>
                        <option value="Europe/London">GMT / Europe/London (GMT+0:00)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Language</label>
                      <select
                        value={general.language}
                        onChange={(e) => setGeneral({ ...general, language: e.target.value })}
                        className="w-full bg-white text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none cursor-pointer"
                      >
                        <option value="en">English (US)</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Currency</label>
                      <select
                        value={general.currency}
                        onChange={(e) => setGeneral({ ...general, currency: e.target.value })}
                        className="w-full bg-white text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none cursor-pointer"
                      >
                        <option value="INR">INR - Indian Rupee (₹)</option>
                        <option value="USD">USD - United States Dollar ($)</option>
                        <option value="EUR">EUR - Euro (€)</option>
                        <option value="GBP">GBP - British Pound (£)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#BEC9BE]/40">
                    <button
                      onClick={() => handleSaveSection('general', general, `Changed App Name to "${general.appName}", Company to "${general.companyName}"`)}
                      disabled={saveLoading.general}
                      className="px-5 py-2.5 bg-[#00522E] hover:bg-[#003B21] disabled:bg-[#BEC9BE] text-white text-xs font-bold tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      {saveLoading.general ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {}
              {activeTab === 'store' && (
                <div className="p-6 space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-bold text-[#111E16]">Store Settings</h3>
                    <p className="text-xs text-[#6F7A70]">Set your digital storefront metadata, addresses, and media socials.</p>
                  </div>
                  <hr className="border-[#BEC9BE]/40" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Store Name</label>
                      <input
                        type="text"
                        value={store.storeName}
                        onChange={(e) => setStore({ ...store, storeName: e.target.value })}
                        className="w-full bg-[#F6F6F6] text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Store Description</label>
                      <textarea
                        rows={3}
                        value={store.storeDescription}
                        onChange={(e) => setStore({ ...store, storeDescription: e.target.value })}
                        className="w-full bg-[#F6F6F6] text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Store Address</label>
                      <textarea
                        rows={2}
                        value={store.storeAddress}
                        onChange={(e) => setStore({ ...store, storeAddress: e.target.value })}
                        className="w-full bg-[#F6F6F6] text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Contact Phone</label>
                      <input
                        type="text"
                        value={store.contactPhone}
                        onChange={(e) => setStore({ ...store, contactPhone: e.target.value })}
                        className="w-full bg-[#F6F6F6] text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Contact Email</label>
                      <input
                        type="email"
                        value={store.contactEmail}
                        onChange={(e) => setStore({ ...store, contactEmail: e.target.value })}
                        className="w-full bg-[#F6F6F6] text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-4 sm:col-span-2">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase block">Social Media Links</label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-semibold text-xs">Insta</span>
                          <input
                            type="text"
                            value={store.socialInstagram}
                            onChange={(e) => setStore({ ...store, socialInstagram: e.target.value })}
                            className="w-full bg-[#F6F6F6] text-xs text-[#111E16] font-semibold rounded-lg pl-12 pr-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-semibold text-xs">FB</span>
                          <input
                            type="text"
                            value={store.socialFacebook}
                            onChange={(e) => setStore({ ...store, socialFacebook: e.target.value })}
                            className="w-full bg-[#F6F6F6] text-xs text-[#111E16] font-semibold rounded-lg pl-10 pr-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-semibold text-xs">Twitter</span>
                          <input
                            type="text"
                            value={store.socialTwitter}
                            onChange={(e) => setStore({ ...store, socialTwitter: e.target.value })}
                            className="w-full bg-[#F6F6F6] text-xs text-[#111E16] font-semibold rounded-lg pl-14 pr-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-semibold text-xs">LinkedIn</span>
                          <input
                            type="text"
                            value={store.socialLinkedIn}
                            onChange={(e) => setStore({ ...store, socialLinkedIn: e.target.value })}
                            className="w-full bg-[#F6F6F6] text-xs text-[#111E16] font-semibold rounded-lg pl-16 pr-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#BEC9BE]/40">
                    <button
                      onClick={() => handleSaveSection('store', store, `Updated Store Metadata: "${store.storeName}"`)}
                      disabled={saveLoading.store}
                      className="px-5 py-2.5 bg-[#00522E] hover:bg-[#003B21] disabled:bg-[#BEC9BE] text-white text-xs font-bold tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      {saveLoading.store ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {}
              {activeTab === 'users' && (
                <div className="p-6 space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-bold text-[#111E16]">User & Access Settings</h3>
                    <p className="text-xs text-[#6F7A70]">Review role assignments, configure login session bounds, and adjust security thresholds.</p>
                  </div>
                  <hr className="border-[#BEC9BE]/40" />

                  {}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-[#6F7A70] uppercase block">Role Access Summary</label>
                    <div className="border border-[#BEC9BE]/50 rounded-lg divide-y divide-[#BEC9BE]/30 overflow-hidden">
                      {roles.slice(0, 4).map((r) => (
                        <div key={r.name} className="flex justify-between items-center p-3 hover:bg-[#F6F6F6]/50">
                          <div>
                            <span className="text-xs font-bold text-[#111E16] block">{r.name}</span>
                            <span className="text-[10px] text-[#6F7A70] block truncate max-w-[280px]">{r.description}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            r.name.includes('Admin') ? 'bg-[#E2F2E3] text-[#00522E]' : 'bg-[#F8B057]/15 text-[#401900]'
                          }`}>
                            Active Module Access
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Max Concurrent Sessions</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={userAccess.maxConcurrentSessions}
                        onChange={(e) => setUserAccess({ ...userAccess, maxConcurrentSessions: parseInt(e.target.value) })}
                        className="w-full bg-[#F6F6F6] text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Password Minimum Length</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={6}
                          max={20}
                          value={userAccess.minLength}
                          onChange={(e) => setUserAccess({ ...userAccess, minLength: parseInt(e.target.value) })}
                          className="flex-1 accent-[#00522E]"
                        />
                        <span className="text-xs font-bold text-[#111E16] w-6">{userAccess.minLength}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-[#6F7A70] uppercase block">Password Policy Enforcements</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 p-2 bg-[#F6F6F6] rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userAccess.requireCapital}
                          onChange={(e) => setUserAccess({ ...userAccess, requireCapital: e.target.checked })}
                          className="accent-[#00522E]"
                        />
                        <span className="text-xs font-semibold text-[#111E16]">Capital Letter</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-[#F6F6F6] rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userAccess.requireNumber}
                          onChange={(e) => setUserAccess({ ...userAccess, requireNumber: e.target.checked })}
                          className="accent-[#00522E]"
                        />
                        <span className="text-xs font-semibold text-[#111E16]">Number Code</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-[#F6F6F6] rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userAccess.requireSpecial}
                          onChange={(e) => setUserAccess({ ...userAccess, requireSpecial: e.target.checked })}
                          className="accent-[#00522E]"
                        />
                        <span className="text-xs font-semibold text-[#111E16]">Special Symbol</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#BEC9BE]/40">
                    <button
                      onClick={() => handleSaveSection('userAccess', userAccess, 'Updated system login security and password policies.')}
                      disabled={saveLoading.userAccess}
                      className="px-5 py-2.5 bg-[#00522E] hover:bg-[#003B21] disabled:bg-[#BEC9BE] text-white text-xs font-bold tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      {saveLoading.userAccess ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {}
              {activeTab === 'notifications' && (
                <div className="p-6 space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-bold text-[#111E16]">Notification Settings</h3>
                    <p className="text-xs text-[#6F7A70]">Opt in/out of dispatch notifications across different integrations.</p>
                  </div>
                  <hr className="border-[#BEC9BE]/40" />

                  <div className="space-y-4">
                    {}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-[#111E16] block uppercase tracking-wider">Email Dispatch Events</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="flex items-center gap-2.5 p-3 border border-[#BEC9BE]/40 rounded-xl cursor-pointer hover:bg-[#F6F6F6]/50">
                          <input
                            type="checkbox"
                            checked={notifications.emailOrders}
                            onChange={(e) => setNotifications({ ...notifications, emailOrders: e.target.checked })}
                            className="accent-[#00522E] w-4 h-4"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#111E16] block">Order Placed</span>
                            <span className="text-[9px] text-[#6F7A70]">Receipt confirmations</span>
                          </div>
                        </label>
                        <label className="flex items-center gap-2.5 p-3 border border-[#BEC9BE]/40 rounded-xl cursor-pointer hover:bg-[#F6F6F6]/50">
                          <input
                            type="checkbox"
                            checked={notifications.emailTickets}
                            onChange={(e) => setNotifications({ ...notifications, emailTickets: e.target.checked })}
                            className="accent-[#00522E] w-4 h-4"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#111E16] block">Support Tickets</span>
                            <span className="text-[9px] text-[#6F7A70]">Escalations & updates</span>
                          </div>
                        </label>
                        <label className="flex items-center gap-2.5 p-3 border border-[#BEC9BE]/40 rounded-xl cursor-pointer hover:bg-[#F6F6F6]/50">
                          <input
                            type="checkbox"
                            checked={notifications.emailSecurity}
                            onChange={(e) => setNotifications({ ...notifications, emailSecurity: e.target.checked })}
                            className="accent-[#00522E] w-4 h-4"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#111E16] block">Security Warnings</span>
                            <span className="text-[9px] text-[#6F7A70]">Login alerts & 2FA</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-[#111E16] block uppercase tracking-wider">SMS Dispatch Events</span>
                        <div className="space-y-2">
                          <label className="flex items-center justify-between p-2.5 bg-[#F6F6F6]/60 rounded-lg cursor-pointer">
                            <span className="text-xs font-semibold text-[#111E16]">Instant Order Status SMS</span>
                            <input
                              type="checkbox"
                              checked={notifications.smsOrders}
                              onChange={(e) => setNotifications({ ...notifications, smsOrders: e.target.checked })}
                              className="accent-[#00522E]"
                            />
                          </label>
                          <label className="flex items-center justify-between p-2.5 bg-[#F6F6F6]/60 rounded-lg cursor-pointer">
                            <span className="text-xs font-semibold text-[#111E16]">Verification & OTP codes</span>
                            <input
                              type="checkbox"
                              checked={notifications.smsOTP}
                              onChange={(e) => setNotifications({ ...notifications, smsOTP: e.target.checked })}
                              className="accent-[#00522E]"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-xs font-bold text-[#111E16] block uppercase tracking-wider">Browser Push alerts</span>
                        <div className="space-y-2">
                          <label className="flex items-center justify-between p-2.5 bg-[#F6F6F6]/60 rounded-lg cursor-pointer">
                            <span className="text-xs font-semibold text-[#111E16]">Daily offers and campaigns</span>
                            <input
                              type="checkbox"
                              checked={notifications.pushOffers}
                              onChange={(e) => setNotifications({ ...notifications, pushOffers: e.target.checked })}
                              className="accent-[#00522E]"
                            />
                          </label>
                          <label className="flex items-center justify-between p-2.5 bg-[#F6F6F6]/60 rounded-lg cursor-pointer">
                            <span className="text-xs font-semibold text-[#111E16]">Customer grievance ticket incoming</span>
                            <input
                              type="checkbox"
                              checked={notifications.pushTickets}
                              onChange={(e) => setNotifications({ ...notifications, pushTickets: e.target.checked })}
                              className="accent-[#00522E]"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-bold text-[#111E16] block uppercase tracking-wider">WhatsApp Business Channel</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2.5 p-3 border border-[#BEC9BE]/40 rounded-xl cursor-pointer hover:bg-[#F6F6F6]/50">
                          <input
                            type="checkbox"
                            checked={notifications.whatsappOrders}
                            onChange={(e) => setNotifications({ ...notifications, whatsappOrders: e.target.checked })}
                            className="accent-[#00522E]"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#111E16]">WhatsApp Order Confirmations</span>
                            <span className="text-[10px] text-[#6F7A70] block">Send receipt immediately to customer phone</span>
                          </div>
                        </label>
                        <label className="flex items-center gap-2.5 p-3 border border-[#BEC9BE]/40 rounded-xl cursor-pointer hover:bg-[#F6F6F6]/50">
                          <input
                            type="checkbox"
                            checked={notifications.whatsappSupport}
                            onChange={(e) => setNotifications({ ...notifications, whatsappSupport: e.target.checked })}
                            className="accent-[#00522E]"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#111E16]">Support Bot Chat Logs</span>
                            <span className="text-[10px] text-[#6F7A70] block">Sync WhatsApp support conversations with tickets</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#BEC9BE]/40">
                    <button
                      onClick={() => handleSaveSection('notifications', notifications, 'Adjusted dispatch event alerts for Email, SMS, WhatsApp.')}
                      disabled={saveLoading.notifications}
                      className="px-5 py-2.5 bg-[#00522E] hover:bg-[#003B21] disabled:bg-[#BEC9BE] text-white text-xs font-bold tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      {saveLoading.notifications ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {}
              {activeTab === 'payments' && (
                <div className="p-6 space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-bold text-[#111E16]">Payment Settings</h3>
                    <p className="text-xs text-[#6F7A70]">Enable gateways, configure Stripe and Razorpay API details, and manage Cash on Delivery limits.</p>
                  </div>
                  <hr className="border-[#BEC9BE]/40" />

                  <div className="space-y-6">
                    {}
                    <div className="border border-[#BEC9BE]/40 rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-xs font-bold text-[#111E16]">Razorpay Checkout API</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={payments.razorpayEnabled}
                            onChange={(e) => setPayments({ ...payments, razorpayEnabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-[#BEC9BE]/60 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00522E]"></div>
                        </label>
                      </div>

                      {payments.razorpayEnabled && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#6F7A70] uppercase">Razorpay Key ID</label>
                            <input
                              type="text"
                              value={payments.razorpayKeyId}
                              onChange={(e) => setPayments({ ...payments, razorpayKeyId: e.target.value })}
                              className="w-full bg-[#F6F6F6] text-xs font-mono text-[#111E16] rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#6F7A70] uppercase">Razorpay Key Secret</label>
                            <div className="relative">
                              <input
                                type={showRazorpaySecret ? 'text' : 'password'}
                                value={payments.razorpaySecret}
                                onChange={(e) => setPayments({ ...payments, razorpaySecret: e.target.value })}
                                className="w-full bg-[#F6F6F6] text-xs font-mono text-[#111E16] rounded-lg pl-3 pr-9 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6F7A70] hover:text-[#111E16]"
                              >
                                <span className="text-[10px] font-bold">{showRazorpaySecret ? 'Hide' : 'Show'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {}
                    <div className="border border-[#BEC9BE]/40 rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <span className="text-xs font-bold text-[#111E16]">Stripe Payments Gateway</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={payments.stripeEnabled}
                            onChange={(e) => setPayments({ ...payments, stripeEnabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-[#BEC9BE]/60 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00522E]"></div>
                        </label>
                      </div>

                      {payments.stripeEnabled && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#6F7A70] uppercase">Stripe Publishable Key</label>
                            <input
                              type="text"
                              value={payments.stripePublishableKey}
                              onChange={(e) => setPayments({ ...payments, stripePublishableKey: e.target.value })}
                              className="w-full bg-[#F6F6F6] text-xs font-mono text-[#111E16] rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#6F7A70] uppercase">Stripe Secret Key</label>
                            <div className="relative">
                              <input
                                type={showStripeSecret ? 'text' : 'password'}
                                value={payments.stripeSecretKey}
                                onChange={(e) => setPayments({ ...payments, stripeSecretKey: e.target.value })}
                                className="w-full bg-[#F6F6F6] text-xs font-mono text-[#111E16] rounded-lg pl-3 pr-9 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowStripeSecret(!showStripeSecret)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6F7A70] hover:text-[#111E16]"
                              >
                                <span className="text-[10px] font-bold">{showStripeSecret ? 'Hide' : 'Show'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {}
                      <div className="border border-[#BEC9BE]/40 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#111E16]">UPI Intent payments</span>
                          <input
                            type="checkbox"
                            checked={payments.upiEnabled}
                            onChange={(e) => setPayments({ ...payments, upiEnabled: e.target.checked })}
                            className="accent-[#00522E]"
                          />
                        </div>
                        {payments.upiEnabled && (
                          <div className="space-y-3 pt-1">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-[#6F7A70] uppercase">Merchant UPI VPA ID</label>
                              <input
                                type="text"
                                value={payments.upiId}
                                onChange={(e) => setPayments({ ...payments, upiId: e.target.value })}
                                className="w-full bg-[#F6F6F6] text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {}
                      <div className="border border-[#BEC9BE]/40 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#111E16]">Cash on Delivery</span>
                          <input
                            type="checkbox"
                            checked={payments.codEnabled}
                            onChange={(e) => setPayments({ ...payments, codEnabled: e.target.checked })}
                            className="accent-[#00522E]"
                          />
                        </div>
                        {payments.codEnabled && (
                          <div className="space-y-3 pt-1">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-[#6F7A70] uppercase">Max COD Transaction Limit</label>
                              <input
                                type="number"
                                value={payments.codMaxLimit}
                                onChange={(e) => setPayments({ ...payments, codMaxLimit: parseInt(e.target.value) })}
                                className="w-full bg-[#F6F6F6] text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#BEC9BE]/40">
                    <button
                      onClick={() => handleSaveSection('payments', payments, 'Configured Payment gateway integrations (Stripe, Razorpay, UPI).')}
                      disabled={saveLoading.payments}
                      className="px-5 py-2.5 bg-[#00522E] hover:bg-[#003B21] disabled:bg-[#BEC9BE] text-white text-xs font-bold tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      {saveLoading.payments ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {}
              {activeTab === 'shipping' && (
                <div className="p-6 space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-bold text-[#111E16]">Shipping Settings</h3>
                    <p className="text-xs text-[#6F7A70]">Set delivery charges, shipping rates, and partner integrations.</p>
                  </div>
                  <hr className="border-[#BEC9BE]/40" />

                  {}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-[#111E16] block uppercase tracking-wider">Shipping Zones</span>
                    <div className="border border-[#BEC9BE]/40 rounded-xl overflow-hidden shadow-xs bg-[#F6F6F6]/20">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#E8F8E9]/40 border-b border-[#BEC9BE]/60 text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase">
                            <th className="px-4 py-2.5">Zone Name</th>
                            <th className="px-4 py-2.5">Bound Region</th>
                            <th className="px-4 py-2.5">Base Rate</th>
                            <th className="px-4 py-2.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#BEC9BE]/30 text-xs text-[#111E16]">
                          {shippingZones.map((zone) => (
                            <tr key={zone.id}>
                              <td className="px-4 py-2.5 font-bold text-[#00522E]">{zone.name}</td>
                              <td className="px-4 py-2.5 text-[#6F7A70]">{zone.regions}</td>
                              <td className="px-4 py-2.5 font-semibold">₹{zone.rate}</td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  onClick={() => handleRemoveShippingZone(zone.id, zone.name)}
                                  className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {}
                  <form onSubmit={handleAddShippingZone} className="border border-[#BEC9BE]/40 rounded-xl p-4 bg-[#F6F6F6]/40 space-y-4">
                    <span className="text-xs font-bold text-[#111E16] block uppercase tracking-wider">Create Shipping Zone</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#6F7A70] uppercase">Zone Name</label>
                        <input
                          type="text"
                          placeholder="e.g. South Region"
                          value={newZoneName}
                          onChange={(e) => setNewZoneName(e.target.value)}
                          className="w-full bg-white text-xs font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#6F7A70] uppercase">Regions Covered</label>
                        <input
                          type="text"
                          placeholder="e.g. AP, TN, KL, KA"
                          value={newZoneRegions}
                          onChange={(e) => setNewZoneRegions(e.target.value)}
                          className="w-full bg-white text-xs font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#6F7A70] uppercase">Base Fee (₹)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="75"
                            value={newZoneRate}
                            onChange={(e) => setNewZoneRate(e.target.value)}
                            className="w-full bg-white text-xs font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg cursor-pointer shrink-0"
                          >
                            Add Zone
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>

                  {}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Free Shipping Threshold (₹)</label>
                      <input
                        type="number"
                        value={shipping.freeShippingThreshold}
                        onChange={(e) => setShipping({ ...shipping, freeShippingThreshold: parseInt(e.target.value) })}
                        className="w-full bg-[#F6F6F6] text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#6F7A70] uppercase">Courier Partner Whitelist</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <label className="flex items-center gap-2 text-xs font-semibold text-[#111E16]">
                          <input
                            type="checkbox"
                            checked={shipping.courierFedex}
                            onChange={(e) => setShipping({ ...shipping, courierFedex: e.target.checked })}
                            className="accent-[#00522E]"
                          />
                          <span>FedEx India</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-[#111E16]">
                          <input
                            type="checkbox"
                            checked={shipping.courierDHL}
                            onChange={(e) => setShipping({ ...shipping, courierDHL: e.target.checked })}
                            className="accent-[#00522E]"
                          />
                          <span>DHL Express</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-[#111E16]">
                          <input
                            type="checkbox"
                            checked={shipping.courierBlueDart}
                            onChange={(e) => setShipping({ ...shipping, courierBlueDart: e.target.checked })}
                            className="accent-[#00522E]"
                          />
                          <span>Blue Dart</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-[#111E16]">
                          <input
                            type="checkbox"
                            checked={shipping.courierDelhivery}
                            onChange={(e) => setShipping({ ...shipping, courierDelhivery: e.target.checked })}
                            className="accent-[#00522E]"
                          />
                          <span>Delhivery</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#BEC9BE]/40">
                    <button
                      onClick={() => handleSaveSection('shipping', shipping, 'Modified Free Shipping thresholds and courier partners.')}
                      disabled={saveLoading.shipping}
                      className="px-5 py-2.5 bg-[#00522E] hover:bg-[#003B21] disabled:bg-[#BEC9BE] text-white text-xs font-bold tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      {saveLoading.shipping ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {}
              {activeTab === 'tax' && (
                <div className="p-6 space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-bold text-[#111E16]">Tax Configuration</h3>
                    <p className="text-xs text-[#6F7A70]">Enable regional Goods and Services Tax (GST) rules and tax rate slabs.</p>
                  </div>
                  <hr className="border-[#BEC9BE]/40" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-[#BEC9BE]/40 rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-[#111E16] block">Enable Indian Goods & Services Tax (GST)</span>
                        <span className="text-[10px] text-[#6F7A70]">Automate tax breakdown during checkout</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={tax.gstEnabled}
                        onChange={(e) => setTax({ ...tax, gstEnabled: e.target.checked })}
                        className="accent-[#00522E] w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {tax.gstEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[#6F7A70] uppercase">GSTIN (Registration Number)</label>
                          <input
                            type="text"
                            placeholder="36AAAAA1111A1Z1"
                            value={tax.gstin}
                            onChange={(e) => setTax({ ...tax, gstin: e.target.value.toUpperCase() })}
                            className="w-full bg-[#F6F6F6] text-sm font-mono text-[#111E16] rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[#6F7A70] uppercase">Regional Tax Exemption Rules</label>
                          <input
                            type="text"
                            value={tax.regionalTaxRules}
                            onChange={(e) => setTax({ ...tax, regionalTaxRules: e.target.value })}
                            className="w-full bg-[#F6F6F6] text-sm text-[#111E16] font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-3 sm:col-span-2">
                          <span className="text-xs font-bold text-[#111E16] block uppercase tracking-wider">GST Distribution Rates</span>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[#6F7A70] uppercase">CGST Rate (%)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={tax.cgstRate}
                                onChange={(e) => setTax({ ...tax, cgstRate: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-[#F6F6F6] text-xs font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[#6F7A70] uppercase">SGST Rate (%)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={tax.sgstRate}
                                onChange={(e) => setTax({ ...tax, sgstRate: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-[#F6F6F6] text-xs font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[#6F7A70] uppercase">IGST Rate (%)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={tax.igstRate}
                                onChange={(e) => setTax({ ...tax, igstRate: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-[#F6F6F6] text-xs font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#BEC9BE]/40">
                    <button
                      onClick={() => handleSaveSection('tax', tax, `Modified GSTIN to "${tax.gstin}" & tax distribution rates.`)}
                      disabled={saveLoading.tax}
                      className="px-5 py-2.5 bg-[#00522E] hover:bg-[#003B21] disabled:bg-[#BEC9BE] text-white text-xs font-bold tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      {saveLoading.tax ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {}
              {activeTab === 'security' && (
                <div className="p-6 space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-bold text-[#111E16]">Security Settings</h3>
                    <p className="text-xs text-[#6F7A70]">Secure your endpoints with 2FA whitelists and lockout boundaries.</p>
                  </div>
                  <hr className="border-[#BEC9BE]/40" />

                  <div className="space-y-6">
                    {}
                    <div className="flex items-center justify-between p-3 border border-[#BEC9BE]/40 rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-[#111E16] block">Two-Factor Authentication (2FA)</span>
                        <span className="text-[10px] text-[#6F7A70]">Secure logins using custom TOTP codes</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={security.twoFactorEnabled}
                        onChange={(e) => handleToggle2FA(e.target.checked)}
                        className="accent-[#00522E] w-4 h-4 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#6F7A70] uppercase">Session Lifetime (min)</label>
                        <input
                          type="number"
                          value={security.sessionTimeoutMinutes}
                          onChange={(e) => setSecurity({ ...security, sessionTimeoutMinutes: parseInt(e.target.value) })}
                          className="w-full bg-[#F6F6F6] text-xs font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#6F7A70] uppercase">Max Login Attempts</label>
                        <input
                          type="number"
                          value={security.maxLoginAttempts}
                          onChange={(e) => setSecurity({ ...security, maxLoginAttempts: parseInt(e.target.value) })}
                          className="w-full bg-[#F6F6F6] text-xs font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#6F7A70] uppercase">Lockout Duration (min)</label>
                        <input
                          type="number"
                          value={security.lockoutDuration}
                          onChange={(e) => setSecurity({ ...security, lockoutDuration: parseInt(e.target.value) })}
                          className="w-full bg-[#F6F6F6] text-xs font-semibold rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                        />
                      </div>
                    </div>

                    {}
                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-bold text-[#111E16] block uppercase tracking-wider">IP Address Restriction Whitelist</span>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {security.ipWhitelist.map((ip: string) => (
                          <div key={ip} className="flex items-center gap-1.5 bg-[#E8F8E9] border border-[#00522E]/20 text-[#00522E] px-2.5 py-1 rounded-full text-xs font-semibold">
                            <span>{ip}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveIp(ip)}
                              className="text-[#BA1A1A] font-bold hover:text-[#930006] cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3 max-w-md">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="e.g. 192.168.1.1"
                            value={newIpInput}
                            onChange={(e) => setNewIpInput(e.target.value)}
                            className="w-full bg-[#F6F6F6] text-xs font-mono text-[#111E16] rounded-lg px-3 py-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                          />
                          {ipError && <p className="text-[10px] text-[#BA1A1A] font-semibold mt-1">{ipError}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddIp}
                          className="px-4 py-2.5 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg cursor-pointer h-fit"
                        >
                          Whitelist IP
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#BEC9BE]/40">
                    <button
                      onClick={() => handleSaveSection('security', security, 'Modified IP whitelist whitelisting and account lockout durations.')}
                      disabled={saveLoading.security}
                      className="px-5 py-2.5 bg-[#00522E] hover:bg-[#003B21] disabled:bg-[#BEC9BE] text-white text-xs font-bold tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      {saveLoading.security ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {}
              {activeTab === 'templates' && (
                <div className="p-6 space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-[#111E16]">Email & SMS Templates</h3>
                      <p className="text-xs text-[#6F7A70]">Customize confirmation messaging, shipment status notices, and OTP templates.</p>
                    </div>
                    <select
                      value={emailTemplates.selectedTemplate}
                      onChange={(e) => setEmailTemplates({ ...emailTemplates, selectedTemplate: e.target.value })}
                      className="bg-white text-xs font-bold text-[#111E16] border border-[#BEC9BE] rounded-lg px-3 py-2 cursor-pointer hover:bg-[#F6F6F6]"
                    >
                      <option value="order_confirmation">Order Confirmation</option>
                      <option value="shipment_notification">Shipment Notification</option>
                      <option value="refund_notification">Refund Notification</option>
                      <option value="otp_template">OTP Templates</option>
                    </select>
                  </div>
                  <hr className="border-[#BEC9BE]/40" />

                  {}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6F7A70] uppercase">Subject Line Template</label>
                        <input
                          type="text"
                          value={emailTemplates[emailTemplates.selectedTemplate as keyof typeof emailTemplates]?.subject || ''}
                          onChange={(e) => {
                            const cur = emailTemplates.selectedTemplate;
                            setEmailTemplates({
                              ...emailTemplates,
                              [cur]: {
                                ...emailTemplates[cur as keyof typeof emailTemplates],
                                subject: e.target.value
                              }
                            });
                          }}
                          className="w-full bg-[#F6F6F6] text-xs font-semibold text-[#111E16] rounded-lg px-3 py-2 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-[#6F7A70] uppercase">Template Body (Markdown supported)</label>
                          <span className="text-[9px] font-bold text-[#00522E]">Variables: {"{{order_id}}"}, {"{{customer_name}}"}</span>
                        </div>
                        <textarea
                          rows={10}
                          value={emailTemplates[emailTemplates.selectedTemplate as keyof typeof emailTemplates]?.body || ''}
                          onChange={(e) => {
                            const cur = emailTemplates.selectedTemplate;
                            setEmailTemplates({
                              ...emailTemplates,
                              [cur]: {
                                ...emailTemplates[cur as keyof typeof emailTemplates],
                                body: e.target.value
                              }
                            });
                          }}
                          className="w-full bg-[#F6F6F6] text-xs font-mono text-[#111E16] rounded-lg p-3 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
                        />
                      </div>
                    </div>

                    {}
                    <div className="border border-[#BEC9BE]/40 rounded-xl overflow-hidden shadow-xs flex flex-col h-full bg-[#F6F6F6]/30">
                      <div className="bg-[#E8F8E9]/40 border-b border-[#BEC9BE]/40 px-4 py-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider">Visual Template Preview</span>
                        <div className="flex gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-start bg-white space-y-4 text-xs">
                        <div className="bg-[#F6F6F6] rounded-lg p-3 border border-[#BEC9BE]/20 space-y-1">
                          <p className="text-[#6F7A70] font-semibold">From: <span className="text-[#111E16]">no-reply@fashionstore.com</span></p>
                          <p className="text-[#6F7A70] font-semibold">Subject: <span className="text-[#00522E] font-bold">
                            {emailTemplates[emailTemplates.selectedTemplate as keyof typeof emailTemplates]?.subject
                              .replace('{{order_id}}', 'ORD-2026-9812')
                              .replace('{{otp_code}}', '720194') || ''}
                          </span></p>
                        </div>
                        <div className="whitespace-pre-line text-[#333333] font-sans leading-relaxed border-l-2 border-[#00522E]/20 pl-3">
                          {emailTemplates[emailTemplates.selectedTemplate as keyof typeof emailTemplates]?.body
                            .replace('{{customer_name}}', 'Chimala Sai Kiran')
                            .replace('{{order_id}}', 'ORD-2026-9812')
                            .replace('{{order_total}}', '₹2,499.00')
                            .replace('{{courier_partner}}', 'DHL Express')
                            .replace('{{tracking_url}}', 'https://track.dhl/fashion-store/2618')
                            .replace('{{est_delivery}}', 'June 26, 2026')
                            .replace('{{refund_amount}}', '₹799.00')
                            .replace('{{otp_code}}', '720194') || ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#BEC9BE]/40">
                    <button
                      onClick={() => handleSaveSection('emailTemplates', emailTemplates, `Updated layout messaging template for: ${emailTemplates.selectedTemplate}.`)}
                      disabled={saveLoading.emailTemplates}
                      className="px-5 py-2.5 bg-[#00522E] hover:bg-[#003B21] disabled:bg-[#BEC9BE] text-white text-xs font-bold tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      {saveLoading.emailTemplates ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {}
              {activeTab === 'audit' && (
                <div className="p-6 space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-bold text-[#111E16]">Audit Logs</h3>
                    <p className="text-xs text-[#6F7A70]">Real-time audit trails of settings revisions and permission swaps.</p>
                  </div>
                  <hr className="border-[#BEC9BE]/40" />

                  {}
                  <div className="border border-[#BEC9BE]/40 rounded-xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#E8F8E9]/40 border-b border-[#BEC9BE]/60 text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase">
                            <th className="px-4 py-3">Timestamp</th>
                            <th className="px-4 py-3">Admin Operator</th>
                            <th className="px-4 py-3">Module Action</th>
                            <th className="px-4 py-3">Configuration Changes Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#BEC9BE]/30 text-xs text-[#111E16]">
                          {auditLogs.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-6 text-center text-[#6F7A70] font-semibold italic">No audit records logged.</td>
                            </tr>
                          ) : (
                            auditLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-[#F6F6F6]/40 transition-colors">
                                <td className="px-4 py-3 font-mono text-[10px] text-[#797979]">
                                  {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 font-semibold text-[#00522E]">
                                  {log.user}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 rounded bg-[#F8B057]/15 text-[#401900] font-bold text-[9px] uppercase tracking-wide">
                                    {log.action}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-[#6F7A70] max-w-sm truncate" title={log.details}>
                                  {log.details}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {}
              {activeTab === 'backup' && (
                <div className="p-6 space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#111E16]">Backup & Restore</h3>
                      <p className="text-xs text-[#6F7A70]">Backup system tables, restore configuration states, or wipe old backup files.</p>
                    </div>
                    <button
                      onClick={handleCreateBackup}
                      disabled={saveLoading.backup}
                      className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] disabled:bg-[#BEC9BE] text-white text-xs font-bold tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      {saveLoading.backup ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Dumping Database...</span>
                        </>
                      ) : (
                        <span>Create Backup Now</span>
                      )}
                    </button>
                  </div>
                  <hr className="border-[#BEC9BE]/40" />

                  {}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-[#111E16] block uppercase tracking-wider">Stored Database Backups</span>
                    
                    <div className="border border-[#BEC9BE]/40 rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#E8F8E9]/40 border-b border-[#BEC9BE]/60 text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase">
                            <th className="px-4 py-2.5">Backup Filename</th>
                            <th className="px-4 py-2.5">File Size</th>
                            <th className="px-4 py-2.5">Created Date</th>
                            <th className="px-4 py-2.5">Status</th>
                            <th className="px-4 py-2.5 text-right">Server Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#BEC9BE]/30 text-xs text-[#111E16]">
                          {backups.map((bk) => (
                            <tr key={bk.id} className="hover:bg-[#F6F6F6]/40 transition-colors">
                              <td className="px-4 py-2.5 font-mono text-[11px] font-bold text-[#00522E]">{bk.filename}</td>
                              <td className="px-4 py-2.5 text-[#6F7A70] font-semibold">{bk.size}</td>
                              <td className="px-4 py-2.5 text-[#797979]">{bk.date}</td>
                              <td className="px-4 py-2.5">
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#E8F8E9] text-[#00522E]">
                                  {bk.status}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-right space-x-3">
                                <button
                                  onClick={() => handleRestoreBackup(bk.filename)}
                                  className="text-xs font-bold text-[#401900] hover:underline transition-colors"
                                >
                                  Restore
                                </button>
                                <button
                                  onClick={() => handleDeleteBackup(bk.id, bk.filename)}
                                  className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
