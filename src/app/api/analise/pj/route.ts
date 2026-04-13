import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateScorePJ } from "@/lib/score-engine";
import { validateCNPJ } from "@/lib/validators";
import { log } from "@/lib/logger";

const PJSchema = z.object({
  razaoSocial: z.string().min(3, "Razão social deve ter pelo menos 3 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  faturamentoMensal: z.number().positive("Faturamento mensal deve ser positivo"),
  valorParcela: z.number().positive("Valor da parcela deve ser positivo"),
  cep: z.string().min(8, "CEP inválido"),
  tempoEmpresaMeses: z
    .number()
    .int()
    .min(0, "Tempo de empresa inválido"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = PJSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Validate CNPJ
    if (!validateCNPJ(data.cnpj)) {
      return NextResponse.json(
        { error: "CNPJ inválido. Verifique o número informado." },
        { status: 400 }
      );
    }

    // Calculate score
    const scoreResult = calculateScorePJ(data);

    // Persist to DB
    const analysis = await prisma.analysis.create({
      data: {
        type: "PJ",
        score: scoreResult.totalScore,
        decision: scoreResult.decision,
        limiteSugerido: scoreResult.limiteSugerido,
        scoreBreakdown: scoreResult.breakdown as object,
        clientPJ: {
          create: {
            razaoSocial: data.razaoSocial,
            cnpj: data.cnpj.replace(/\D/g, ""),
            faturamentoMensal: data.faturamentoMensal,
            valorParcela: data.valorParcela,
            cep: data.cep.replace(/\D/g, ""),
            tempoEmpresaMeses: data.tempoEmpresaMeses,
          },
        },
        scoreLogs: {
          createMany: {
            data: scoreResult.breakdown.map((b) => ({
              category: b.category,
              points: b.points,
              reason: b.reason,
            })),
          },
        },
      },
      include: { clientPJ: true, scoreLogs: true },
    });

    await log({
      level: "INFO",
      category: "ANALISE_PJ",
      message: `Análise PJ concluída. ID: ${analysis.id} | Score: ${scoreResult.totalScore} | Decisão: ${scoreResult.decision}`,
    });

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      score: scoreResult.totalScore,
      decision: scoreResult.decision,
      decisionLabel: scoreResult.decisionLabel,
      limiteSugerido: scoreResult.limiteSugerido,
      breakdown: scoreResult.breakdown,
    });
  } catch (err) {
    console.error("[API/analise/pj] Erro:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar análise." },
      { status: 500 }
    );
  }
}
