'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight, 
  Calendar, 
  Check, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  FileText, 
  HelpCircle, 
  Info, 
  Layers, 
  MessageSquare, 
  Package, 
  Search, 
  ShoppingBag, 
  Trash2, 
  X, 
  Building2, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Quotation, Order, Product, Vendor, ClientLocation, OrderLine } from '../lib/types';
import MarketplaceRFQ from './marketplace/MarketplaceRFQ';

interface OffersViewProps {
  quotations: Quotation[];
  onUpdateQuotations: (newQuotations: Quotation[]) => void;
  orders: Order[];
  onUpdateOrders: (newOrders: Order[]) => void;
  products: Product[];
  vendors: Vendor[];
  locations: ClientLocation[];
  activeLocationId: string;
  onOpenChat: (vendorId: string, subject: string, objectType: 'quotation' | 'product' | 'none', objectId: string) => void;
  triggerNotification: (title: string, content: string, type: string) => void;
  onNavigateToMarketplace?: (path: string) => void;
}

export default function OffersView({
  quotations,
  onUpdateQuotations,
  orders,
  onUpdateOrders,
  products,
  vendors,
  locations,
  activeLocationId,
  onOpenChat,
  triggerNotification,
  onNavigateToMarketplace
}: OffersViewProps) {
  const [activeTab, setActiveTab] = useState<'quotations' | 'rfqs'>('quotations');
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);

  // RFQ States loaded from local storage with lazy functional initializers
  const [rfqBasket, setRfqBasket] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedBasket = localStorage.getItem('ambra-marketplace-enquiry');
        return storedBasket ? JSON.parse(storedBasket) : [];
      } catch (e) {
        console.error('Error loading RFQ basket in OffersView init', e);
      }
    }
    return [];
  });

  const [submittedRfqs, setSubmittedRfqs] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedRfqs = localStorage.getItem('ambra-marketplace-rfqs');
        return storedRfqs ? JSON.parse(storedRfqs) : [];
      } catch (e) {
        console.error('Error loading RFQs in OffersView init', e);
      }
    }
    return [];
  });

  // Sync state with storage events so they stay perfectly updated in real-time
  useEffect(() => {
    const handleStorageSync = () => {
      try {
        const storedBasket = localStorage.getItem('ambra-marketplace-enquiry');
        setRfqBasket(storedBasket ? JSON.parse(storedBasket) : []);

        const storedRfqs = localStorage.getItem('ambra-marketplace-rfqs');
        setSubmittedRfqs(storedRfqs ? JSON.parse(storedRfqs) : []);
      } catch (e) {
        console.error('Error syncing RFQ storage in OffersView', e);
      }
    };

    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  // Save RFQ basket helper
  const saveRfqBasket = (newBasket: any[]) => {
    setRfqBasket(newBasket);
    localStorage.setItem('ambra-marketplace-enquiry', JSON.stringify(newBasket));
    window.dispatchEvent(new Event('storage'));
  };

  // Save submitted RFQs helper
  const saveSubmittedRfqs = (newRfqs: any[]) => {
    setSubmittedRfqs(newRfqs);
    localStorage.setItem('ambra-marketplace-rfqs', JSON.stringify(newRfqs));
    window.dispatchEvent(new Event('storage'));
  };

  const getProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const getVendor = (vendorId: string) => {
    return vendors.find(v => v.id === vendorId);
  };

  // Filter VMI Quotations for active location or vendor
  const activeLocationQuotations = useMemo(() => {
    // Quotations might be global or mapped. Let's filter or list them.
    return quotations;
  }, [quotations]);

  // Convert Quotation to real VMI Order
  const handleAcceptQuotation = (quotation: Quotation) => {
    const orderNumber = `ZAM-OFE-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Create new order lines from quotation lines
    const orderLines: OrderLine[] = quotation.lines.map(line => ({
      productId: line.productId,
      requestedQty: line.qty,
      confirmedQty: line.qty,
      shippedQty: 0,
      deliveredQty: 0,
      price: line.offeredPrice
    }));

    const newOrder: Order = {
      id: `o-loc-${Date.now()}`,
      vendorId: quotation.vendorId,
      locationId: activeLocationId,
      orderNumber: orderNumber,
      date: new Date().toISOString().substring(0, 10),
      requestedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // 3 days lead
      confirmedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      origin: 'Zaakceptowana oferta',
      status: 'Wysłane',
      lines: orderLines,
      poReference: `OFE-${quotation.quotationNumber}`,
      hasAttachment: false,
      notes: `Zamówienie wygenerowane z zaakceptowanej oferty handlowej ${quotation.quotationNumber}. Warunki dostawy: ${quotation.deliveryConditions}`,
      timeline: [
        { status: 'Szkic', date: new Date().toISOString().substring(0, 16).replace('T', ' '), description: 'Utworzono automatycznie z oferty handlowej.' },
        { status: 'Wysłane', date: new Date().toISOString().substring(0, 16).replace('T', ' '), description: 'Zaakceptowano wycenę i przesłano zamówienie do realizacji.' }
      ]
    };

    // Update quotation status
    const updatedQuotations = quotations.map(q => {
      if (q.id === quotation.id) {
        return { ...q, status: 'Zaakceptowana' as const };
      }
      return q;
    });
    onUpdateQuotations(updatedQuotations);

    // Save order
    const nextOrders = [newOrder, ...orders];
    onUpdateOrders(nextOrders);

    // Close view details
    setSelectedQuotationId(null);

    // Trigger notification
    triggerNotification(
      'Zaakceptowano ofertę',
      `Oferta ${quotation.quotationNumber} została pomyślnie zaakceptowana i przekształcona w zamówienie ${orderNumber}.`,
      'success'
    );
  };

  const selectedQuotation = quotations.find(q => q.id === selectedQuotationId);
  const selectedQuotationVendor = selectedQuotation ? getVendor(selectedQuotation.vendorId) : null;

  return (
    <div className="space-y-6 text-left">
      
      {/* Title block */}
      <div>
        <h2 className="text-xl font-black text-gray-950 dark:text-white font-display uppercase tracking-tight">Oferty i zapytania</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Zarządzaj otrzymanymi wycenami handlowymi od stałych dostawców oraz składaj nowe zapytania ofertowe (RFQ).
        </p>
      </div>

      {/* Tabs list switch */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 pb-px">
        <button
          onClick={() => { setActiveTab('quotations'); setSelectedQuotationId(null); }}
          className={cn(
            "py-2.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer",
            activeTab === 'quotations'
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-gray-450 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          Otrzymane oferty i wyceny ({activeLocationQuotations.length})
        </button>
        <button
          onClick={() => { setActiveTab('rfqs'); setSelectedQuotationId(null); }}
          className={cn(
            "py-2.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer",
            activeTab === 'rfqs'
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-gray-450 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          Twoje Zapytania RFQ ({submittedRfqs.length + (rfqBasket.length > 0 ? 1 : 0)})
        </button>
      </div>

      {activeTab === 'quotations' && (
        <div className="space-y-6">
          {!selectedQuotationId ? (
            // LIST VIEW
            activeLocationQuotations.length === 0 ? (
              <div className="bg-white dark:bg-[#0E1321] rounded-2xl py-12 px-4 text-center max-w-lg mx-auto space-y-4 shadow-sm">
                <FileText className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto" />
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Brak ofert handlowych</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Gdy dostawcy prześlą dedykowane warunki cenowe lub wyceny specjalne, pojawią się one w tym miejscu z opcją natychmiastowego zamówienia.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeLocationQuotations.map(quot => {
                  const vendor = getVendor(quot.vendorId);
                  const totalItems = quot.lines.length;
                  const totalValue = quot.lines.reduce((acc, line) => acc + (line.offeredPrice * quot.lines.reduce((subAcc, item) => subAcc + (item.productId === line.productId ? item.qty : 0), 0)), 0);

                  let statusBadge = 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400';
                  if (quot.status === 'Zaakceptowana' || quot.status === 'Przekształcona w zamówienie') {
                    statusBadge = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                  } else if (quot.status === 'Odrzucona') {
                    statusBadge = 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400';
                  } else if (quot.status === 'Wymaga zmian') {
                    statusBadge = 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400';
                  }

                  return (
                    <div 
                      key={quot.id}
                      className="bg-white dark:bg-[#0E1321] border border-gray-150 dark:border-gray-850 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 uppercase">
                            {quot.quotationNumber}
                          </span>
                          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide", statusBadge)}>
                            {quot.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {vendor?.logoUrl ? (
                            <img src={vendor.logoUrl} alt={vendor.name} className="w-8 h-8 rounded-lg object-cover bg-gray-50 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {vendor?.name?.charAt(0) || 'D'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">{vendor?.name || 'Dostawca'}</h4>
                            <p className="text-[10px] text-gray-450">Wycena asortymentowa</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-950/40 p-2.5 rounded-lg text-[10px] space-y-1.5 font-sans">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Liczba pozycji:</span>
                            <span className="font-bold">{totalItems}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 font-medium">Ważność oferty do:</span>
                            <span className="font-bold font-mono text-gray-700 dark:text-gray-300">{quot.validTo}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-[9px] text-gray-450 uppercase font-semibold">Suma oferty</p>
                          <p className="text-xs font-black text-gray-900 dark:text-white font-mono">
                            {totalValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedQuotationId(quot.id)}
                          className="py-1.5 px-3 bg-[#2A3B4C] hover:bg-[#1E2B38] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Szczegóły</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // DETAIL VIEW
            selectedQuotation && (
              <div className="bg-white dark:bg-[#0E1321] border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm space-y-6">
                {/* Detail header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedQuotationId(null)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">
                          OFERTA {selectedQuotation.quotationNumber}
                        </span>
                        <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {selectedQuotation.status}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                        Wycena od {selectedQuotationVendor?.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenChat(selectedQuotation.vendorId, `Pytanie dot. oferty ${selectedQuotation.quotationNumber}`, 'quotation', selectedQuotation.id)}
                      className="py-2 px-3.5 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 font-bold text-[11px] uppercase tracking-wide rounded-xl flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                      <span>Zapytaj dostawcę</span>
                    </button>

                    {selectedQuotation.status === 'Oczekująca' && (
                      <button
                        onClick={() => handleAcceptQuotation(selectedQuotation)}
                        className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-extrabold text-[11px] uppercase tracking-wide rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Akceptuj i Zamów</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Info block columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-950/40 p-4 rounded-xl text-xs font-sans">
                  <div className="space-y-1">
                    <p className="text-gray-400">Warunki dostawy:</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{selectedQuotation.deliveryConditions}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400">Termin ważności oferty:</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{selectedQuotation.validTo}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400">Suma netto wyceny:</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400">{selectedQuotation.totalValue.toFixed(2)} PLN</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Pozycje wycenione ({selectedQuotation.lines.length})</h4>
                  
                  <div className="overflow-x-auto border border-gray-100 dark:border-gray-850 rounded-xl divide-y divide-gray-100 dark:divide-gray-850/60 font-sans">
                    {selectedQuotation.lines.map((line, idx) => {
                      const prod = getProduct(line.productId);
                      const originalTotal = line.originalPrice * line.qty;
                      const offeredTotal = line.offeredPrice * line.qty;
                      const savings = originalTotal - offeredTotal;

                      return (
                        <div key={idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors text-xs">
                          <div className="flex gap-3 min-w-0">
                            {prod?.imageUrl ? (
                              <img src={prod.imageUrl} alt={prod.name} className="w-10 h-10 rounded-lg object-cover bg-gray-50 shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xs text-gray-400 shrink-0">
                                <Package className="h-4 w-4" />
                              </div>
                            )}
                            <div className="min-w-0 text-left">
                              <h5 className="font-bold text-gray-900 dark:text-white truncate">{prod?.name || 'Produkt'}</h5>
                              <p className="text-[10px] text-gray-400 font-mono">SKU: {prod?.vendorSku || 'BRAK'} • Jedn: {prod?.unitOfMeasure || 'szt.'}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-6 sm:gap-10 font-mono self-stretch sm:self-auto justify-between sm:justify-start">
                            <div className="text-center">
                              <p className="text-[9px] text-gray-400 font-sans">Ilość</p>
                              <p className="font-bold text-gray-800 dark:text-gray-200">{line.qty}</p>
                            </div>

                            <div className="text-center">
                              <p className="text-[9px] text-gray-400 font-sans">Cena katalogowa</p>
                              <p className="text-gray-400 line-through">{line.originalPrice.toFixed(2)} PLN</p>
                            </div>

                            <div className="text-center">
                              <p className="text-[9px] text-blue-600 font-sans font-bold">Cena oferty</p>
                              <p className="font-bold text-blue-600 dark:text-blue-400">{line.offeredPrice.toFixed(2)} PLN</p>
                            </div>

                            <div className="text-right">
                              <p className="text-[9px] text-gray-400 font-sans">Suma netto</p>
                              <p className="font-black text-gray-900 dark:text-white">{offeredTotal.toFixed(2)} PLN</p>
                              {savings > 0 && (
                                <p className="text-[9px] text-emerald-500 font-bold font-sans">Oszczędność: -{savings.toFixed(2)} PLN</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional notes */}
                {selectedQuotation.notes && (
                  <div className="p-3.5 bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/20 rounded-xl flex gap-3 text-xs text-gray-600 dark:text-gray-400 font-sans">
                    <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Uwagi dostawcy:</p>
                      <p className="mt-0.5 leading-relaxed">{selectedQuotation.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {activeTab === 'rfqs' && (
        <MarketplaceRFQ
          basket={rfqBasket}
          onUpdateItem={(vendorId, productId, fields) => {
            const nextBasket = rfqBasket.map(group => {
              if (group.vendorId === vendorId) {
                return {
                  ...group,
                  items: group.items.map((item: any) =>
                    item.productId === productId ? { ...item, ...fields } : item
                  )
                };
              }
              return group;
            });
            saveRfqBasket(nextBasket);
          }}
          onRemoveItem={(vendorId, productId) => {
            const nextBasket = rfqBasket.map(group => {
              if (group.vendorId === vendorId) {
                return {
                  ...group,
                  items: group.items.filter((item: any) => item.productId !== productId)
                };
              }
              return group;
            }).filter(group => group.items.length > 0);
            saveRfqBasket(nextBasket);
          }}
          onClearVendorGroup={(vendorId) => {
            const nextBasket = rfqBasket.filter(group => group.vendorId !== vendorId);
            saveRfqBasket(nextBasket);
          }}
          onSubmitRFQ={(rfq) => {
            const nextRfqs = [rfq, ...submittedRfqs];
            saveSubmittedRfqs(nextRfqs);
            const nextBasket = rfqBasket.filter(group => group.vendorId !== rfq.vendorId);
            saveRfqBasket(nextBasket);
            triggerNotification('Wysłano zapytanie RFQ', `Zapytanie ${rfq.enquiryNumber} zostało pomyślnie wysłane do dostawcy.`, 'success');
          }}
          submittedRfqs={submittedRfqs}
          onGoToVendor={(slug) => {
            if (onNavigateToMarketplace) {
              onNavigateToMarketplace(`/dostawcy/${slug}`);
            }
          }}
          onGoToHome={() => {
            if (onNavigateToMarketplace) {
              onNavigateToMarketplace('/');
            }
          }}
          isLoggedIn={true}
        />
      )}

    </div>
  );
}
