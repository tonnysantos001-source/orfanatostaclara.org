import { prisma } from "@/lib/prisma";
import {
  UserCheck,
  Building2,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface RecentAnalysis {
  id: string;
  type: string;
  score: number;
  decision: string;
  createdAt: Date;
  clientPF: { nome: string } | null;
  clientPJ: { razaoSocial: string } | null;
}

async function getDashboardStats() {
  const [
    totalAnalyses,
    totalPF,
    totalPJ,
    approved,
    approvedWithLimit,
    manual,
    rejected,
    avgScoreAgg,
  ] = await Promise.all([
    prisma.analysis.count(),
    prisma.analysis.count({ where: { type: "PF" } }),
    prisma.analysis.count({ where: { type: "PJ" } }),
    prisma.analysis.count({ where: { decision: "APROVADO" } }),
    prisma.analysis.count({ where: { decision: "APROVADO_COM_LIMITE" } }),
    prisma.analysis.count({ where: { decision: "ANALISE_MANUAL" } }),
    prisma.analysis.count({ where: { decision: "RECUSADO" } }),
    prisma.analysis.aggregate({ _avg: { score: true } }),
  ]);

  const recentAnalyses = await (prisma.analysis.findMany as Function)({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      clientPF: { select: { nome: true } },
      clientPJ: { select: { razaoSocial: true } },
    },
  }) as RecentAnalysis[];

  const avgScore = Math.round(avgScoreAgg._avg.score ?? 0);

  return {
    totalAnalyses,
    totalPF,
    totalPJ,
    approved,
    approvedWithLimit,
    manual,
    rejected,
    avgScore,
    recentAnalyses,
  };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function DecisionIcon({ decision }: { decision: string }) {
  if (decision === "APROVADO")
    return <CheckCircle size={16} className="text-emerald-400" />;
  if (decision === "APROVADO_COM_LIMITE")
    return <CheckCircle size={16} className="text-blue-400" />;
  if (decision === "ANALISE_MANUAL")
    return <Clock size={16} className="text-amber-400" />;
  return <XCircle size={16} className="text-red-400" />;
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="dashboard">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-purple">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="kpi-value">{stats.totalAnalyses}</div>
            <div className="kpi-label">Total de Análises</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-blue">
            <UserCheck size={22} />
          </div>
          <div>
            <div className="kpi-value">{stats.totalPF}</div>
            <div className="kpi-label">Análises PF</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-cyan">
            <Building2 size={22} />
          </div>
          <div>
            <div className="kpi-value">{stats.totalPJ}</div>
            <div className="kpi-label">Análises PJ</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-emerald">
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="kpi-value">{stats.avgScore}</div>
            <div className="kpi-label">Score Médio</div>
          </div>
        </div>
      </div>

      {/* Decision Distribution */}
      <div className="dashboard-row">
        <div className="card">
          <h2 className="card-title">Distribuição de Decisões</h2>
          <div className="decision-stats">
            {[
              {
                label: "✓ Aprovado",
                count: stats.approved,
                cls: "approved",
                color: "text-emerald-400",
              },
              {
                label: "◑ Aprovado c/ Limite",
                count: stats.approvedWithLimit,
                cls: "approved-limit",
                color: "text-blue-400",
              },
              {
                label: "⏳ Análise Manual",
                count: stats.manual,
                cls: "manual",
                color: "text-amber-400",
              },
              {
                label: "✕ Recusado",
                count: stats.rejected,
                cls: "rejected",
                color: "text-red-400",
              },
            ].map((item) => (
              <div key={item.cls} className="decision-stat">
                <div
                  className={`decision-stat-bar ${item.cls}`}
                  style={{
                    width:
                      stats.totalAnalyses > 0
                        ? `${(item.count / stats.totalAnalyses) * 100}%`
                        : "0%",
                  }}
                />
                <div className="decision-stat-info">
                  <span className={`decision-stat-label ${item.color}`}>
                    {item.label}
                  </span>
                  <span className="decision-stat-count">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="card">
          <h2 className="card-title">Análises Recentes</h2>
          {stats.recentAnalyses.length === 0 ? (
            <p className="empty-state">Nenhuma análise realizada ainda.</p>
          ) : (
            <div className="recent-list">
              {stats.recentAnalyses.map((a: RecentAnalysis) => (
                <div key={a.id} className="recent-item">
                  <div className="recent-item-left">
                    <DecisionIcon decision={a.decision} />
                    <div>
                      <div className="recent-name">
                        {a.type === "PF"
                          ? a.clientPF?.nome ?? "—"
                          : a.clientPJ?.razaoSocial ?? "—"}
                      </div>
                      <div className="recent-meta">
                        {a.type} • {formatDate(a.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div
                    className="recent-score"
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
