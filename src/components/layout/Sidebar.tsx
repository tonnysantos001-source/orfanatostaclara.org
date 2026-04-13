"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UserCheck,
  Building2,
  History,
  Settings,
  ScrollText,
  LogOut,
  Zap,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/analise/pf",
    label: "Nova Análise PF",
    icon: UserCheck,
  },
  {
    href: "/analise/pj",
    label: "Nova Análise PJ",
    icon: Building2,
  },
  {
    href: "/historico",
    label: "Histórico",
    icon: History,
  },
  {
    href: "/configuracoes",
    label: "Configurações de APIs",
    icon: Settings,
  },
  {
    href: "/logs",
    label: "Logs",
    icon: ScrollText,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Zap size={20} />
        </div>
        <div>
          <div className="logo-title">Motor de Crédito</div>
          <div className="logo-sub">Super Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "nav-item-active" : ""}`}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
              {isActive && <span className="nav-indicator" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
