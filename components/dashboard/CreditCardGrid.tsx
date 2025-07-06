'use client';

import { CreditCard } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CreditCard as CreditCardIcon, DollarSign, Plane } from "lucide-react";
import UpdateSpendDrawer from './UpdateSpendDrawer';
import { CONFIG } from '@/lib/config';

interface CreditCardGridProps {
  cards: CreditCard[];
  onEdit: (card: CreditCard) => void;
  onDelete: (cardId: string) => void;
  onUpdateSpend: (cardId: string, category: string, amount: number) => void;
  paidPaymentPeriods: Set<string>;
}

export default function CreditCardGrid({ cards, onEdit, onDelete, onUpdateSpend, paidPaymentPeriods }: CreditCardGridProps) {
  const getCardTypeIcon = (type: string) => {
    switch (type) {
      case 'miles': return <Plane className="h-4 w-4" />;
      case 'cashback': return <DollarSign className="h-4 w-4" />;
      default: return <CreditCardIcon className="h-4 w-4" />;
    }
  };

  const getCardTypeColor = (type: string) => {
    switch (type) {
      case 'miles': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'cashback': return 'bg-green-100 text-green-800 hover:bg-green-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const calculateTotalSpend = (card: CreditCard) => {
    return card.spendByCategory?.reduce((total, spend) => total + spend.amount, 0) || 0;
  };

  const calculateTotalMilesEarned = (card: CreditCard) => {
    if (!card.spendByCategory || !card.earningRates) return 0;

    return card.spendByCategory.reduce((total, spend) => {
      const earningRate = card.earningRates.find(rate => rate.category === spend.category);
      if (earningRate) {
        // Apply monthly cap if it exists
        const cappedSpend = earningRate.cap ? Math.min(spend.amount, earningRate.cap) : spend.amount;
        return total + (cappedSpend * earningRate.rate);
      }
      return total;
    }, 0);
  };

  const calculateTotalCashbackEarned = (card: CreditCard) => {
    if (!card.spendByCategory || !card.earningRates) return 0;

    return card.spendByCategory.reduce((total, spend) => {
      const earningRate = card.earningRates.find(rate => rate.category === spend.category);
      if (earningRate) {
        // For cashback cards, the rate is a percentage, so divide by 100
        return total + (spend.amount * earningRate.rate / 100);
      }
      return total;
    }, 0);
  };

  const getNextPaymentDate = (card: CreditCard) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let paymentDate = new Date(currentYear, currentMonth, card.paymentDueDate);

    if (paymentDate < today) {
      paymentDate = new Date(currentYear, currentMonth + 1, card.paymentDueDate);
    }

    return paymentDate;
  };

  const getDaysUntilPayment = (card: CreditCard) => {
    const paymentDate = getNextPaymentDate(card);
    const today = new Date();
    const diffTime = paymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / CONFIG.TIME.MILLISECONDS_PER_DAY);
    return diffDays;
  };

  const getPaymentStatusColor = (days: number) => {
    if (days < 0) return 'bg-red-100 text-red-800';
    if (days <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getPaymentStatusText = (days: number) => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days left`;
  };

  const isPaymentPeriodPaid = (card: CreditCard) => {
    const paymentDate = getNextPaymentDate(card);
    const paymentPeriodKey = `${card.id}_${paymentDate.getFullYear()}_${paymentDate.getMonth()}`;
    return paidPaymentPeriods.has(paymentPeriodKey);
  };

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CreditCardIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No credit cards yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Start by adding your first credit card to track your spending and rewards.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const daysUntilPayment = getDaysUntilPayment(card);
        const totalSpend = calculateTotalSpend(card);
        const totalMiles = calculateTotalMilesEarned(card);
        const totalCashback = calculateTotalCashbackEarned(card);

        return (
          <Card key={card.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getCardTypeIcon(card.cardType)}
                  <CardTitle className="text-lg">{card.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(card)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(card.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{card.bank}</Badge>
                <Badge className={getCardTypeColor(card.cardType)}>
                  {card.cardType}
                </Badge>
                {!card.isActive && (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spend</p>
                  <p className="text-lg font-semibold">
                    SGD {totalSpend.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {card.cardType === 'cashback' ? 'Cashback Earned' : 'Miles Earned'}
                  </p>
                  <p className="text-lg font-semibold">
                    {card.cardType === 'cashback'
                      ? `SGD ${totalCashback.toFixed(2)}`
                      : totalMiles.toFixed(0)
                    }
                  </p>
                </div>
              </div>

              {/* Spend by Category */}
              {card.spendByCategory && card.spendByCategory.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Spend by Category</p>
                  <div className="space-y-1">
                    {card.spendByCategory.map((spend, index) => {
                      const earningRate = card.earningRates.find(rate => rate.category === spend.category);
                      const earned = earningRate ? (card.cardType === 'cashback'
                        ? spend.amount * earningRate.rate / 100
                        : (earningRate.cap ? Math.min(spend.amount, earningRate.cap) : spend.amount) * earningRate.rate
                      ) : 0;

                      return (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="truncate">{spend.category}</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              SGD {spend.amount.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({card.cardType === 'cashback'
                                ? `SGD ${earned.toFixed(2)}`
                                : `${earned.toFixed(0)} miles`
                              })
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Payment Status */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Payment Status</p>
                {isPaymentPeriodPaid(card) ? (
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Payment Paid
                    </Badge>
                  </div>
                ) : (
                  <Badge className={getPaymentStatusColor(daysUntilPayment)}>
                    {getPaymentStatusText(daysUntilPayment)}
                  </Badge>
                )}
              </div>

              {/* Earning Rates */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Earning Rates</p>
                <div className="space-y-1">
                  {card.earningRates.slice(0, 2).map((rate, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{rate.category}</span>
                      <span className="font-medium">
                        {rate.rate} {card.cardType === 'miles' ? 'miles/$' : '%'}
                      </span>
                    </div>
                  ))}
                  {card.earningRates.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      +{card.earningRates.length - 2} more rates
                    </p>
                  )}
                </div>
              </div>

              {/* Fee Waiver Progress */}
              {card.annualFeeWaiver > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Fee Waiver Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((totalSpend / card.annualFeeWaiver) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalSpend.toLocaleString()} / {card.annualFeeWaiver.toLocaleString()} SGD
                  </p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-2">
                <UpdateSpendDrawer
                  card={card}
                  onUpdateSpend={onUpdateSpend}
                  trigger={
                    <Button variant="outline" size="sm" className="w-full">
                      Update Spend
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 