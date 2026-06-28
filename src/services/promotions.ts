import { supabase } from '@/lib/supabase';
import type { Promotion, PromotionRegistration } from '@/types/database';

export async function getPromotions(filters?: {
  bank?: string;
  cardName?: string;
  category?: string;
  registrationRequired?: boolean;
  expiringSoon?: boolean;
  needsReview?: boolean;
  status?: string;
}): Promise<Promotion[]> {
  let query = supabase
    .from('promotions')
    .select('*')
    .order('end_date', { ascending: true, nullsFirst: false });

  if (filters?.bank) query = query.eq('bank', filters.bank);
  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.status) query = query.eq('status', filters.status);
  else query = query.eq('status', 'active');
  if (filters?.registrationRequired) query = query.eq('registration_required', true);
  if (filters?.needsReview) query = query.eq('needs_review', true);

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch promotions: ${error.message}`);

  let result = data || [];

  // Client-side filtering
  if (filters?.cardName) {
    result = result.filter(
      (p) => p.applicable_cards?.some((c: string) => c.includes(filters.cardName!)) ?? false
    );
  }
  if (filters?.expiringSoon) {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    result = result.filter((p) => {
      if (!p.end_date) return false;
      const end = new Date(p.end_date);
      return end <= sevenDaysFromNow && end >= new Date();
    });
  }

  return result;
}

export async function getPromotionsRequiringRegistration(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('status', 'active')
    .eq('registration_required', true)
    .order('end_date', { ascending: true, nullsFirst: false });

  if (error) throw new Error(`Failed to fetch registration promotions: ${error.message}`);
  return data || [];
}

export async function getExpiringPromotions(daysThreshold = 7): Promise<Promotion[]> {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + daysThreshold);
  const thresholdStr = threshold.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('status', 'active')
    .lte('end_date', thresholdStr)
    .order('end_date', { ascending: true });

  if (error) throw new Error(`Failed to fetch expiring promotions: ${error.message}`);
  return data || [];
}

export async function getPromotionRegistrations(
  promotionIds: string[]
): Promise<PromotionRegistration[]> {
  if (promotionIds.length === 0) return [];

  const { data, error } = await supabase
    .from('promotion_registrations')
    .select('*')
    .in('promotion_id', promotionIds);

  if (error) throw new Error(`Failed to fetch registrations: ${error.message}`);
  return data || [];
}

export async function updatePromotionRegistration(
  promotionId: string,
  registered: boolean
): Promise<void> {
  const { data: existing } = await supabase
    .from('promotion_registrations')
    .select('id')
    .eq('promotion_id', promotionId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('promotion_registrations')
      .update({ registered, registered_at: registered ? new Date().toISOString() : null })
      .eq('id', existing.id);

    if (error) throw new Error(`Failed to update registration: ${error.message}`);
  } else {
    const { error } = await supabase
      .from('promotion_registrations')
      .insert({
        promotion_id: promotionId,
        registered,
        registered_at: registered ? new Date().toISOString() : null,
      });

    if (error) throw new Error(`Failed to create registration: ${error.message}`);
  }
}
