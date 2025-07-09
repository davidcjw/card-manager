# [Credit Card Manager](https://cardmanager.davidcjw.com/)

<p align="center">
  <img src="/public/card-manager.gif" alt="Credit Card Manager Demo" width="700" />
</p>

A comprehensive credit card management application built with Next.js and TypeScript. Track your credit cards, monitor spending, and stay on top of important dates and limits.

No data is collected. Everything is stored in your browser's local storage and you are free to download the data in JSON format to share with others (e.g. your spouse).

Feel free to open an issue [here](https://github.com/davidcjw/card-manager/issues) for bugs or feature requests.

## Features

### Credit Card Management
- Add, edit, and delete credit cards
- Track spending by category
- Monitor earning rates and caps
- Set credit limits and annual fees
- Track payment due dates and annual fee dates

### Smart Alerts System
The application automatically generates alerts for:

1. **Payment Due Alerts** - Notifies you when payments are due within 7 days
2. **Annual Fee Alerts** - Reminds you of upcoming annual fees within 30 days
3. **Fee Waiver Opportunities** - Alerts when you're close to spending enough to waive annual fees
4. **Category Spending Limit Alerts** - Warns when you're approaching monthly spending caps for specific categories (80% threshold)
5. **Credit Limit Alerts** - Notifies when you're approaching your credit limit (80% threshold)

### Alert Types

#### Category Spending Limit Alerts
- Triggered when spending reaches 80% or more of the monthly cap for a specific category
- Shows remaining amount before hitting the cap
- Helps you maximize rewards while staying within limits

#### Credit Limit Alerts
- Triggered when total spending reaches 80% or more of your credit limit
- Shows remaining available credit
- Helps you manage credit utilization and avoid over-limit fees

### Data Management
- Export all data to JSON format
- Import data from previously exported files
- Clear all data with confirmation
- Automatic data persistence in browser storage

## Try It Out Yourself!

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Data
To see the new alert features in action:
1. Open the application
2. Go to Settings → Data Manager
3. Import the `demo-data.json` file included in this repository
4. The demo data includes cards that will trigger category limit and credit limit alerts

## Usage

### Adding a Credit Card
1. Click "Add Card" in the header
2. Fill in the card details including:
   - Card name and bank
   - Credit limit and annual fee
   - Payment due date and annual fee date
   - Earning rates with monthly caps
3. Save the card

### Setting Spending Limits
1. When adding earning rates, specify the monthly cap for each category
2. The system will automatically track spending against these caps
3. Alerts will be generated when you approach 80% of the cap

### Managing Alerts
- View all alerts in the Alerts Panel
- Mark alerts as read or delete them
- Mark payment due alerts as paid to track payment history
- Resolve category and credit limit alerts when you've addressed the issue

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Custom store with localStorage persistence
- **Icons**: Lucide React

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Data Structure

The application stores data in the browser's localStorage with the following structure:

```typescript
interface CreditCard {
  id: string;
  name: string;
  bank: string;
  cardType: 'miles' | 'cashback';
  creditLimit: number;
  annualFee: number;
  annualFeeWaiver: number;
  paymentDueDate: number;
  annualFeeDate: string;
  spendByCategory: SpendByCategory[];
  earningRates: EarningRate[];
  isActive: boolean;
}

interface Alert {
  id: string;
  cardId: string;
  type: 'payment_due' | 'annual_fee' | 'spending_cap' | 'fee_waiver' | 'category_limit' | 'credit_limit';
  title: string;
  message: string;
  dueDate: string;
  isRead: boolean;
}
```
