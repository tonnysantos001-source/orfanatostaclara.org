import { validateCEP, hasSuspiciousData } from "./validators";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PFInput {
  nome: string;
  cpf: string;
  rendaMensal: number;
  valorParcela: number;
  cep: string;
  idade: number;
  profissao: string;
}

export interface PJInput {
  razaoSocial: string;
  cnpj: string;
  faturamentoMensal: number;
  valorParcela: number;
  cep: string;
  tempoEmpresaMeses: number;
}

export interface ScoreBreakdown {
  category: string;
  points: number;
  maxPoints: number;
  reason: string;
  percentage: number;
}

export interface ScoreResult {
  totalScore: number;
  decision: "APROVADO" | "APROVADO_COM_LIMITE" | "ANALISE_MANUAL" | "RECUSADO";
  decisionLabel: string;
  limiteSugerido: number;
  breakdown: ScoreBreakdown[];
  maxPossibleScore: number;
}

// ─── Decision Logic ───────────────────────────────────────────────────────────

function getDecision(score: number): ScoreResult["decision"] {
  if (score >= 750) return "APROVADO";
  if (score >= 600) return "APROVADO_COM_LIMITE";
  if (score >= 400) return "ANALISE_MANUAL";
  return "RECUSADO";
}

function getDecisionLabel(decision: ScoreResult["decision"]): string {
  const labels: Record<ScoreResult["decision"], string> = {
    APROVADO: "Aprovado",
    APROVADO_COM_LIMITE: "Aprovado com Limite",
    ANALISE_MANUAL: "Análise Manual",
    RECUSADO: "Recusado",
  };
  return labels[decision];
}

function buildBreakdown(
  category: string,
  points: number,
  maxPoints: number,
  reasons: string[]
): ScoreBreakdown {
  return {
    category,
    points: Math.max(0, points),
    maxPoints,
    reason: reasons.length > 0 ? reasons.join("; ") : "Sem pontuação nesta categoria",
    percentage: Math.round((Math.max(0, points) / maxPoints) * 100),
  };
}

// ─── PF Score Calculator ──────────────────────────────────────────────────────

export function calculateScorePF(input: PFInput): ScoreResult {
  const breakdown: ScoreBreakdown[] = [];
  let total = 0;

  // ── CARÁTER (0–200) ──────────────────────────────────────────────────────
  let carater = 0;
  const caraterReasons: string[] = [];

  if (input.idade > 25) {
    carater += 40;
    caraterReasons.push("Idade acima de 25 anos (+40)");
  }
  if (validateCEP(input.cep)) {
    carater += 20;
    caraterReasons.push("CEP válido (+20)");
  }
  if (input.nome.trim().length >= 3) {
    carater += 20;
    caraterReasons.push("Nome preenchido (+20)");
  }
  if (
    hasSuspiciousData({
      nome: input.nome,
      cep: input.cep,
      profissao: input.profissao,
    })
  ) {
    carater -= 80;
    caraterReasons.push("⚠️ Dados suspeitos detectados (-80)");
  }

  breakdown.push(buildBreakdown("Caráter", carater, 200, caraterReasons));
  total += Math.max(0, carater);

  // ── CAPACIDADE (0–250) ───────────────────────────────────────────────────
  const ratio =
    input.valorParcela > 0 ? input.rendaMensal / input.valorParcela : 0;
  let capacidade = 0;
  let capacidadeReason = "";

  if (ratio >= 6) {
    capacidade = 250;
    capacidadeReason = `Renda/Parcela = ${ratio.toFixed(1)}× (≥6 → +250)`;
  } else if (ratio >= 4) {
    capacidade = 180;
    capacidadeReason = `Renda/Parcela = ${ratio.toFixed(1)}× (≥4 → +180)`;
  } else if (ratio >= 3) {
    capacidade = 120;
    capacidadeReason = `Renda/Parcela = ${ratio.toFixed(1)}× (≥3 → +120)`;
  } else if (ratio >= 2) {
    capacidade = 60;
    capacidadeReason = `Renda/Parcela = ${ratio.toFixed(1)}× (≥2 → +60)`;
  } else {
    capacidade = 0;
    capacidadeReason = `Renda/Parcela = ${ratio.toFixed(1)}× (<2 → 0)`;
  }

  breakdown.push(buildBreakdown("Capacidade", capacidade, 250, [capacidadeReason]));
  total += capacidade;

  // ── CAPITAL (0–150) ──────────────────────────────────────────────────────
  const capital = input.rendaMensal > 3 * input.valorParcela ? 150 : 0;
  breakdown.push(
    buildBreakdown("Capital", capital, 150, [
      capital > 0
        ? "Renda mensal > 3× o valor da parcela (+150)"
        : "Renda mensal não supera 3× a parcela",
    ])
  );
  total += capital;

  // ── COLATERAL (0–150) ────────────────────────────────────────────────────
  const colateral = input.idade > 30 ? 150 : 0;
  breakdown.push(
    buildBreakdown("Colateral", colateral, 150, [
      colateral > 0
        ? "Idade acima de 30 anos (+150)"
        : "Idade igual ou inferior a 30 anos",
    ])
  );
  total += colateral;

  // ── CONDIÇÕES (0–100) ────────────────────────────────────────────────────
  const percentual =
    input.rendaMensal > 0
      ? (input.valorParcela / input.rendaMensal) * 100
      : 100;
  const condicoes = percentual < 30 ? 100 : 0;
  breakdown.push(
    buildBreakdown("Condições", condicoes, 100, [
      condicoes > 0
        ? `Parcela representa ${percentual.toFixed(1)}% da renda (< 30% → +100)`
        : `Parcela representa ${percentual.toFixed(1)}% da renda (≥ 30%)`,
    ])
  );
  total += condicoes;

  // ── COMPLIANCE (0–150) ───────────────────────────────────────────────────
  // CPF already validated before reaching this function
  breakdown.push(buildBreakdown("Compliance", 150, 150, ["CPF validado com sucesso (+150)"]));
  total += 150;

  const finalScore = Math.min(1000, total);
  const decision = getDecision(finalScore);

  return {
    totalScore: finalScore,
    decision,
    decisionLabel: getDecisionLabel(decision),
    limiteSugerido: input.rendaMensal * 4,
    breakdown,
    maxPossibleScore: 1000,
  };
}

// ─── PJ Score Calculator ──────────────────────────────────────────────────────

export function calculateScorePJ(input: PJInput): ScoreResult {
  const breakdown: ScoreBreakdown[] = [];
  let total = 0;

  // ── CARÁTER (0–200) ──────────────────────────────────────────────────────
  let carater = 0;
  const caraterReasons: string[] = [];

  // Proxy de "maturidade" para PJ: empresa com mais de 36 meses ≙ idade > 25
  if (input.tempoEmpresaMeses > 36) {
    carater += 40;
    caraterReasons.push("Empresa com mais de 36 meses (+40)");
  }
  if (validateCEP(input.cep)) {
    carater += 20;
    caraterReasons.push("CEP válido (+20)");
  }
  if (input.razaoSocial.trim().length >= 3) {
    carater += 20;
    caraterReasons.push("Razão social preenchida (+20)");
  }
  if (
    hasSuspiciousData({
      razaoSocial: input.razaoSocial,
      cep: input.cep,
    })
  ) {
    carater -= 80;
    caraterReasons.push("⚠️ Dados suspeitos detectados (-80)");
  }

  breakdown.push(buildBreakdown("Caráter", carater, 200, caraterReasons));
  total += Math.max(0, carater);

  // ── CAPACIDADE (0–250) ───────────────────────────────────────────────────
  const ratio =
    input.valorParcela > 0
      ? input.faturamentoMensal / input.valorParcela
      : 0;
  let capacidade = 0;
  let capacidadeReason = "";

  if (ratio >= 6) {
    capacidade = 250;
    capacidadeReason = `Faturamento/Parcela = ${ratio.toFixed(1)}× (≥6 → +250)`;
  } else if (ratio >= 4) {
    capacidade = 180;
    capacidadeReason = `Faturamento/Parcela = ${ratio.toFixed(1)}× (≥4 → +180)`;
  } else if (ratio >= 3) {
    capacidade = 120;
    capacidadeReason = `Faturamento/Parcela = ${ratio.toFixed(1)}× (≥3 → +120)`;
  } else if (ratio >= 2) {
    capacidade = 60;
    capacidadeReason = `Faturamento/Parcela = ${ratio.toFixed(1)}× (≥2 → +60)`;
  } else {
    capacidade = 0;
    capacidadeReason = `Faturamento/Parcela = ${ratio.toFixed(1)}× (<2 → 0)`;
  }

  breakdown.push(buildBreakdown("Capacidade", capacidade, 250, [capacidadeReason]));
  total += capacidade;

  // ── CAPITAL (0–150) ──────────────────────────────────────────────────────
  const capital = input.faturamentoMensal > 3 * input.valorParcela ? 150 : 0;
  breakdown.push(
    buildBreakdown("Capital", capital, 150, [
      capital > 0
        ? "Faturamento mensal > 3× o valor da parcela (+150)"
        : "Faturamento mensal não supera 3× a parcela",
    ])
  );
  total += capital;

  // ── COLATERAL (0–150) ────────────────────────────────────────────────────
  const colateral = input.tempoEmpresaMeses > 24 ? 150 : 0;
  breakdown.push(
    buildBreakdown("Colateral", colateral, 150, [
      colateral > 0
        ? "Empresa com mais de 24 meses de operação (+150)"
        : "Empresa com menos de 24 meses de operação",
    ])
  );
  total += colateral;

  // ── CONDIÇÕES (0–100) ────────────────────────────────────────────────────
  const percentual =
    input.faturamentoMensal > 0
      ? (input.valorParcela / input.faturamentoMensal) * 100
      : 100;
  const condicoes = percentual < 30 ? 100 : 0;
  breakdown.push(
    buildBreakdown("Condições", condicoes, 100, [
      condicoes > 0
        ? `Parcela representa ${percentual.toFixed(1)}% do faturamento (< 30% → +100)`
        : `Parcela representa ${percentual.toFixed(1)}% do faturamento (≥ 30%)`,
    ])
  );
  total += condicoes;

  // ── COMPLIANCE (0–150) ───────────────────────────────────────────────────
  breakdown.push(buildBreakdown("Compliance", 150, 150, ["CNPJ validado com sucesso (+150)"]));
  total += 150;

  const finalScore = Math.min(1000, total);
  const decision = getDecision(finalScore);

  return {
    totalScore: finalScore,
    decision,
    decisionLabel: getDecisionLabel(decision),
    limiteSugerido: input.faturamentoMensal * 2,
    breakdown,
    maxPossibleScore: 1000,
  };
}
