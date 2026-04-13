"use client";

type Decision =
  | "APROVADO"
  | "APROVADO_COM_LIMITE"
  | "ANALISE_MANUAL"
  | "RECUSADO";

interface DecisionBadgeProps {
  decision: Decision;
  size?: "sm" | "md" | "lg";
}

const config: Record<
  Decision,
  { label: string; className: string }
> = {
  APROVADO: {
    label: "✓ Aprovado",
    className: "badge-approved",
  },
  APROVADO_COM_LIMITE: {
    label: "◑ Aprovado c/ Limite",
    className: "badge-approved-limit",
  },
  ANALISE_MANUAL: {
    label: "⏳ Análise Manual",
    className: "badge-manual",
  },
  RECUSADO: {
    label: "✕ Recusado",
    className: "badge-rejected",
  },
};

export function DecisionBadge({ decision, size = "md" }: DecisionBadgeProps) {
  const { label, className } = config[decision] ?? config.RECUSADO;
  return (
    <span className={`badge badge-${size} ${className}`}>{label}</span>
  );
}
