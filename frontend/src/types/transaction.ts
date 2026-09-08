export interface TransactionSummary {
  id: string;
  source: string;
  amount: number;
  date: string;
  type: 'payout' | 'expense' | 'deduction';
  status: 'cleared' | 'pending';
}
