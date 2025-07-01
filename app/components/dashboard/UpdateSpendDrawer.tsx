'use client';

import { useState } from 'react';
import { CreditCard } from '@/app/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CreditCard as CreditCardIcon, DollarSign, Plane } from "lucide-react";

interface UpdateSpendDrawerProps {
  card: CreditCard;
  onUpdateSpend: (cardId: string, newSpend: number) => void;
  trigger: React.ReactNode;
}

export default function UpdateSpendDrawer({ card, onUpdateSpend, trigger }: UpdateSpendDrawerProps) {
  const [spendAmount, setSpendAmount] = useState(card.currentMonthSpend.toString());
  const [isOpen, setIsOpen] = useState(false);

  const getCardTypeIcon = (type: string) => {
    switch (type) {
      case 'miles': return <Plane className="h-4 w-4" />;
      case 'cashback': return <DollarSign className="h-4 w-4" />;
      case 'rewards': return <CreditCardIcon className="h-4 w-4" />;
      default: return <CreditCardIcon className="h-4 w-4" />;
    }
  };

  const getCardTypeColor = (type: string) => {
    switch (type) {
      case 'miles': return 'bg-blue-100 text-blue-800';
      case 'cashback': return 'bg-green-100 text-green-800';
      case 'rewards': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalMilesEarned = (spend: number) => {
    return card.earningRates.reduce((total, rate) => {
      const earned = spend * rate.rate;
      return total + earned;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSpend = Number(spendAmount);
    if (!isNaN(newSpend) && newSpend >= 0) {
      onUpdateSpend(card.id, newSpend);
      setIsOpen(false);
    }
  };

  const handleReset = () => {
    setSpendAmount(card.currentMonthSpend.toString());
  };

  const currentMiles = calculateTotalMilesEarned(Number(spendAmount) || 0);
  const previousMiles = calculateTotalMilesEarned(card.currentMonthSpend);
  const milesDifference = currentMiles - previousMiles;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Update Card Spend</DrawerTitle>
            <DrawerDescription>
              Update the current month spending for this credit card.
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4">
            {/* Card Info */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  {getCardTypeIcon(card.cardType)}
                  <CardTitle className="text-lg">{card.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{card.bank}</Badge>
                  <Badge className={getCardTypeColor(card.cardType)}>
                    {card.cardType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current Spend</p>
                    <p className="font-semibold">SGD {card.currentMonthSpend.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Miles</p>
                    <p className="font-semibold">{previousMiles.toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Update Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spendAmount">New Spend Amount (SGD)</Label>
                <Input
                  id="spendAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  placeholder="Enter new spend amount"
                />
              </div>

              {/* Preview Changes */}
              {spendAmount && !isNaN(Number(spendAmount)) && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-3">Preview Changes</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>New Spend:</span>
                        <span className="font-medium">SGD {Number(spendAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New Miles:</span>
                        <span className="font-medium">{currentMiles.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Miles Change:</span>
                        <span className={`font-medium ${milesDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {milesDifference >= 0 ? '+' : ''}{milesDifference.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Earning Rates Info */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Earning Rates</Label>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {card.earningRates.map((rate, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{rate.category}</span>
                      <span>
                        {rate.rate} {card.cardType === 'miles' ? 'miles/$' : '%'}
                        {rate.cap && ` (cap: SGD ${rate.cap})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>

          <DrawerFooter>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
              <Button onClick={handleSubmit} disabled={!spendAmount || isNaN(Number(spendAmount))}>
                Update Spend
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 