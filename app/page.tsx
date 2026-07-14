'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from '../hooks/use-mobile';
import { 
  mockLocations, 
  mockVendors, 
  mockProducts, 
  mockInventoryBalances, 
  mockReplenishmentProposals, 
  mockOrders, 
  mockPromotions, 
  mockDigitalFlyers, 
  mockShowrooms, 
  mockQuotations, 
  mockConversations, 
  mockNotifications, 
  currentUser 
} from '../lib/mockData';
import { 
  Vendor, 
  Product, 
  InventoryBalance, 
  ReplenishmentProposal, 
  Order, 
  Quotation, 
  DigitalFlyer, 
  Conversation, 
  Notification, 
  UserProfile, 
  OrderLine,
  ReplenishmentProposalLine
} from '../lib/types';

// Importing Custom Screens
import LoginScreen from '../components/LoginScreen';
import StockCountWorkflow from '../components/StockCountWorkflow';
import DigitalFlyerViewer from '../components/DigitalFlyerViewer';
import MessagesCenter from '../components/MessagesCenter';
import ProposalDetail from '../components/ProposalDetail';
import DashboardView from '../components/DashboardView';
import InventoryView from '../components/InventoryView';
import OrdersView from '../components/OrdersView';
import VendorDashboardView from '../components/VendorDashboardView';

import { 
  Bell, 
  CheckCircle2, 
  Database, 
  Globe, 
  Globe2, 
  HelpCircle, 
  Home, 
  Layers, 
  LogOut, 
  MessageSquare, 
  Package, 
  Plus,
  RefreshCw, 
  Settings,
  ShieldCheck, 
  ShoppingBag, 
  Sun,
  Moon,
  User, 
  Wifi, 
  WifiOff,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  MessageCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

// Static available staff per vendor
const VENDOR_CONTACTS: Record<string, { name: string; role: string; phone: string; email: string; status: 'online' | 'busy' | 'offline' }[]> = {
  'v-1': [
    { name: 'Tomasz Kowalski', role: 'Główny opiekun', phone: '+48 601 234 567', email: 't.kowalski@autopartspro.pl', status: 'online' },
    { name: 'Janusz Nowak', role: 'Wsparcie techniczne', phone: '+48 601 111 222', email: 'j.nowak@autopartspro.pl', status: 'online' }
  ],
  'v-2': [
    { name: 'Andrzej Wiśniewski', role: 'Kluczowy opiekun', phone: '+48 602 987 654', email: 'a.wisniewski@werktools.pl', status: 'online' },
    { name: 'Marcin Zieliński', role: 'Inżynier sprzedaży', phone: '+48 602 333 444', email: 'm.zielinski@werktools.pl', status: 'offline' }
  ],
  'v-3': [
    { name: 'Karolina Nowak', role: 'Opiekun handlowy', phone: '+48 501 111 222', email: 'k.nowak@cleanchem.com.pl', status: 'online' },
    { name: 'Piotr Kaczmarek', role: 'Dyrektor handlowy', phone: '+48 501 555 666', email: 'p.kaczmarek@cleanchem.com.pl', status: 'busy' }
  ],
  'v-4': [
    { name: 'Marek Jankowski', role: 'Konsultant techniczny', phone: '+48 701 444 555', email: 'm.jankowski@safecut.pl', status: 'online' },
    { name: 'Anna Dąbrowska', role: 'Dział logistyki', phone: '+48 701 888 999', email: 'a.dabrowska@safecut.pl', status: 'online' }
  ]
};

export default function MainPage() {
  const isMobile = useIsMobile();
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) return savedTheme;
      const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      return systemPref;
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(currentUser);

  // App Navigation Routing State
  const [currentTab, setCurrentTab] = useState<'home' | 'vendors' | 'inventory' | 'orders' | 'messages' | 'settings'>('home');
  const [activeLocationId, setActiveLocationId] = useState<string>('loc-1');
  
  // Simulated developer features
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineDraftsCount, setOfflineDraftsCount] = useState<number>(0);

  // Domain state layers
  const [inventoryBalances, setInventoryBalances] = useState<InventoryBalance[]>([]);
  const [proposals, setProposals] = useState<ReplenishmentProposal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Separate Carts by Vendor: { [vendorId: string]: OrderLine[] }
  const [carts, setCarts] = useState<{ [vendorId: string]: OrderLine[] }>({});

  // Active sub-modals or detail-screen overlays
  const [activeVendorId, setActiveVendorId] = useState<string | null>(null);
  const [expandedContactsVendorId, setExpandedContactsVendorId] = useState<string | null>(null);
  const [activeProposalId, setActiveProposalId] = useState<string | null>(null);
  const [activeFlyer, setActiveFlyer] = useState<DigitalFlyer | null>(null);
  const [isCountWorkflowOpen, setIsCountWorkflowOpen] = useState<boolean>(false);
  
  // Quick deep link variables
  const [messageCenterInitialId, setMessageCenterInitialId] = useState<string | null>(null);

  // 1. Synchronize to/from localStorage on Mount & Update
  useEffect(() => {
    const loadPersistedState = () => {
      // Load from local storage or fallback to mock files
      const storedAuth = localStorage.getItem('vmi_is_logged_in');
      if (storedAuth === 'true') {
        setIsLoggedIn(true);
      }

      const storedInventory = localStorage.getItem('vmi_inventory');
      if (storedInventory) {
        setInventoryBalances(JSON.parse(storedInventory));
      } else {
        setInventoryBalances(mockInventoryBalances);
      }

      const storedProposals = localStorage.getItem('vmi_proposals');
      if (storedProposals) {
        setProposals(JSON.parse(storedProposals));
      } else {
        setProposals(mockReplenishmentProposals);
      }

      const storedOrders = localStorage.getItem('vmi_orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      } else {
        setOrders(mockOrders);
      }

      const storedQuotations = localStorage.getItem('vmi_quotations');
      if (storedQuotations) {
        setQuotations(JSON.parse(storedQuotations));
      } else {
        setQuotations(mockQuotations);
      }

      const storedConversations = localStorage.getItem('vmi_conversations');
      if (storedConversations) {
        setConversations(JSON.parse(storedConversations));
      } else {
        setConversations(mockConversations);
      }

      const storedNotifications = localStorage.getItem('vmi_notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      } else {
        setNotifications(mockNotifications);
      }

      const storedCarts = localStorage.getItem('vmi_carts');
      if (storedCarts) {
        setCarts(JSON.parse(storedCarts));
      }

      const storedOfflineDrafts = localStorage.getItem('vmi_offline_drafts_count');
      if (storedOfflineDrafts) {
        setOfflineDraftsCount(parseInt(storedOfflineDrafts, 10));
      }
    };

    const timer = setTimeout(loadPersistedState, 0);
    return () => clearTimeout(timer);
  }, []);

  // Helpers to update and persist state
  const saveInventoryState = (newBalances: InventoryBalance[]) => {
    setInventoryBalances(newBalances);
    localStorage.setItem('vmi_inventory', JSON.stringify(newBalances));
  };

  const saveProposalsState = (newProposals: ReplenishmentProposal[]) => {
    setProposals(newProposals);
    localStorage.setItem('vmi_proposals', JSON.stringify(newProposals));
  };

  const saveOrdersState = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('vmi_orders', JSON.stringify(newOrders));
  };

  const saveNotificationsState = (newNotifs: Notification[]) => {
    setNotifications(newNotifs);
    localStorage.setItem('vmi_notifications', JSON.stringify(newNotifs));
  };

  const saveConversationsState = (newConvs: Conversation[]) => {
    setConversations(newConvs);
    localStorage.setItem('vmi_conversations', JSON.stringify(newConvs));
  };

  const saveCartsState = (newCarts: { [vendorId: string]: OrderLine[] }) => {
    setCarts(newCarts);
    localStorage.setItem('vmi_carts', JSON.stringify(newCarts));
  };

  // 2. Action Flow Implementations
  const handleLogin = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsLoggedIn(true);
    localStorage.setItem('vmi_is_logged_in', 'true');
    
    // Auto trigger welcome notification
    triggerLocalNotification('System VMI', 'Zalogowano pomyślnie do platformy Ambra VMI. Witaj, Michał!');
  };

  const handleLogout = () => {
    if (confirm('Czy chcesz wylogować się z systemu?')) {
      setIsLoggedIn(false);
      localStorage.removeItem('vmi_is_logged_in');
    }
  };

  const triggerLocalNotification = (title: string, content: string, type: any = 'Low-stock warning') => {
    const newNotif: Notification = {
      id: `n_loc_${Date.now()}`,
      type,
      title,
      content,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false
    };
    saveNotificationsState([newNotif, ...notifications]);
  };

  // Add item to cart
  const handleAddToCart = (productId: string, qty: number) => {
    const prod = mockProducts.find(p => p.id === productId);
    if (!prod) return;

    const vendorId = prod.vendorId;
    const price = prod.promoPrice || prod.price;

    const vendorCart = carts[vendorId] || [];
    const idx = vendorCart.findIndex(i => i.productId === productId);
    
    let updatedCart = [...vendorCart];
    if (idx > -1) {
      updatedCart[idx].requestedQty += qty;
      updatedCart[idx].confirmedQty = updatedCart[idx].requestedQty;
    } else {
      updatedCart.push({ 
        productId, 
        requestedQty: qty, 
        confirmedQty: qty,
        shippedQty: 0,
        deliveredQty: 0,
        price 
      });
    }

    const updatedCarts = { ...carts, [vendorId]: updatedCart };
    saveCartsState(updatedCarts);

    triggerLocalNotification(
      'Koszyk zaktualizowany', 
      `Dodano ${qty} szt. produktu "${prod.name}" do koszyka dostawcy "${mockVendors.find(v => v.id === vendorId)?.name}".`
    );
  };

  // Remove from cart
  const handleRemoveFromCart = (vendorId: string, productId: string) => {
    const vendorCart = carts[vendorId] || [];
    const updatedCart = vendorCart.filter(i => i.productId !== productId);
    const updatedCarts = { ...carts, [vendorId]: updatedCart };
    saveCartsState(updatedCarts);
  };

  // Update quantity in cart
  const handleUpdateCartQty = (vendorId: string, productId: string, qty: number) => {
    const vendorCart = carts[vendorId] || [];
    const updatedCart = vendorCart.map(item => {
      if (item.productId === productId) {
        return { ...item, requestedQty: qty };
      }
      return item;
    });
    const updatedCarts = { ...carts, [vendorId]: updatedCart };
    saveCartsState(updatedCarts);
  };

  // Checkout (manual cart submission to VMI Order)
  const handleCheckout = (
    vendorId: string,
    deliveryLocationId: string,
    requestedDeliveryDate: string,
    poReference: string,
    comments: string
  ) => {
    const vendorCart = carts[vendorId] || [];
    if (vendorCart.length === 0) return;

    // Create new order object
    const newOrder: Order = {
      id: `o_loc_${Date.now()}`,
      vendorId,
      locationId: deliveryLocationId,
      orderNumber: `ZAM-202607-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().substring(0, 10),
      requestedDeliveryDate,
      origin: 'Zamówienie ręczne',
      status: 'Wysłane',
      poReference: poReference || `PO-MAN-${Date.now().toString().slice(-4)}`,
      notes: comments,
      hasAttachment: false,
      lines: vendorCart.map(i => ({
        productId: i.productId,
        requestedQty: i.requestedQty,
        confirmedQty: i.requestedQty,
        shippedQty: 0,
        deliveredQty: 0,
        price: i.price
      })),
      timeline: [
        { status: 'Szkic', date: new Date().toISOString().substring(0, 16).replace('T', ' '), description: 'Złożono zamówienie z portalu mobilnego.' }
      ]
    };

    // Save order
    const nextOrders = [newOrder, ...orders];
    saveOrdersState(nextOrders);

    // Empty specific cart
    const nextCarts = { ...carts };
    delete nextCarts[vendorId];
    saveCartsState(nextCarts);

    // Create success notification
    triggerLocalNotification(
      'Nowe zamówienie ręczne',
      `Złożono zamówienie ${newOrder.orderNumber} do dostawcy ${mockVendors.find(v => v.id === vendorId)?.name}.`,
      'Order status changed'
    );
  };

  // Message Sending
  const handleSendMessage = (conversationId: string, text: string) => {
    const updated = conversations.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          unreadCount: 0,
          lastUpdated: new Date().toISOString(),
          messages: [
            ...c.messages,
            {
              id: `msg_loc_${Date.now()}`,
              sender: 'client' as const,
              senderName: userProfile.name,
              content: text,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return c;
    });
    saveConversationsState(updated);
  };

  // Initiate message from product detail / quotation / order context
  const handleInitiateContextChat = (
    vendorId: string, 
    subject: string, 
    objectType: 'product' | 'order' | 'quotation' | 'proposal' | 'none', 
    objectId: string
  ) => {
    // Check if duplicate conversation exists
    const existing = conversations.find(c => 
      c.vendorId === vendorId && 
      c.relatedObjectType === objectType && 
      c.relatedObjectId === objectId
    );

    if (existing) {
      setMessageCenterInitialId(existing.id);
      setCurrentTab('messages'); // Messages is placed in 'messages' tab
      return;
    }

    // Create new conversation
    const newConv: Conversation = {
      id: `c_loc_${Date.now()}`,
      vendorId,
      subject,
      relatedObjectType: objectType,
      relatedObjectId: objectId,
      lastUpdated: new Date().toISOString(),
      unreadCount: 0,
      status: 'active',
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          sender: 'client',
          senderName: userProfile.name,
          content: `Cześć, piszę z zapytaniem w temacie: ${subject}.`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    saveConversationsState([newConv, ...conversations]);
    setMessageCenterInitialId(newConv.id);
    setCurrentTab('messages'); // Switch to message tab
    
    triggerLocalNotification('Czat rozpoczęty', `Zainicjowano nową dyskusję kontekstową z dostawcą.`);
  };

  // Submit approved VMI replenishment proposal
  const handleProposalApprovalSubmit = (
    proposalId: string, 
    approvedLines: ReplenishmentProposalLine[], 
    comments?: string
  ) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;

    // Convert approved proposal lines into a new order
    const newOrder: Order = {
      id: `o_prop_${Date.now()}`,
      vendorId: proposal.vendorId,
      locationId: proposal.locationId,
      orderNumber: `ZAM-VMI-${proposal.proposalNumber.substring(8)}`,
      date: new Date().toISOString().substring(0, 10),
      requestedDeliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().substring(0, 10), // +3 days
      origin: 'Propozycja uzupełnienia',
      status: 'Wysłane',
      poReference: `PO-VMI-${proposal.proposalNumber.split('-')[2]}`,
      notes: comments || 'Automatyczna akceptacja propozycji VMI bez dodatkowych modyfikacji.',
      hasAttachment: false,
      lines: approvedLines.map(line => ({
        productId: line.productId,
        requestedQty: line.finalProposedQty,
        confirmedQty: line.finalProposedQty,
        shippedQty: 0,
        deliveredQty: 0,
        price: line.price
      })),
      timeline: [
        { status: 'Szkic', date: new Date().toISOString().replace('T', ' ').substring(0, 16), description: 'Wygenerowano automatycznie z harmonogramu inwentaryzacji VMI.' },
        { status: 'Wysłane', date: new Date().toISOString().replace('T', ' ').substring(0, 16), description: 'Zatwierdzono przez kierownika oddziału.' }
      ]
    };

    // Save order & update proposal status
    const updatedOrders = [newOrder, ...orders];
    saveOrdersState(updatedOrders);

    const updatedProposals: ReplenishmentProposal[] = proposals.map(p => {
      if (p.id === proposalId) {
        return { ...p, status: 'Zatwierdzona' as const };
      }
      return p;
    });
    saveProposalsState(updatedProposals);

    // Update product stock levels based on approved proposal
    const updatedBalances = inventoryBalances.map(bal => {
      const approvedLine = approvedLines.find(l => l.productId === bal.productId);
      if (approvedLine) {
        return {
          ...bal,
          incomingQty: bal.incomingQty + approvedLine.finalProposedQty
        };
      }
      return bal;
    });
    saveInventoryState(updatedBalances);

    setActiveProposalId(null);
    triggerLocalNotification(
      'Propozycja VMI zaakceptowana',
      `Zatwierdzono propozycję ${proposal.proposalNumber}. Wygenerowano zamówienie VMI ${newOrder.orderNumber}.`,
      'Order status changed'
    );
  };

  // Submit physical stock counting
  const handleStockCountSubmit = (countedLines: { [id: string]: number }, comments?: string) => {
    // Check network connectivity
    if (!isOnline) {
      // Simulate offline buffer saving
      setOfflineDraftsCount(prev => {
        const next = prev + 1;
        localStorage.setItem('vmi_offline_drafts_count', next.toString());
        return next;
      });

      // Save counts locally as cached drafts
      const storedDrafts = localStorage.getItem('vmi_offline_drafts_data') || '[]';
      const draftsArray = JSON.parse(storedDrafts);
      draftsArray.push({ countedLines, date: new Date().toISOString() });
      localStorage.setItem('vmi_offline_drafts_data', JSON.stringify(draftsArray));

      setIsCountWorkflowOpen(false);
      triggerLocalNotification(
        'Szkic inwentaryzacji (Offline)',
        'Brak połączenia sieciowego. Spis zapisany bezpiecznie jako szkic lokalny w pamięci urządzenia. Zostanie zsynchronizowany po przywróceniu sieci.'
      );
      return;
    }

    // Online count update
    const updatedBalances = inventoryBalances.map(bal => {
      if (bal.locationId === activeLocationId && countedLines[bal.productId] !== undefined) {
        const counted = countedLines[bal.productId];
        let status: 'Healthy' | 'Approaching minimum' | 'Below minimum' | 'Out of stock' | 'Overstocked' = 'Healthy';
        
        if (counted === 0) status = 'Out of stock';
        else if (counted <= bal.minStock) status = 'Below minimum';
        else if (counted > bal.targetStock * 1.5) status = 'Overstocked';

        return {
          ...bal,
          currentStock: counted,
          stockStatus: status,
          lastUpdated: new Date().toISOString()
        };
      }
      return bal;
    });

    saveInventoryState(updatedBalances);
    setIsCountWorkflowOpen(false);

    triggerLocalNotification(
      'Stan magazynowy zaktualizowany',
      'Pomyślnie zsynchronizowano nową inwentaryzację warsztatową VMI. Stany magazynowe zostały zaktualizowane.',
      'Stock-count request'
    );
  };

  // Force Resync offline drafts when online is turned back on
  const handleSyncOfflineDrafts = () => {
    if (!isOnline) {
      alert('Nie można zsynchronizować w trybie Offline. Włącz sieć komórkową lub Wi-Fi!');
      return;
    }

    const storedDrafts = localStorage.getItem('vmi_offline_drafts_data');
    if (storedDrafts) {
      const draftsArray = JSON.parse(storedDrafts);
      let updatedBalances = [...inventoryBalances];

      draftsArray.forEach((draft: any) => {
        updatedBalances = updatedBalances.map(bal => {
          if (bal.locationId === activeLocationId && draft.countedLines[bal.productId] !== undefined) {
            const counted = draft.countedLines[bal.productId];
            let status: 'Healthy' | 'Approaching minimum' | 'Below minimum' | 'Out of stock' | 'Overstocked' = 'Healthy';
            
            if (counted === 0) status = 'Out of stock';
            else if (counted <= bal.minStock) status = 'Below minimum';

            return {
              ...bal,
              currentStock: counted,
              stockStatus: status,
              lastUpdated: draft.date
            };
          }
          return bal;
        });
      });

      saveInventoryState(updatedBalances);
    }

    // Reset drafts
    setOfflineDraftsCount(0);
    localStorage.removeItem('vmi_offline_drafts_count');
    localStorage.removeItem('vmi_offline_drafts_data');

    triggerLocalNotification(
      'Szkice offline wysłane',
      'Pomyślnie wysłano i zsynchronizowano wszystkie zaległe inwentaryzacje z bufora offline.'
    );
  };

  const handleClearDemoCache = () => {
    if (confirm('Czy chcesz zresetować demo i załadować oryginalne dane testowe Ambra?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Filter conversations
  const unreadMessagesCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  }, [conversations]);

  // Notifications bell count
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // Clear unread badge of notifications
  const handleMarkNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveNotificationsState(updated);
  };

  // Render Page Content Tabs Router
  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <DashboardView
            locations={mockLocations}
            activeLocationId={activeLocationId}
            setActiveLocationId={setActiveLocationId}
            inventoryBalances={inventoryBalances}
            proposals={proposals}
            orders={orders}
            quotations={quotations}
            notifications={notifications}
            vendors={mockVendors}
            onNavigateTab={setCurrentTab}
            onOpenProposal={setActiveProposalId}
            onOpenOrder={(id) => { setSelectedOrderViewId(id); setCurrentTab('orders'); }}
            onOpenQuotation={(id) => { setActiveVendorId('v-4'); }} // BHP SafetyCore
            onOpenStockCount={() => setIsCountWorkflowOpen(true)}
            onOpenVendor={(vendorId, subtab) => { setActiveVendorId(vendorId); }}
          />
        );

      case 'vendors':
        return (
          <div className="space-y-4 text-xs">
            <div className="border-b border-[#E1E3E6] dark:border-gray-800 pb-2">
              <h2 className="text-base font-bold text-gray-950 dark:text-white font-display">Twoi certyfikowani partnerzy VMI</h2>
              <p className="text-gray-500 dark:text-gray-400">Dostęp do katalogów, cen, propozycji dostaw i bezpośredniej komunikacji</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {mockVendors.map(v => {
                const vendorProposalsCount = proposals.filter(p => p.vendorId === v.id && p.status === 'Oczekuje na zatwierdzenie').length;

                return (
                  <div
                    key={v.id}
                    className="bg-white dark:bg-[#0E1321] border border-[#E1E3E6] dark:border-gray-850 hover:border-gray-350 dark:hover:border-gray-800 rounded-xl overflow-hidden flex flex-col justify-between gap-0 transition-all shadow-sm group hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* Branded card header with custom background, patterns, and mock logo */}
                    <div className={cn(
                      "h-20 relative px-5 py-3 flex items-center justify-between border-b border-[#E1E3E6] dark:border-gray-850 overflow-hidden",
                      v.id === 'v-1' ? "bg-gradient-to-r from-blue-500/10 to-blue-600/5 dark:from-blue-550/20 dark:to-blue-900/10" :
                      v.id === 'v-2' ? "bg-gradient-to-r from-amber-500/10 to-orange-600/5 dark:from-amber-550/20 dark:to-orange-900/10" :
                      v.id === 'v-3' ? "bg-gradient-to-r from-emerald-500/10 to-teal-600/5 dark:from-emerald-550/20 dark:to-teal-900/10" :
                      "bg-gradient-to-r from-rose-500/10 to-red-600/5 dark:from-rose-550/20 dark:to-red-900/10"
                    )}>
                      {/* Decorative background layout watermark */}
                      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.1] font-mono text-[8px] leading-none select-none tracking-tight p-2 truncate pointer-events-none uppercase">
                        {Array(15).fill("VMI CONNECT • CERTIFIED ").join(" ")}
                      </div>

                      <div className="z-10 flex items-center gap-3">
                        {/* Branded Logo badge with initials */}
                        <div className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-sm border",
                          v.id === 'v-1' ? "bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-400" :
                          v.id === 'v-2' ? "bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400" :
                          v.id === 'v-3' ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400" :
                          "bg-gradient-to-br from-rose-600 to-red-700 border-rose-400"
                        )}>
                          {v.id === 'v-1' ? 'AF' : v.id === 'v-2' ? 'EH' : v.id === 'v-3' ? 'PK' : 'SC'}
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-gray-950 dark:text-white leading-tight">{v.name}</h3>
                          <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-900/30 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                            {v.connectionStatus}
                          </span>
                        </div>
                      </div>

                      <span className="z-10 text-[8px] font-black text-gray-500 dark:text-gray-400 uppercase font-mono tracking-widest bg-white/80 dark:bg-black/40 px-2 py-1 rounded border border-[#E1E3E6]/60 dark:border-gray-800">
                        {v.industry}
                      </span>
                    </div>

                    {/* Content area */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-3">
                        {(() => {
                          const contacts = VENDOR_CONTACTS[v.id] || [];
                          const onlineCount = contacts.filter(c => c.status === 'online').length;
                          const busyCount = contacts.filter(c => c.status === 'busy').length;
                          const totalAvailable = onlineCount + busyCount;
                          const isExpanded = expandedContactsVendorId === v.id;
                          const pendingOrdersCount = orders.filter(o => o.vendorId === v.id && o.status !== 'Dostarczone' && o.status !== 'Anulowane').length;
                          const vendorConv = conversations.find(c => c.vendorId === v.id);
                          const unreadMsgs = vendorConv?.unreadCount || 0;

                          return (
                            <>
                              {/* Interactive contact selector */}
                              <div 
                                onClick={() => setExpandedContactsVendorId(isExpanded ? null : v.id)}
                                className="p-3 bg-[#F8F9FA] dark:bg-[#121729] hover:bg-gray-100 dark:hover:bg-[#181F38] rounded-xl border border-gray-100 dark:border-gray-850/60 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "w-2.5 h-2.5 rounded-full relative shrink-0",
                                    onlineCount > 0 ? "bg-emerald-500" : busyCount > 0 ? "bg-amber-500" : "bg-gray-400"
                                  )}>
                                    {onlineCount > 0 && (
                                      <span className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
                                    )}
                                  </span>
                                  <div className="text-left">
                                    <p className="text-[10px] font-black text-gray-800 dark:text-gray-200">
                                      {totalAvailable > 0 
                                        ? `Opiekunowie online: ${totalAvailable}` 
                                        : "Opiekunowie offline"}
                                    </p>
                                    <p className="text-[9px] text-gray-400">
                                      Kliknij, aby rozwinąć
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right text-[10px] text-gray-500 font-mono flex items-center gap-1">
                                  <span className="font-extrabold text-[9px] text-blue-600 dark:text-blue-400">
                                    {contacts.length} {contacts.length === 1 ? 'osoba' : 'osoby'}
                                  </span>
                                  {isExpanded ? (
                                    <ChevronUp className="h-3 w-3 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3 text-gray-400" />
                                  )}
                                </div>
                              </div>

                              {/* Expanded staff list */}
                              {isExpanded && (
                                <div className="space-y-1.5 pt-1 border-t border-dashed border-gray-100 dark:border-gray-800 text-left">
                                  {contacts.map((contact, idx) => (
                                    <div key={idx} className="p-2 bg-white dark:bg-[#0A0D18] border border-gray-100 dark:border-gray-850 rounded-lg flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <span className={cn(
                                          "w-1.5 h-1.5 rounded-full shrink-0",
                                          contact.status === 'online' ? "bg-emerald-500" :
                                          contact.status === 'busy' ? "bg-amber-500" : "bg-gray-400"
                                        )} />
                                        <div>
                                          <p className="font-bold text-gray-900 dark:text-gray-200 text-[10px]">{contact.name}</p>
                                          <p className="text-[8px] text-gray-400 font-mono">{contact.role}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <a href={`tel:${contact.phone}`} className="p-1 rounded bg-gray-50 hover:bg-gray-150 dark:bg-gray-800 text-gray-650 dark:text-gray-300">
                                          <Phone className="h-3 w-3" />
                                        </a>
                                        <a href={`mailto:${contact.email}`} className="p-1 rounded bg-gray-50 hover:bg-gray-150 dark:bg-gray-800 text-gray-650 dark:text-gray-300">
                                          <Mail className="h-3 w-3" />
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Status indicators board */}
                              <div className="space-y-1.5">
                                {vendorProposalsCount > 0 && (
                                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/20 px-2.5 py-1.5 rounded-lg text-blue-700 dark:text-blue-400 font-bold text-[10px] flex items-center gap-1.5 text-left">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping shrink-0" />
                                    <span>Czeka propozycja dostawy VMI ({vendorProposalsCount})</span>
                                  </div>
                                )}

                                {unreadMsgs > 0 && (
                                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100/30 dark:border-amber-900/20 px-2.5 py-1.5 rounded-lg text-amber-700 dark:text-amber-400 font-bold text-[10px] flex items-center gap-1.5 text-left">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shrink-0" />
                                    <span>Masz nieprzeczytaną odpowiedź ({unreadMsgs})</span>
                                  </div>
                                )}

                                {pendingOrdersCount > 0 && (
                                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/30 dark:border-emerald-900/20 px-2.5 py-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1.5 text-left">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 animate-pulse" />
                                    <span>Aktywne zamówienie w realizacji ({pendingOrdersCount})</span>
                                  </div>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      <button
                        onClick={() => setActiveVendorId(v.id)}
                        className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-white font-bold rounded-lg text-center cursor-pointer transition-colors border border-[#E1E3E6] dark:border-transparent text-xs"
                      >
                        Otwórz panel partnera
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'inventory':
        return (
          <InventoryView
            inventoryBalances={inventoryBalances}
            products={mockProducts}
            vendors={mockVendors}
            locations={mockLocations}
            activeLocationId={activeLocationId}
            onViewProductDetail={(id) => alert(`Specyfikacja produktu Ambra ID: ${id}. Aby zamówić, dodaj do koszyka w katalogu.`)}
            onOpenStockCountForProduct={(id) => setIsCountWorkflowOpen(true)}
            onAddToCart={handleAddToCart}
          />
        );

      case 'orders':
        return (
          <OrdersView
            orders={orders}
            products={mockProducts}
            vendors={mockVendors}
            locations={mockLocations}
            activeLocationId={activeLocationId}
            onOpenOrderChat={(id, vId, sub) => handleInitiateContextChat(vId, sub, 'order', id)}
          />
        );

      case 'messages':
        return (
          <div className="space-y-4">
            <div className="border-b border-[#E1E3E6] dark:border-gray-850 pb-2">
              <h2 className="text-base font-bold text-gray-950 dark:text-white font-display">Centrum Wiadomości VMI</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bezpośredni, bezpieczny kanał komunikacji z dedykowanymi opiekunami handlowymi Twoich dostawców</p>
            </div>
            <div className="bg-white dark:bg-[#0E1321] border border-[#E1E3E6] dark:border-gray-850 rounded-xl overflow-hidden h-[74vh]">
              <MessagesCenter
                conversations={conversations}
                vendors={mockVendors}
                orders={orders}
                products={mockProducts}
                quotations={quotations}
                proposals={proposals}
                onSendMessage={handleSendMessage}
                initialConversationId={messageCenterInitialId}
              />
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6 text-xs text-gray-600 dark:text-gray-300">
            <div className="border-b border-[#E1E3E6] dark:border-gray-850 pb-2">
              <h2 className="text-base font-bold text-gray-950 dark:text-white font-display">Ustawienia Systemowe i Piaskownica</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Konfiguracja profilu, symulacja warunków sieciowych oraz historia powiadomień</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in">
              <div className="lg:col-span-4 space-y-4">
                {/* Profile Panel */}
                <div className="bg-white dark:bg-[#0E1321] border border-[#E1E3E6] dark:border-gray-850 rounded-xl p-5 space-y-3.5 shadow-sm">
                  <h5 className="font-bold text-gray-950 dark:text-white uppercase tracking-wider text-[10px]">Twój Profil Klienta</h5>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600/10 text-blue-500 dark:text-blue-400 rounded-full">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-950 dark:text-white text-sm">{userProfile.name}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-[11px]">{userProfile.organization}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-850 space-y-1.5 text-[11px]">
                    <p className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Rola w oddziale:</span> <span className="font-bold text-blue-600 dark:text-blue-400">Kierownik Oddziału VMI</span></p>
                    <p className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Uprawnienia:</span> <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Zatwierdzający B2B</span></p>
                    <p className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Klucz szyfrowania:</span> <span className="font-mono text-gray-500 dark:text-gray-600">AMBRA-7821-X</span></p>
                  </div>
                </div>

                {/* Logout trigger */}
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-900/20 rounded-xl font-bold text-center flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Wyloguj się z sesji VMI</span>
                </button>
              </div>

              <div className="lg:col-span-8 space-y-4">
                {/* Developer Network settings (Offline count simulator) */}
                <div className="bg-white dark:bg-[#0E1321] border border-[#E1E3E6] dark:border-gray-850 rounded-xl p-5 space-y-3 shadow-sm">
                  <h5 className="font-bold text-gray-950 dark:text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-[#2A3B4C] dark:text-blue-400" />
                    <span>Tryb deweloperski (VMI Sandbox)</span>
                  </h5>
                  
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[11px]">
                    Zasymuluj brak sieci komórkowej, aby przetestować lokalny bufor inwentaryzacji offline i automatyczną ponowną synchronizację:
                  </p>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setIsOnline(true)}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer transition-all border",
                        isOnline 
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" 
                          : "bg-gray-100 dark:bg-gray-850 text-gray-500 border-[#E1E3E6] dark:border-transparent hover:bg-gray-200"
                      )}
                    >
                      <Wifi className="h-3.5 w-3.5" />
                      <span>Sieć aktywna (Online)</span>
                    </button>
                    
                    <button
                      onClick={() => setIsOnline(false)}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer transition-all border",
                        !isOnline 
                          ? "bg-amber-600 border-amber-600 text-white shadow-sm" 
                          : "bg-gray-100 dark:bg-gray-850 text-gray-500 border-[#E1E3E6] dark:border-transparent hover:bg-gray-200"
                      )}
                    >
                      <WifiOff className="h-3.5 w-3.5" />
                      <span>Brak sieci (Offline)</span>
                    </button>
                  </div>

                  {offlineDraftsCount > 0 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/30 rounded-xl space-y-2 text-amber-700 dark:text-amber-300">
                      <p className="font-semibold text-[10px]">Masz {offlineDraftsCount} spisów oczekujących na wysyłkę!</p>
                      <button
                        onClick={handleSyncOfflineDrafts}
                        disabled={!isOnline}
                        className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 font-bold text-gray-950 rounded text-[10px] cursor-pointer"
                      >
                        Synchronizuj teraz
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleClearDemoCache}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] rounded-lg hover:text-gray-800 dark:hover:text-white transition-all cursor-pointer font-bold text-center border border-[#E1E3E6] dark:border-gray-800"
                  >
                    Resetuj całe demo (Wyczyść Cache i przeładuj)
                  </button>
                </div>

                {/* Notifications list trigger */}
                <div className="bg-white dark:bg-[#0E1321] border border-[#E1E3E6] dark:border-gray-850 rounded-xl p-5 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-gray-950 dark:text-white uppercase tracking-wider text-[10px]">Archiwum Powiadomień Systemowych ({unreadNotificationsCount})</h5>
                    {unreadNotificationsCount > 0 && (
                      <button 
                        onClick={handleMarkNotificationsRead}
                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-bold"
                      >
                        Oznacz wszystkie jako przeczytane
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 divide-y divide-gray-100 dark:divide-gray-850/60 max-h-56 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-gray-400 italic text-center py-4">Brak nowych powiadomień w historii.</p>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="pt-2.5 first:pt-0 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <p className={cn("font-bold text-xs", !notif.isRead ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300")}>
                              {notif.title}
                            </p>
                            <span className="text-[9px] font-mono text-gray-400">{notif.date}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal">{notif.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // State bypass router for Order detail screens from the aggregated dashboard
  const [selectedOrderViewId, setSelectedOrderViewId] = useState<string | null>(null);

  // Switch vendor details back
  const handleVendorDashboardBack = () => {
    setActiveVendorId(null);
  };

  // If not logged in, render LoginScreen (with prefilled credentials for Michał)
  if (!isLoggedIn) {
    return (
      <LoginScreen
        preFilledUser={currentUser}
        onLoginSuccess={handleLogin}
      />
    );
  }

  // Active elements
  const activeVendor = mockVendors.find(v => v.id === activeVendorId);
  const activeProposal = proposals.find(p => p.id === activeProposalId);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0D16] text-[#1A1C1E] dark:text-white font-sans flex flex-col md:flex-row relative transition-colors duration-200">
      
      {/* MOBILE TOP HEADER BAR */}
      <header className="md:hidden bg-white dark:bg-[#0E1321] border-b border-[#E1E3E6] dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2A3B4C] dark:bg-blue-600 flex items-center justify-center font-extrabold text-white text-sm shadow-md">
            A
          </div>
          <div>
            <h1 className="font-extrabold font-display text-xs tracking-wide text-[#2A3B4C] dark:text-white leading-tight uppercase">Ambra VMI</h1>
            <p className="text-[8px] text-gray-400 dark:text-gray-500 uppercase font-bold">Portal Klienta</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Active location summary badge */}
          <span className="text-[9px] font-bold bg-[#F0F2F5] dark:bg-[#131A2E] text-[#2A3B4C] dark:text-white py-1 px-2 rounded-lg border border-[#E1E3E6] dark:border-gray-800 transition-colors">
            {mockLocations.find(l => l.id === activeLocationId)?.name || 'Oddział'}
          </span>
          
          {/* Mobile Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title={theme === 'light' ? "Przełącz na tryb ciemny" : "Przełącz na tryb jasny"}
          >
            {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* OFFLINE STATUS HEADER BAR */}
      {!isOnline && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-amber-500 text-gray-950 px-4 py-1.5 text-center text-xs font-black flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="h-4 w-4 shrink-0 animate-bounce" />
          <span>TRYB OFFLINE (VMI OFFLINE BUFFER): Twoje inwentaryzacje są buforowane lokalnie i zostaną zsynchronizowane po włączeniu sieci.</span>
        </div>
      )}

      {/* 1. DESKTOP NAVIGATION SIDEBAR - Breakpoint 768px */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#0E1321] border-r border-[#E1E3E6] dark:border-gray-800 shrink-0 select-none transition-colors">
        {/* App Title */}
        <div className="p-5 border-b border-[#E1E3E6] dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2A3B4C] dark:bg-blue-600 flex items-center justify-center font-extrabold text-white text-sm shadow-md">
              A
            </div>
            <div>
              <h1 className="font-extrabold font-display text-sm tracking-wide text-[#2A3B4C] dark:text-white leading-tight">Ambra VMI</h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Portal Klienta</p>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title={theme === 'light' ? "Przełącz na tryb ciemny" : "Przełącz na tryb jasny"}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
          </button>
        </div>

        {/* Location display */}
        <div className="p-4 mx-3 my-4 bg-[#F0F2F5] dark:bg-[#131A2E] rounded-xl border border-[#E1E3E6] dark:border-gray-800 flex items-center gap-2.5 transition-colors">
          <div className="p-1.5 rounded-lg bg-[#2A3B4C]/10 dark:bg-white/10 text-[#2A3B4C] dark:text-blue-400">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold">Monitorowany oddział</p>
            <p className="font-bold text-xs text-[#2A3B4C] dark:text-white truncate">
              {mockLocations.find(l => l.id === activeLocationId)?.name || 'Brak'}
            </p>
          </div>
        </div>

        {/* Tab buttons */}
        <nav className="flex-1 px-3 space-y-1">
          {[
            { id: 'home', name: 'Pulpit główny', icon: Home },
            { id: 'vendors', name: 'Nasi dostawcy', icon: Layers },
            { id: 'inventory', name: 'Zapas magazynowy', icon: Package },
            { id: 'orders', name: 'Spis zamówień', icon: ShoppingBag },
            { id: 'messages', name: 'Wiadomości', icon: MessageSquare },
            { id: 'settings', name: 'Ustawienia i Sandbox', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            // Unread counts indicators
            let count = 0;
            if (tab.id === 'messages') count = unreadMessagesCount;
            if (tab.id === 'settings') count = unreadNotificationsCount;

            return (
              <button
                key={tab.id}
                onClick={() => { 
                  setCurrentTab(tab.id as any); 
                  setActiveVendorId(null); 
                  setActiveProposalId(null); 
                  setSelectedOrderViewId(null); 
                }}
                className={cn(
                  "w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer",
                  isActive 
                    ? "bg-[#F0F2F5] dark:bg-[#131A2E] text-[#2A3B4C] dark:text-white border-l-4 border-[#2A3B4C] dark:border-blue-500" 
                    : "text-gray-500 hover:text-[#2A3B4C] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4", isActive ? "text-[#2A3B4C] dark:text-blue-400" : "text-gray-400")} />
                  <span>{tab.name}</span>
                </div>
                {count > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center justify-center font-mono animate-pulse",
                    tab.id === 'settings' ? "bg-red-500" : "bg-[#2A3B4C] dark:bg-blue-600"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Primary Action Button */}
        <div className="p-4 border-t border-[#E1E3E6] dark:border-gray-800">
          <button
            onClick={() => setIsCountWorkflowOpen(true)}
            className="w-full py-3 bg-[#2A3B4C] dark:bg-blue-600 hover:bg-[#1E2B38] dark:hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <span>Inwentaryzacja VMI</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] dark:bg-[#0A0D16] h-screen overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 transition-colors duration-200">
        
        {/* Dynamic subscreen rendering logic (Master overlays) */}
        {activeProposalId && activeProposal ? (
          
          /* Proposal details overlay override */
          <ProposalDetail
            proposal={activeProposal}
            vendor={mockVendors.find(v => v.id === activeProposal.vendorId)!}
            products={mockProducts}
            onBack={() => setActiveProposalId(null)}
            onSubmitApproval={handleProposalApprovalSubmit}
            onAskQuestion={(pId, subject) => handleInitiateContextChat(activeProposal.vendorId, subject, 'product', pId)}
          />

        ) : activeVendorId && activeVendor ? (

          /* Vendor area branded dashboard overlay */
          <VendorDashboardView
            vendor={activeVendor}
            products={mockProducts}
            orders={orders}
            quotations={quotations}
            flyers={mockDigitalFlyers}
            showrooms={mockShowrooms}
            proposals={proposals}
            locations={mockLocations}
            activeLocationId={activeLocationId}
            cart={carts[activeVendor.id] || []}
            onBack={handleVendorDashboardBack}
            onAddToCart={(productId, qty) => handleAddToCart(productId, qty)}
            onRemoveFromCart={(productId) => handleRemoveFromCart(activeVendor.id, productId)}
            onUpdateCartQty={(productId, qty) => handleUpdateCartQty(activeVendor.id, productId, qty)}
            onCheckout={(locId, date, ref, com) => handleCheckout(activeVendor.id, locId, date, ref, com)}
            onOpenFlyer={setActiveFlyer}
            onAskVendorQuestion={(pId, sub) => handleInitiateContextChat(activeVendor.id, sub, 'product', pId)}
          />

        ) : (

          /* Standard tab list render */
          <div className={cn("space-y-4", !isOnline ? "pt-8" : "")}>
            {renderTabContent()}
          </div>

        )}

      </main>

      {/* 2. MOBILE NAVIGATION BOTTOM BAR - Breakpoint 768px */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0E1321]/95 backdrop-blur-md border-t border-[#E1E3E6] dark:border-gray-800 flex items-center justify-around py-2 shrink-0 select-none transition-colors">
        {[
          { id: 'home', name: 'Pulpit', icon: Home },
          { id: 'vendors', name: 'Dostawcy', icon: Layers },
          { id: 'inventory', name: 'Zapas', icon: Package },
          { id: 'orders', name: 'Zlecenia', icon: ShoppingBag },
          { id: 'messages', name: 'Czat', icon: MessageSquare },
          { id: 'settings', name: 'Opcje', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          // messaging & notification badge
          let count = 0;
          if (tab.id === 'messages') count = unreadMessagesCount;
          if (tab.id === 'settings') count = unreadNotificationsCount;

          return (
            <button
              key={tab.id}
              onClick={() => { 
                setCurrentTab(tab.id as any); 
                setActiveVendorId(null); 
                setActiveProposalId(null); 
                setSelectedOrderViewId(null); 
              }}
              className="flex flex-col items-center gap-1 cursor-pointer animate-fade-in"
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-[#2A3B4C] dark:text-blue-400" : "text-gray-400")} />
                {count > 0 && (
                  <span className={cn(
                    "absolute -top-1.5 -right-2 px-1 text-[8px] font-black text-white rounded-full flex items-center justify-center min-w-[14px]",
                    tab.id === 'settings' ? "bg-red-500" : "bg-[#2A3B4C] dark:bg-blue-600"
                  )}>
                    {count}
                  </span>
                )}
              </div>
              <span className={cn("text-[9px] font-bold tracking-tight transition-colors", isActive ? "text-[#2A3B4C] dark:text-blue-400" : "text-gray-400")}>
                {tab.name}
              </span>
            </button>
          );
        })}
        
        {/* Mobile floating fast inwentaryzacja helper trigger */}
        <button
          onClick={() => setIsCountWorkflowOpen(true)}
          className="w-10 h-10 rounded-full bg-[#2A3B4C] dark:bg-blue-600 text-white flex items-center justify-center -translate-y-4 shadow-lg border-4 border-[#F8F9FA] dark:border-[#0A0D16] cursor-pointer active:scale-95 transition-all"
          title="Inwentaryzacja VMI"
        >
          <Plus className="h-5 w-5" />
        </button>
      </nav>

      {/* OVERLAY 1: THE COMPLEX INVENTORY STOCK COUNTING WORKFLOW */}
      {isCountWorkflowOpen && (
        <StockCountWorkflow
          vendors={mockVendors}
          locations={mockLocations}
          products={mockProducts}
          inventoryBalances={inventoryBalances}
          isOnline={isOnline}
          onClose={() => setIsCountWorkflowOpen(false)}
          onCompleteCount={(locId, counts) => {
            const countedLines: { [id: string]: number } = {};
            counts.forEach(c => {
              countedLines[c.productId] = c.qty;
            });
            handleStockCountSubmit(countedLines);
          }}
        />
      )}

      {/* OVERLAY 2: THE INTERACTIVE DIGITAL FLYER PROMOTIONAL LEAFLET */}
      {activeFlyer && (
        <DigitalFlyerViewer
          flyer={activeFlyer}
          products={mockProducts}
          vendorName={mockVendors.find(v => v.id === activeFlyer.vendorId)?.name || 'Dostawca'}
          onAddToCart={handleAddToCart}
          onViewProduct={(id) => alert(`Widok szczegółowy produktu ID: ${id}`)}
          onAskVendor={(id, subject) => handleInitiateContextChat(activeFlyer.vendorId, subject, 'product', id)}
          onClose={() => setActiveFlyer(null)}
        />
      )}

    </div>
  );
}
