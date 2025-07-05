'use client';

import { useState } from 'react';
import { CreditCard } from '@/app/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CreditCard as CreditCardIcon, DollarSign, Plane, Minus, Plus } from "lucide-react";

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

  function onClick(adjustment: number) {
    setSpendAmount((Number(spendAmount) + adjustment).toString());
  }

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
            {/* Update Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
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