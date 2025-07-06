import { CreditCard, Alert } from '../types';

class CreditCardStore {
  private cards: CreditCard[] = [];
  private alerts: Alert[] = [];
  private paidPaymentPeriods: Set<string> = new Set();

  constructor() {
    this.loadFromStorage();
    this.generateAlerts();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const storedCards = localStorage.getItem('creditCards');
      const storedAlerts = localStorage.getItem('alerts');
      const storedPaidPeriods = localStorage.getItem('paidPaymentPeriods');

      if (storedCards) {
        this.cards = JSON.parse(storedCards);
        // Migrate existing cards to new structure
        this.migrateExistingCards();
      }

      if (storedAlerts) {
        this.alerts = JSON.parse(storedAlerts);
      }

      if (storedPaidPeriods) {
        this.paidPaymentPeriods = new Set(JSON.parse(storedPaidPeriods));
      }
    }
  }

  private migrateExistingCards() {
    this.cards.forEach(card => {
      // Check if card has old structure (currentMonthSpend exists but spendByCategory doesn't)
      if ('currentMonthSpend' in card && (!card.spendByCategory || card.spendByCategory.length === 0)) {
        const oldSpend = (card as CreditCard & { currentMonthSpend?: number }).currentMonthSpend || 0;

        // If there are earning rates, assign the spend to the first rate category
        if (card.earningRates && card.earningRates.length > 0 && oldSpend > 0) {
          card.spendByCategory = [{
            category: card.earningRates[0].category,
            amount: oldSpend
          }];
        } else {
          card.spendByCategory = [];
        }

        // Remove the old field
        delete (card as CreditCard & { currentMonthSpend?: number }).currentMonthSpend;
      }

      // Ensure spendByCategory exists
      if (!card.spendByCategory) {
        card.spendByCategory = [];
      }
    });

    // Save the migrated data
    this.saveToStorage();
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('creditCards', JSON.stringify(this.cards));
      localStorage.setItem('alerts', JSON.stringify(this.alerts));
      localStorage.setItem('paidPaymentPeriods', JSON.stringify(Array.from(this.paidPaymentPeriods)));
    }
  }

  // Export data to JSON
  exportData(): string {
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      cards: this.cards,
      alerts: this.alerts,
      paidPaymentPeriods: Array.from(this.paidPaymentPeriods)
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Import data from JSON
  importData(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);

      // Validate the data structure
      if (!data.cards || !Array.isArray(data.cards)) {
        return { success: false, message: 'Invalid data format: cards array is missing' };
      }

      // Clear existing data
      this.cards = [];
      this.alerts = [];
      this.paidPaymentPeriods.clear();

      // Import cards
      this.cards = data.cards.map((card: CreditCard) => ({
        ...card,
        // Ensure required fields exist
        spendByCategory: card.spendByCategory || [],
        earningRates: card.earningRates || [],
        isActive: card.isActive !== undefined ? card.isActive : true
      }));

      // Import alerts if they exist
      if (data.alerts && Array.isArray(data.alerts)) {
        this.alerts = data.alerts;
      }

      // Import paid payment periods if they exist
      if (data.paidPaymentPeriods && Array.isArray(data.paidPaymentPeriods)) {
        this.paidPaymentPeriods = new Set(data.paidPaymentPeriods);
      }

      // Save to storage and regenerate alerts
      this.saveToStorage();
      this.generateAlerts();

      return {
        success: true,
        message: `Successfully imported ${this.cards.length} cards and ${this.alerts.length} alerts`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Download data as JSON file
  downloadData(): void {
    const data = this.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-cards-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Load data from file input
  async loadFromFile(file: File): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        const result = this.importData(content);
        resolve(result);
      };

      reader.onerror = () => {
        resolve({ success: false, message: 'Failed to read file' });
      };

      reader.readAsText(file);
    });
  }

  // Helper methods for new spend structure
  private getCardTotalSpend(card: CreditCard): number {
    return card.spendByCategory?.reduce((total, spend) => total + spend.amount, 0) || 0;
  }

  private getCardMilesEarned(card: CreditCard): number {
    if (!card.spendByCategory || !card.earningRates) return 0;

    return card.spendByCategory.reduce((total, spend) => {
      const earningRate = card.earningRates.find(rate => rate.category === spend.category);
      if (earningRate) {
        return total + (spend.amount * earningRate.rate);
      }
      return total;
    }, 0);
  }

  private getCardCashbackEarned(card: CreditCard): number {
    if (!card.spendByCategory || !card.earningRates) return 0;

    return card.spendByCategory.reduce((total, spend) => {
      const earningRate = card.earningRates.find(rate => rate.category === spend.category);
      if (earningRate) {
        // For cashback cards, the rate is a percentage, so divide by 100
        return total + (spend.amount * earningRate.rate / 100);
      }
      return total;
    }, 0);
  }

  private generateAlerts() {
    const newAlerts: Alert[] = [];
    const now = new Date();

    this.cards.forEach(card => {
      if (!card.isActive) return;

      // Payment due alerts
      const paymentDate = this.getNextPaymentDate(card);
      const daysUntilPayment = Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilPayment <= 7 && daysUntilPayment >= 0) {
        // Check if this payment period has already been marked as paid
        const paymentPeriodKey = this.getPaymentPeriodKey(card, paymentDate);
        const isPaymentPeriodPaid = this.paidPaymentPeriods.has(paymentPeriodKey);

        if (!isPaymentPeriodPaid) {
          const existingAlert = this.alerts.find(a =>
            a.cardId === card.id && a.type === 'payment_due'
          );

          if (!existingAlert) {
            newAlerts.push({
              id: `payment_${card.id}_${Date.now()}`,
              cardId: card.id,
              type: 'payment_due',
              title: 'Payment Due Soon',
              message: `Payment for ${card.name} is due in ${daysUntilPayment} days`,
              dueDate: paymentDate.toISOString(),
              isRead: false,
              createdAt: now.toISOString(),
            });
          }
        }
      }

      // Annual fee alerts
      const annualFeeDate = this.getAnnualFeeDate(card);
      const daysUntilAnnualFee = Math.ceil((annualFeeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilAnnualFee <= 30 && daysUntilAnnualFee >= 0) {
        const existingAlert = this.alerts.find(a =>
          a.cardId === card.id && a.type === 'annual_fee'
        );

        if (!existingAlert) {
          newAlerts.push({
            id: `annual_${card.id}_${Date.now()}`,
            cardId: card.id,
            type: 'annual_fee',
            title: 'Annual Fee Due',
            message: `Annual fee of SGD ${card.annualFee} for ${card.name} is due in ${daysUntilAnnualFee} days`,
            dueDate: annualFeeDate.toISOString(),
            isRead: false,
            createdAt: now.toISOString(),
          });
        }
      }

      // Fee waiver alerts
      const totalSpend = this.getCardTotalSpend(card);
      if (card.annualFeeWaiver > 0 && totalSpend < card.annualFeeWaiver) {
        const remaining = card.annualFeeWaiver - totalSpend;
        if (remaining <= 1000) { // Alert when within $1000 of waiver
          const existingAlert = this.alerts.find(a =>
            a.cardId === card.id && a.type === 'fee_waiver'
          );

          if (!existingAlert) {
            newAlerts.push({
              id: `waiver_${card.id}_${Date.now()}`,
              cardId: card.id,
              type: 'fee_waiver',
              title: 'Fee Waiver Opportunity',
              message: `Spend SGD ${remaining.toLocaleString()} more on ${card.name} to waive annual fee`,
              dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
              isRead: false,
              createdAt: now.toISOString(),
            });
          }
        }
      }

      // Category spending limit alerts
      if (card.spendByCategory && card.earningRates) {
        card.spendByCategory.forEach(spend => {
          const earningRate = card.earningRates.find(rate => rate.category === spend.category);
          if (earningRate && earningRate.cap) {
            const usagePercentage = (spend.amount / earningRate.cap) * 100;

            // Alert when at 80% or more of the monthly cap
            if (usagePercentage >= 80) {
              const existingAlert = this.alerts.find(a =>
                a.cardId === card.id &&
                a.type === 'category_limit' &&
                a.message.includes(spend.category)
              );

              if (!existingAlert) {
                const remaining = earningRate.cap - spend.amount;
                newAlerts.push({
                  id: `category_${card.id}_${spend.category}_${Date.now()}`,
                  cardId: card.id,
                  type: 'category_limit',
                  title: 'Category Spending Limit Alert',
                  message: `${spend.category} spending on ${card.name} is at ${usagePercentage.toFixed(1)}% of monthly cap (SGD ${remaining.toLocaleString()} remaining)`,
                  dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
                  isRead: false,
                  createdAt: now.toISOString(),
                });
              }
            }
          }
        });
      }

      // Credit limit alerts
      if (card.creditLimit > 0) {
        const creditUtilization = (totalSpend / card.creditLimit) * 100;

        // Alert when at 80% or more of credit limit
        if (creditUtilization >= 80) {
          const existingAlert = this.alerts.find(a =>
            a.cardId === card.id && a.type === 'credit_limit'
          );

          if (!existingAlert) {
            const remaining = card.creditLimit - totalSpend;
            newAlerts.push({
              id: `credit_${card.id}_${Date.now()}`,
              cardId: card.id,
              type: 'credit_limit',
              title: 'Credit Limit Alert',
              message: `${card.name} is at ${creditUtilization.toFixed(1)}% of credit limit (SGD ${remaining.toLocaleString()} remaining)`,
              dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
              isRead: false,
              createdAt: now.toISOString(),
            });
          }
        }
      }
    });

    this.alerts = [...this.alerts, ...newAlerts];
    this.saveToStorage();
  }

  private getNextPaymentDate(card: CreditCard): Date {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let paymentDate = new Date(currentYear, currentMonth, card.paymentDueDate);

    if (paymentDate < today) {
      paymentDate = new Date(currentYear, currentMonth + 1, card.paymentDueDate);
    }

    return paymentDate;
  }

  private getAnnualFeeDate(card: CreditCard): Date {
    const [month, day] = card.annualFeeDate.split('-').map(Number);
    const today = new Date();
    const currentYear = today.getFullYear();

    let feeDate = new Date(currentYear, month - 1, day);

    if (feeDate < today) {
      feeDate = new Date(currentYear + 1, month - 1, day);
    }

    return feeDate;
  }

  // Card methods
  getCards(): CreditCard[] {
    return [...this.cards];
  }

  addCard(cardData: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>): CreditCard {
    const now = new Date().toISOString();
    const card: CreditCard = {
      ...cardData,
      id: `card_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    this.cards.push(card);
    this.saveToStorage();
    this.generateAlerts();
    return card;
  }

  updateCard(cardId: string, cardData: Partial<CreditCard>): CreditCard | null {
    const index = this.cards.findIndex(c => c.id === cardId);
    if (index === -1) return null;

    this.cards[index] = {
      ...this.cards[index],
      ...cardData,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage();
    this.generateAlerts();
    return this.cards[index];
  }

  deleteCard(cardId: string): boolean {
    const index = this.cards.findIndex(c => c.id === cardId);
    if (index === -1) return false;

    this.cards.splice(index, 1);
    // Remove related alerts
    this.alerts = this.alerts.filter(a => a.cardId !== cardId);

    this.saveToStorage();
    return true;
  }

  updateCardSpend(cardId: string, category: string, amount: number): boolean {
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return false;

    // Initialize spendByCategory if it doesn't exist
    if (!card.spendByCategory) {
      card.spendByCategory = [];
    }

    // Find existing spend for this category
    const existingSpendIndex = card.spendByCategory.findIndex(spend => spend.category === category);

    if (amount === 0) {
      // Remove the spend entry if amount is 0
      if (existingSpendIndex >= 0) {
        card.spendByCategory.splice(existingSpendIndex, 1);
      }
    } else {
      if (existingSpendIndex >= 0) {
        // Update existing spend
        card.spendByCategory[existingSpendIndex].amount = amount;
      } else {
        // Add new spend category
        card.spendByCategory.push({ category, amount });
      }
    }

    card.updatedAt = new Date().toISOString();

    this.saveToStorage();
    this.generateAlerts();
    return true;
  }

  // Alert methods
  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  markAlertAsRead(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.isRead = true;
    this.saveToStorage();
    return true;
  }

  deleteAlert(alertId: string): boolean {
    const index = this.alerts.findIndex(a => a.id === alertId);
    if (index === -1) return false;

    this.alerts.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  markAlertAsPaid(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    // For payment due alerts, track the payment period as paid
    if (alert.type === 'payment_due') {
      const card = this.cards.find(c => c.id === alert.cardId);
      if (card) {
        const paymentPeriodKey = this.getPaymentPeriodKey(card, new Date(alert.dueDate));
        this.paidPaymentPeriods.add(paymentPeriodKey);
      }
    }

    // For category_limit and credit_limit alerts, just remove them when marked as resolved
    // For payment_due alerts, remove them since the payment has been made
    const index = this.alerts.findIndex(a => a.id === alertId);
    if (index === -1) return false;

    this.alerts.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  private getPaymentPeriodKey(card: CreditCard, paymentDate: Date): string {
    // Create a unique key for this payment period (card + month + year)
    return `${card.id}_${paymentDate.getFullYear()}_${paymentDate.getMonth()}`;
  }

  // Utility methods
  getTotalSpend(): number {
    return this.cards.reduce((total, card) => total + this.getCardTotalSpend(card), 0);
  }

  getTotalMilesEarned(): number {
    return this.cards.reduce((total, card) => total + this.getCardMilesEarned(card), 0);
  }

  getTotalCashbackEarned(): number {
    return this.cards.reduce((total, card) => total + this.getCardCashbackEarned(card), 0);
  }

  getMilesCardsStats(): { totalSpend: number; totalMiles: number } {
    const milesCards = this.cards.filter(card => card.cardType === 'miles');
    const totalSpend = milesCards.reduce((total, card) => total + this.getCardTotalSpend(card), 0);
    const totalMiles = milesCards.reduce((total, card) => total + this.getCardMilesEarned(card), 0);
    return { totalSpend, totalMiles };
  }

  getCashbackCardsStats(): { totalSpend: number; totalCashback: number } {
    const cashbackCards = this.cards.filter(card => card.cardType === 'cashback');
    const totalSpend = cashbackCards.reduce((total, card) => total + this.getCardTotalSpend(card), 0);
    const totalCashback = cashbackCards.reduce((total, card) => total + this.getCardCashbackEarned(card), 0);
    return { totalSpend, totalCashback };
  }

  refreshAlerts(): void {
    this.generateAlerts();
  }

  // Get paid payment periods
  getPaidPaymentPeriods(): Set<string> {
    return new Set(this.paidPaymentPeriods);
  }

  // Clear paid payment periods (useful for testing or resetting)
  clearPaidPaymentPeriods(): void {
    this.paidPaymentPeriods.clear();
    this.saveToStorage();
    this.generateAlerts();
  }
}

// Create a singleton instance
export const creditCardStore = new CreditCardStore(); 