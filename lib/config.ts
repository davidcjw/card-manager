/**
 * Application Configuration
 * 
 * This file centralizes all configurable values used throughout the application.
 * Modify these values to adjust alert thresholds, time periods, and other settings.
 */

export const CONFIG = {
    // Alert Thresholds
    ALERTS: {
        // Payment due alerts
        PAYMENT_DUE_DAYS: 7, // Alert when payment is due within this many days

        // Annual fee alerts  
        ANNUAL_FEE_DAYS: 30, // Alert when annual fee is due within this many days

        // Category spending limit alerts
        CATEGORY_LIMIT_PERCENTAGE: 80, // Alert when spending reaches this percentage of monthly cap

        // Credit limit alerts
        CREDIT_LIMIT_PERCENTAGE: 80, // Alert when credit utilization reaches this percentage

        // Fee waiver alerts
        FEE_WAIVER_THRESHOLD: 1000, // Alert when within this amount of annual fee waiver
    },

    // Time Calculations
    TIME: {
        // Milliseconds in a day (used for date calculations)
        MILLISECONDS_PER_DAY: 1000 * 60 * 60 * 24,
    },

    // UI Configuration
    UI: {
        // Quick spend amounts for the update spend drawer
        QUICK_SPEND_AMOUNTS: [50, 100, 200, 500, 1000, 2000],
    },

    // Data Export/Import
    EXPORT: {
        // Version for exported data
        DATA_VERSION: '1.0.0',

        // Default filename format for exports
        FILENAME_FORMAT: 'credit-cards-{date}.json',
    },

    // Storage Keys
    STORAGE: {
        CREDIT_CARDS: 'creditCards',
        ALERTS: 'alerts',
        PAID_PAYMENT_PERIODS: 'paidPaymentPeriods',
    },

    // Card Types
    CARD_TYPES: {
        MILES: 'miles',
        CASHBACK: 'cashback',
    } as const,

    // Alert Types
    ALERT_TYPES: {
        PAYMENT_DUE: 'payment_due',
        ANNUAL_FEE: 'annual_fee',
        FEE_WAIVER: 'fee_waiver',
        CATEGORY_LIMIT: 'category_limit',
        CREDIT_LIMIT: 'credit_limit',
    } as const,

    // Default Values
    DEFAULTS: {
        // Default earning rate for cashback cards (percentage)
        CASHBACK_RATE: 1.5,

        // Default earning rate for miles cards (miles per dollar)
        MILES_RATE: 1.2,

        // Default annual fee
        ANNUAL_FEE: 0,

        // Default credit limit
        CREDIT_LIMIT: 10000,
    },
} as const;

// Type exports for better type safety
export type CardType = typeof CONFIG.CARD_TYPES[keyof typeof CONFIG.CARD_TYPES];
export type AlertType = typeof CONFIG.ALERT_TYPES[keyof typeof CONFIG.ALERT_TYPES]; 