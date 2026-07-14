'use client';

import React from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  Bell, 
  ChevronRight, 
  Clock, 
  Database, 
  FileCheck, 
  HelpCircle, 
  Layers, 
  MapPin, 
  Package, 
  Percent, 
  ShoppingBag, 
  TrendingUp, 
  Truck, 
  User 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  InventoryBalance, 
  ReplenishmentProposal, 
  Order, 
  Quotation, 
  Notification, 
  ClientLocation, 
  Vendor 
} from '../lib/types';

interface DashboardViewProps {
  locations: ClientLocation[];
  activeLocationId: string;
  setActiveLocationId: (id: string) => void;
  inventoryBalances: InventoryBalance[];
  proposals: ReplenishmentProposal[];
  orders: Order[];
  quotations: Quotation[];
  notifications: Notification[];
  vendors: Vendor[];
  
  // Navigation helpers to open specific panels
  onNavigateTab: (tab: 'vendors' | 'inventory' | 'orders' | 'messages' | 'settings') => void;
  onOpenProposal: (id: string) => void;
  onOpenOrder: (id: string) => void;
  onOpenQuotation: (id: string) => void;
  onOpenStockCount: () => void;
  onOpenVendor: (vendorId: string, tab?: any) => void;
}

export default function DashboardView({
  locations,
  activeLocationId,
  setActiveLocationId,
  inventoryBalances,
  proposals,
  orders,
  quotations,
  notifications,
  vendors,
  onNavigateTab,
  onOpenProposal,
  onOpenOrder,
  onOpenQuotation,
  onOpenStockCount,
  onOpenVendor
}: DashboardViewProps) {
  
  // Calculate specific figures for active location
  const activeLocation = locations.find(l => l.id === activeLocationId);
  
  const locationBalances = inventoryBalances.filter(b => b.locationId === activeLocationId);
  const monitoredCount = locationBalances.length || 186; // Fallback
  
  const lowStockCount = locationBalances.filter(b => 
    ['Below minimum', 'Out of stock', 'Approaching minimum'].includes(b.stockStatus)
  ).length;

  const pendingProposalsCount = proposals.filter(p => 
    p.locationId === activeLocationId && p.status === 'Oczekuje na zatwierdzenie'
  ).length;

  const activeOrdersCount = orders.filter(o => 
    o.locationId === activeLocationId && 
    !['Dostarczone', 'Anulowane', 'Szkic'].includes(o.status)
  ).length;

  const activeQuotation = quotations.find(q => q.status === 'Oczekująca');

  // Filter unread notifications
  const unreadNotifications = notifications.filter(n => !n.isRead).slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* Upper banner: Greeting & Location Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-[#2A3B4C] rounded-2xl shadow-sm relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-gray-300 tracking-wider font-mono">Dostęp VMI Aktywny</span>
          </div>
          <h2 className="text-xl font-bold font-display text-white">Witaj, Michał Stępień</h2>
          <p className="text-xs text-gray-300">
            Firma: <strong className="text-white">AutoService Komorniki</strong> • Rola: <span className="text-blue-200 font-semibold">Kierownik Oddziału</span>
          </p>
        </div>

        {/* Location selector */}
        <div className="flex items-center gap-2.5 shrink-0 relative z-10 bg-[#1E2B38] p-2 rounded-xl">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-300">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide">Aktywny oddział</label>
            <select
              value={activeLocationId}
              onChange={(e) => setActiveLocationId(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none pr-6 cursor-pointer"
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id} className="bg-[#2A3B4C] text-white">
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Metric 1 */}
        <div 
          onClick={() => onNavigateTab('vendors')}
          className="bg-white dark:bg-[#0E1321] hover:bg-gray-50 dark:hover:bg-[#111728] rounded-xl p-4 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Dostawcy</span>
            <Layers className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-[#2A3B4C] dark:text-white font-mono">{vendors.length}</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold font-sans">aktywne</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white dark:bg-[#0E1321] hover:bg-gray-50 dark:hover:bg-[#111728] rounded-xl p-4 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Monitowane</span>
            <Package className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-[#2A3B4C] dark:text-white font-mono">{monitoredCount}</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">pozycji</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white dark:bg-[#0E1321] hover:bg-gray-50 dark:hover:bg-[#111728] rounded-xl p-4 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Niski stan</span>
            <AlertTriangle className={cn("h-4 w-4", lowStockCount > 0 ? "text-red-500 animate-pulse" : "text-gray-400 dark:text-gray-500")} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={cn("text-xl font-bold font-mono", lowStockCount > 0 ? "text-red-500 dark:text-red-400" : "text-[#2A3B4C] dark:text-white")}>
              {lowStockCount}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">do uzupełnienia</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          className="bg-white dark:bg-[#0E1321] hover:bg-gray-50 dark:hover:bg-[#111728] rounded-xl p-4 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Dostawy VMI</span>
            <FileCheck className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={cn("text-xl font-bold font-mono", pendingProposalsCount > 0 ? "text-blue-600 dark:text-blue-400" : "text-[#2A3B4C] dark:text-white")}>
              {pendingProposalsCount}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">propozycje</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="bg-white dark:bg-[#0E1321] hover:bg-gray-50 dark:hover:bg-[#111728] rounded-xl p-4 transition-all cursor-pointer group col-span-2 lg:col-span-1 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">W realizacji</span>
            <Truck className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-[#2A3B4C] dark:text-white font-mono">{activeOrdersCount}</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">zamówień</span>
          </div>
        </div>
      </div>

      {/* TWO COLUMN MASTER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ATTENTION REQUIRED (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-display text-xs uppercase tracking-wider text-gray-500 dark:text-gray-450 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>Wymaga uwagi (Pilne akcje)</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold">
              Krytyczne
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            
            {/* 1. Low chemical stocks */}
            {lowStockCount > 0 && (
              <div 
                onClick={() => onNavigateTab('inventory')}
                className="bg-white dark:bg-[#0E1321] hover:bg-gray-50 dark:hover:bg-[#111728] rounded-xl p-3.5 transition-all flex items-start justify-between gap-3 cursor-pointer shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/25 text-red-600 dark:text-red-400 shrink-0 mt-0.5">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#1A1C1E] dark:text-white">Niski zapas chemii i części</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      W lokalizacji <span className="text-[#1A1C1E] dark:text-gray-250 font-semibold">{activeLocation?.name}</span> wykryto <strong className="text-red-500 dark:text-red-400">{lowStockCount} produktów</strong> poniżej bezpiecznego poziomu VMI.
                    </p>
                    <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded uppercase font-mono mt-2 inline-block font-bold">
                      CleanChem / AutoParts
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-550 mt-2" />
              </div>
            )}

            {/* 2. AutoParts replenishment proposal */}
            {proposals.find(p => p.vendorId === 'v-1' && p.status === 'Oczekuje na zatwierdzenie') && (
              <div 
                onClick={() => onOpenProposal('rp-1')}
                className="bg-white dark:bg-[#0E1321] hover:bg-gray-50 dark:hover:bg-[#111728] rounded-xl p-3.5 transition-all flex items-start justify-between gap-3 cursor-pointer shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/25 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#1A1C1E] dark:text-white">Propozycja uzupełnienia AutoParts Pro</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      Nowa kalkulacja dostawy klocków i filtrów <strong className="text-[#1A1C1E] dark:text-gray-250">PROP-V1-202607-003</strong> czeka na Twoje zatwierdzenie.
                    </p>
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded uppercase font-mono mt-2 inline-block font-bold">
                      Wygasa za 2 dni
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-550 mt-2" />
              </div>
            )}

            {/* 3. SafetyCore quote */}
            {activeQuotation && (
              <div 
                onClick={() => onOpenQuotation('q-1')}
                className="bg-white dark:bg-[#0E1321] hover:bg-gray-50 dark:hover:bg-[#111728] rounded-xl p-3.5 transition-all flex items-start justify-between gap-3 cursor-pointer shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/25 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                    <Percent className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#1A1C1E] dark:text-white">Wycena specjalna SafetyCore BHP</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      Dedykowana oferta na buty i spodnie robocze <strong className="text-[#1A1C1E] dark:text-gray-250">OFE-202607-0841</strong> ze specjalnym rabatem partnera wygaśnie niedługo.
                    </p>
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded uppercase font-mono mt-2 inline-block font-bold">
                      Ważna do 16 lipca (3 dni!)
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-550 mt-2" />
              </div>
            )}

            {/* 4. WerkTools Order Partially Confirmed */}
            {orders.find(o => o.id === 'o-2') && (
              <div 
                onClick={() => onOpenOrder('o-2')}
                className="bg-white dark:bg-[#0E1321] hover:bg-gray-50 dark:hover:bg-[#111728] rounded-xl p-3.5 transition-all flex items-start justify-between gap-3 cursor-pointer shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/25 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#1A1C1E] dark:text-white">Zamówienie WerkTools częściowo potwierdzone</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      Brak suwmiarki Mitutoyo na magazynie. Kliknij, aby przejść do czatu i zaakceptować wysyłkę częściową lub dobrać zamiennik.
                    </p>
                    <span className="text-[9px] px-1.5 py-0.5 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 rounded uppercase font-mono mt-2 inline-block font-bold">
                      Wymaga kontaktu
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-550 mt-2" />
              </div>
            )}

            {/* 5. Stock count requested */}
            <div 
              onClick={onOpenStockCount}
              className="bg-white dark:bg-[#0E1321] hover:bg-gray-50 dark:hover:bg-[#111728] rounded-xl p-3.5 transition-all flex items-start justify-between gap-3 cursor-pointer shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/25 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#1A1C1E] dark:text-white">Zlecone inwentaryzacje VMI</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Dostawca AutoParts Pro prosi o aktualizację stanu klocków i tarczy w celu optymalizacji kolejnych dostaw.
                  </p>
                  <span className="text-[9px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 rounded uppercase font-mono mt-2 inline-block font-bold">
                    Inwentaryzacja VMI
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-550 mt-2" />
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: RECENT NOTIFICATIONS & ACTIVITIES (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Notifications Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-display text-xs uppercase tracking-wider text-gray-500 dark:text-gray-450 flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500" />
                <span>Ostatnie powiadomienia</span>
              </h3>
              <button 
                onClick={() => onNavigateTab('settings')} 
                className="text-xs text-[#2A3B4C] dark:text-blue-400 hover:underline font-bold transition-colors cursor-pointer"
              >
                Pokaż wszystkie
              </button>
            </div>

            <div className="bg-white dark:bg-[#0E1321] rounded-xl shadow-sm divide-y divide-[#E1E3E6] dark:divide-gray-850">
              {unreadNotifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500">
                  Brak nieprzeczytanych powiadomień.
                </div>
              ) : (
                unreadNotifications.map(notif => {
                  let badgeColor = "bg-blue-600";
                  if (notif.type === 'Low-stock warning') badgeColor = "bg-red-500";
                  if (notif.type === 'Quotation expiring') badgeColor = "bg-amber-500";
                  if (notif.type === 'New vendor message') badgeColor = "bg-indigo-500";

                  return (
                    <div key={notif.id} className="p-3.5 space-y-1 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", badgeColor)} />
                          <span className="font-bold text-[11px] text-gray-800 dark:text-white truncate">{notif.title}</span>
                        </div>
                        <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono shrink-0">{notif.date.split(' ')[1]}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal line-clamp-2">
                        {notif.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick stats / Activity */}
          <div className="space-y-4">
            <h3 className="font-bold font-display text-xs uppercase tracking-wider text-gray-500 dark:text-gray-450 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span>Ostatnia aktywność VMI</span>
            </h3>

            <div className="bg-white dark:bg-[#0E1321] shadow-sm rounded-xl p-4 space-y-4 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                <div className="space-y-0.5">
                  <p className="text-[#1A1C1E] dark:text-white font-medium">Uruchomiono inwentaryzację (Komorniki)</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-550">Przed chwilą przez Michał Stępień</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0 mt-1.5" />
                <div className="space-y-0.5">
                  <p className="text-[#1A1C1E] dark:text-white font-medium">Dostarczono zamówienie ZAM-202607-9520</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-550">Wczoraj, 10:30 • CleanChem</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-1.5" />
                <div className="space-y-0.5">
                  <p className="text-[#1A1C1E] dark:text-white font-medium">Wygenerowano nową propozycję uzupełnienia</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-550">12 lipca, 10:15 • AutoParts Pro</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
