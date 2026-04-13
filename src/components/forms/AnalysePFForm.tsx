"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Search } from "lucide-react";
import { ResultCard } from "@/components/ui/ResultCard";
import { formatCPF, formatCEP } from "@/lib/validators";

const schema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().min(14, "CPF inválido"),
  rendaMensal: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number({ error: "Informe um valor numérico" }).positive("Renda deve ser positiva")
  ),
  valorParcela: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number({ error: "Informe um valor numérico" }).positive("Parcela deve ser positiva")
  ),
  cep: z.string().min(9, "CEP inválido"),
  idade: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z.number({ error: "Informe a idade" }).int().min(18, "Idade mínima: 18 anos").max(120)
  ),
  profissao: z.string().min(2, "Informe a profissão"),
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

export function AnalysePFForm() {
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

  function handleCPFChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCPF(e.target.value);
    setValue("cpf", formatted);
  }

  function handleCEPChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCEP(e.target.value);
    setValue("cep", formatted);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function onSubmit(data: any) {
    setApiError(null);
    setResult(null);

    try {
      const payload = {
        ...data,
        cpf: data.cpf.replace(/\D/g, ""),
        cep: data.cep.replace(/\D/g, ""),
      };

      const res = await fetch("/api/analise/pf", {
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

  const rendaMensal = watch("rendaMensal") as number | undefined;
  const valorParcela = watch("valorParcela") as number | undefined;

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit(onSubmit)} className="analysis-form">
        <div className="form-grid">
          {/* Nome */}
          <div className="form-group form-col-2">
            <label className="form-label">Nome Completo</label>
            <input
              {...register("nome")}
              className={`form-input ${errors.nome ? "form-input-error" : ""}`}
              placeholder="João da Silva"
              id="pf-nome"
            />
            {errors.nome && (
              <span className="form-error">{String(errors.nome.message)}</span>
            )}
          </div>

          {/* CPF */}
          <div className="form-group">
            <label className="form-label">CPF</label>
            <input
              {...register("cpf")}
              onChange={handleCPFChange}
              className={`form-input ${errors.cpf ? "form-input-error" : ""}`}
              placeholder="000.000.000-00"
              maxLength={14}
              id="pf-cpf"
            />
            {errors.cpf && (
              <span className="form-error">{String(errors.cpf.message)}</span>
            )}
          </div>

          {/* Idade */}
          <div className="form-group">
            <label className="form-label">Idade</label>
            <input
              {...register("idade")}
              type="number"
              className={`form-input ${errors.idade ? "form-input-error" : ""}`}
              placeholder="35"
              min={18}
              max={120}
              id="pf-idade"
            />
            {errors.idade && (
              <span className="form-error">{String(errors.idade.message)}</span>
            )}
          </div>

          {/* Profissão */}
          <div className="form-group">
            <label className="form-label">Profissão</label>
            <input
              {...register("profissao")}
              className={`form-input ${errors.profissao ? "form-input-error" : ""}`}
              placeholder="Engenheiro"
              id="pf-profissao"
            />
            {errors.profissao && (
              <span className="form-error">{String(errors.profissao.message)}</span>
            )}
          </div>

          {/* Renda Mensal */}
          <div className="form-group">
            <label className="form-label">Renda Mensal (R$)</label>
            <input
              {...register("rendaMensal")}
              type="number"
              step="0.01"
              className={`form-input ${errors.rendaMensal ? "form-input-error" : ""}`}
              placeholder="5000.00"
              id="pf-renda"
            />
            {errors.rendaMensal && (
              <span className="form-error">{String(errors.rendaMensal.message)}</span>
            )}
          </div>

          {/* Valor da Parcela */}
          <div className="form-group">
            <label className="form-label">Valor da Parcela (R$)</label>
            <input
              {...register("valorParcela")}
              type="number"
              step="0.01"
              className={`form-input ${errors.valorParcela ? "form-input-error" : ""}`}
              placeholder="800.00"
              id="pf-parcela"
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
              id="pf-cep"
            />
            {errors.cep && (
              <span className="form-error">{String(errors.cep.message)}</span>
            )}
          </div>
        </div>

        {/* Preview */}
        {rendaMensal && valorParcela && rendaMensal > 0 && valorParcela > 0 && (
          <div className="form-preview">
            <div className="preview-item">
              <span className="preview-label">Razão Renda/Parcela</span>
              <span className="preview-value">
                {(rendaMensal / valorParcela).toFixed(1)}×
              </span>
            </div>
            <div className="preview-item">
              <span className="preview-label">% da Renda Comprometida</span>
              <span className="preview-value">
                {((valorParcela / rendaMensal) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {apiError && (
          <div className="form-api-error">⚠️ {apiError}</div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-analisar"
          id="btn-analisar-pf"
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
            type="PF"
            analysisId={result.analysisId}
          />
        </div>
      )}
    </div>
  );
}
