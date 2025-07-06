'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Alert } from './types';
import { creditCardStore } from './lib/store';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, CreditCard as CreditCardIcon, AlertCircle } from "lucide-react";
import StatsCards from './components/dashboard/StatsCards';
import CreditCardGrid from './components/dashboard/CreditCardGrid';
import AlertsPanel from './components/dashboard/AlertsPanel';
import CreditCardForm from './components/dashboard/CreditCardForm';
import { ThemeToggle } from './components/theme-toggle';

export default function Home() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalMiles, setTotalMiles] = useState(0);

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
    setTotalMiles(creditCardStore.getTotalMilesEarned());
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

  const handleEditCardClick = (card: CreditCard) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCard(null);
  };

  const activeCards = cards.filter(card => card.isActive);
  const inactiveCards = cards.filter(card => !card.isActive);
  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Credit Card Portfolio</h1>
              <p className="text-muted-foreground">Manage your credit cards and track your rewards</p>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Card
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <CreditCardForm
                    key={editingCard ? `edit-${editingCard.id}` : 'add-new'}
                    card={editingCard || undefined}
                    onSubmit={editingCard ? handleEditCard : handleAddCard}
                    onCancel={handleCancelForm}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <StatsCards
            totalCards={cards.length}
            activeCards={activeCards.length}
            totalSpend={totalSpend}
            totalMiles={totalMiles}
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
            />
          </div>

          {/* Cards Section */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="active" className="w-full">
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="active" className="flex items-center space-x-2">
                    <CreditCardIcon className="h-4 w-4" />
                    <span>Active Cards</span>
                    {activeCards.length > 0 && (
                      <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                        {activeCards.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="inactive" className="flex items-center space-x-2">
                    <CreditCardIcon className="h-4 w-4" />
                    <span>Inactive Cards</span>
                    {inactiveCards.length > 0 && (
                      <span className="ml-1 bg-muted text-muted-foreground text-xs rounded-full px-2 py-1">
                        {inactiveCards.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                {unreadAlerts.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>{unreadAlerts.length} unread alerts</span>
                  </div>
                )}
              </div>

              <TabsContent value="active" className="space-y-4">
                <CreditCardGrid
                  cards={activeCards}
                  onEdit={handleEditCardClick}
                  onDelete={handleDeleteCard}
                  onUpdateSpend={handleUpdateSpend}
                />
              </TabsContent>

              <TabsContent value="inactive" className="space-y-4">
                <CreditCardGrid
                  cards={inactiveCards}
                  onEdit={handleEditCardClick}
                  onDelete={handleDeleteCard}
                  onUpdateSpend={handleUpdateSpend}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
