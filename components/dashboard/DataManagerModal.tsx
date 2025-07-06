'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { creditCardStore } from '@/lib/store';
import { Download, Upload, FileText, AlertCircle, Settings, Trash2 } from 'lucide-react';

export function DataManagerModal() {
    const [importStatus, setImportStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });
    const [isImporting, setIsImporting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleExport = () => {
        try {
            creditCardStore.downloadData();
            setImportStatus({
                type: 'success',
                message: 'Data exported successfully!'
            });
        } catch {
            setImportStatus({
                type: 'error',
                message: 'Failed to export data'
            });
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setImportStatus({ type: null, message: '' });

        try {
            const result = await creditCardStore.loadFromFile(file);
            setImportStatus({
                type: result.success ? 'success' : 'error',
                message: result.message
            });

            if (result.success) {
                // Refresh the page to show updated data
                window.location.reload();
            }
        } catch {
            setImportStatus({
                type: 'error',
                message: 'Failed to import data'
            });
        } finally {
            setIsImporting(false);
            // Reset the file input
            event.target.value = '';
        }
    };

    const handleClearData = () => {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            try {
                // Clear localStorage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('creditCards');
                    localStorage.removeItem('alerts');
                    localStorage.removeItem('paidPaymentPeriods');
                }

                setImportStatus({
                    type: 'success',
                    message: 'All data cleared successfully! The page will refresh.'
                });

                // Refresh the page after a short delay to show the message
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } catch {
                setImportStatus({
                    type: 'error',
                    message: 'Failed to clear data'
                });
            }
        }
    };

    const handleFileInputClick = () => {
        const fileInput = document.getElementById('file-input-modal') as HTMLInputElement;
        fileInput?.click();
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Reset status when closing modal
            setImportStatus({ type: null, message: '' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Data
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Data Management
                    </DialogTitle>
                    <DialogDescription>
                        Export your credit card data to share with others, import data from a JSON file, or clear all data
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Button
                            onClick={handleExport}
                            className="flex items-center gap-2 flex-1"
                            variant="outline"
                        >
                            <Download className="h-4 w-4" />
                            Export Data
                        </Button>

                        <Button
                            onClick={handleFileInputClick}
                            className="flex items-center gap-2 flex-1"
                            variant="outline"
                            disabled={isImporting}
                        >
                            <Upload className="h-4 w-4" />
                            {isImporting ? 'Importing...' : 'Import Data'}
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleClearData}
                            className="flex items-center gap-2 flex-1"
                            variant="destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear All Data
                        </Button>
                    </div>

                    <input
                        id="file-input-modal"
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        style={{ display: 'none' }}
                    />

                    {importStatus.type && (
                        <Alert className={importStatus.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                            <AlertCircle className={`h-4 w-4 ${importStatus.type === 'error' ? 'text-red-600' : 'text-green-600'}`} />
                            <AlertDescription className={importStatus.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                                {importStatus.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="text-sm text-muted-foreground space-y-2">
                        <p><strong>Export:</strong> Downloads all your credit cards, alerts, and payment history as a JSON file.</p>
                        <p><strong>Import:</strong> Loads credit card data from a previously exported JSON file. This will replace your current data.</p>
                        <p><strong>Clear All Data:</strong> Removes all credit cards, alerts, and payment history from your browser storage.</p>
                        <p className="text-xs text-orange-600">
                            ⚠️ Importing will replace all existing data. Make sure to export your current data first if you want to keep it.
                        </p>
                        <p className="text-xs text-red-600">
                            ⚠️ Clearing data is permanent and cannot be undone. Export your data first if you want to keep it.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 