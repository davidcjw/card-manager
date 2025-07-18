export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  cardType: 'miles' | 'cashback';

  // Earning rates
  earningRates: EarningRate[];

  // Limits and fees
  creditLimit: number;
  annualFee: number;
  annualFeeWaiver: number; // minimum spend for fee waiver

  // Important dates
  paymentDueDate: number; // day of month
  annualFeeDate: string; // MM-DD format

  // Current month tracking - now tracked by category
  spendByCategory: SpendByCategory[];
  lastResetDate: string; // YYYY-MM format

  // Status
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EarningRate {
  category: string;
  rate: number; // miles per dollar or cashback percentage
  cap?: number; // monthly cap if applicable
  currentMonthEarned?: number;
}

export interface SpendByCategory {
  category: string;
  amount: number;
}

export interface Alert {
  id: string;
  cardId: string;
  type: 'payment_due' | 'annual_fee' | 'spending_cap' | 'fee_waiver' | 'category_limit' | 'credit_limit';
  title: string;
  message: string;
  dueDate: string;
  isRead: boolean;
  createdAt: string;
}

export interface MonthlySpend {
  cardId: string;
  month: string; // YYYY-MM format
  totalSpend: number;
  milesEarned: number;
  cashbackEarned: number;
} 