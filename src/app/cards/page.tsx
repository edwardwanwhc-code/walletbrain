"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCards } from "@/services/cards";
import type { CardWithCategoryRewards } from "@/types/database";
import { LoadingSpinner, PageHeader } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORY_ICONS, REWARD_TYPE_LABELS } from "@/lib/constants";

export default function CardsPage() {
  const [cards, setCards] = useState<CardWithCategoryRewards[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCards()
      .then(setCards)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="載入信用卡..." />;

  return (
    <div>
      <PageHeader
        title="信用卡"
        subtitle={`共 ${cards.length} 張`}
        action={
          <Link
            href="/cards/new"
            className="inline-flex items-center px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            ＋ 新增
          </Link>
        }
      />

      {cards.length === 0 ? (
        <EmptyState
          icon="💳"
          title="未有信用卡"
          description="新增你嘅信用卡，等我幫你分析每張卡嘅回贈優惠！"
          actionLabel="新增信用卡"
          actionHref="/cards/new"
        />
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={`/cards/detail?id=${card.id}`}
              className="card p-4 block hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {card.card_name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {card.bank}{card.network ? ` · ${card.network}` : ''}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                    card.is_active
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                  }`}
                >
                  {card.is_active ? "啟用" : "已停用"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{REWARD_TYPE_LABELS[card.reward_type] || card.reward_type}</span>
                {card.base_reward_rate > 0 && (
                  <span>· 基本回贈 {Number(card.base_reward_rate).toFixed(1)}%</span>
                )}
                {card.monthly_cap_amount && (
                  <span>· 每月上限 ${Number(card.monthly_cap_amount).toFixed(0)}</span>
                )}
              </div>
              {card.category_rewards && card.category_rewards.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {card.category_rewards.slice(0, 4).map((cr) => (
                    <span
                      key={cr.id}
                      className="inline-flex items-center gap-0.5 text-xs bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded"
                    >
                      {CATEGORY_ICONS[cr.category] || ""} {Number(cr.reward_rate).toFixed(1)}%
                    </span>
                  ))}
                  {card.category_rewards.length > 4 && (
                    <span className="text-xs text-slate-400">
                      +{card.category_rewards.length - 4}
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
