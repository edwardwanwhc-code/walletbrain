import type {
  CardWithCategoryRewards,
  Promotion,
  PromotionRegistration,
  RecommendationInput,
  RecommendationResult,
  CardScore,
  Category,
} from '@/types/database';
import { getActiveCards } from '@/services/cards';
import { getMonthlySpending } from '@/services/transactions';
import { getPromotions, getPromotionRegistrations } from '@/services/promotions';

/**
 * Deterministic recommendation engine.
 * No LLM calls — pure logic based on the spec in RECOMMENDATION_ENGINE.md.
 *
 * Scoring formula:
 *   expected_reward = base_reward + category_reward + promotion_reward
 *   penalties = cap_penalty + registration_penalty + confidence_penalty
 *   final_score = expected_reward - penalties
 */

function getCurrentMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function getCategoryReward(card: CardWithCategoryRewards, category: Category): number {
  const catReward = card.category_rewards?.find((r) => r.category === category);
  return catReward ? Number(catReward.reward_rate) : 0;
}

function matchPromotion(
  promotions: Promotion[],
  card: CardWithCategoryRewards,
  category: Category,
  amount: number,
  merchant: string,
  location: string
): Promotion | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const promo of promotions) {
    // Check status
    if (promo.status !== 'active') continue;

    // Check date range
    if (promo.start_date && new Date(promo.start_date) > today) continue;
    if (promo.end_date && new Date(promo.end_date) < today) continue;

    // Check applicable cards
    if (
      promo.applicable_cards &&
      promo.applicable_cards.length > 0 &&
      !promo.applicable_cards.some((c) => c === card.card_name || c === card.bank)
    ) {
      continue;
    }

    // Check category match
    if (promo.category && promo.category !== category) continue;

    // Check merchant match
    if (promo.merchant && !merchant.toLowerCase().includes(promo.merchant.toLowerCase())) continue;

    // Check location/mall match
    if (promo.mall && !location.toLowerCase().includes(promo.mall.toLowerCase())) continue;

    // Check minimum spend
    if (promo.minimum_spend && amount < Number(promo.minimum_spend)) continue;

    return promo;
  }

  return null;
}

function calculatePromotionReward(
  promo: Promotion,
  amount: number,
  baseReward: number
): number {
  if (promo.reward_rate !== null && promo.reward_rate !== undefined) {
    const promoReward = amount * Number(promo.reward_rate);
    if (promo.maximum_reward !== null && promo.maximum_reward !== undefined) {
      return Math.min(promoReward, Number(promo.maximum_reward));
    }
    return promoReward;
  }

  // If no specific reward rate but promo matches, use base reward
  return baseReward;
}

export async function recommend(input: RecommendationInput): Promise<RecommendationResult> {
  const { amount_hkd, merchant, location, category } = input;

  // Fetch all active cards
  const cards = await getActiveCards();

  // Fetch active promotions
  const promotions = await getPromotions({ status: 'active', category });

  // Fetch promotion registrations
  const promoIds = promotions.map((p) => p.id);
  const registrations = await getPromotionRegistrations(promoIds);
  const registrationMap = new Map<string, PromotionRegistration>();
  registrations.forEach((r) => registrationMap.set(r.promotion_id, r));

  const { year, month } = getCurrentMonth();

  const scores: CardScore[] = [];
  let excludedCount = 0;

  for (const card of cards) {
    // Exclude inactive cards
    if (!card.is_active) {
      excludedCount++;
      continue;
    }

    // Calculate base reward
    const baseReward = amount_hkd * Number(card.base_reward_rate);

    // Calculate category reward (higher rate between base and category-specific)
    const catRate = getCategoryReward(card, category);
    const effectiveRate = Math.max(Number(card.base_reward_rate), catRate);
    const categoryReward = amount_hkd * effectiveRate;

    // Match promotion
    const matchedPromo = matchPromotion(promotions, card, category, amount_hkd, merchant, location);

    // Calculate promotion reward
    let promotionReward = 0;
    if (matchedPromo) {
      promotionReward = calculatePromotionReward(matchedPromo, amount_hkd, categoryReward);
    }

    const expectedReward = categoryReward + promotionReward;

    // Cap penalty
    let capPenalty = 0;
    let remainingCap: number | null = null;
    let capWarning = false;

    if (card.monthly_cap_amount) {
      const spent = await getMonthlySpending(card.id, year, month);
      remainingCap = Number(card.monthly_cap_amount) - spent;

      if (remainingCap <= 0) {
        capPenalty = expectedReward; // Full penalty — cap is exhausted
        capWarning = true;
      } else if (remainingCap < expectedReward) {
        capPenalty = expectedReward - remainingCap;
        capWarning = true;
      }
    }

    // Registration penalty
    let registrationPenalty = 0;
    if (matchedPromo?.registration_required) {
      const reg = registrationMap.get(matchedPromo.id);
      if (!reg?.registered) {
        registrationPenalty = promotionReward * 0.5; // 50% penalty if not registered
      }
    }

    // Confidence penalty
    let confidencePenalty = 0;
    if (matchedPromo && matchedPromo.confidence_score < 0.7) {
      confidencePenalty = promotionReward * 0.2;
    }

    const finalScore = expectedReward - capPenalty - registrationPenalty - confidencePenalty;

    // Build warnings
    const warnings: string[] = [];
    if (capWarning) {
      warnings.push(
        remainingCap! <= 0
          ? `每月回贈上限已用完`
          : `每月回贈上限剩餘 $${remainingCap!.toFixed(0)}`
      );
    }
    if (matchedPromo?.registration_required && !registrationMap.get(matchedPromo.id)?.registered) {
      warnings.push(`需要登記優惠：${matchedPromo.registration_url ? '按此登記' : '請自行登記'}`);
    }
    if (matchedPromo && matchedPromo.confidence_score < 0.7) {
      warnings.push('優惠資料尚未完全確認，建議核實');
    }

    // Build reasoning
    const parts: string[] = [];
    parts.push(`${card.bank} ${card.card_name}`);
    if (effectiveRate > 0) {
      parts.push(
        `${categoryReward > baseReward ? `類別回贈 ${(effectiveRate * 100).toFixed(1)}%` : `基本回贈 ${(effectiveRate * 100).toFixed(1)}%`}`
      );
      parts.push(`預計回贈 $${categoryReward.toFixed(2)}`);
    }
    if (matchedPromo) {
      parts.push(`優惠：${matchedPromo.title} (+$${promotionReward.toFixed(2)})`);
    }

    scores.push({
      card_id: card.id,
      card_name: card.card_name,
      bank: card.bank,
      reward_type: card.reward_type,
      reward_currency: card.reward_currency,
      expected_reward: expectedReward,
      base_reward: baseReward,
      category_reward: categoryReward,
      promotion_reward: promotionReward,
      cap_penalty: capPenalty,
      registration_penalty: registrationPenalty,
      confidence_penalty: confidencePenalty,
      final_score: finalScore,
      remaining_cap: remainingCap,
      matched_promotion: matchedPromo
        ? {
            id: matchedPromo.id,
            title: matchedPromo.title,
            reward_description: matchedPromo.reward_description,
            registration_required: matchedPromo.registration_required,
            registration_url: matchedPromo.registration_url,
            end_date: matchedPromo.end_date,
          }
        : null,
      warnings,
      reasoning: parts.join(' | '),
    });
  }

  // Sort by final_score descending
  scores.sort((a, b) => b.final_score - a.final_score);

  return {
    recommendations: scores.slice(0, 3),
    input,
    total_active_cards: cards.length,
    excluded_cards: excludedCount,
  };
}
