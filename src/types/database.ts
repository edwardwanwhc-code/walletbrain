// Database types — mirrors supabase/migrations/001_initial_schema.sql

export type RewardType = 'cashback' | 'miles' | 'points' | 'discount';
export type CardNetwork = 'Visa' | 'Mastercard' | 'Amex' | 'UnionPay' | 'JCB';

export type Category =
  | 'dining'
  | 'cafe'
  | 'online_shopping'
  | 'supermarket'
  | 'convenience_store'
  | 'electronics'
  | 'department_store'
  | 'travel'
  | 'hotel'
  | 'flight'
  | 'overseas_spending'
  | 'local_spending'
  | 'entertainment'
  | 'healthcare'
  | 'insurance'
  | 'utilities'
  | 'government'
  | 'education'
  | 'tax'
  | 'others';

export type PromotionStatus = 'active' | 'expired' | 'upcoming';
export type AgentTaskType = 'promotion_update' | 'data_quality_check' | 'backup';
export type AgentStatus = 'success' | 'partial' | 'failed';

export interface Card {
  id: string;
  owner_name: string | null;
  bank: string;
  card_name: string;
  network: CardNetwork | null;
  reward_type: RewardType;
  reward_currency: string | null;
  base_reward_rate: number;
  monthly_cap_amount: number | null;
  cap_reset_day: number;
  official_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CardCategoryReward {
  id: string;
  card_id: string;
  category: Category;
  reward_rate: number;
  cap_amount: number | null;
  notes: string | null;
}

export interface CardWithCategoryRewards extends Card {
  category_rewards: CardCategoryReward[];
}

export interface Transaction {
  id: string;
  card_id: string | null;
  transaction_date: string;
  amount_hkd: number;
  merchant: string | null;
  location: string | null;
  category: Category;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithCard extends Transaction {
  cards: Pick<Card, 'id' | 'bank' | 'card_name'> | null;
}

export interface Promotion {
  id: string;
  title: string;
  bank: string | null;
  applicable_cards: string[] | null;
  merchant: string | null;
  mall: string | null;
  category: Category | null;
  reward_description: string | null;
  reward_rate: number | null;
  minimum_spend: number | null;
  maximum_reward: number | null;
  registration_required: boolean;
  registration_url: string | null;
  terms_summary: string | null;
  start_date: string | null;
  end_date: string | null;
  source_url: string;
  confidence_score: number;
  status: PromotionStatus;
  needs_review: boolean;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromotionRegistration {
  id: string;
  promotion_id: string;
  registered: boolean;
  registered_at: string | null;
  notes: string | null;
}

export interface AgentLog {
  id: string;
  task_type: AgentTaskType;
  status: AgentStatus;
  summary: string | null;
  checked_count: number;
  added_count: number;
  updated_count: number;
  expired_count: number;
  needs_review_count: number;
  created_at: string;
}

// Recommendation engine types
export interface RecommendationInput {
  amount_hkd: number;
  merchant: string;
  location: string;
  category: Category;
}

export interface CardScore {
  card_id: string;
  card_name: string;
  bank: string;
  reward_type: RewardType;
  reward_currency: string | null;
  expected_reward: number;
  base_reward: number;
  category_reward: number;
  promotion_reward: number;
  cap_penalty: number;
  registration_penalty: number;
  confidence_penalty: number;
  final_score: number;
  remaining_cap: number | null;
  matched_promotion: {
    id: string;
    title: string;
    reward_description: string | null;
    registration_required: boolean;
    registration_url: string | null;
    end_date: string | null;
  } | null;
  warnings: string[];
  reasoning: string;
}

export interface RecommendationResult {
  recommendations: CardScore[];
  input: RecommendationInput;
  total_active_cards: number;
  excluded_cards: number;
}
