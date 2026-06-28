"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCard } from "@/services/cards";
import { PageHeader } from "@/components/ui/LoadingSpinner";
import { HK_BANKS, CATEGORY_LABELS, REWARD_TYPE_LABELS, NETWORK_LABELS } from "@/lib/constants";
import type { RewardType, CardNetwork, Category } from "@/types/database";

const REWARD_TYPES: RewardType[] = ["cashback", "miles", "points", "discount"];
const NETWORKS: CardNetwork[] = ["Visa", "Mastercard", "Amex", "UnionPay", "JCB"];
const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

interface CategoryRewardInput {
  category: Category;
  reward_rate: string;
  cap_amount: string;
}

export default function NewCardPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categoryRewards, setCategoryRewards] = useState<CategoryRewardInput[]>([]);

  const [form, setForm] = useState({
    bank: HK_BANKS[0],
    card_name: "",
    network: "" as CardNetwork | "",
    reward_type: "cashback" as RewardType,
    reward_currency: "HKD",
    base_reward_rate: "0",
    monthly_cap_amount: "",
    cap_reset_day: "1",
    official_url: "",
    notes: "",
    owner_name: "",
  });

  function addCategoryReward() {
    setCategoryRewards([
      ...categoryRewards,
      { category: "dining", reward_rate: "0", cap_amount: "" },
    ]);
  }

  function removeCategoryReward(index: number) {
    setCategoryRewards(categoryRewards.filter((_, i) => i !== index));
  }

  function updateCategoryReward(index: number, field: keyof CategoryRewardInput, value: string) {
    const updated = [...categoryRewards];
    updated[index] = { ...updated[index], [field]: value };
    setCategoryRewards(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.card_name.trim()) {
      setError("請輸入信用卡名稱");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createCard(
        {
          bank: form.bank,
          card_name: form.card_name.trim(),
          network: (form.network || null) as CardNetwork | null,
          reward_type: form.reward_type,
          reward_currency: form.reward_type === "miles" ? form.reward_currency : null,
          base_reward_rate: parseFloat(form.base_reward_rate) || 0,
          monthly_cap_amount: form.monthly_cap_amount ? parseFloat(form.monthly_cap_amount) : null,
          cap_reset_day: parseInt(form.cap_reset_day) || 1,
          official_url: form.official_url.trim() || null,
          notes: form.notes.trim() || null,
          is_active: true,
          owner_name: form.owner_name.trim() || null,
        },
        categoryRewards
          .filter((r) => parseFloat(r.reward_rate) > 0)
          .map((r) => ({
            category: r.category,
            reward_rate: parseFloat(r.reward_rate),
            cap_amount: r.cap_amount ? parseFloat(r.cap_amount) : null,
            notes: null,
          }))
      );
      router.push("/cards");
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="新增信用卡" />
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bank */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            銀行
          </label>
          <select
            value={form.bank}
            onChange={(e) => setForm({ ...form, bank: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          >
            {HK_BANKS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Card Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            信用卡名稱 *
          </label>
          <input
            type="text"
            value={form.card_name}
            onChange={(e) => setForm({ ...form, card_name: e.target.value })}
            placeholder="例如：HSBC Red Card"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            required
          />
        </div>

        {/* Network + Owner */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              網絡
            </label>
            <select
              value={form.network}
              onChange={(e) => setForm({ ...form, network: e.target.value as CardNetwork | "" })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            >
              <option value="">不指定</option>
              {NETWORKS.map((n) => (
                <option key={n} value={n}>{NETWORK_LABELS[n]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              持卡人
            </label>
            <input
              type="text"
              value={form.owner_name}
              onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
              placeholder="家庭成員名稱"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Reward Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            回贈類型
          </label>
          <div className="grid grid-cols-4 gap-2">
            {REWARD_TYPES.map((rt) => (
              <button
                key={rt}
                type="button"
                onClick={() => setForm({ ...form, reward_type: rt })}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  form.reward_type === rt
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                }`}
              >
                {REWARD_TYPE_LABELS[rt]}
              </button>
            ))}
          </div>
        </div>

        {/* Base Reward Rate + Cap */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              基本回贈率 (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.base_reward_rate}
              onChange={(e) => setForm({ ...form, base_reward_rate: e.target.value })}
              placeholder="例如：2"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              每月回贈上限 ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.monthly_cap_amount}
              onChange={(e) => setForm({ ...form, monthly_cap_amount: e.target.value })}
              placeholder="留空表示無上限"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Cap Reset Day */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            每月上限重置日
          </label>
          <input
            type="number"
            min="1"
            max="31"
            value={form.cap_reset_day}
            onChange={(e) => setForm({ ...form, cap_reset_day: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          />
        </div>

        {/* Official URL */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            官方網址
          </label>
          <input
            type="url"
            value={form.official_url}
            onChange={(e) => setForm({ ...form, official_url: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          />
        </div>

        {/* Category Rewards */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              類別回贈
            </label>
            <button
              type="button"
              onClick={addCategoryReward}
              className="text-xs text-primary hover:text-primary-dark"
            >
              ＋ 新增類別
            </button>
          </div>
          {categoryRewards.length === 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
              如某類別有額外回贈（例如：餐飲4%），請在此設定
            </p>
          )}
          {categoryRewards.map((cr, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <select
                value={cr.category}
                onChange={(e) => updateCategoryReward(i, "category", e.target.value)}
                className="flex-1 px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cr.reward_rate}
                onChange={(e) => updateCategoryReward(i, "reward_rate", e.target.value)}
                placeholder="回贈率%"
                className="w-20 px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={cr.cap_amount}
                onChange={(e) => updateCategoryReward(i, "cap_amount", e.target.value)}
                placeholder="上限$"
                className="w-20 px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm"
              />
              <button
                type="button"
                onClick={() => removeCategoryReward(i)}
                className="text-red-500 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            備註
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            placeholder="其他注意事項..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saving ? "儲存中..." : "新增信用卡"}
        </button>
      </form>
    </div>
  );
}
