'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { CreditCard, Alert } from '../types';
import { creditCardStore } from '../lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard as CreditCardIcon, AlertCircle, Search as SearchIcon, Store as StoreIcon } from "lucide-react";
import StatsCards from '@/components/dashboard/StatsCards';
import CreditCardGrid from '@/components/dashboard/CreditCardGrid';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import Header from '@/components/dashboard/Header';
import { MERCHANTS, CATEGORY_OPTIONS, MERCHANT_TO_CATEGORY } from '@/lib/mappings';
import CategorySearch from '@/components/dashboard/CategorySearch';

export default function Home() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [totalSpend, setTotalSpend] = useState(0);
  const [milesStats, setMilesStats] = useState({ totalSpend: 0, totalMiles: 0 });
  const [cashbackStats, setCashbackStats] = useState({ totalSpend: 0, totalCashback: 0 });
  const [cardTypeFilter, setCardTypeFilter] = useState<'all' | 'miles' | 'cashback'>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [merchantSearch, setMerchantSearch] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  const [merchantSuggestions, setMerchantSuggestions] = useState<string[]>([]);

  useEffect(() => {
    loadData();
    // Refresh data every minute
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Autocomplete logic for merchant search
  useEffect(() => {
    if (merchantSearch) {
      setMerchantSuggestions(
        MERCHANTS.filter(m => m.toLowerCase().includes(merchantSearch.toLowerCase()))
      );
    } else {
      setMerchantSuggestions([]);
    }
  }, [merchantSearch]);

  const loadData = () => {
    const loadedCards = creditCardStore.getCards();
    const loadedAlerts = creditCardStore.getAlerts();

    setCards(loadedCards);
    setAlerts(loadedAlerts);
    setTotalSpend(creditCardStore.getTotalSpend());
    setMilesStats(creditCardStore.getMilesCardsStats());
    setCashbackStats(creditCardStore.getCashbackCardsStats());
  };

  const handleAddCard = (cardData: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    creditCardStore.addCard(cardData);
    loadData();
    setShowForm(false);
  };

  const handleEditCard = (cardData: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCard) {
      creditCardStore.updateCard(editingCard.id, cardData);
      loadData();
      setEditingCard(null);
      setShowForm(false);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      creditCardStore.deleteCard(cardId);
      loadData();
    }
  };

  const handleUpdateSpend = (cardId: string, category: string, amount: number) => {
    creditCardStore.updateCardSpend(cardId, category, amount);
    loadData();
  };

  const handleMarkAlertAsRead = (alertId: string) => {
    creditCardStore.markAlertAsRead(alertId);
    loadData();
  };

  const handleDeleteAlert = (alertId: string) => {
    creditCardStore.deleteAlert(alertId);
    loadData();
  };

  const handleMarkAlertAsPaid = (alertId: string) => {
    creditCardStore.markAlertAsPaid(alertId);
    loadData();
  };

  const handleEditCardClick = (card: CreditCard) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCard(null);
  };

  const handleUnmarkPaymentPaid = (card: CreditCard, paymentDate: Date) => {
    creditCardStore.unmarkPaymentPeriodAsPaid(card.id, paymentDate);
    loadData();
  };

  const activeCards = cards.filter(card => card.isActive);
  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  // Filter cards based on card type
  const getFilteredCards = () => {
    const base = showInactive ? cards : activeCards;
    if (cardTypeFilter === 'all') {
      return base;
    }
    return base.filter(card => card.cardType === cardTypeFilter);
  };

  // Find best cards for a category
  const getBestCardsForCategory = (category: string) => {
    const best: { cashback: CreditCard | null; miles: CreditCard | null } = { cashback: null, miles: null };
    let bestCashbackRate = -Infinity;
    let bestMilesRate = -Infinity;
    // Find best for selected category
    for (const card of cards) {
      if (!card.isActive) continue;
      const rate = card.earningRates.find(r => r.category === category);
      if (rate) {
        if (card.cardType === 'cashback' && rate.rate > bestCashbackRate) {
          best.cashback = card;
          bestCashbackRate = rate.rate;
        }
        if (card.cardType === 'miles' && rate.rate > bestMilesRate) {
          best.miles = card;
          bestMilesRate = rate.rate;
        }
      }
    }
    // If not found, fallback to best 'General' rate
    if (!best.cashback) {
      for (const card of cards) {
        if (!card.isActive || card.cardType !== 'cashback') continue;
        const rate = card.earningRates.find(r => r.category === 'General');
        if (rate && rate.rate > bestCashbackRate) {
          best.cashback = card;
          bestCashbackRate = rate.rate;
        }
      }
    }
    if (!best.miles) {
      for (const card of cards) {
        if (!card.isActive || card.cardType !== 'miles') continue;
        const rate = card.earningRates.find(r => r.category === 'General');
        if (rate && rate.rate > bestMilesRate) {
          best.miles = card;
          bestMilesRate = rate.rate;
        }
      }
    }
    return best;
  };

  const filteredCards = getFilteredCards();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        showForm={showForm}
        setShowForm={setShowForm}
        editingCard={editingCard}
        onAddCard={handleAddCard}
        onEditCard={handleEditCard}
        onCancelForm={handleCancelForm}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Category Search UI - at top, now a component */}
        <CategorySearch CATEGORY_OPTIONS={CATEGORY_OPTIONS} getBestCardsForCategory={getBestCardsForCategory} />
        {/* Merchant Search UI - redesigned */}
        <div className="mb-6">
          <div className="bg-white dark:bg-muted rounded-xl shadow p-4 flex flex-col gap-3 border border-muted-foreground/10">
            <div className="flex items-center gap-2 mb-2">
              <StoreIcon className="h-5 w-5 text-primary" />
              <span className="font-semibold text-base">Find best card for merchant</span>
            </div>
            <div className="flex items-center gap-2 w-full relative">
              <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                id="merchantSearch"
                type="text"
                value={merchantSearch}
                onChange={e => {
                  setMerchantSearch(e.target.value);
                  setSelectedMerchant(null);
                }}
                placeholder="Type merchant name..."
                className="h-10 rounded-lg border pl-9 pr-3 text-base w-full focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                autoComplete="off"
              />
              {selectedMerchant && (
                <button
                  type="button"
                  className="ml-2 text-xs text-muted-foreground border rounded px-2 py-1 hover:bg-muted absolute right-2 top-1"
                  onClick={() => {
                    setSelectedMerchant(null);
                    setMerchantSearch('');
                  }}
                >
                  Clear
                </button>
              )}
              {merchantSuggestions.length > 0 && !selectedMerchant && (
                <ul className="absolute z-10 bg-white dark:bg-muted border rounded shadow w-full mt-1 max-h-40 overflow-auto left-0 top-12">
                  {merchantSuggestions.map(m => (
                    <li
                      key={m}
                      className="px-3 py-2 cursor-pointer hover:bg-primary/10 text-base"
                      onClick={() => {
                        setSelectedMerchant(m);
                        setMerchantSearch(m);
                        setMerchantSuggestions([]);
                      }}
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {selectedMerchant && Object.prototype.hasOwnProperty.call(MERCHANT_TO_CATEGORY, selectedMerchant) && (
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                {(() => {
                  const category = MERCHANT_TO_CATEGORY[selectedMerchant];
                  const best = getBestCardsForCategory(category);
                  return (
                    <>
                      <div className="flex-1 bg-muted/60 rounded-lg p-4 flex flex-col gap-2 border border-primary/10">
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
                          <CreditCardIcon className="h-4 w-4" /> Best Miles Card
                        </div>
                        {best.miles ? (
                          <div>
                            <div className="font-medium text-lg">{best.miles.name}</div>
                            <div className="text-xs text-muted-foreground mb-1">{best.miles.bank}</div>
                            <div className="text-sm font-mono">Rate (mpd): <span className="font-bold">{best.miles.earningRates.find(r => r.category === category)?.rate ?? best.miles.earningRates.find(r => r.category === 'General')?.rate}</span></div>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">No miles card available</div>
                        )}
                      </div>
                      <div className="flex-1 bg-muted/60 rounded-lg p-4 flex flex-col gap-2 border border-primary/10">
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
                          <CreditCardIcon className="h-4 w-4" /> Best Cashback Card
                        </div>
                        {best.cashback ? (
                          <div>
                            <div className="font-medium text-lg">{best.cashback.name}</div>
                            <div className="text-xs text-muted-foreground mb-1">{best.cashback.bank}</div>
                            <div className="text-sm font-mono">Rate (%): <span className="font-bold">{best.cashback.earningRates.find(r => r.category === category)?.rate ?? best.cashback.earningRates.find(r => r.category === 'General')?.rate}</span></div>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">No cashback card available</div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
        {/* Stats Overview */}
        <div className="mb-8">
          <StatsCards
            totalCards={cards.length}
            activeCards={activeCards.length}
            totalSpend={totalSpend}
            milesStats={milesStats}
            cashbackStats={cashbackStats}
            cards={activeCards} // Only pass active cards
          />
        </div>
        {/* Alerts and Cards */}
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Alerts Panel */}
          <div className="lg:col-span-1">
            <AlertsPanel
              alerts={alerts}
              cards={activeCards}
              onMarkAsRead={handleMarkAlertAsRead}
              onDeleteAlert={handleDeleteAlert}
              onMarkAsPaid={handleMarkAlertAsPaid}
            />
          </div>
          {/* Cards Section */}
          <div className="lg:col-span-3">
            {/* Show Inactive Cards Switch - moved back here */}
            <div className="flex items-center mb-4 gap-2">
              <Switch id="showInactive" checked={showInactive} onCheckedChange={setShowInactive} />
              <label htmlFor="showInactive" className="text-sm">Show inactive cards</label>
            </div>
            <Tabs value={cardTypeFilter} onValueChange={(value) => setCardTypeFilter(value as 'all' | 'miles' | 'cashback')} className="w-full">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="w-full">
                  <TabsList className="flex flex-wrap w-full bg-muted rounded-lg p-[3px] gap-2 justify-start items-center">
                    <TabsTrigger value="all" className="flex items-center space-x-2">
                      <CreditCardIcon className="h-4 w-4" />
                      <span>All Cards</span>
                      {getFilteredCards().length > 0 && (
                        <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                          {getFilteredCards().length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="miles" className="flex items-center space-x-2">
                      <CreditCardIcon className="h-4 w-4" />
                      <span>Miles</span>
                      {getFilteredCards().filter(card => card.cardType === 'miles').length > 0 && (
                        <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                          {getFilteredCards().filter(card => card.cardType === 'miles').length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="cashback" className="flex items-center space-x-2">
                      <CreditCardIcon className="h-4 w-4" />
                      <span>Cashback</span>
                      {getFilteredCards().filter(card => card.cardType === 'cashback').length > 0 && (
                        <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                          {getFilteredCards().filter(card => card.cardType === 'cashback').length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>
                {unreadAlerts.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2 sm:mt-0">
                    <AlertCircle className="h-4 w-4" />
                    <span>{unreadAlerts.length} unread alerts</span>
                  </div>
                )}
              </div>

              <TabsContent value="all" className="space-y-4">
                <CreditCardGrid
                  cards={filteredCards}
                  onEdit={handleEditCardClick}
                  onDelete={handleDeleteCard}
                  onUpdateSpend={handleUpdateSpend}
                  paidPaymentPeriods={creditCardStore.getPaidPaymentPeriods()}
                  onUnmarkPaymentPaid={handleUnmarkPaymentPaid}
                />
              </TabsContent>

              <TabsContent value="miles" className="space-y-4">
                <CreditCardGrid
                  cards={filteredCards}
                  onEdit={handleEditCardClick}
                  onDelete={handleDeleteCard}
                  onUpdateSpend={handleUpdateSpend}
                  paidPaymentPeriods={creditCardStore.getPaidPaymentPeriods()}
                  onUnmarkPaymentPaid={handleUnmarkPaymentPaid}
                />
              </TabsContent>

              <TabsContent value="cashback" className="space-y-4">
                <CreditCardGrid
                  cards={filteredCards}
                  onEdit={handleEditCardClick}
                  onDelete={handleDeleteCard}
                  onUpdateSpend={handleUpdateSpend}
                  paidPaymentPeriods={creditCardStore.getPaidPaymentPeriods()}
                  onUnmarkPaymentPaid={handleUnmarkPaymentPaid}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
