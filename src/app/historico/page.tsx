"use client";

import { useState, useEffect, useCallback } from "react";
import { DecisionBadge } from "@/components/ui/Badge";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

interface Analysis {
  id: string;
  type: string;
  score: number;
  decision: string;
  limiteSugerido: number | null;
  createdAt: string;
  client: {
    nome: string;
    documento: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export default function HistoricoPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState("");
  const [filterDecision, setFilterDecision] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(filterType && { type: filterType }),
        ...(filterDecision && { decision: filterDecision }),
      });
      const res = await fetch(`/api/historico?${params}`);
      const json = await res.json();
      setAnalyses(json.data ?? []);
      setPagination(json.pagination ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterDecision]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="page-container">
      {/* Filters */}
      <div className="filters-bar">
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="filter-select"
          id="filter-type"
        >
          <option value="">Todos os tipos</option>
          <option value="PF">Pessoa Física</option>
          <option value="PJ">Pessoa Jurídica</option>
        </select>

        <select
          value={filterDecision}
          onChange={(e) => { setFilterDecision(e.target.value); setPage(1); }}
          className="filter-select"
          id="filter-decision"
        >
          <option value="">Todas as decisões</option>
          <option value="APROVADO">Aprovado</option>
          <option value="APROVADO_COM_LIMITE">Aprovado c/ Limite</option>
          <option value="ANALISE_MANUAL">Análise Manual</option>
          <option value="RECUSADO">Recusado</option>
        </select>

        <button onClick={fetchData} className="btn-refresh" title="Atualizar">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>

        {pagination && (
          <span className="filter-total">
            {pagination.total} análises encontradas
          </span>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Documento</th>
              <th>Tipo</th>
              <th>Score</th>
              <th>Decisão</th>
              <th>Limite Sugerido</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="table-loading">
                  <RefreshCw size={20} className="animate-spin" />
                  Carregando...
                </td>
              </tr>
            ) : analyses.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-empty">
                  Nenhuma análise encontrada.
                </td>
              </tr>
            ) : (
              analyses.map((a) => (
                <tr key={a.id} className="table-row">
                  <td className="table-name">{a.client.nome}</td>
                  <td className="table-doc">{a.client.documento}</td>
                  <td>
                    <span className={`type-badge type-${a.type.toLowerCase()}`}>
                      {a.type}
                    </span>
                  </td>
                  <td>
                    <span
                      className="score-cell"
                      style={{
                        color:
                          a.score >= 750
                            ? "#10B981"
                            : a.score >= 600
                            ? "#3B82F6"
                            : a.score >= 400
                            ? "#F59E0B"
                            : "#EF4444",
                      }}
                    >
                      {a.score}
                    </span>
                  </td>
                  <td>
                    <DecisionBadge
                      decision={
                        a.decision as
                          | "APROVADO"
                          | "APROVADO_COM_LIMITE"
                          | "ANALISE_MANUAL"
                          | "RECUSADO"
                      }
                      size="sm"
                    />
                  </td>
                  <td className="table-limit">
                    {formatCurrency(a.limiteSugerido)}
                  </td>
                  <td className="table-date">{formatDate(a.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="pagination-btn"
            id="btn-prev-page"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <span className="pagination-info">
            Página {page} de {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="pagination-btn"
            id="btn-next-page"
          >
            Próxima
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
