"use client";

import { useEffect, useState } from "react";
import { getPromotions, updatePromotionRegistration } from "@/services/promotions";
import type { Promotion } from "@/types/database";
import { LoadingSpinner, PageHeader } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { HK_BANKS, PROMOTION_STATUS_LABELS } from "@/lib/constants";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    bank: "",
    registrationRequired: false,
    expiringSoon: false,
    needsReview: false,
    status: "active",
  });

  useEffect(() => {
    setLoading(true);
    getPromotions({
      bank: filter.bank || undefined,
      registrationRequired: filter.registrationRequired || undefined,
      expiringSoon: filter.expiringSoon || undefined,
      needsReview: filter.needsReview || undefined,
      status: filter.status,
    })
      .then(setPromotions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <PageHeader title="優惠" subtitle={`共 ${promotions.length} 項`} />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filter.bank}
          onChange={(e) => setFilter({ ...filter, bank: e.target.value })}
          className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
        >
          <option value="">所有銀行</option>
          {HK_BANKS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
        >
          <option value="active">進行中</option>
          <option value="expired">已過期</option>
          <option value="upcoming">即將開始</option>
        </select>

        <button
          onClick={() =>
            setFilter({
              ...filter,
              registrationRequired: !filter.registrationRequired,
              expiringSoon: false,
              needsReview: false,
            })
          }
          className={`px-2 py-1 text-xs rounded border transition-colors ${
            filter.registrationRequired
              ? "bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
              : "border-slate-300 dark:border-slate-600"
          }`}
        >
          需登記
        </button>

        <button
          onClick={() =>
            setFilter({
              ...filter,
              expiringSoon: !filter.expiringSoon,
              registrationRequired: false,
              needsReview: false,
            })
          }
          className={`px-2 py-1 text-xs rounded border transition-colors ${
            filter.expiringSoon
              ? "bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
              : "border-slate-300 dark:border-slate-600"
          }`}
        >
          即將到期
        </button>

        <button
          onClick={() =>
            setFilter({
              ...filter,
              needsReview: !filter.needsReview,
              registrationRequired: false,
              expiringSoon: false,
            })
          }
          className={`px-2 py-1 text-xs rounded border transition-colors ${
            filter.needsReview
              ? "bg-slate-200 dark:bg-slate-700 border-slate-400"
              : "border-slate-300 dark:border-slate-600"
          }`}
        >
          待審核
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="載入優惠..." />
      ) : promotions.length === 0 ? (
        <EmptyState
          icon="🎉"
          title="未有優惠記錄"
          description="Hermes 會定時更新最新嘅信用卡優惠資訊！"
        />
      ) : (
        <div className="space-y-3">
          {promotions.map((promo) => (
            <div key={promo.id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-xs ${
                        promo.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : promo.status === "expired"
                          ? "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      }`}
                    >
                      {PROMOTION_STATUS_LABELS[promo.status]}
                    </span>
                    {promo.needs_review && (
                      <span className="inline-flex px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                        待審核
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                    {promo.title}
                  </div>
                </div>
                {promo.registration_required && (
                  <PromoRegisterButton promo={promo} />
                )}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                {promo.bank && <div>🏦 {promo.bank}</div>}
                {promo.reward_description && (
                  <div className="text-slate-700 dark:text-slate-300">
                    {promo.reward_description}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {promo.merchant && <span>商戶：{promo.merchant}</span>}
                  {promo.mall && <span>地點：{promo.mall}</span>}
                  {promo.category && <CategoryBadge category={promo.category} size="sm" />}
                  {promo.reward_rate && (
                    <span className="text-primary font-medium">
                      {Number(promo.reward_rate).toFixed(1)}% 回贈
                    </span>
                  )}
                </div>
                {promo.minimum_spend && (
                  <div>最低消費：${Number(promo.minimum_spend).toFixed(0)}</div>
                )}
                {promo.maximum_reward && (
                  <div>最高回贈：${Number(promo.maximum_reward).toFixed(0)}</div>
                )}
                <div className="flex gap-3">
                  {promo.start_date && <span>開始：{promo.start_date}</span>}
                  {promo.end_date && <span>結束：{promo.end_date}</span>}
                </div>
                <div>
                  信心度：{(Number(promo.confidence_score) * 100).toFixed(0)}%
                </div>
                <div>
                  <a
                    href={promo.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    查看來源
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PromoRegisterButton({ promo }: { promo: Promotion }) {
  const [registered, setRegistered] = useState(false);

  async function handleRegister() {
    try {
      await updatePromotionRegistration(promo.id, !registered);
      setRegistered(!registered);
    } catch (err) {
      console.error("Failed to update registration:", err);
    }
  }

  return (
    <button
      onClick={handleRegister}
      className={`px-2 py-1 text-xs rounded border transition-colors shrink-0 ${
        registered
          ? "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
          : "bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
      }`}
    >
      {registered ? "已登記 ✓" : "登記"}
    </button>
  );
}
