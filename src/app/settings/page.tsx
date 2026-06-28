"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/LoadingSpinner";
import Link from "next/link";

export default function SettingsPage() {
  const [supabaseUrl, setSupabaseUrl] = useState(
    process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  );

  return (
    <div>
      <PageHeader title="設定" subtitle="WalletBrain 個人化設定" />

      <div className="space-y-4">
        {/* Connection status */}
        <div className="card p-4">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            連接狀態
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Supabase</span>
              <span
                className={`inline-flex items-center gap-1 text-xs ${
                  supabaseUrl
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    supabaseUrl ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                {supabaseUrl ? "已連接" : "未設定"}
              </span>
            </div>
          </div>
        </div>

        {/* Environment status */}
        <div className="card p-4">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            環境變數
          </div>
          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <div>NEXT_PUBLIC_SUPABASE_URL: {supabaseUrl || "未設定"}</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "已設定 ✓" : "未設定"}</div>
            <div>CRON_SECRET: {process.env.NEXT_PUBLIC_CRON_SECRET ? "已設定 ✓" : "未設定（暫不影響使用）"}</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              請確認 .env 檔案已設定以上環境變數。詳情請參考 .env.example。
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div className="card p-4">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            快速連結
          </div>
          <div className="space-y-2">
            <Link
              href="/"
              className="block text-sm text-primary hover:underline"
            >
              📊 儀表板
            </Link>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-primary hover:underline"
            >
              🗄️ Supabase 控制台
            </a>
          </div>
        </div>

        {/* About */}
        <div className="card p-4">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            關於 WalletBrain
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p>版本：1.0.0 MVP</p>
            <p>個人及家庭用香港信用卡智能助手</p>
            <p>幫助你快速決定用邊張信用卡消費最抵</p>
            <p className="mt-2">技術棧：Next.js · TypeScript · Tailwind CSS · Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
