"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTransactions } from "@/services/transactions";
import type { TransactionWithCard } from "@/types/database";
import { LoadingSpinner, PageHeader } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryBadge } from "@/components/ui/CategoryBadge";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="載入交易記錄..." />;

  return (
    <div>
      <PageHeader
        title="交易記錄"
        action={
          <Link
            href="/transactions/new"
            className="inline-flex items-center px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            ＋ 新增
          </Link>
        }
      />

      {transactions.length === 0 ? (
        <EmptyState
          icon="📝"
          title="未有交易記錄"
          description="記錄每筆消費，幫你追蹤回贈及每月上限使用情況！"
          actionLabel="新增交易"
          actionHref="/transactions/new"
        />
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <div key={t.id} className="card p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {t.merchant || "無備註商戶"}
                    </span>
                    <CategoryBadge category={t.category} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>{t.transaction_date}</span>
                    {t.cards && (
                      <span>
                        · {t.cards.bank} {t.cards.card_name}
                      </span>
                    )}
                    {t.location && <span>· {t.location}</span>}
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 ml-3">
                  ${Number(t.amount_hkd).toFixed(0)}
                </div>
              </div>
              {t.notes && (
                <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">{t.notes}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
