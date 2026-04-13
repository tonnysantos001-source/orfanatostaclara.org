import { AnalysePFForm } from "@/components/forms/AnalysePFForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nova Análise PF | Motor de Crédito",
};

export default function AnalysePFPage() {
  return (
    <div className="page-container">
      <div className="page-intro">
        <div className="six-cs-legend">
          <span className="cs-tag" style={{ color: "#8B5CF6" }}>Caráter</span>
          <span className="cs-tag" style={{ color: "#3B82F6" }}>Capacidade</span>
          <span className="cs-tag" style={{ color: "#10B981" }}>Capital</span>
          <span className="cs-tag" style={{ color: "#F59E0B" }}>Colateral</span>
          <span className="cs-tag" style={{ color: "#EC4899" }}>Condições</span>
          <span className="cs-tag" style={{ color: "#06B6D4" }}>Compliance</span>
        </div>
        <p className="page-description">
          Preencha os dados do cliente para calcular o score de crédito baseado nos 6 Cs.
          Score máximo: <strong>1000 pontos</strong>.
        </p>
      </div>
      <AnalysePFForm />
    </div>
  );
}
