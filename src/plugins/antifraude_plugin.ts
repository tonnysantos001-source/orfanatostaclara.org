/**
 * Antifraude Plugin
 *
 * Interface for future integration with fraud detection services
 * (e.g., ClearSale, Konduto, BigData Corp, Neurotech).
 * Currently a stub — all methods return safe/empty responses.
 *
 * Future integration:
 * 1. Set ANTIFRAUDE_API_KEY via /configuracoes panel (stored encrypted in DB)
 * 2. Choose a provider and implement the methods below
 */

export interface FraudCheckResult {
  isFraud: boolean;
  riskScore: number; // 0–100 (higher = more risky)
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  flags: string[];
  provider: string;
  checkedAt: string;
}

export interface DeviceCheckResult {
  deviceId: string;
  isKnownDevice: boolean;
  isEmulator: boolean;
  location: {
    country: string;
    region: string;
    city: string;
  } | null;
}

export interface IdentityCheckResult {
  documentMatch: boolean;
  facialMatch: boolean | null; // null if not checked
  cpfOwnerName: string | null;
  cpfSituation: "REGULAR" | "SUSPENDED" | "CANCELLED" | "UNKNOWN";
}

export class AntiFraudePlugin {
  private apiKey: string | null;
  private provider: string;

  constructor(apiKey?: string, provider = "custom") {
    this.apiKey = apiKey ?? null;
    this.provider = provider;
  }

  /**
   * Runs a fraud check against a CPF or CNPJ.
   * @param document - CPF ou CNPJ sem formatação
   * @param context - Additional context (IP, device info, etc.)
   */
  async checkFraud(
    document: string,
    context?: Record<string, unknown>
  ): Promise<FraudCheckResult | null> {
    // TODO: Implement antifraude API call
    console.log(
      "[AntiFraudePlugin] checkFraud chamado para documento:",
      document.slice(0, 3) + "...",
      context ? "com contexto" : "sem contexto"
    );
    return null;
  }

  /**
   * Checks device fingerprint and geolocation.
   * @param deviceFingerprint - Device fingerprint hash
   */
  async checkDevice(deviceFingerprint: string): Promise<DeviceCheckResult | null> {
    // TODO: Implement device check
    console.log("[AntiFraudePlugin] checkDevice chamado:", deviceFingerprint.slice(0, 8) + "...");
    return null;
  }

  /**
   * Validates identity document against government databases.
   * @param cpf - CPF sem formatação
   * @param nome - Nome completo para conferência
   */
  async checkIdentity(cpf: string, nome: string): Promise<IdentityCheckResult | null> {
    // TODO: Implement identity validation (e.g., via Receita Federal API)
    console.log("[AntiFraudePlugin] checkIdentity chamado para:", nome.split(" ")[0] + "...");
    return null;
  }

  /**
   * Generates a risk score based on all available signals.
   * @param document - CPF ou CNPJ
   * @returns Risk score 0–100
   */
  async getRiskScore(document: string): Promise<number> {
    // TODO: Implement composite risk scoring
    console.log("[AntiFraudePlugin] getRiskScore chamado");
    return 0;
  }

  isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  getProvider(): string {
    return this.provider;
  }
}
