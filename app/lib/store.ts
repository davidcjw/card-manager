import { CreditCard, Alert } from '../types';

class CreditCardStore {
  private cards: CreditCard[] = [];
  private alerts: Alert[] = [];

  constructor() {
    this.loadFromStorage();
    this.generateAlerts();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const storedCards = localStorage.getItem('creditCards');
      const storedAlerts = localStorage.getItem('alerts');
      
      if (storedCards) {
        this.cards = JSON.parse(storedCards);
      }
      
      if (storedAlerts) {
        this.alerts = JSON.parse(storedAlerts);
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('creditCards', JSON.stringify(this.cards));
      localStorage.setItem('alerts', JSON.stringify(this.alerts));
    }
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
        const existingAlert = this.alerts.find(a => 
          a.cardId === card.id && a.type === 'payment_due' && !a.isRead
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

      // Annual fee alerts
      const annualFeeDate = this.getAnnualFeeDate(card);
      const daysUntilAnnualFee = Math.ceil((annualFeeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilAnnualFee <= 30 && daysUntilAnnualFee >= 0) {
        const existingAlert = this.alerts.find(a => 
          a.cardId === card.id && a.type === 'annual_fee' && !a.isRead
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
      if (card.annualFeeWaiver > 0 && card.currentMonthSpend < card.annualFeeWaiver) {
        const remaining = card.annualFeeWaiver - card.currentMonthSpend;
        if (remaining <= 1000) { // Alert when within $1000 of waiver
          const existingAlert = this.alerts.find(a => 
            a.cardId === card.id && a.type === 'fee_waiver' && !a.isRead
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

  updateCardSpend(cardId: string, newSpend: number): boolean {
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return false;
    
    card.currentMonthSpend = newSpend;
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

  // Utility methods
  getTotalSpend(): number {
    return this.cards.reduce((total, card) => total + card.currentMonthSpend, 0);
  }

  getTotalMilesEarned(): number {
    return this.cards.reduce((total, card) => {
      const cardMiles = card.earningRates.reduce((cardTotal, rate) => {
        return cardTotal + (card.currentMonthSpend * rate.rate);
      }, 0);
      return total + cardMiles;
    }, 0);
  }

  refreshAlerts(): void {
    this.generateAlerts();
  }
}

// Create a singleton instance
export const creditCardStore = new CreditCardStore(); 