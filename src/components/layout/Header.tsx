"use client";

import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Visão geral do sistema de análise de crédito",
  },
  "/analise/pf": {
    title: "Nova Análise — Pessoa Física",
    description: "Análise de crédito baseada nos 6 Cs para PF",
  },
  "/analise/pj": {
    title: "Nova Análise — Pessoa Jurídica",
    description: "Análise de crédito baseada nos 6 Cs para PJ",
  },
  "/historico": {
    title: "Histórico de Análises",
    description: "Todas as análises realizadas pelo motor",
  },
  "/configuracoes": {
    title: "Configurações de APIs",
    description: "Gerencie chaves de integração de terceiros",
  },
  "/logs": {
    title: "Logs do Sistema",
    description: "Registro de eventos e operações",
  },
};

export function Header() {
  const pathname = usePathname();
  const info = pageTitles[pathname] ?? {
    title: "Motor de Crédito",
    description: "",
  };

  return (
    <header className="header">
      <div className="header-content">
        <div>
          <h1 className="header-title">{info.title}</h1>
          {info.description && (
            <p className="header-description">{info.description}</p>
          )}
        </div>
        <div className="header-badge">
          <Shield size={14} />
          <span>Ambiente Seguro</span>
        </div>
      </div>
    </header>
  );
}
