"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "主頁", icon: "📊" },
  { href: "/cards", label: "信用卡", icon: "💳" },
  { href: "/transactions", label: "交易", icon: "📝" },
  { href: "/recommend", label: "推薦", icon: "🎯" },
  { href: "/promotions", label: "優惠", icon: "🎉" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="mobile-nav">
      <div className="flex justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${
              isActive(item.href) ? "active" : ""
            }`}
          >
            <span className="text-lg mb-0.5">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
