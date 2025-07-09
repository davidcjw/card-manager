import { useState } from 'react';
import { CreditCard as CreditCardIcon, Tag as TagIcon } from "lucide-react";
import { CreditCard, EarningRate } from '../../types';

interface CategorySearchProps {
    CATEGORY_OPTIONS: string[];
    getBestCardsForCategory: (category: string) => { cashback: CreditCard | null; miles: CreditCard | null };
    className?: string;
}

export default function CategorySearch({ CATEGORY_OPTIONS, getBestCardsForCategory, className }: CategorySearchProps) {
    const [categorySearch, setCategorySearch] = useState<string | null>(null);

    return (
        <div className={`mb-6 ${className || ''}`}>
            <div className="bg-white dark:bg-muted rounded-xl shadow p-4 flex flex-col gap-3 border border-muted-foreground/10">
                <div className="flex items-center gap-2 mb-2">
                    <TagIcon className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-base">What card should I use for...</span>
                </div>
                <div className="flex items-center gap-2 w-full">
                    <select
                        id="categorySearch"
                        value={categorySearch || ''}
                        onChange={e => setCategorySearch(e.target.value || null)}
                        className="h-10 rounded-lg border px-3 text-base w-full focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                    >
                        <option value="">Select category</option>
                        {CATEGORY_OPTIONS.filter(c => c !== 'General').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {categorySearch && (
                        <button
                            type="button"
                            className="ml-1 text-xs text-muted-foreground border rounded px-2 py-1 hover:bg-muted"
                            onClick={() => setCategorySearch(null)}
                        >
                            Clear
                        </button>
                    )}
                </div>
                {categorySearch && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        {(() => {
                            const best = getBestCardsForCategory(categorySearch);
                            return (
                                <>
                                    <div className="flex-1 bg-muted/60 rounded-lg p-4 flex flex-col gap-2 border border-primary/10">
                                        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
                                            <CreditCardIcon className="h-4 w-4" /> Best Miles Card
                                        </div>
                                        {best.miles ? (
                                            <div>
                                                <div className="font-medium text-lg">{best.miles.name}</div>
                                                <div className="text-xs text-muted-foreground mb-1">{best.miles.bank}</div>
                                                <div className="text-sm font-mono">Rate (mpd): <span className="font-bold">{best.miles.earningRates.find((r: EarningRate) => r.category === categorySearch)?.rate ?? best.miles.earningRates.find((r: EarningRate) => r.category === 'General')?.rate}</span></div>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-muted-foreground">No miles card available</div>
                                        )}
                                    </div>
                                    <div className="flex-1 bg-muted/60 rounded-lg p-4 flex flex-col gap-2 border border-primary/10">
                                        <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
                                            <CreditCardIcon className="h-4 w-4" /> Best Cashback Card
                                        </div>
                                        {best.cashback ? (
                                            <div>
                                                <div className="font-medium text-lg">{best.cashback.name}</div>
                                                <div className="text-xs text-muted-foreground mb-1">{best.cashback.bank}</div>
                                                <div className="text-sm font-mono">Rate (%): <span className="font-bold">{best.cashback.earningRates.find((r: EarningRate) => r.category === categorySearch)?.rate ?? best.cashback.earningRates.find((r: EarningRate) => r.category === 'General')?.rate}</span></div>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-muted-foreground">No cashback card available</div>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
} 