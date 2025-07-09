'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign, Plane } from "lucide-react";

interface StatsCardsProps {
  totalCards: number;
  activeCards: number;
  totalSpend: number;
  milesStats: {
    totalSpend: number;
    totalMiles: number;
  };
  cashbackStats: {
    totalSpend: number;
    totalCashback: number;
  };
  cards: import("@/types").CreditCard[]; // NEW PROP
}

export default function StatsCards({ totalCards, activeCards, totalSpend, milesStats, cashbackStats, cards }: StatsCardsProps) {
  // --- NEW: Compute best rates by category ---
  // Helper to get best rates for a given card type
  function getBestRatesByCategory(cardType: 'miles' | 'cashback') {
    const categoryMap: Record<string, { rate: number; cardNames: string[] }> = {};
    cards.filter(card => card.cardType === cardType && card.isActive).forEach(card => {
      card.earningRates.forEach(rateObj => {
        if (!categoryMap[rateObj.category] || rateObj.rate > categoryMap[rateObj.category].rate) {
          categoryMap[rateObj.category] = { rate: rateObj.rate, cardNames: [card.name] };
        } else if (rateObj.rate === categoryMap[rateObj.category].rate) {
          categoryMap[rateObj.category].cardNames.push(card.name);
        }
      });
    });
    return categoryMap;
  }
  const bestCashback = getBestRatesByCategory('cashback');
  const bestMiles = getBestRatesByCategory('miles');
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCards}</div>
          <p className="text-xs text-muted-foreground">
            {activeCards} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">SGD {totalSpend.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Miles Earned</CardTitle>
          <Plane className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{milesStats.totalMiles.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">
            From SGD {milesStats.totalSpend.toLocaleString()} spend
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Miles/$</CardTitle>
          <Plane className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {milesStats.totalSpend > 0 ? (milesStats.totalMiles / milesStats.totalSpend).toFixed(2) : '0.00'}
          </div>
          <p className="text-xs text-muted-foreground">
            Miles per dollar
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cashback Earned</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">SGD {cashbackStats.totalCashback.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            From SGD {cashbackStats.totalSpend.toLocaleString()} spend
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Effective Cashback Rate</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {cashbackStats.totalSpend > 0 ? ((cashbackStats.totalCashback / cashbackStats.totalSpend) * 100).toFixed(2) : '0.00'}%
          </div>
          <p className="text-xs text-muted-foreground">
            Cashback percentage
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Cashback by Category</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.keys(bestCashback).length === 0 ? (
              <span className="text-xs text-muted-foreground">No cashback cards</span>
            ) : (
              Object.entries(bestCashback)
                .sort((a, b) => b[1].rate - a[1].rate)
                .map(([category, { rate, cardNames }]) => (
                  <div key={category} className="flex justify-between text-xs">
                    <span className="font-medium">{category}</span>
                    <span>
                      {rate}% ({cardNames.join(', ')})
                    </span>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Miles by Category</CardTitle>
          <Plane className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.keys(bestMiles).length === 0 ? (
              <span className="text-xs text-muted-foreground">No miles cards</span>
            ) : (
              Object.entries(bestMiles)
                .sort((a, b) => b[1].rate - a[1].rate)
                .map(([category, { rate, cardNames }]) => (
                  <div key={category} className="flex justify-between text-xs">
                    <span className="font-medium">{category}</span>
                    <span>
                      {rate} mpd ({cardNames.join(', ')})
                    </span>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 