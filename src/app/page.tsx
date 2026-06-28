"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActiveCards } from "@/services/cards";
import { getTransactions } from "@/services/transactions";
import { getExpiringPromotions, getPromotionsRequiringRegistration } from "@/services/promotions";
import type { CardWithCategoryRewards, TransactionWithCard, Promotion } from "@/types/database";
import { LoadingSpinner, PageHeader } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DashboardPage() {
  const [cards, setCards] = useState<CardWithCategoryRewards[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithCard[]>([]);
  const [expiringPromos, setExpiringPromos] = useState<Promotion[]>([]);
  const [regPromos, setRegPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [c, t, e, r] = await Promise.all([
          getActiveCards(),
          getTransactions(10),
          getExpiringPromotions(7),
          getPromotionsRequiringRegistration(),
        ]);
        setCards(c);
        setTransactions(t);
        setExpiringPromos(e);
        setRegPromos(r);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner text="載入儀表板..." />;

  const needsSetup = cards.length === 0;

  if (needsSetup) {
    return (
      <EmptyState
        icon="💳"
        title="歡迎使用 WalletBrain"
        description="開始使用前，請先新增你嘅信用卡，等我幫你做智能推薦！"
        actionLabel="新增信用卡"
        actionHref="/cards/new"
      />
    );
  }

  return (
    <div>
      <PageHeader title="WalletBrain" subtitle="智能信用卡助手" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card p-4">
          <div className="text-2xl font-bold text-primary">{cards.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">活躍信用卡</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-primary">{regPromos.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">需要登記優惠</div>
        </div>
      </div>

      {/* Alerts: registration required */}
      {regPromos.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
            ⚠️ 需要登記優惠 ({regPromos.length})
          </h2>
          <div className="space-y-2">
            {regPromos.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="card p-3 border-l-4 border-l-amber-500"
              >
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {p.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {p.bank} · {p.registration_url ? (
                    <a
                      href={p.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      按此登記
                    </a>
                  ) : "請自行登記"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expiring soon */}
      {expiringPromos.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
            ⏰ 即將到期優惠 ({expiringPromos.length})
          </h2>
          <div className="space-y-2">
            {expiringPromos.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="card p-3 border-l-4 border-l-red-500"
              >
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {p.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {p.bank} · 到期日：{p.end_date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            最近交易
          </h2>
          <Link
            href="/transactions"
            className="text-sm text-primary hover:text-primary-dark"
          >
            查看全部
          </Link>
        </div>
        {transactions.length === 0 ? (
          <EmptyState
            icon="📝"
            title="未有交易記錄"
            description="記錄你嘅每筆消費，等我幫你追蹤每月回贈！"
            actionLabel="新增交易"
            actionHref="/transactions/new"
          />
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="card p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {t.merchant || "無備註商戶"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t.cards?.bank} {t.cards?.card_name} · {t.transaction_date}
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  ${Number(t.amount_hkd).toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/recommend"
          className="card p-4 text-center hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">🎯</span>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
            智能推薦
          </div>
        </Link>
        <Link
          href="/transactions/new"
          className="card p-4 text-center hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">➕</span>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
            新增交易
          </div>
        </Link>
      </div>
    </div>
  );
}
