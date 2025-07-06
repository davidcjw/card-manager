'use client';

import { useState } from 'react';
import { CreditCard, EarningRate } from '@/app/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, X, CreditCard as CreditCardIcon, TrendingUp, Calendar, DollarSign } from "lucide-react";

interface CreditCardFormProps {
  card?: CreditCard;
  onSubmit: (card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function CreditCardForm({ card, onSubmit, onCancel }: CreditCardFormProps) {
  const [formData, setFormData] = useState({
    name: card?.name || '',
    bank: card?.bank || '',
    cardType: card?.cardType || 'miles' as const,
    creditLimit: card?.creditLimit || 0,
    annualFee: card?.annualFee || 0,
    annualFeeWaiver: card?.annualFeeWaiver || 0,
    paymentDueDate: card?.paymentDueDate || 15,
    annualFeeDate: card?.annualFeeDate || '01-01',
    isActive: card?.isActive ?? true,
  });

  const [earningRates, setEarningRates] = useState<EarningRate[]>(
    card?.earningRates || [{ category: 'General', rate: 1.2, cap: undefined }]
  );

  const addEarningRate = () => {
    setEarningRates([...earningRates, { category: '', rate: 1.2, cap: undefined }]);
  };

  const updateEarningRate = (index: number, field: keyof EarningRate, value: string | number | undefined) => {
    const updated = [...earningRates];
    updated[index] = { ...updated[index], [field]: value };
    setEarningRates(updated);
  };

  const removeEarningRate = (index: number) => {
    setEarningRates(earningRates.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentDate = new Date().toISOString().slice(0, 7); // YYYY-MM format
    onSubmit({
      ...formData,
      lastResetDate: currentDate,
      earningRates: earningRates.filter(rate => rate.category.trim() !== ''),
      spendByCategory: card?.spendByCategory || [],
    });
  };

  const getCardTypeColor = (type: string) => {
    switch (type) {
      case 'miles': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cashback': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rewards': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CreditCardIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">{card ? 'Edit Credit Card' : 'Add New Credit Card'}</CardTitle>
            <p className="text-muted-foreground text-sm">
              {card ? 'Update your credit card information' : 'Add a new credit card to your portfolio'}
            </p>
          </div>
        </div>
        {formData.cardType && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Card Type:</span>
            <Badge className={getCardTypeColor(formData.cardType)}>
              {formData.cardType.charAt(0).toUpperCase() + formData.cardType.slice(1)}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-1 text-xs">
                <CreditCardIcon className="h-3 w-3" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="limits" className="flex items-center gap-1 text-xs">
                <DollarSign className="h-3 w-3" />
                Limits
              </TabsTrigger>
              <TabsTrigger value="rates" className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3" />
                Rates
              </TabsTrigger>
              <TabsTrigger value="dates" className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                Dates
              </TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-medium">Card Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., DBS Altitude"
                    className="h-10"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="bank" className="text-sm font-medium">Bank</Label>
                  <Input
                    id="bank"
                    required
                    value={formData.bank}
                    onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                    placeholder="e.g., DBS"
                    className="h-10"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="cardType" className="text-sm font-medium">Card Type</Label>
                <Select
                  value={formData.cardType}
                  onValueChange={(value) => setFormData({ ...formData, cardType: value as 'miles' | 'cashback' | 'rewards' })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="miles">Miles</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="rewards">Rewards</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Alert>
                <CreditCardIcon className="h-4 w-4" />
                <AlertDescription>
                  Choose the card type that best describes your card&apos;s primary benefit. This helps categorize your cards for better tracking.
                </AlertDescription>
              </Alert>
            </TabsContent>
            <TabsContent value="limits" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="creditLimit" className="text-sm font-medium">Credit Limit (SGD)</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="annualFee" className="text-sm font-medium">Annual Fee (SGD)</Label>
                  <Input
                    id="annualFee"
                    type="number"
                    value={formData.annualFee}
                    onChange={(e) => setFormData({ ...formData, annualFee: Number(e.target.value) })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="annualFeeWaiver" className="text-sm font-medium">Fee Waiver Spend (SGD)</Label>
                  <Input
                    id="annualFeeWaiver"
                    type="number"
                    value={formData.annualFeeWaiver}
                    onChange={(e) => setFormData({ ...formData, annualFeeWaiver: Number(e.target.value) })}
                    className="h-10"
                  />
                </div>
              </div>
              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  Track your spending to monitor your credit utilization and ensure you stay within your limits.
                </AlertDescription>
              </Alert>
            </TabsContent>
            <TabsContent value="rates" className="space-y-6 mt-6">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-sm font-medium">Earning Rates</Label>
                  <p className="text-sm text-muted-foreground">Configure how your card earns rewards</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEarningRate}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rate
                </Button>
              </div>
              <div className="space-y-4">
                {earningRates.map((rate, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Category</Label>
                        <Input
                          value={rate.category}
                          onChange={(e) => updateEarningRate(index, 'category', e.target.value)}
                          placeholder="e.g., Dining, Travel"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Rate</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={rate.rate}
                          onChange={(e) => updateEarningRate(index, 'rate', Number(e.target.value))}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Monthly Cap (Optional)</Label>
                        <Input
                          type="number"
                          value={rate.cap || ''}
                          onChange={(e) => updateEarningRate(index, 'cap', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="No cap"
                          className="h-9"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeEarningRate(index)}
                        className="h-9"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Set up earning rates for different spending categories. Higher rates on specific categories can help maximize your rewards.
                </AlertDescription>
              </Alert>
            </TabsContent>
            <TabsContent value="dates" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="paymentDueDate" className="text-sm font-medium">Payment Due Date (Day of Month)</Label>
                  <Input
                    id="paymentDueDate"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.paymentDueDate}
                    onChange={(e) => setFormData({ ...formData, paymentDueDate: Number(e.target.value) })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="annualFeeDate" className="text-sm font-medium">Annual Fee Date (MM-DD)</Label>
                  <Input
                    id="annualFeeDate"
                    pattern="\d{2}-\d{2}"
                    value={formData.annualFeeDate}
                    onChange={(e) => setFormData({ ...formData, annualFeeDate: e.target.value })}
                    placeholder="01-01"
                    className="h-10"
                  />
                </div>
              </div>
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  Set important dates to help you track payment deadlines and annual fee charges. This will help you avoid late fees and plan your spending.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button type="submit">
              {card ? 'Update Card' : 'Add Card'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 