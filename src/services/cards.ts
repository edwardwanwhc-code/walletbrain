import { supabase } from '@/lib/supabase';
import type { Card, CardWithCategoryRewards, CardCategoryReward } from '@/types/database';

// --- Card CRUD ---

export async function getCards(): Promise<CardWithCategoryRewards[]> {
  const { data: cards, error } = await supabase
    .from('cards')
    .select('*, category_rewards:card_category_rewards(*)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch cards: ${error.message}`);
  return cards || [];
}

export async function getActiveCards(): Promise<CardWithCategoryRewards[]> {
  const { data: cards, error } = await supabase
    .from('cards')
    .select('*, category_rewards:card_category_rewards(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch active cards: ${error.message}`);
  return cards || [];
}

export async function getCard(id: string): Promise<CardWithCategoryRewards | null> {
  const { data, error } = await supabase
    .from('cards')
    .select('*, category_rewards:card_category_rewards(*)')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createCard(
  card: Omit<Card, 'id' | 'created_at' | 'updated_at'>,
  categoryRewards: Omit<CardCategoryReward, 'id' | 'card_id'>[] = []
): Promise<CardWithCategoryRewards> {
  const { data, error } = await supabase
    .from('cards')
    .insert(card)
    .select()
    .single();

  if (error) throw new Error(`Failed to create card: ${error.message}`);

  // Insert category rewards if any
  if (categoryRewards.length > 0) {
    const rewards = categoryRewards.map((r) => ({ ...r, card_id: data.id }));
    const { error: rewardError } = await supabase
      .from('card_category_rewards')
      .insert(rewards);

    if (rewardError) throw new Error(`Failed to create category rewards: ${rewardError.message}`);
  }

  return getCard(data.id) as Promise<CardWithCategoryRewards>;
}

export async function updateCard(
  id: string,
  updates: Partial<Omit<Card, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(`Failed to update card: ${error.message}`);
}

export async function archiveCard(id: string): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(`Failed to archive card: ${error.message}`);
}

export async function deleteCard(id: string): Promise<void> {
  const { error } = await supabase.from('cards').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete card: ${error.message}`);
}

// --- Category Rewards ---

export async function updateCategoryReward(
  id: string,
  updates: Partial<Omit<CardCategoryReward, 'id'>>
): Promise<void> {
  const { error } = await supabase
    .from('card_category_rewards')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(`Failed to update category reward: ${error.message}`);
}

export async function deleteCategoryReward(id: string): Promise<void> {
  const { error } = await supabase
    .from('card_category_rewards')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete category reward: ${error.message}`);
}

export async function setCategoryRewards(
  cardId: string,
  rewards: Omit<CardCategoryReward, 'id' | 'card_id'>[]
): Promise<void> {
  // Delete existing rewards for this card
  const { error: deleteError } = await supabase
    .from('card_category_rewards')
    .delete()
    .eq('card_id', cardId);

  if (deleteError) throw new Error(`Failed to clear category rewards: ${deleteError.message}`);

  // Insert new rewards
  if (rewards.length > 0) {
    const { error: insertError } = await supabase
      .from('card_category_rewards')
      .insert(rewards.map((r) => ({ ...r, card_id: cardId })));

    if (insertError) throw new Error(`Failed to set category rewards: ${insertError.message}`);
  }
}
