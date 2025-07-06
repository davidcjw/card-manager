'use client';

import { useState } from 'react';
import { z } from 'zod';
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

// Validation schema
const creditCardSchema = z.object({
  name: z.string().min(1, 'Card name is required').max(100, 'Card name must be less than 100 characters'),
  bank: z.string().min(1, 'Bank name is required').max(100, 'Bank name must be less than 100 characters'),
  cardType: z.enum(['miles', 'cashback', 'rewards'], {
    required_error: 'Card type is required'
  }),
  creditLimit: z.number().min(0, 'Credit limit must be 0 or greater'),
  annualFee: z.number().min(0, 'Annual fee must be 0 or greater'),
  annualFeeWaiver: z.number().min(0, 'Annual fee waiver must be 0 or greater'),
  paymentDueDate: z.number().min(1, 'Payment due date must be between 1 and 31').max(31, 'Payment due date must be between 1 and 31'),
  annualFeeDate: z.string().regex(/^\d{2}-\d{2}$/, 'Annual fee date must be in MM-DD format'),
  isActive: z.boolean(),
});

const earningRateSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  rate: z.number().min(0.1, 'Rate must be at least 0.1').max(10, 'Rate must be 10 or less'),
  cap: z.number().optional(),
});

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [earningRateErrors, setEarningRateErrors] = useState<Record<number, Record<string, string>>>({});

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const newEarningRateErrors: Record<number, Record<string, string>> = {};

    // Validate main form data
    try {
      creditCardSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          newErrors[field] = err.message;
        });
      }
    }

    // Validate earning rates
    earningRates.forEach((rate, index) => {
      if (rate.category.trim() !== '') {
        try {
          earningRateSchema.parse(rate);
        } catch (error) {
          if (error instanceof z.ZodError) {
            newEarningRateErrors[index] = {};
            error.errors.forEach((err) => {
              const field = err.path[0] as string;
              newEarningRateErrors[index][field] = err.message;
            });
          }
        }
      }
    });

    setErrors(newErrors);
    setEarningRateErrors(newEarningRateErrors);

    return Object.keys(newErrors).length === 0 && Object.keys(newEarningRateErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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
                  <Label htmlFor="name" className="text-sm font-medium">
                    Card Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) {
                        setErrors({ ...errors, name: '' });
                      }
                    }}
                    placeholder="e.g., DBS Altitude"
                    className={`h-10 ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="bank" className="text-sm font-medium">
                    Bank <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bank"
                    value={formData.bank}
                    onChange={(e) => {
                      setFormData({ ...formData, bank: e.target.value });
                      if (errors.bank) {
                        setErrors({ ...errors, bank: '' });
                      }
                    }}
                    placeholder="e.g., DBS"
                    className={`h-10 ${errors.bank ? 'border-red-500' : ''}`}
                  />
                  {errors.bank && (
                    <p className="text-sm text-red-500">{errors.bank}</p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="cardType" className="text-sm font-medium">
                  Card Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.cardType}
                  onValueChange={(value) => {
                    setFormData({ ...formData, cardType: value as 'miles' | 'cashback' | 'rewards' });
                    if (errors.cardType) {
                      setErrors({ ...errors, cardType: '' });
                    }
                  }}
                >
                  <SelectTrigger className={`h-10 ${errors.cardType ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="miles">Miles</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="rewards">Rewards</SelectItem>
                  </SelectContent>
                </Select>
                {errors.cardType && (
                  <p className="text-sm text-red-500">{errors.cardType}</p>
                )}
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
                    value={formData.creditLimit || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, creditLimit: e.target.value ? Number(e.target.value) : 0 });
                      if (errors.creditLimit) {
                        setErrors({ ...errors, creditLimit: '' });
                      }
                    }}
                    className={`h-10 ${errors.creditLimit ? 'border-red-500' : ''}`}
                    min="0"
                  />
                  {errors.creditLimit && (
                    <p className="text-sm text-red-500">{errors.creditLimit}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="annualFee" className="text-sm font-medium">Annual Fee (SGD)</Label>
                  <Input
                    id="annualFee"
                    type="number"
                    value={formData.annualFee || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, annualFee: e.target.value ? Number(e.target.value) : 0 });
                      if (errors.annualFee) {
                        setErrors({ ...errors, annualFee: '' });
                      }
                    }}
                    className={`h-10 ${errors.annualFee ? 'border-red-500' : ''}`}
                    min="0"
                  />
                  {errors.annualFee && (
                    <p className="text-sm text-red-500">{errors.annualFee}</p>
                  )}
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
                          onChange={(e) => {
                            updateEarningRate(index, 'category', e.target.value);
                            if (earningRateErrors[index]?.category) {
                              const newErrors = { ...earningRateErrors };
                              delete newErrors[index]?.category;
                              if (Object.keys(newErrors[index] || {}).length === 0) {
                                delete newErrors[index];
                              }
                              setEarningRateErrors(newErrors);
                            }
                          }}
                          placeholder="e.g., Dining, Travel"
                          className={`h-9 ${earningRateErrors[index]?.category ? 'border-red-500' : ''}`}
                        />
                        {earningRateErrors[index]?.category && (
                          <p className="text-xs text-red-500">{earningRateErrors[index].category}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Rate</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={rate.rate}
                          onChange={(e) => {
                            updateEarningRate(index, 'rate', Number(e.target.value));
                            if (earningRateErrors[index]?.rate) {
                              const newErrors = { ...earningRateErrors };
                              delete newErrors[index]?.rate;
                              if (Object.keys(newErrors[index] || {}).length === 0) {
                                delete newErrors[index];
                              }
                              setEarningRateErrors(newErrors);
                            }
                          }}
                          className={`h-9 ${earningRateErrors[index]?.rate ? 'border-red-500' : ''}`}
                        />
                        {earningRateErrors[index]?.rate && (
                          <p className="text-xs text-red-500">{earningRateErrors[index].rate}</p>
                        )}
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
                  <Select
                    value={formData.paymentDueDate?.toString() || ''}
                    onValueChange={(value) => {
                      setFormData({ ...formData, paymentDueDate: Number(value) });
                      if (errors.paymentDueDate) {
                        setErrors({ ...errors, paymentDueDate: '' });
                      }
                    }}
                  >
                    <SelectTrigger className={`h-10 ${errors.paymentDueDate ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select day of month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.paymentDueDate && (
                    <p className="text-sm text-red-500">{errors.paymentDueDate}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="annualFeeDate" className="text-sm font-medium">Annual Fee Date</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2 col-span-2">
                      <Label className="text-xs text-muted-foreground">Month</Label>
                      <Select
                        value={formData.annualFeeDate.split('-')[0] || ''}
                        onValueChange={(month) => {
                          const day = formData.annualFeeDate.split('-')[1] || '01';
                          const newDate = `${month}-${day}`;
                          setFormData({ ...formData, annualFeeDate: newDate });
                          if (errors.annualFeeDate) {
                            setErrors({ ...errors, annualFeeDate: '' });
                          }
                        }}
                      >
                        <SelectTrigger className={`h-10 ${errors.annualFeeDate ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                              {new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Day</Label>
                      <Select
                        value={formData.annualFeeDate.split('-')[1] || ''}
                        onValueChange={(day) => {
                          const month = formData.annualFeeDate.split('-')[0] || '01';
                          const newDate = `${month}-${day}`;
                          setFormData({ ...formData, annualFeeDate: newDate });
                          if (errors.annualFeeDate) {
                            setErrors({ ...errors, annualFeeDate: '' });
                          }
                        }}
                      >
                        <SelectTrigger className={`h-10 ${errors.annualFeeDate ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString().padStart(2, '0')}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {errors.annualFeeDate && (
                    <p className="text-sm text-red-500">{errors.annualFeeDate}</p>
                  )}
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