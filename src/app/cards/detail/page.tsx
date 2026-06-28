"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getCard, updateCard, archiveCard, setCategoryRewards } from "@/services/cards";
import { getMonthlySpending } from "@/services/transactions";
import type { CardWithCategoryRewards, Category, RewardType, CardNetwork } from "@/types/database";
import { LoadingSpinner, PageHeader } from "@/components/ui/LoadingSpinner";
import { HK_BANKS, CATEGORY_LABELS, REWARD_TYPE_LABELS, NETWORK_LABELS, CATEGORY_ICONS } from "@/lib/constants";

const REWARD_TYPES = ["cashback", "miles", "points", "discount"] as const;
const NETWORKS = ["Visa", "Mastercard", "Amex", "UnionPay", "JCB"] as const;
const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

function CardDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cardId = searchParams.get("id") || "";

  const [card, setCard] = useState<CardWithCategoryRewards | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [monthlySpent, setMonthlySpent] = useState(0);

  const [form, setForm] = useState({
    bank: "",
    card_name: "",
    network: "" as CardNetwork | "",
    reward_type: "cashback" as RewardType,
    base_reward_rate: "0",
    monthly_cap_amount: "",
    cap_reset_day: "1",
    official_url: "",
    notes: "",
    owner_name: "",
    is_active: true,
  });

  const [catRewards, setCatRewards] = useState<
    { category: Category; reward_rate: string; cap_amount: string }[]
  >([]);

  useEffect(() => {
    if (!cardId) {
      router.push("/cards");
      return;
    }
    async function load() {
      const data = await getCard(cardId);
      if (!data) {
        router.push("/cards");
        return;
      }
      setCard(data);
      setForm({
        bank: data.bank,
        card_name: data.card_name,
        network: data.network || "",
        reward_type: data.reward_type,
        base_reward_rate: String(data.base_reward_rate),
        monthly_cap_amount: data.monthly_cap_amount ? String(data.monthly_cap_amount) : "",
        cap_reset_day: String(data.cap_reset_day),
        official_url: data.official_url || "",
        notes: data.notes || "",
        owner_name: data.owner_name || "",
        is_active: data.is_active,
      });
      setCatRewards(
        (data.category_rewards || []).map((r) => ({
          category: r.category,
          reward_rate: String(r.reward_rate),
          cap_amount: r.cap_amount ? String(r.cap_amount) : "",
        }))
      );

      // Get monthly spending
      const now = new Date();
      const spent = await getMonthlySpent(data.id, now.getFullYear(), now.getMonth() + 1);
      setMonthlySpent(spent);

      setLoading(false);
    }
    load();
  }, [cardId, router]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await updateCard(cardId, {
        bank: form.bank,
        card_name: form.card_name,
        network: (form.network || null) as CardNetwork | null,
        reward_type: form.reward_type,
        base_reward_rate: parseFloat(form.base_reward_rate) || 0,
        monthly_cap_amount: form.monthly_cap_amount ? parseFloat(form.monthly_cap_amount) : null,
        cap_reset_day: parseInt(form.cap_reset_day) || 1,
        official_url: form.official_url || null,
        notes: form.notes || null,
        owner_name: form.owner_name || null,
        is_active: form.is_active,
      });

      await setCategoryRewards(
        cardId,
        catRewards
          .filter((r) => parseFloat(r.reward_rate) > 0)
          .map((r) => ({
            category: r.category,
            reward_rate: parseFloat(r.reward_rate),
            cap_amount: r.cap_amount ? parseFloat(r.cap_amount) : null,
            notes: null,
          }))
      );

      setEditing(false);
      const updated = await getCard(cardId);
      if (updated) setCard(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    if (!confirm("確定要停用此信用卡？")) return;
    try {
      await archiveCard(cardId);
      router.push("/cards");
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失敗");
    }
  }

  if (loading) return <LoadingSpinner text="載入信用卡..." />;
  if (!card) return null;

  if (!editing) {
    // View mode
    const capRemaining = card.monthly_cap_amount
      ? Math.max(0, Number(card.monthly_cap_amount) - monthlySpent)
      : null;

    return (
      <div>
        <PageHeader
          title={card.card_name}
          subtitle={card.bank}
          action={
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 text-sm text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
            >
              編輯
            </button>
          }
        />

        <div className="space-y-4">
          {/* Status */}
          <div className="card p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-500 dark:text-slate-400 mb-1">狀態</div>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                    card.is_active
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {card.is_active ? "啟用" : "已停用"}
                </span>
              </div>
              <div>
                <div className="text-slate-500 dark:text-slate-400 mb-1">網絡</div>
                <div className="text-slate-800 dark:text-slate-200">
                  {card.network || "—"}
                </div>
              </div>
              <div>
                <div className="text-slate-500 dark:text-slate-400 mb-1">回贈類型</div>
                <div className="text-slate-800 dark:text-slate-200">
                  {REWARD_TYPE_LABELS[card.reward_type]}
                </div>
              </div>
              <div>
                <div className="text-slate-500 dark:text-slate-400 mb-1">基本回贈率</div>
                <div className="text-slate-800 dark:text-slate-200">
                  {Number(card.base_reward_rate).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Cap usage */}
          {card.monthly_cap_amount && (
            <div className="card p-4">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                每月回贈使用情況
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all ${
                    monthlySpent >= Number(card.monthly_cap_amount)
                      ? "bg-red-500"
                      : monthlySpent / Number(card.monthly_cap_amount) > 0.8
                      ? "bg-amber-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(100, (monthlySpent / Number(card.monthly_cap_amount)) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>已使用 ${monthlySpent.toFixed(0)}</span>
                <span>上限 ${Number(card.monthly_cap_amount).toFixed(0)}</span>
              </div>
              {capRemaining !== null && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  剩餘 ${capRemaining.toFixed(0)} · 每月{card.cap_reset_day}號重置
                </div>
              )}
            </div>
          )}

          {/* Category rewards */}
          {card.category_rewards && card.category_rewards.length > 0 && (
            <div className="card p-4">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                類別回贈
              </div>
              <div className="space-y-2">
                {card.category_rewards.map((cr) => (
                  <div
                    key={cr.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-700 dark:text-slate-300">
                      {CATEGORY_ICONS[cr.category]} {CATEGORY_LABELS[cr.category]}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {Number(cr.reward_rate).toFixed(1)}%
                      {cr.cap_amount && ` (上限 $${Number(cr.cap_amount).toFixed(0)})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {card.notes && (
            <div className="card p-4">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">備註</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{card.notes}</div>
            </div>
          )}

          {card.official_url && (
            <a
              href={card.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 block text-sm text-primary hover:underline"
            >
              🔗 查看官方網頁
            </a>
          )}

          <button
            onClick={handleArchive}
            className="w-full py-3 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            {card.is_active ? "停用此信用卡" : "此卡已停用"}
          </button>
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div>
      <PageHeader title={card.card_name} subtitle="編輯信用卡" />
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="space-y-4">
        {/* Bank */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">銀行</label>
          <select
            value={form.bank}
            onChange={(e) => setForm({ ...form, bank: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
          >
            {HK_BANKS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">信用卡名稱</label>
          <input type="text" value={form.card_name} onChange={(e) => setForm({ ...form, card_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">網絡</label>
            <select value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value as CardNetwork | "" })} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm">
              <option value="">不指定</option>
              {NETWORKS.map((n) => <option key={n} value={n}>{NETWORK_LABELS[n]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">回贈類型</label>
            <select value={form.reward_type} onChange={(e) => setForm({ ...form, reward_type: e.target.value as typeof form.reward_type })} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm">
              {REWARD_TYPES.map((rt) => <option key={rt} value={rt}>{REWARD_TYPE_LABELS[rt]}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">基本回贈率 (%)</label>
            <input type="number" step="0.01" value={form.base_reward_rate} onChange={(e) => setForm({ ...form, base_reward_rate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">每月回贈上限 ($)</label>
            <input type="number" step="0.01" value={form.monthly_cap_amount} onChange={(e) => setForm({ ...form, monthly_cap_amount: e.target.value })} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">激活狀態</label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            <span className="text-sm text-slate-700 dark:text-slate-300">啟用</span>
          </label>
        </div>

        {/* Category rewards edit */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">類別回贈</label>
            <button type="button" onClick={() => setCatRewards([...catRewards, { category: "dining", reward_rate: "0", cap_amount: "" }])} className="text-xs text-primary">＋ 新增</button>
          </div>
          {catRewards.map((cr, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <select value={cr.category} onChange={(e) => { const u = [...catRewards]; u[i] = { ...u[i], category: e.target.value as Category }; setCatRewards(u); }} className="flex-1 px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
              <input type="number" step="0.01" value={cr.reward_rate} onChange={(e) => { const u = [...catRewards]; u[i] = { ...u[i], reward_rate: e.target.value }; setCatRewards(u); }} className="w-20 px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm" placeholder="%" />
              <input type="number" step="0.01" value={cr.cap_amount} onChange={(e) => { const u = [...catRewards]; u[i] = { ...u[i], cap_amount: e.target.value }; setCatRewards(u); }} className="w-20 px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm" placeholder="$上限" />
              <button type="button" onClick={() => setCatRewards(catRewards.filter((_, idx) => idx !== i))} className="text-red-500 text-sm">✕</button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => setEditing(false)} className="flex-1 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">取消</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">{saving ? "儲存中..." : "儲存"}</button>
        </div>
      </div>
    </div>
  );
}

export default function CardDetailPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="載入信用卡..." />}>
      <CardDetailContent />
    </Suspense>
  );
}

async function getMonthlySpent(cardId: string, year: number, month: number): Promise<number> {
  try {
    return await getMonthlySpending(cardId, year, month);
  } catch {
    return 0;
  }
}
