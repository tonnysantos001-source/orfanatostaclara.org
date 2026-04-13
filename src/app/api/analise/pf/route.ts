import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateScorePF } from "@/lib/score-engine";
import { validateCPF } from "@/lib/validators";
import { log } from "@/lib/logger";

const PFSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().min(11, "CPF inválido"),
  rendaMensal: z.number().positive("Renda mensal deve ser positiva"),
  valorParcela: z.number().positive("Valor da parcela deve ser positivo"),
  cep: z.string().min(8, "CEP inválido"),
  idade: z.number().int().min(18, "Idade mínima é 18 anos").max(120),
  profissao: z.string().min(2, "Profissão deve ter pelo menos 2 caracteres"),
});


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = PFSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Validate CPF
    if (!validateCPF(data.cpf)) {
      return NextResponse.json(
        { error: "CPF inválido. Verifique o número informado." },
        { status: 400 }
      );
    }

    // Calculate score
    const scoreResult = calculateScorePF(data);

    // Persist analysis → client PF → score logs (transaction)
    const analysis = await prisma.analysis.create({
      data: {
        type: "PF",
        score: scoreResult.totalScore,
        decision: scoreResult.decision,
        limiteSugerido: scoreResult.limiteSugerido,
        scoreBreakdown: scoreResult.breakdown as object,
        clientPF: {
          create: {
            nome: data.nome,
            cpf: data.cpf.replace(/\D/g, ""),
            rendaMensal: data.rendaMensal,
            valorParcela: data.valorParcela,
            cep: data.cep.replace(/\D/g, ""),
            idade: data.idade,
            profissao: data.profissao,
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
      include: { clientPF: true, scoreLogs: true },
    });

    await log({
      level: "INFO",
      category: "ANALISE_PF",
      message: `Análise PF concluída. ID: ${analysis.id} | Score: ${scoreResult.totalScore} | Decisão: ${scoreResult.decision}`,
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
    console.error("[API/analise/pf] Erro:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar análise." },
      { status: 500 }
    );
  }
}
