'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Github } from "lucide-react";
import { ThemeToggle } from '../theme-toggle';
import { DataManagerModal } from './DataManagerModal';
import CreditCardForm from './CreditCardForm';
import { CreditCard } from '../../types';

interface HeaderProps {
    showForm: boolean;
    setShowForm: (show: boolean) => void;
    editingCard: CreditCard | null;
    onAddCard: (cardData: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onEditCard: (cardData: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancelForm: () => void;
}

export default function Header({
    showForm,
    setShowForm,
    editingCard,
    onAddCard,
    onEditCard,
    onCancelForm
}: HeaderProps) {
    return (
        <header className="border-b relative">
            {/* GitHub Link */}
            <a
                href="https://github.com/davidcjw/card-manager"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-4 top-2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="View on GitHub"
            >
                <Github className="w-5 h-5" />
            </a>
            <div className="container mx-auto px-4 py-4 sm:py-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                    {/* Title Section */}
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold">Credit Card Manager</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            Manage your credit cards and track your rewards
                        </p>
                    </div>

                    {/* Actions Section */}
                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-2">
                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-start">
                            <ThemeToggle />
                            <DataManagerModal />
                        </div>

                        <Dialog open={showForm} onOpenChange={setShowForm}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Card
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <CreditCardForm
                                    key={editingCard ? `edit-${editingCard.id}` : 'add-new'}
                                    card={editingCard || undefined}
                                    onSubmit={editingCard ? onEditCard : onAddCard}
                                    onCancel={onCancelForm}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </header>
    );
} 