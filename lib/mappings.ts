export const CATEGORY_OPTIONS = [
    'Dining',
    'Travel',
    'Beauty & Wellness',
    'Groceries',
    'Online Spend',
    'Online Shopping',
    'Offline Shopping',
    'Paywave',
    'Mobile Contactless',
    'In-App Purchases',
    'Pharmacies',
    'Bakeries',
    'Transport',
    'General',
];

export const MERCHANT_TO_CATEGORY: Record<string, string> = {
    'McDonalds': 'Dining',
    'IKEA': 'Paywave',
    'Donki': 'Groceries',
    'Daiso': 'Offline Shopping',
    'MRT': 'Transport',
    'Shopback Pay': 'Online Spend',
    'Atome': 'Online Spend',
    'Shopee': 'Online Spend',
    'Fairprice': 'Groceries',
    'The Closet Lover (Online)': 'Online Shopping',
    'The Closer Lover (Offline)': 'Offline Shopping',

};
export const MERCHANTS = Object.keys(MERCHANT_TO_CATEGORY);
