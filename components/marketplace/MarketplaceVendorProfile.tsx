'use client';

import React, { useState, useMemo } from 'react';
import { 
  mockProducts, 
  mockCatalogs, 
  mockPromotions, 
  mockFlyers 
} from './mockData';
import { PublicVendor, PublicProduct, EnquiryBasketGroup } from './types';
import { 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Clock, 
  Truck, 
  Compass, 
  Heart, 
  ChevronRight, 
  BookOpen, 
  Search, 
  Tag, 
  ArrowLeft,
  FileText,
  User,
  ExternalLink,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MarketplaceVendorProfileProps {
  vendor: PublicVendor;
  onBack: () => void;
  onSelectProduct: (slug: string) => void;
  onSelectFlyer: (slug: string) => void;
  onToggleSaveVendor: () => void;
  isSaved: boolean;
  savedProductIds: string[];
  onToggleSaveProduct: (id: string) => void;
  onAddToEnquiry: (productId: string, qty: number, unit: 'szt' | 'paczka') => void;
  basket: EnquiryBasketGroup[];
}

export default function MarketplaceVendorProfile({
  vendor,
  onBack,
  onSelectProduct,
  onSelectFlyer,
  onToggleSaveVendor,
  isSaved,
  savedProductIds,
  onToggleSaveProduct,
  onAddToEnquiry,
  basket
}: MarketplaceVendorProfileProps) {
  // Tabs: 'info' | 'catalog' | 'promotions' | 'contact'
  const [activeTab, setActiveTab] = useState<'info' | 'catalog' | 'promotions' | 'contact'>('info');

  // Search inside vendor's catalog state
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('Wszystko');

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    company: '',
    email: '',
    message: '',
    urgency: 'Średni'
  });
  const [contactSuccess, setContactSuccess] = useState(false);

  // Vendor Specific Products
  const vendorProducts = useMemo(() => {
    return mockProducts.filter(p => p.vendorId === vendor.id);
  }, [vendor.id]);

  // Categories present in this vendor's catalog
  const vendorCategories = useMemo(() => {
    const cats = new Set(vendorProducts.map(p => p.category));
    return ['Wszystko', ...Array.from(cats)];
  }, [vendorProducts]);

  // Catalog filtered items
  const filteredVendorProducts = useMemo(() => {
    return vendorProducts.filter(p => {
      const matchesSearch = !catalogSearch || 
        p.name.toLowerCase().includes(catalogSearch.toLowerCase()) || 
        p.brand.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(catalogSearch.toLowerCase());

      const matchesCat = catalogCategory === 'Wszystko' || p.category === catalogCategory;

      return matchesSearch && matchesCat;
    });
  }, [vendorProducts, catalogSearch, catalogCategory]);

  // Vendor promotions
  const vendorPromotions = useMemo(() => {
    return mockPromotions.filter(p => p.vendorId === vendor.id);
  }, [vendor.id]);

  // Vendor flyers
  const vendorFlyers = useMemo(() => {
    return mockFlyers.filter(f => f.vendorId === vendor.id);
  }, [vendor.id]);

  // Vendor catalogs
  const vendorCatalogs = useMemo(() => {
    return mockCatalogs.filter(c => c.vendorId === vendor.id);
  }, [vendor.id]);

  // Quick add animation success indicator
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const handleQuickAdd = (productId: string, minQty: number) => {
    onAddToEnquiry(productId, minQty, 'paczka');
    setAddedProductId(productId);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API request send
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactForm({ name: '', company: '', email: '', message: '', urgency: 'Średni' });
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 animate-fade-in text-left">
      {/* 1. PROFILE BANNER HERO */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm relative">
        <div className="h-44 md:h-60 relative overflow-hidden bg-gray-100 dark:bg-gray-950">
          <img src={vendor.coverUrl} alt={vendor.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 py-1.5 px-3 bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-white rounded-lg text-xs font-black uppercase tracking-wide flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Powrót do wyszukiwania
          </button>
        </div>

        {/* Profile Identity Details Row */}
        <div className="p-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12 md:-mt-16 z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 text-left">
            <img 
              src={vendor.logoUrl} 
              alt={vendor.name} 
              className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover bg-white p-1 shadow-lg shrink-0" 
            />
            
            <div className="space-y-1.5 pt-4 md:pt-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-3xl font-black font-display text-gray-900 dark:text-white uppercase tracking-tight">
                  {vendor.name}
                </h1>
                {vendor.isVerified && (
                  <span title="Dostawca certyfikowany">
                    <ShieldCheck className="h-6 w-6 text-blue-500 fill-blue-500/10 shrink-0" />
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider font-mono">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  {vendor.city} ({vendor.distanceKm} km od Ciebie)
                </span>
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 rounded">
                  {vendor.category}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={onToggleSaveVendor}
              className={cn(
                "p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer transition-all",
                isSaved ? "bg-rose-50 dark:bg-rose-950/20 text-rose-500" : "text-gray-400"
              )}
              title={isSaved ? "Usuń ze schowka" : "Zapisz dostawcę"}
            >
              <Heart className={cn("h-5 w-5", isSaved && "fill-rose-500 text-rose-500")} />
            </button>
            <button 
              onClick={() => setActiveTab('contact')}
              className="py-2.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-xs rounded-xl shadow-md uppercase tracking-wider cursor-pointer"
            >
              Zapytaj o współpracę
            </button>
          </div>
        </div>
      </div>

      {/* 2. PROFILE GRID BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR COLUMNS: QUICK INFORMATION */}
        <div className="space-y-6">
          {/* Quick Contact Box */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-[10px] text-gray-400 uppercase tracking-widest font-mono pb-1">Kontakt B2B</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 leading-none mb-0.5">Opiekun handlowy:</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">Dział Współpracy B2B</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 leading-none mb-0.5">Telefon bezpośredni:</p>
                  <a href={`tel:${vendor.contactPhone}`} className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline">{vendor.contactPhone}</a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 leading-none mb-0.5">Adres E-mail:</p>
                  <a href={`mailto:${vendor.contactEmail}`} className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline">{vendor.contactEmail}</a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 leading-none mb-0.5">Godziny otwarcia:</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{vendor.openingHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logistics Terms */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 space-y-4 shadow-sm text-xs leading-relaxed">
            <h3 className="font-extrabold text-[10px] text-gray-400 uppercase tracking-widest font-mono pb-1">Zasady logistyki</h3>
            <div className="space-y-3">
              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200 block mb-0.5">🚚 Dostawa:</span>
                <span className="text-gray-500 dark:text-gray-400">{vendor.deliveryAvailable ? 'Dostępna (własna flota / kurier B2B)' : 'Brak dostawy'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200 block mb-0.5">🏢 Odbiór osobisty:</span>
                <span className="text-gray-500 dark:text-gray-400">{vendor.collectionAvailable ? 'Możliwy w punkcie handlowym' : 'Brak możliwości odbioru'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200 block mb-0.5">📍 Obszar dostaw:</span>
                <span className="text-gray-500 dark:text-gray-400">{vendor.serviceArea}</span>
              </div>
              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200 block mb-0.5">⌛ Czas reakcji:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{vendor.responseTimeText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN BODY AREA: TAB SWITCHER & VIEWS */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs header list */}
          <div className="flex">
            {(['info', 'catalog', 'promotions', 'contact'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-3 text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                  activeTab === tab 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {tab === 'info' ? 'O firmie & Warunki' : tab === 'catalog' ? `Katalog B2B (${vendorProducts.length})` : tab === 'promotions' ? 'Promocje & Gazetki' : 'Kontakt / Zapytaj'}
              </button>
            ))}
          </div>

          {/* TAB 1: INFORMACJE & REGULAMINY */}
          {activeTab === 'info' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Opis dystrybutora</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  {vendor.longDescription}
                </p>
              </div>

              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-xs">
                  <h4 className="font-black text-gray-700 dark:text-gray-300 uppercase tracking-wide">Warunki dostawy & Minimum logistyczne</h4>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    {vendor.deliveryTerms}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="font-black text-gray-700 dark:text-gray-300 uppercase tracking-wide">Wiodące marki asortymentowe</h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {vendor.featuredBrands.map(b => (
                      <span key={b} className="px-3 py-1 bg-gray-50 dark:bg-gray-850 text-[10px] font-black text-gray-600 dark:text-gray-300 rounded-lg uppercase tracking-wider">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vendor Catalogs list (PDF format / dynamic download) */}
              {vendorCatalogs.length > 0 && (
                <div className="pt-6 space-y-3">
                  <h4 className="font-black text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wide">Dostępne Katalogi Produktowe ({vendorCatalogs.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vendorCatalogs.map(catalog => (
                      <div key={catalog.id} className="p-4 bg-gray-50 dark:bg-gray-950 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-6 w-6 text-blue-500" />
                          <div className="text-left">
                            <h5 className="font-bold text-xs">{catalog.title}</h5>
                            <p className="text-[10px] text-gray-400 font-medium">{catalog.category} • {catalog.productCount} produktów</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setActiveTab('catalog'); setCatalogCategory(catalog.category); }}
                          className="py-1 px-3 bg-[#2A3B4C] text-white rounded-lg text-[9px] uppercase font-black cursor-pointer"
                        >
                          Zobacz
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTERACTIVE B2B CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              {/* Inner search & inner categories filter */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch gap-3">
                <div className="flex-1 bg-gray-50 dark:bg-gray-950 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Wyszukaj w katalogu tego dostawcy..."
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    className="w-full text-xs font-bold bg-transparent outline-none dark:text-white"
                  />
                </div>

                <div className="w-full sm:w-56 bg-gray-50 dark:bg-gray-950 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-semibold shrink-0">Kategoria:</span>
                  <select
                    value={catalogCategory}
                    onChange={e => setCatalogCategory(e.target.value)}
                    className="w-full text-xs font-bold bg-transparent outline-none dark:text-white cursor-pointer"
                  >
                    {vendorCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid of Products */}
              {filteredVendorProducts.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl space-y-2">
                  <span className="text-2xl">📦</span>
                  <p className="text-xs text-gray-400 font-bold">Brak pasujących artykułów w katalogu tego dostawcy.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVendorProducts.map(product => {
                    const isSaved = savedProductIds.includes(product.id);
                    return (
                      <div 
                        key={product.id}
                        className="bg-white dark:bg-gray-900 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-md group transition-all"
                      >
                        <div>
                          {/* Image */}
                          <div className="aspect-square relative bg-gray-50 dark:bg-gray-950 rounded-lg overflow-hidden mb-3">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            
                            {/* New Badge */}
                            {product.isNew && (
                              <span className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                                NOWOŚĆ
                              </span>
                            )}

                            {/* Save */}
                            <button
                              onClick={() => onToggleSaveProduct(product.id)}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/95 dark:bg-gray-900/95 shadow-sm text-gray-400 hover:text-rose-500 cursor-pointer"
                            >
                              <Heart className={cn("h-3.5 w-3.5", isSaved && "fill-rose-500 text-rose-500")} />
                            </button>
                          </div>

                          {/* Details */}
                          <div className="space-y-1.5">
                            <span className="text-[8px] font-black tracking-widest text-blue-600 dark:text-blue-400 uppercase font-mono">{product.brand}</span>
                            <h4 
                              onClick={() => onSelectProduct(product.slug)}
                              className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-blue-600 hover:underline cursor-pointer line-clamp-2 leading-snug"
                            >
                              {product.name}
                            </h4>

                            {/* Pricing */}
                            <div className="pt-0.5 text-xs text-left">
                              {product.priceMode === 'exact' && product.priceValue && (
                                <p className="font-extrabold text-xs text-gray-950 dark:text-white">
                                  {product.priceValue.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN <span className="text-[10px] text-gray-400 font-normal">/{product.unit}</span>
                                </p>
                              )}
                              {product.priceMode === 'from' && product.priceValue && (
                                <p className="font-extrabold text-xs text-gray-950 dark:text-white">
                                  od {product.priceValue.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                                </p>
                              )}
                              {product.priceMode === 'range' && product.priceValue && product.priceMax && (
                                <p className="font-extrabold text-xs text-gray-950 dark:text-white">
                                  {product.priceValue.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} - {product.priceMax.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                                </p>
                              )}
                              {product.priceMode === 'on_request' && (
                                <span className="text-orange-600 dark:text-orange-400 text-[9px] font-black uppercase tracking-wider font-mono">Cena na zapytanie</span>
                              )}
                              {product.priceMode === 'after_login' && (
                                <span className="text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-wider font-mono">Cena po zalogowaniu</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="pt-3 mt-3 flex items-center justify-between text-[9px] text-gray-400">
                          <span>Op. zbiorcze: {product.packSize}</span>
                          
                          <button
                            onClick={() => handleQuickAdd(product.id, product.minEnquiryQty)}
                            disabled={addedProductId === product.id}
                            className={cn(
                              "py-1 px-3 rounded-lg font-black text-[9px] uppercase tracking-wider cursor-pointer",
                              addedProductId === product.id 
                                ? "bg-green-600 text-white" 
                                : "bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                            )}
                          >
                            {addedProductId === product.id ? 'Dodano ✓' : 'Zapytaj +'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROMOTIONS & DIGITAL FLYERS */}
          {activeTab === 'promotions' && (
            <div className="space-y-6">
              {/* Dynamic flyers list */}
              {vendorFlyers.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-black text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wide">Dostępne Gazetki Produktowe ({vendorFlyers.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {vendorFlyers.map(flyer => (
                      <div 
                        key={flyer.id}
                        onClick={() => onSelectFlyer(flyer.slug)}
                        className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer group"
                      >
                        <div className="aspect-[3/4] overflow-hidden relative bg-gray-50 dark:bg-gray-950">
                          <img src={flyer.coverUrl} alt={flyer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                            <h5 className="text-white font-bold text-xs line-clamp-2">{flyer.title}</h5>
                          </div>
                        </div>
                        <div className="p-3 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase">
                          <span>{flyer.pages.length} strony</span>
                          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-0.5">Otwórz <ChevronRight className="h-3 w-3" /></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Promotions list */}
              <div className="space-y-3">
                <h4 className="font-black text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wide">Promocje i Rabaty ilościowe ({vendorPromotions.length})</h4>
                {vendorPromotions.length === 0 ? (
                  <p className="text-xs text-gray-400">Brak aktywnych promocji u tego dostawcy.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {vendorPromotions.map(promo => (
                      <div key={promo.id} className="bg-white dark:bg-gray-900 rounded-xl p-5 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-extrabold text-sm text-gray-900 dark:text-white leading-tight">{promo.title}</h5>
                          <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[10px] font-black px-2.5 py-1 rounded-full">
                            {promo.badgeText}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{promo.description}</p>
                        <div className="text-[10px] text-gray-400 font-bold uppercase font-mono pt-3">
                          Okres ważności oferty: {promo.validFrom} do {promo.validTo}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DIRECT COOPERATION FORM */}
          {activeTab === 'contact' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
              <div className="space-y-1 text-left mb-6">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Zapytaj o warunki handlowe lub współpracę</h3>
                <p className="text-xs text-gray-400">Wypełnij krótki formularz B2B. Twoje zgłoszenie trafi bezpośrednio do zespołu opiekunów dystrybutora.</p>
              </div>

              {contactSuccess ? (
                <div className="bg-green-50 dark:bg-green-950/20 p-8 rounded-xl text-center space-y-4 max-w-md mx-auto">
                  <span className="text-3xl">✓</span>
                  <h4 className="font-bold text-sm text-green-800 dark:text-green-300">Zapytanie zostało wysłane!</h4>
                  <p className="text-xs text-green-600 dark:text-green-400 leading-relaxed">Dziękujemy za kontakt. Opiekun handlowy dostawcy AutoParts Pro skontaktuje się z Tobą na podany adres e-mail w ciągu deklarowanego czasu reakcji (zwykle {vendor.responseTimeText}).</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 max-w-xl text-left text-xs font-bold text-gray-700 dark:text-gray-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label>Imię i nazwisko nadawcy *</label>
                      <input 
                        type="text" 
                        required
                        value={contactForm.name}
                        onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-950 rounded-xl px-3.5 py-2.5 outline-none dark:text-white text-xs font-bold"
                        placeholder="np. Jan Kowalski" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label>Nazwa firmy (NIP opcjonalnie)</label>
                      <input 
                        type="text" 
                        value={contactForm.company}
                        onChange={e => setContactForm({ ...contactForm, company: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-950 rounded-xl px-3.5 py-2.5 outline-none dark:text-white text-xs font-bold"
                        placeholder="np. Warsztat Auto-Klinika" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label>Adres e-mail do kontaktu *</label>
                    <input 
                      type="email" 
                      required
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-950 rounded-xl px-3.5 py-2.5 outline-none dark:text-white text-xs font-bold"
                      placeholder="np. kontakt@twojwarsztat.pl" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label>Wybierz stopień pilności kontaktu</label>
                    <div className="flex items-center gap-3">
                      {['Niski', 'Średni', 'Wysoki'].map(urg => (
                        <button
                          key={urg}
                          type="button"
                          onClick={() => setContactForm({ ...contactForm, urgency: urg })}
                          className={cn(
                            "py-2 px-4 rounded-xl font-black text-[10px] uppercase transition-all cursor-pointer",
                            contactForm.urgency === urg 
                              ? "bg-blue-600 text-white" 
                              : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850"
                          )}
                        >
                          {urg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label>Treść zapytania / szczegóły współpracy *</label>
                    <textarea 
                      rows={5}
                      required
                      value={contactForm.message}
                      onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-950 rounded-xl px-3.5 py-2.5 outline-none dark:text-white text-xs font-bold resize-none"
                      placeholder="Napisz, jakich produktów potrzebujesz, jakie wolumeny planujesz zamawiać miesięcznie, lub zadaj pytanie o dostawę..."
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md uppercase tracking-wider cursor-pointer"
                    >
                      Wyślij zapytanie handlowe
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
