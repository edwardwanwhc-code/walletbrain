import { supabase } from '@/lib/supabase';
import type { Transaction, TransactionWithCard } from '@/types/database';

export async function getTransactions(limit = 50): Promise<TransactionWithCard[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, cards:card_id(id, bank, card_name)')
    .order('transaction_date', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch transactions: ${error.message}`);
  return data || [];
}

export async function getTransactionsByCard(cardId: string): Promise<TransactionWithCard[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, cards:card_id(id, bank, card_name)')
    .eq('card_id', cardId)
    .order('transaction_date', { ascending: false });

  if (error) throw new Error(`Failed to fetch card transactions: ${error.message}`);
  return data || [];
}

export async function getMonthlySpending(
  cardId: string,
  year: number,
  month: number
): Promise<number> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  const { data, error } = await supabase
    .from('transactions')
    .select('amount_hkd')
    .eq('card_id', cardId)
    .gte('transaction_date', startDate)
    .lt('transaction_date', endDate);

  if (error) throw new Error(`Failed to fetch monthly spending: ${error.message}`);

  return (data || []).reduce((sum, t) => sum + Number(t.amount_hkd), 0);
}

export async function createTransaction(
  transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single();

  if (error) throw new Error(`Failed to create transaction: ${error.message}`);
  return data;
}

export async function updateTransaction(
  id: string,
  updates: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(`Failed to update transaction: ${error.message}`);
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete transaction: ${error.message}`);
}
