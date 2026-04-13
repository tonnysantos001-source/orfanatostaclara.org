"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface LogEntry {
  id: string;
  analysisId: string;
  category: string;
  points: number;
  reason: string;
  createdAt: string;
  analysis: {
    type: string;
    decision: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const categoryColors: Record<string, string> = {
  Caráter: "#8B5CF6",
  Capacidade: "#3B82F6",
  Capital: "#10B981",
  Colateral: "#F59E0B",
  Condições: "#EC4899",
  Compliance: "#06B6D4",
  AUTH: "#6B7280",
  ANALISE_PF: "#3B82F6",
  ANALISE_PJ: "#06B6D4",
  SYSTEM: "#6B7280",
  SETTINGS: "#F59E0B",
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(dateStr));
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "50",
        ...(filterCategory && { category: filterCategory }),
      });
      const res = await fetch(`/api/logs?${params}`);
      const json = await res.json();
      setLogs(json.data ?? []);
      setPagination(json.pagination ?? null);
    } finally {
      setLoading(false);
    }
  }, [page, filterCategory]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const categories = [
    "Caráter", "Capacidade", "Capital",
    "Colateral", "Condições", "Compliance",
    "ANALISE_PF", "ANALISE_PJ", "AUTH", "SYSTEM",
  ];

  return (
    <div className="page-container">
      {/* Filters */}
      <div className="filters-bar">
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="filter-select"
          id="filter-log-category"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button onClick={fetchLogs} className="btn-refresh" id="btn-refresh-logs">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
        {pagination && (
          <span className="filter-total">{pagination.total} registros</span>
        )}
      </div>

      {/* Timeline / Table */}
      <div className="card">
        <div className="logs-timeline">
          {loading ? (
            <div className="table-loading">
              <RefreshCw size={20} className="animate-spin" /> Carregando logs...
            </div>
          ) : logs.length === 0 ? (
            <p className="empty-state">Nenhum log encontrado.</p>
          ) : (
            logs.map((log) => {
              const color = categoryColors[log.category] ?? "#6B7280";
              const isPositive = log.points > 0;
              const isNegative = log.points < 0;
              return (
                <div key={log.id} className="log-entry">
                  <div
                    className="log-dot"
                    style={{ backgroundColor: color }}
                  />
                  <div className="log-content">
                    <div className="log-header">
                      <span
                        className="log-category"
                        style={{ color }}
                      >
                        {log.category}
                      </span>
                      {log.points !== 0 && (
                        <span
                          className={`log-points ${
                            isPositive ? "log-points-pos" : isNegative ? "log-points-neg" : ""
                          }`}
                        >
                          {isPositive ? "+" : ""}{log.points} pts
                        </span>
                      )}
                      <span className="log-type-badge">
                        {log.analysis.type}
                      </span>
                    </div>
                    <p className="log-reason">{log.reason}</p>
                    <div className="log-footer">
                      <span className="log-id">
                        Análise: {log.analysisId.slice(0, 8)}...
                      </span>
                      <span className="log-date">{formatDate(log.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="pagination-btn"
            id="btn-logs-prev"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="pagination-info">
            {page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="pagination-btn"
            id="btn-logs-next"
          >
            Próxima <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
