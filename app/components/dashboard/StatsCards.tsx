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
}

export default function StatsCards({ totalCards, activeCards, totalSpend, milesStats, cashbackStats }: StatsCardsProps) {
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
    </div>
  );
} 