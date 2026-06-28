"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveCards } from "@/services/cards";
import { createTransaction } from "@/services/transactions";
import type { CardWithCategoryRewards, Category } from "@/types/database";
import { LoadingSpinner, PageHeader } from "@/components/ui/LoadingSpinner";
import { CATEGORY_LABELS } from "@/lib/constants";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export default function NewTransactionPage() {
  const router = useRouter();
  const [cards, setCards] = useState<CardWithCategoryRewards[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    card_id: "",
    transaction_date: today,
    amount_hkd: "",
    merchant: "",
    location: "",
    category: "dining" as Category,
    notes: "",
  });

  useEffect(() => {
    getActiveCards()
      .then((c) => {
        setCards(c);
        if (c.length > 0) setForm((f) => ({ ...f, card_id: c[0].id }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.card_id) {
      setError("請選擇信用卡");
      return;
    }
    if (!form.amount_hkd || parseFloat(form.amount_hkd) <= 0) {
      setError("請輸入有效金額");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createTransaction({
        card_id: form.card_id,
        transaction_date: form.transaction_date,
        amount_hkd: parseFloat(form.amount_hkd),
        merchant: form.merchant.trim() || null,
        location: form.location.trim() || null,
        category: form.category,
        notes: form.notes.trim() || null,
      });
      router.push("/transactions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner text="載入中..." />;

  return (
    <div>
      <PageHeader title="新增交易" />
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            信用卡 *
          </label>
          <select
            value={form.card_id}
            onChange={(e) => setForm({ ...form, card_id: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
            required
          >
            <option value="">選擇信用卡</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.bank} {c.card_name}
              </option>
            ))}
          </select>
        </div>

        {/* Amount + Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              金額 (HKD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount_hkd}
              onChange={(e) => setForm({ ...form, amount_hkd: e.target.value })}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              日期
            </label>
            <input
              type="date"
              value={form.transaction_date}
              onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
              required
            />
          </div>
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
              placeholder="例如：又一城"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            類別 *
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            備註
          </label>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="其他資訊..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saving ? "儲存中..." : "新增交易"}
        </button>
      </form>
    </div>
  );
}
