'use client';

import { useState, useEffect } from 'react';
import { CreditCard } from '@/app/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Minus, Plus } from "lucide-react";

interface UpdateSpendDrawerProps {
  card: CreditCard;
  onUpdateSpend: (cardId: string, category: string, amount: number) => void;
  trigger: React.ReactNode;
  initialCategory?: string;
}

export default function UpdateSpendDrawer({ card, onUpdateSpend, trigger, initialCategory }: UpdateSpendDrawerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [spendAmount, setSpendAmount] = useState('0');
  const [isOpen, setIsOpen] = useState(false);

  const getCurrentSpendForCategory = (category: string) => {
    return card.spendByCategory?.find(spend => spend.category === category)?.amount || 0;
  };

  // Update spend amount when category changes
  useEffect(() => {
    if (selectedCategory) {
      const currentSpend = getCurrentSpendForCategory(selectedCategory);
      setSpendAmount(currentSpend.toString());
    } else {
      setSpendAmount('0');
    }
  }, [selectedCategory, card.spendByCategory]);

  // Handle initial category when drawer opens
  useEffect(() => {
    if (isOpen) {
      if (initialCategory) {
        setSelectedCategory(initialCategory);
        const currentSpend = getCurrentSpendForCategory(initialCategory);
        setSpendAmount(currentSpend.toString());
      } else if (card.spendByCategory && card.spendByCategory.length > 0) {
        // Pre-populate with the first existing category
        const firstCategory = card.spendByCategory[0].category;
        setSelectedCategory(firstCategory);
        const currentSpend = getCurrentSpendForCategory(firstCategory);
        setSpendAmount(currentSpend.toString());
      }
    }
  }, [isOpen, initialCategory, card.spendByCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSpend = Number(spendAmount);
    if (!isNaN(newSpend) && newSpend >= 0 && selectedCategory) {
      onUpdateSpend(card.id, selectedCategory, newSpend);
      setIsOpen(false);
      // Reset form
      setSelectedCategory('');
      setSpendAmount('0');
    }
  };

  const handleReset = () => {
    setSelectedCategory('');
    setSpendAmount('0');
  };

  function onClick(adjustment: number) {
    setSpendAmount((Number(spendAmount) + adjustment).toString());
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Reset form when closing
    if (!open) {
      setSelectedCategory('');
      setSpendAmount('0');
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm h-[80vh] flex flex-col">
          <DrawerHeader>
            <DrawerTitle>Update Card Spend</DrawerTitle>
            <DrawerDescription>
              Select a spending category and update the amount for this credit card.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Current Spend Summary */}
            {card.spendByCategory && card.spendByCategory.length > 0 && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">Current Spend Summary</h4>
                <div className="space-y-2">
                  {card.spendByCategory.map((spend, index) => {
                    const earningRate = card.earningRates.find(rate => rate.category === spend.category);
                    const earned = earningRate ? (card.cardType === 'cashback'
                      ? spend.amount * earningRate.rate / 100
                      : spend.amount * earningRate.rate
                    ) : 0;

                    return (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="font-medium">{spend.category}</span>
                        <div className="flex items-center space-x-2">
                          <span>SGD {spend.amount.toLocaleString()}</span>
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

            {/* Update Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Spending Category</Label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {card.earningRates.map((rate, index) => {
                      const currentSpend = getCurrentSpendForCategory(rate.category);
                      return (
                        <SelectItem key={index} value={rate.category}>
                          {rate.category} ({rate.rate} {card.cardType === 'miles' ? 'miles/$' : '%'})
                          {currentSpend > 0 && ` - SGD ${currentSpend.toLocaleString()}`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedCategory && (
                  <p className="text-xs text-muted-foreground">
                    Current spend: SGD {getCurrentSpendForCategory(selectedCategory).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Amount (SGD)</Label>
                <div className="p-4 pb-0">
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-full"
                      onClick={() => onClick(-10)}
                    >
                      <Minus />
                      <span className="sr-only">Decrease</span>
                    </Button>
                    <div className="flex-1 text-center">
                      <Input
                        type="number"
                        value={spendAmount}
                        onChange={(e) => setSpendAmount(e.target.value)}
                        className="font-bold tracking-tighter text-center border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto w-full"
                        min="0"
                        step="1"
                        max="99999"
                        placeholder="0"
                        style={{ fontSize: '4.5rem', lineHeight: '1' }}
                      />
                      <div className="text-muted-foreground text-[0.70rem] uppercase">
                        SGD
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-full"
                      onClick={() => onClick(10)}
                    >
                      <Plus />
                      <span className="sr-only">Increase</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 200, 500, 1000, 2000].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSpendAmount(amount.toString())}
                  >
                    {amount}
                  </Button>
                ))}
              </div>

              {/* Clear Spend Button */}
              {selectedCategory && getCurrentSpendForCategory(selectedCategory) > 0 && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setSpendAmount('0')}
                    className="w-full"
                  >
                    Clear Spend for {selectedCategory}
                  </Button>
                </div>
              )}

              {/* Status Indicator */}
              {selectedCategory && (
                <div className="pt-2">
                  <div className={`text-xs p-2 rounded ${getCurrentSpendForCategory(selectedCategory) > 0
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                    }`}>
                    {getCurrentSpendForCategory(selectedCategory) > 0
                      ? `Editing existing spend for ${selectedCategory}`
                      : `Adding new spend for ${selectedCategory}`
                    }
                  </div>
                </div>
              )}
            </form>
          </div>

          <DrawerFooter className="flex-shrink-0 border-t bg-background">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
              <Button
                onClick={handleSubmit}
                disabled={!selectedCategory || !spendAmount || isNaN(Number(spendAmount))}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                {selectedCategory && getCurrentSpendForCategory(selectedCategory) > 0 ? 'Update Spend' : 'Add Spend'}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 