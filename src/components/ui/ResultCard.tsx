"use client";

import { ScoreMeter } from "./ScoreMeter";
import { DecisionBadge } from "./Badge";

interface ScoreBreakdown {
  category: string;
  points: number;
  maxPoints: number;
  reason: string;
  percentage: number;
}

interface ResultCardProps {
  score: number;
  decision: "APROVADO" | "APROVADO_COM_LIMITE" | "ANALISE_MANUAL" | "RECUSADO";
  decisionLabel: string;
  limiteSugerido: number;
  breakdown: ScoreBreakdown[];
  type: "PF" | "PJ";
  analysisId: string;
}

const categoryColors: Record<string, string> = {
  "Caráter": "#8B5CF6",
  "Capacidade": "#3B82F6",
  "Capital": "#10B981",
  "Colateral": "#F59E0B",
  "Condições": "#EC4899",
  "Compliance": "#06B6D4",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function ResultCard({
  score,
  decision,
  decisionLabel,
  limiteSugerido,
  breakdown,
  type,
  analysisId,
}: ResultCardProps) {
  return (
    <div className="result-card">
      {/* Header */}
      <div className="result-header">
        <div className="result-type-badge">
          {type === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
        </div>
        <div className="result-id">ID: {analysisId.slice(0, 8)}...</div>
      </div>

      {/* Score and Decision */}
      <div className="result-score-section">
        <ScoreMeter score={score} size={180} />
        <div className="result-decision-info">
          <DecisionBadge decision={decision} size="lg" />
          <p className="result-decision-label">{decisionLabel}</p>
          <div className="result-limit">
            <span className="result-limit-label">
              {type === "PF" ? "Limite Sugerido" : "Crédito Sugerido"}
            </span>
            <span className="result-limit-value">
              {formatCurrency(limiteSugerido)}
            </span>
          </div>
        </div>
      </div>

      {/* 6 Cs Breakdown */}
      <div className="breakdown-section">
        <h3 className="breakdown-title">Detalhamento dos 6 Cs</h3>
        <div className="breakdown-grid">
          {breakdown.map((item) => {
            const color = categoryColors[item.category] ?? "#6B7280";
            return (
              <div key={item.category} className="breakdown-item">
                <div className="breakdown-header">
                  <span
                    className="breakdown-category"
                    style={{ color }}
                  >
                    {item.category}
                  </span>
                  <span className="breakdown-points">
                    {item.points}
                    <span className="breakdown-max">/{item.maxPoints}</span>
                  </span>
                </div>
                <div className="breakdown-bar-track">
                  <div
                    className="breakdown-bar-fill"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <p className="breakdown-reason">{item.reason}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
