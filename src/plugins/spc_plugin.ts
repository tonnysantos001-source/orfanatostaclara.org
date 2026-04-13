/**
 * SPC Brasil Plugin
 *
 * Interface for future integration with SPC Brasil credit bureau APIs.
 * Currently a stub — all methods return mock/empty responses.
 *
 * Future integration:
 * 1. Set SPC_API_KEY via /configuracoes panel (stored encrypted in DB)
 * 2. Implement each method using SPC's REST API
 */

export interface SPCConsultaResponse {
  hasRestriction: boolean;
  totalValue: number;
  occurrences: Array<{
    origin: string;
    value: number;
    date: string;
    type: "CHEQUE_SEM_FUNDO" | "DEBITO_VENCIDO" | "PROTESTO" | "OUTROS";
  }>;
  source: "SPC";
}

export interface SPCScoreResponse {
  score: number;
  probability: number; // probability of default in %
  source: "SPC";
}

export class SPCPlugin {
  private apiKey: string | null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? null;
  }

  /**
   * Consults SPC for restrictions on a CPF or CNPJ.
   * @param document - CPF ou CNPJ sem formatação
   */
  async consultar(document: string): Promise<SPCConsultaResponse | null> {
    // TODO: Implement SPC API call
    // const response = await fetch(`https://api.spcbrasil.org.br/consulta/${document}`, {
    //   headers: { 'Authorization': `Bearer ${this.apiKey}` }
    // })
    console.log("[SPCPlugin] consultar chamado para documento:", document.slice(0, 3) + "...");
    return null;
  }

  /**
   * Gets SPC credit score for an individual (CPF).
   * @param cpf - CPF sem formatação
   */
  async getScore(cpf: string): Promise<SPCScoreResponse | null> {
    // TODO: Implement SPC Score API
    console.log("[SPCPlugin] getScore chamado para CPF:", cpf.slice(0, 3) + "...");
    return null;
  }

  /**
   * Checks if a document has any active restrictions in SPC.
   * @param document - CPF ou CNPJ
   */
  async hasRestriction(document: string): Promise<boolean> {
    // TODO: Implement
    console.log("[SPCPlugin] hasRestriction chamado");
    return false;
  }

  isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }
}
