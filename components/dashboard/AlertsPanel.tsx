'use client';

import { Alert, CreditCard } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { CONFIG } from '@/lib/config';

interface AlertsPanelProps {
  alerts: Alert[];
  cards: CreditCard[];
  onMarkAsRead: (alertId: string) => void;
  onDeleteAlert: (alertId: string) => void;
  onMarkAsPaid: (alertId: string) => void;
}

export default function AlertsPanel({ alerts, cards, onMarkAsRead, onDeleteAlert, onMarkAsPaid }: AlertsPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'payment_due': return <AlertCircle className="h-4 w-4" />;
      case 'annual_fee': return <AlertCircle className="h-4 w-4" />;
      case 'spending_cap': return <AlertCircle className="h-4 w-4" />;
      case 'fee_waiver': return <CheckCircle className="h-4 w-4" />;
      case 'category_limit': return <AlertCircle className="h-4 w-4" />;
      case 'credit_limit': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'payment_due': return 'border-red-200 bg-red-50';
      case 'annual_fee': return 'border-yellow-200 bg-yellow-50';
      case 'spending_cap': return 'border-blue-200 bg-blue-50';
      case 'fee_waiver': return 'border-green-200 bg-green-50';
      case 'category_limit': return 'border-orange-200 bg-orange-50';
      case 'credit_limit': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getAlertTextColor = (type: string) => {
    switch (type) {
      case 'payment_due': return 'text-red-800';
      case 'annual_fee': return 'text-yellow-800';
      case 'spending_cap': return 'text-blue-800';
      case 'fee_waiver': return 'text-green-800';
      case 'category_limit': return 'text-orange-800';
      case 'credit_limit': return 'text-red-800';
      default: return 'text-gray-800';
    }
  };

  const getCardName = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    return card?.name || 'Unknown Card';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / CONFIG.TIME.MILLISECONDS_PER_DAY);

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `In ${diffDays} days`;
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    // Sort by unread first, then by due date
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No alerts at the moment!</p>
          <p className="text-sm text-muted-foreground">All your cards are up to date.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Alerts</span>
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} new</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedAlerts.slice(0, 5).map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border ${getAlertColor(alert.type)} ${alert.isRead ? 'opacity-75' : ''
              }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className={`font-medium text-sm ${getAlertTextColor(alert.type)}`}>
                      {alert.title}
                    </h4>
                    {!alert.isRead && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{alert.message}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Card: {getCardName(alert.cardId)}</span>
                    <span>Due: {formatDate(alert.dueDate)}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-1">
                {!alert.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(alert.id)}
                    title="Mark as read"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                {(alert.type === 'payment_due' || alert.type === 'category_limit' || alert.type === 'credit_limit') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsPaid(alert.id)}
                    title="Mark as resolved"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteAlert(alert.id)}
                  title="Delete alert"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {alerts.length > 5 && (
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Showing 5 of {alerts.length} alerts
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 