// ─── CPF Validation ──────────────────────────────────────────────────────────

/**
 * Validates a CPF (Brazilian individual taxpayer number).
 * Accepts formats: 000.000.000-00 or 00000000000
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  // Reject all-same-digit sequences
  if (/^(\d)\1+$/.test(cleaned)) return false;

  const calcDigit = (digits: string, factor: number): number => {
    let sum = 0;
    for (const d of digits) {
      sum += parseInt(d) * factor--;
    }
    const rest = (sum * 10) % 11;
    return rest === 10 || rest === 11 ? 0 : rest;
  };

  const d1 = calcDigit(cleaned.slice(0, 9), 10);
  if (d1 !== parseInt(cleaned[9])) return false;
  const d2 = calcDigit(cleaned.slice(0, 10), 11);
  return d2 === parseInt(cleaned[10]);
}

// ─── CNPJ Validation ─────────────────────────────────────────────────────────

/**
 * Validates a CNPJ (Brazilian company taxpayer number).
 * Accepts formats: 00.000.000/0000-00 or 00000000000000
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  const calcDigit = (digits: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      sum += parseInt(digits[i]) * weights[i];
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calcDigit(cleaned.slice(0, 12), w1);
  if (d1 !== parseInt(cleaned[12])) return false;
  const d2 = calcDigit(cleaned.slice(0, 13), w2);
  return d2 === parseInt(cleaned[13]);
}

// ─── CEP Validation ──────────────────────────────────────────────────────────

/**
 * Validates a Brazilian ZIP code (CEP).
 * Accepts formats: 00000-000 or 00000000
 */
export function validateCEP(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, "");
  if (cleaned.length !== 8) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  return true;
}

// ─── Format Helpers ───────────────────────────────────────────────────────────

export function formatCPF(cpf: string): string {
  const c = cpf.replace(/\D/g, "").slice(0, 11);
  return c
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatCNPJ(cnpj: string): string {
  const c = cnpj.replace(/\D/g, "").slice(0, 14);
  return c
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function formatCEP(cep: string): string {
  const c = cep.replace(/\D/g, "").slice(0, 8);
  return c.replace(/(\d{5})(\d)/, "$1-$2");
}

// ─── Suspicious Data Detection ────────────────────────────────────────────────

const SUSPICIOUS_PATTERNS = [
  "teste",
  "test",
  "aaa",
  "xxx",
  "fake",
  "falso",
  "nenhum",
  "none",
  "null",
  "undefined",
];

export function hasSuspiciousData(values: Record<string, unknown>): boolean {
  return Object.values(values).some((v) => {
    const str = String(v).toLowerCase().trim();
    return SUSPICIOUS_PATTERNS.some((p) => str.includes(p));
  });
}
