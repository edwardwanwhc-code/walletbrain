"use client";

import { useState } from "react";
import type { Category, CardScore } from "@/types/database";
import { CATEGORY_LABELS, CATEGORY_ICONS, REWARD_TYPE_LABELS } from "@/lib/constants";
import { recommend } from "@/lib/recommendation";
import { PageHeader } from "@/components/ui/LoadingSpinner";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export default function RecommendPage() {
  const [form, setForm] = useState({
    amount_hkd: "",
    merchant: "",
    location: "",
    category: "dining" as Category,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<CardScore[] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount_hkd || parseFloat(form.amount_hkd) <= 0) {
      setError("請輸入有效金額");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await recommend({
        amount_hkd: parseFloat(form.amount_hkd),
        merchant: form.merchant.trim(),
        location: form.location.trim(),
        category: form.category,
      });
      setResults(result.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="智能推薦" subtitle="輸入消費資訊，等我幫你揀卡！" />

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            消費金額 (HKD) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.amount_hkd}
            onChange={(e) => setForm({ ...form, amount_hkd: e.target.value })}
            placeholder="例如：500"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            消費類別 *
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        {/* Merchant + Location */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              商戶
            </label>
            <input
              type="text"
              value={form.merchant}
              onChange={(e) => setForm({ ...form, merchant: e.target.value })}
              placeholder="例如：百佳"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              地點/商場
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="例如：時代廣場"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? "計算中..." : "🎯 推薦最適合嘅信用卡"}
        </button>
      </form>

      {/* Results */}
      {results && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            推薦結果 · 頭 {results.length} 張
          </h2>
          {results.length === 0 ? (
            <div className="card p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
              未有活躍信用卡，請先新增信用卡
            </div>
          ) : (
            results.map((card, index) => (
              <div
                key={card.card_id}
                className={`card p-4 ${
                  index === 0
                    ? "border-2 border-primary shadow-md"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded">
                          最佳
                        </span>
                      )}
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {card.card_name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {card.bank} · {REWARD_TYPE_LABELS[card.reward_type]}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      ${card.expected_reward.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">預計回贈</div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">基本回贈</div>
                    <div className="text-slate-700 dark:text-slate-300">
                      ${card.base_reward.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">類別回贈</div>
                    <div className="text-slate-700 dark:text-slate-300">
                      ${card.category_reward.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">優惠額外</div>
                    <div className="text-slate-700 dark:text-slate-300">
                      ${card.promotion_reward.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Promo match */}
                {card.matched_promotion && (
                  <div className="mb-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-xs">
                    <div className="font-medium text-amber-700 dark:text-amber-300">
                      🎉 {card.matched_promotion.title}
                    </div>
                    {card.matched_promotion.reward_description && (
                      <div className="text-amber-600 dark:text-amber-400 mt-0.5">
                        {card.matched_promotion.reward_description}
                      </div>
                    )}
                    {card.matched_promotion.registration_required && (
                      <div className="text-red-600 dark:text-red-400 mt-0.5">
                        ⚠️ 需要登記
                        {card.matched_promotion.registration_url && (
                          <a
                            href={card.matched_promotion.registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline ml-1"
                          >
                            按此登記
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Cap */}
                {card.remaining_cap !== null && (
                  <div className="mb-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          card.remaining_cap <= 0
                            ? "bg-red-500"
                            : card.remaining_cap < card.expected_reward
                            ? "bg-amber-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.max(5, Math.min(100, card.remaining_cap > 0 ? ((card.remaining_cap) / (card.remaining_cap + card.expected_reward)) * 100 : 0))}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      剩餘上限 ${card.remaining_cap.toFixed(0)}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {card.warnings.length > 0 && (
                  <div className="space-y-1">
                    {card.warnings.map((w, i) => (
                      <div
                        key={i}
                        className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                      >
                        <span>⚠️</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reasoning */}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500">
                  {card.reasoning}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
