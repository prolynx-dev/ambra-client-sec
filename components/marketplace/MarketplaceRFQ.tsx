'use client';

import React, { useState, useMemo } from 'react';
import { 
  mockProducts, 
  mockVendors 
} from './mockData';
import { EnquiryBasketGroup, EnquiryLine, PublicQuotationRequest } from './types';
import { 
  ShoppingBag, 
  Trash2, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  Clipboard, 
  User, 
  Building2, 
  Mail, 
  Phone,
  Calendar,
  AlertCircle,
  Building,
  Sparkles,
  Search,
  ChevronRight,
  Package,
  Check,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MarketplaceRFQProps {
  basket: EnquiryBasketGroup[];
  onUpdateItem: (vendorId: string, productId: string, fields: Partial<EnquiryLine>) => void;
  onRemoveItem: (vendorId: string, productId: string) => void;
  onClearVendorGroup: (vendorId: string) => void;
  onSubmitRFQ: (request: PublicQuotationRequest) => void;
  submittedRfqs: PublicQuotationRequest[];
  onGoToVendor: (slug: string) => void;
  onGoToHome: () => void;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
}

export default function MarketplaceRFQ({
  basket,
  onUpdateItem,
  onRemoveItem,
  onClearVendorGroup,
  onSubmitRFQ,
  submittedRfqs,
  onGoToVendor,
  onGoToHome,
  isLoggedIn,
  onLoginClick
}: MarketplaceRFQProps) {
  // RFQ Submission state
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    email: '',
    phone: '',
    nip: '',
    city: '',
    postalCode: '',
    businessType: 'Warsztat niezależny',
    expectedDeliveryDate: '',
    message: '',
    contactPreference: 'email'
  });

  const [activeVendorIndex, setActiveVendorIndex] = useState<number>(0);
  const [successRequest, setSuccessRequest] = useState<PublicQuotationRequest | null>(null);

  const activeGroup = useMemo(() => {
    if (basket.length === 0) return null;
    const index = Math.min(activeVendorIndex, basket.length - 1);
    return basket[index] || null;
  }, [basket, activeVendorIndex]);

  const activeVendor = useMemo(() => {
    if (!activeGroup) return null;
    return mockVendors.find(v => v.id === activeGroup.vendorId) || null;
  }, [activeGroup]);

  // Handle Submit RFQ for the selected vendor group
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onLoginClick?.();
      return;
    }
    if (!activeGroup || !activeVendor) return;

    const rfqNumber = `AMB-RFQ-${Math.floor(100000 + Math.random() * 900000)}`;

    const rfqObj: PublicQuotationRequest = {
      id: `rfq-${Date.now()}`,
      enquiryNumber: rfqNumber,
      vendorId: activeVendor.id,
      date: new Date().toISOString().split('T')[0],
      status: 'Wysłane',
      clientName: formData.clientName,
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      nip: formData.nip,
      city: formData.city,
      postalCode: formData.postalCode,
      businessType: formData.businessType,
      contactPreference: formData.contactPreference,
      expectedDeliveryDate: formData.expectedDeliveryDate || new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],
      message: formData.message,
      items: [...activeGroup.items]
    };

    onSubmitRFQ(rfqObj);
    setSuccessRequest(rfqObj);
  };

  const handleCloseSuccess = () => {
    setSuccessRequest(null);
    setActiveVendorIndex(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-left text-xs font-medium">
      <div>
        <h1 className="text-2xl font-black font-display text-gray-900 dark:text-white uppercase tracking-tight">Kreator Zapytania Ofertowego B2B (RFQ)</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Zbierz zapotrzebowanie dla swoich serwisów, dopasuj opakowania i wyślij bezpośrednie prośby o wycenę.</p>
      </div>

      {/* SUCCESS POPUP MODAL STATE */}
      {successRequest && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl space-y-6 max-w-2xl mx-auto text-center animate-scale-up relative">
          <div className="w-14 h-14 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-2">
            <Check className="h-6 w-6" />
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Zapytanie ofertowe zostało wysłane pomyślnie!</h2>
            <p className="text-gray-400">Wygenerowaliśmy oficjalny numer zapytania: <strong className="text-blue-600 dark:text-blue-400 font-mono text-sm">{successRequest.enquiryNumber}</strong></p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-950 p-5 rounded-2xl text-left space-y-3 max-w-lg mx-auto">
            <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-widest font-mono">Podsumowanie zgłoszenia B2B</h4>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-gray-500">
              <p>📍 Dostawca: <strong className="text-gray-800 dark:text-gray-200">
                {mockVendors.find(v => v.id === successRequest.vendorId)?.name}
              </strong></p>
              <p>🏢 Klient: <span className="text-gray-800 dark:text-gray-200 font-bold">{successRequest.companyName}</span></p>
              <p>📧 Kontakt: <span className="text-gray-800 dark:text-gray-200">{successRequest.email}</span></p>
              <p>📅 Oczekiwany termin: <span className="text-gray-800 dark:text-gray-200 font-mono font-bold">{successRequest.expectedDeliveryDate}</span></p>
            </div>

            <div className="pt-2">
              <p className="text-[10px] text-gray-400 font-bold">Pozycje asortymentowe ({successRequest.items.length}):</p>
              <ul className="list-disc list-inside text-[10px] text-gray-500 mt-1 space-y-0.5">
                {successRequest.items.map(item => {
                  const prod = mockProducts.find(p => p.id === item.productId);
                  return (
                    <li key={item.productId} className="truncate">
                      {prod?.name} • <strong>{item.quantity} paczek</strong> ({item.quantity * (prod?.packSize || 1)} szt.)
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={handleCloseSuccess}
              className="py-3 px-8 bg-[#2A3B4C] hover:brightness-110 text-white font-black text-xs rounded-xl shadow-md uppercase tracking-wider cursor-pointer"
            >
              Zamknij i wróć do koszyka
            </button>
          </div>
        </div>
      )}

      {/* CORE RFQ BUILDER VIEW (WHEN BASKET HAS ITEMS) */}
      {!successRequest && basket.length > 0 && activeGroup && activeVendor && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: LIST OF VENDORS WITH ACTIVE ITEMS */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-extrabold text-[10px] text-gray-400 uppercase tracking-widest font-mono pb-1">Dostawcy w zapytaniu ({basket.length})</h3>
            
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {basket.map((group, idx) => {
                const vend = mockVendors.find(v => v.id === group.vendorId);
                const isActive = activeVendorIndex === idx;
                return (
                  <button
                    key={group.vendorId}
                    type="button"
                    onClick={() => setActiveVendorIndex(idx)}
                    className={cn(
                      "p-4 rounded-xl text-left transition-all shrink-0 cursor-pointer flex items-center justify-between gap-3 w-64 lg:w-full",
                      isActive 
                        ? "bg-white dark:bg-gray-900 shadow-md scale-[1.01]" 
                        : "bg-gray-50 dark:bg-gray-950 hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <img src={vend?.logoUrl} alt={vend?.name} className="w-9 h-9 rounded-lg object-cover bg-white p-0.5" />
                      <div>
                        <h4 className={cn("font-bold text-xs", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-800 dark:text-gray-200")}>
                          {vend?.name}
                        </h4>
                        <p className="text-[10px] text-gray-400">{group.items.length} pozycji do wyceny</p>
                      </div>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 text-gray-400", isActive && "text-blue-500")} />
                  </button>
                );
              })}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl space-y-2 text-[11px] leading-relaxed">
              <span className="font-bold text-blue-700 dark:text-blue-400 block">💡 Jedno zapytanie na raz</span>
              <span className="text-gray-500 dark:text-gray-400">
                W B2B zapytania ofertowe wysyła się indywidualnie do każdego dystrybutora. Wybierz firmę z listy u góry, wypełnij dane z prawej strony i zatwierdź wysyłkę. Pozostałe grupy pozostaną w koszyku.
              </span>
            </div>
          </div>

          {/* RIGHT VIEW: ACTIVE BASKET ITEMS & CONTACT FORM */}
          <div className="lg:col-span-8 space-y-6">
            {/* Group Active Items List */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Asortyment zapytania: {activeVendor.name}</h3>
                  <p className="text-[10px] text-gray-400">{activeVendor.city} • Czas odpowiedzi: {activeVendor.responseTimeText}</p>
                </div>
                <button 
                  onClick={() => onClearVendorGroup(activeVendor.id)}
                  className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="h-4.5 w-4.5" /> Wyczyść tę listę
                </button>
              </div>

              {/* Items Rows */}
              <div className="divide-y divide-gray-100 dark:divide-gray-850">
                {activeGroup.items.map(item => {
                  const product = mockProducts.find(p => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      {/* Left: Product profile */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img src={product.imageUrl} alt={product.name} className="w-11 h-11 rounded-lg object-cover bg-gray-50 shrink-0" />
                        <div className="min-w-0 text-left">
                          <span className="text-[8px] font-black tracking-widest text-blue-600 dark:text-blue-400 uppercase font-mono">{product.brand} • SKU: {product.sku}</span>
                          <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate leading-tight">{product.name}</h4>
                          <span className="text-[10px] text-gray-400 font-bold uppercase font-mono mt-0.5 block">1 paczka = {product.packSize} {product.unit}</span>
                        </div>
                      </div>

                      {/* Center: Package quantities adjustments */}
                      <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                        {/* Qty controller */}
                        <div className="flex items-center rounded-lg bg-gray-50 dark:bg-gray-950 p-0.5">
                          <button 
                            type="button"
                            onClick={() => onUpdateItem(activeVendor.id, product.id, { quantity: Math.max(1, item.quantity - 1) })}
                            className="w-7 h-7 flex items-center justify-center text-sm font-black text-gray-400 hover:text-gray-800 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-black text-xs text-gray-800 dark:text-white">
                            {item.quantity} op.
                          </span>
                          <button 
                            type="button"
                            onClick={() => onUpdateItem(activeVendor.id, product.id, { quantity: item.quantity + 1 })}
                            className="w-7 h-7 flex items-center justify-center text-sm font-black text-gray-400 hover:text-gray-800 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Calculated pieces */}
                        <div className="text-right shrink-0 min-w-[70px]">
                          <p className="font-extrabold text-xs text-gray-950 dark:text-white">
                            {item.quantity * product.packSize} {product.unit}
                          </p>
                          <p className="text-[9px] text-gray-400 font-medium">łączna ilość</p>
                        </div>

                        {/* Line Controls Note & Substitutes */}
                        <button 
                          onClick={() => onRemoveItem(activeVendor.id, product.id)}
                          className="p-2 text-gray-400 hover:text-rose-500 cursor-pointer"
                          title="Usuń pozycję"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Client RFQ Company Form details */}
            {!isLoggedIn ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-md text-center space-y-4 max-w-xl mx-auto">
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <User className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="font-extrabold text-sm text-gray-800 dark:text-gray-200">Wymagane logowanie do wysłania RFQ</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  Twoje zapytanie ofertowe jest przygotowane i oczekuje w koszyku. Aby przesłać je bezpośrednio do wybranego dostawcy ({activeVendor?.name}), musisz najpierw zalogować się do swojego konta handlowego.
                </p>
                <button 
                  type="button"
                  onClick={onLoginClick}
                  className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wide cursor-pointer mx-auto block"
                >
                  Zaloguj się, aby wysłać zapytanie
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md space-y-6">
              <div className="space-y-1">
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Dane nadawcy i dane warsztatu</h3>
                <p className="text-[10px] text-gray-400">Podaj oficjalne dane rejestrowe firmy. Przyspieszy to automatyczną weryfikację i przypisanie rabatów handlowych.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700 dark:text-gray-300">
                <div className="space-y-1.5">
                  <label>Twoja nazwa (Osoba kontaktowa) *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-950 rounded-xl px-3.5 py-2.5 outline-none dark:text-white"
                    placeholder="np. Jan Kowalski" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label>Pełna nazwa firmy (Warsztatu) *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-950 rounded-xl px-3.5 py-2.5 outline-none dark:text-white"
                    placeholder="np. Moto-Serwis Poznań Sp. z o.o." 
                  />
                </div>

                <div className="space-y-1.5">
                  <label>Adres E-mail do ofert *</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-950 rounded-xl px-3.5 py-2.5 outline-none dark:text-white"
                    placeholder="np. oferty@motoserwis.pl" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label>Telefon komórkowy B2B</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-950 rounded-xl px-3.5 py-2.5 outline-none dark:text-white"
                    placeholder="np. +48 501 200 300" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label>Numer NIP firmy (do faktury i upustów)</label>
                  <input 
                    type="text" 
                    value={formData.nip}
                    onChange={e => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-950 rounded-xl px-3.5 py-2.5 outline-none dark:text-white"
                    placeholder="np. 7771234567" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label>Miasto i kod pocztowy *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input 
                      type="text" 
                      required
                      value={formData.postalCode}
                      onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                      className="bg-gray-50 dark:bg-gray-950 rounded-xl px-3.5 py-2.5 outline-none dark:text-white text-center"
                      placeholder="60-001" 
                    />
                    <input 
                      type="text" 
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="col-span-2 bg-gray-50 dark:bg-gray-950 rounded-xl px-3.5 py-2.5 outline-none dark:text-white"
                      placeholder="Poznań" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label>Oczekiwany termin dostawy</label>
                  <input 
                    type="date" 
                    value={formData.expectedDeliveryDate}
                    onChange={e => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-950 rounded-xl px-3.5 py-2.5 outline-none dark:text-white cursor-pointer" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label>Typ działalności warsztatu</label>
                  <select
                    value={formData.businessType}
                    onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-950 rounded-xl px-3.5 py-2.5 outline-none dark:text-white cursor-pointer"
                  >
                    <option value="Warsztat niezależny">Warsztat niezależny (SOP)</option>
                    <option value="Autoryzowany serwis ASO">Autoryzowany serwis ASO</option>
                    <option value="Flota samochodowa">Obsługa floty korporacyjnej</option>
                    <option value="Sklep motoryzacyjny">Sklep detaliczny / Hurtownia</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                <label>Dodatkowe uwagi dla opiekuna handlowego</label>
                <textarea 
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-950 rounded-xl px-3.5 py-2.5 outline-none dark:text-white resize-none font-bold"
                  placeholder="Napisz np. o konieczności stałej dostawy, zapytaj o warunki płatności odroczonej lub darmową wysyłkę..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>Wyślij zapytanie ofertowe do: {activeVendor.name}</span>
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* FALLBACK: BASKET IS EMPTY */}
      {basket.length === 0 && !successRequest && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl py-16 px-4 shadow-md text-center max-w-lg mx-auto space-y-4">
          <div className="flex justify-center pb-2">
            <ShoppingBag className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-200">Twój koszyk zapytań jest pusty</h2>
          <p className="text-xs text-gray-400 leading-relaxed">Aby wysłać zapytanie o wycenę, dodaj paczki produktów do koszyka za pomocą przycisku „Zapytaj +” w wyszukiwarce lub na profilu wybranego dystrybutora.</p>
          <div className="pt-2">
            <button 
              onClick={onGoToHome}
              className="py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer"
            >
              Rozpocznij zakupy
            </button>
          </div>
        </div>
      )}

      {/* RFQ HISTORIC ENQUIRIES TRACKER */}
      {submittedRfqs.length > 0 && !successRequest && (
        <div className="space-y-4 pt-12">
          <h2 className="text-base font-black font-display text-gray-900 dark:text-white uppercase tracking-tight">Twoja historia zapytań B2B ({submittedRfqs.length})</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submittedRfqs.map(rfq => {
              const vendor = mockVendors.find(v => v.id === rfq.vendorId);
              return (
                <div key={rfq.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-md space-y-3">
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <span className="text-[9px] font-black tracking-widest text-blue-600 dark:text-blue-400 font-mono uppercase">
                        {vendor?.name}
                      </span>
                      <h4 className="font-extrabold text-xs text-gray-900 dark:text-white mt-0.5">{rfq.enquiryNumber}</h4>
                    </div>
                    <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider font-mono flex items-center gap-1">
                      Wysłane <Check className="h-3 w-3" />
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-500 space-y-1.5 leading-relaxed text-left flex flex-col">
                    <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-gray-400" /> Data wysłania: <span className="text-gray-800 dark:text-gray-200 font-mono font-bold">{rfq.date}</span></p>
                    <p className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5 text-gray-400" /> Pozycje: <span className="text-gray-800 dark:text-gray-200 font-bold">{rfq.items.length} linie produktowe</span></p>
                    <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400" /> Oczekiwany termin: <span className="text-gray-800 dark:text-gray-200 font-mono">{rfq.expectedDeliveryDate}</span></p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
