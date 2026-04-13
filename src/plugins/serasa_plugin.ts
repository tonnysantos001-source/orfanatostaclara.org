/**
 * Serasa Experian Plugin
 *
 * Interface for future integration with Serasa's credit APIs.
 * Currently a stub — all methods return mock/empty responses.
 *
 * Future integration:
 * 1. Set SERASA_API_KEY via /configuracoes panel (stored encrypted in DB)
 * 2. Implement each method using the official Serasa SDK or REST API
 */

export interface SerasaScoreResponse {
  score: number;
  riskClass: string;
  lastUpdated: string;
  source: "SERASA";
}

export interface SerasaDebtResponse {
  hasDebts: boolean;
  totalDebt: number;
  debts: Array<{
    creditor: string;
    amount: number;
    daysLate: number;
    nature: string;
  }>;
}

export class SerasaPlugin {
  private apiKey: string | null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? null;
  }

  /**
   * Fetches the Serasa credit score for a given CPF.
   * @param cpf - CPF sem formatação (apenas números)
   */
  async getCreditScore(cpf: string): Promise<SerasaScoreResponse | null> {
    // TODO: Implement Serasa API call
    // const response = await fetch(`https://api.serasaexperian.com.br/credit-score/${cpf}`, {
    //   headers: { 'Authorization': `Bearer ${this.apiKey}` }
    // })
    console.log("[SerasaPlugin] getCreditScore chamado para CPF:", cpf.slice(0, 3) + "...");
    return null;
  }

  /**
   * Fetches debt information for a given CPF or CNPJ.
   * @param document - CPF ou CNPJ sem formatação
   */
  async getDebts(document: string): Promise<SerasaDebtResponse | null> {
    // TODO: Implement Serasa debt API call
    console.log("[SerasaPlugin] getDebts chamado para documento:", document.slice(0, 3) + "...");
    return null;
  }

  /**
   * Checks if a person/company is negative in Serasa.
   * @param document - CPF ou CNPJ sem formatação
   */
  async isNegative(document: string): Promise<boolean> {
    // TODO: Implement
    console.log("[SerasaPlugin] isNegative chamado");
    return false;
  }

  /**
   * Returns true if the plugin is configured and ready to use.
   */
  isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }
}
