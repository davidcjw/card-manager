'use client';

import { useState } from 'react';
import { CreditCard, EarningRate } from '@/app/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

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
    currentMonthSpend: card?.currentMonthSpend || 0,
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
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{card ? 'Edit Credit Card' : 'Add New Credit Card'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Card Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., DBS Altitude"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bank">Bank</Label>
              <Input
                id="bank"
                required
                value={formData.bank}
                onChange={(e) => setFormData({...formData, bank: e.target.value})}
                placeholder="e.g., DBS"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardType">Card Type</Label>
            <Select
              value={formData.cardType}
              onValueChange={(value) => setFormData({...formData, cardType: value as 'miles' | 'cashback' | 'rewards'})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select card type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="miles">Miles</SelectItem>
                <SelectItem value="cashback">Cashback</SelectItem>
                <SelectItem value="rewards">Rewards</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Limits and Fees */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creditLimit">Credit Limit (SGD)</Label>
              <Input
                id="creditLimit"
                type="number"
                value={formData.creditLimit}
                onChange={(e) => setFormData({...formData, creditLimit: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="annualFee">Annual Fee (SGD)</Label>
              <Input
                id="annualFee"
                type="number"
                value={formData.annualFee}
                onChange={(e) => setFormData({...formData, annualFee: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="annualFeeWaiver">Fee Waiver Spend (SGD)</Label>
              <Input
                id="annualFeeWaiver"
                type="number"
                value={formData.annualFeeWaiver}
                onChange={(e) => setFormData({...formData, annualFeeWaiver: Number(e.target.value)})}
              />
            </div>
          </div>

          {/* Important Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentDueDate">Payment Due Date (Day of Month)</Label>
              <Input
                id="paymentDueDate"
                type="number"
                min="1"
                max="31"
                value={formData.paymentDueDate}
                onChange={(e) => setFormData({...formData, paymentDueDate: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="annualFeeDate">Annual Fee Date (MM-DD)</Label>
              <Input
                id="annualFeeDate"
                pattern="\d{2}-\d{2}"
                value={formData.annualFeeDate}
                onChange={(e) => setFormData({...formData, annualFeeDate: e.target.value})}
                placeholder="01-01"
              />
            </div>
          </div>

          {/* Earning Rates */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Earning Rates</Label>
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
            
            <div className="space-y-3">
              {earningRates.map((rate, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={rate.category}
                      onChange={(e) => updateEarningRate(index, 'category', e.target.value)}
                      placeholder="e.g., Dining, Travel"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Rate</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={rate.rate}
                      onChange={(e) => updateEarningRate(index, 'rate', Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Monthly Cap (Optional)</Label>
                    <Input
                      type="number"
                      value={rate.cap || ''}
                      onChange={(e) => updateEarningRate(index, 'cap', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="No cap"
                    />
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeEarningRate(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Current Month Spend */}
          <div className="space-y-2">
            <Label htmlFor="currentMonthSpend">Current Month Spend (SGD)</Label>
            <Input
              id="currentMonthSpend"
              type="number"
              value={formData.currentMonthSpend}
              onChange={(e) => setFormData({...formData, currentMonthSpend: Number(e.target.value)})}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
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