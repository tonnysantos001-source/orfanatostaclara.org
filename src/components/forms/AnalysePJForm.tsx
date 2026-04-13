"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Search } from "lucide-react";
import { ResultCard } from "@/components/ui/ResultCard";
import { formatCNPJ, formatCEP } from "@/lib/validators";

const schema = z.object({
  razaoSocial: z
    .string()
    .min(3, "Razão social deve ter pelo menos 3 caracteres"),
  cnpj: z.string().min(18, "CNPJ inválido"),
  faturamentoMensal: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number({ error: "Informe um valor numérico" }).positive("Faturamento deve ser positivo")
  ),
  valorParcela: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number({ error: "Informe um valor numérico" }).positive("Parcela deve ser positiva")
  ),
  cep: z.string().min(9, "CEP inválido"),
  tempoEmpresaMeses: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number({ error: "Informe o tempo em meses" }).int().min(0, "Tempo inválido")
  ),
});

type FormData = z.infer<typeof schema>;

interface AnalysisResult {
  analysisId: string;
  score: number;
  decision: "APROVADO" | "APROVADO_COM_LIMITE" | "ANALISE_MANUAL" | "RECUSADO";
  decisionLabel: string;
  limiteSugerido: number;
  breakdown: Array<{
    category: string;
    points: number;
    maxPoints: number;
    reason: string;
    percentage: number;
  }>;
}

export function AnalysePJForm() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
  });

  function handleCNPJChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue("cnpj", formatCNPJ(e.target.value));
  }

  function handleCEPChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue("cep", formatCEP(e.target.value));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function onSubmit(data: any) {
    setApiError(null);
    setResult(null);

    try {
      const payload = {
        ...data,
        cnpj: data.cnpj.replace(/\D/g, ""),
        cep: data.cep.replace(/\D/g, ""),
      };

      const res = await fetch("/api/analise/pj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setApiError(json.error ?? "Erro ao processar análise.");
        return;
      }

      setResult(json);
    } catch {
      setApiError("Erro de conexão. Tente novamente.");
    }
  }

  const faturamentoMensal = watch("faturamentoMensal") as number | undefined;
  const valorParcela = watch("valorParcela") as number | undefined;
  const tempoEmpresaMeses = watch("tempoEmpresaMeses") as number | undefined;

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit(onSubmit)} className="analysis-form">
        <div className="form-grid">
          {/* Razão Social */}
          <div className="form-group form-col-2">
            <label className="form-label">Razão Social</label>
            <input
              {...register("razaoSocial")}
              className={`form-input ${errors.razaoSocial ? "form-input-error" : ""}`}
              placeholder="Empresa LTDA"
              id="pj-razao-social"
            />
            {errors.razaoSocial && (
              <span className="form-error">{String(errors.razaoSocial.message)}</span>
            )}
          </div>

          {/* CNPJ */}
          <div className="form-group">
            <label className="form-label">CNPJ</label>
            <input
              {...register("cnpj")}
              onChange={handleCNPJChange}
              className={`form-input ${errors.cnpj ? "form-input-error" : ""}`}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              id="pj-cnpj"
            />
            {errors.cnpj && (
              <span className="form-error">{String(errors.cnpj.message)}</span>
            )}
          </div>

          {/* Tempo de Empresa */}
          <div className="form-group">
            <label className="form-label">Tempo de Empresa (meses)</label>
            <input
              {...register("tempoEmpresaMeses")}
              type="number"
              className={`form-input ${
                errors.tempoEmpresaMeses ? "form-input-error" : ""
              }`}
              placeholder="36"
              min={0}
              id="pj-tempo-meses"
            />
            {errors.tempoEmpresaMeses && (
              <span className="form-error">
                {String(errors.tempoEmpresaMeses.message)}
              </span>
            )}
          </div>

          {/* Faturamento Mensal */}
          <div className="form-group">
            <label className="form-label">Faturamento Mensal (R$)</label>
            <input
              {...register("faturamentoMensal")}
              type="number"
              step="0.01"
              className={`form-input ${
                errors.faturamentoMensal ? "form-input-error" : ""
              }`}
              placeholder="50000.00"
              id="pj-faturamento"
            />
            {errors.faturamentoMensal && (
              <span className="form-error">
                {String(errors.faturamentoMensal.message)}
              </span>
            )}
          </div>

          {/* Valor da Parcela */}
          <div className="form-group">
            <label className="form-label">Valor da Parcela (R$)</label>
            <input
              {...register("valorParcela")}
              type="number"
              step="0.01"
              className={`form-input ${
                errors.valorParcela ? "form-input-error" : ""
              }`}
              placeholder="5000.00"
              id="pj-parcela"
            />
            {errors.valorParcela && (
              <span className="form-error">{String(errors.valorParcela.message)}</span>
            )}
          </div>

          {/* CEP */}
          <div className="form-group">
            <label className="form-label">CEP</label>
            <input
              {...register("cep")}
              onChange={handleCEPChange}
              className={`form-input ${errors.cep ? "form-input-error" : ""}`}
              placeholder="00000-000"
              maxLength={9}
              id="pj-cep"
            />
            {errors.cep && (
              <span className="form-error">{String(errors.cep.message)}</span>
            )}
          </div>
        </div>

        {/* Preview */}
        {faturamentoMensal && valorParcela && faturamentoMensal > 0 && valorParcela > 0 && (
          <div className="form-preview">
            <div className="preview-item">
              <span className="preview-label">Razão Faturamento/Parcela</span>
              <span className="preview-value">
                {(faturamentoMensal / valorParcela).toFixed(1)}×
              </span>
            </div>
            <div className="preview-item">
              <span className="preview-label">% do Faturamento Comprometido</span>
              <span className="preview-value">
                {((valorParcela / faturamentoMensal) * 100).toFixed(1)}%
              </span>
            </div>
            {tempoEmpresaMeses != null && tempoEmpresaMeses >= 0 && (
              <div className="preview-item">
                <span className="preview-label">Tempo de Empresa</span>
                <span className="preview-value">
                  {Math.floor(tempoEmpresaMeses / 12)} anos e{" "}
                  {tempoEmpresaMeses % 12} meses
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {apiError && <div className="form-api-error">⚠️ {apiError}</div>}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-analisar"
          id="btn-analisar-pj"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Search size={18} />
              ANALISAR
            </>
          )}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="result-section">
          <ResultCard
            score={result.score}
            decision={result.decision}
            decisionLabel={result.decisionLabel}
            limiteSugerido={result.limiteSugerido}
            breakdown={result.breakdown}
            type="PJ"
            analysisId={result.analysisId}
          />
        </div>
      )}
    </div>
  );
}
