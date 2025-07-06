'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Alert } from '../types';
import { creditCardStore } from '../lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard as CreditCardIcon, AlertCircle } from "lucide-react";
import StatsCards from '@/components/dashboard/StatsCards';
import CreditCardGrid from '@/components/dashboard/CreditCardGrid';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import Header from '@/components/dashboard/Header';

export default function Home() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [totalSpend, setTotalSpend] = useState(0);
  const [milesStats, setMilesStats] = useState({ totalSpend: 0, totalMiles: 0 });
  const [cashbackStats, setCashbackStats] = useState({ totalSpend: 0, totalCashback: 0 });
  const [cardTypeFilter, setCardTypeFilter] = useState<'all' | 'miles' | 'cashback'>('all');

  useEffect(() => {
    loadData();
    // Refresh data every minute
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const activeCards = cards.filter(card => card.isActive);
  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  // Filter cards based on card type
  const getFilteredCards = () => {
    if (cardTypeFilter === 'all') {
      return activeCards;
    }
    return activeCards.filter(card => card.cardType === cardTypeFilter);
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
        {/* Stats Overview */}
        <div className="mb-8">
          <StatsCards
            totalCards={cards.length}
            activeCards={activeCards.length}
            totalSpend={totalSpend}
            milesStats={milesStats}
            cashbackStats={cashbackStats}
          />
        </div>

        {/* Alerts and Cards */}
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Alerts Panel */}
          <div className="lg:col-span-1">
            <AlertsPanel
              alerts={alerts}
              cards={cards}
              onMarkAsRead={handleMarkAlertAsRead}
              onDeleteAlert={handleDeleteAlert}
              onMarkAsPaid={handleMarkAlertAsPaid}
            />
          </div>

          {/* Cards Section */}
          <div className="lg:col-span-3">
            <Tabs value={cardTypeFilter} onValueChange={(value) => setCardTypeFilter(value as 'all' | 'miles' | 'cashback')} className="w-full">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="w-full overflow-x-auto">
                  <TabsList className="whitespace-nowrap w-max min-w-full">
                    <TabsTrigger value="all" className="flex items-center space-x-2">
                      <CreditCardIcon className="h-4 w-4" />
                      <span>All Cards</span>
                      {activeCards.length > 0 && (
                        <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                          {activeCards.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="miles" className="flex items-center space-x-2">
                      <CreditCardIcon className="h-4 w-4" />
                      <span>Miles</span>
                      {activeCards.filter(card => card.cardType === 'miles').length > 0 && (
                        <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                          {activeCards.filter(card => card.cardType === 'miles').length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="cashback" className="flex items-center space-x-2">
                      <CreditCardIcon className="h-4 w-4" />
                      <span>Cashback</span>
                      {activeCards.filter(card => card.cardType === 'cashback').length > 0 && (
                        <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                          {activeCards.filter(card => card.cardType === 'cashback').length}
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
                />
              </TabsContent>

              <TabsContent value="miles" className="space-y-4">
                <CreditCardGrid
                  cards={filteredCards}
                  onEdit={handleEditCardClick}
                  onDelete={handleDeleteCard}
                  onUpdateSpend={handleUpdateSpend}
                  paidPaymentPeriods={creditCardStore.getPaidPaymentPeriods()}
                />
              </TabsContent>

              <TabsContent value="cashback" className="space-y-4">
                <CreditCardGrid
                  cards={filteredCards}
                  onEdit={handleEditCardClick}
                  onDelete={handleDeleteCard}
                  onUpdateSpend={handleUpdateSpend}
                  paidPaymentPeriods={creditCardStore.getPaidPaymentPeriods()}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
