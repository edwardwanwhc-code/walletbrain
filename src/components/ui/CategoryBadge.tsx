"use client";

import Link from "next/link";
import { CATEGORY_ICONS } from "@/lib/constants";
import type { Category } from "@/types/database";

interface CategoryBadgeProps {
  category: string;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, size = "md" }: CategoryBadgeProps) {
  const icon = CATEGORY_ICONS[category] || "📌";
  const sizeClass = size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 ${sizeClass}`}
    >
      {icon}
    </span>
  );
}

interface SectionTitleProps {
  title: string;
  linkHref?: string;
  linkLabel?: string;
}

export function SectionTitle({ title, linkHref, linkLabel }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </h2>
      {linkHref && (
        <Link
          href={linkHref}
          className="text-sm text-primary hover:text-primary-dark transition-colors"
        >
          {linkLabel || "查看全部"}
        </Link>
      )}
    </div>
  );
}
