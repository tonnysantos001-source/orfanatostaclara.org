import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const type = searchParams.get("type");
    const decision = searchParams.get("decision");

    const where: Record<string, unknown> = {};
    if (type && ["PF", "PJ"].includes(type)) where.type = type;
    if (decision) where.decision = decision;

    const total = await prisma.analysis.count({ where });

    // Use raw query to avoid Accelerate extension type issues with include
    const analyses = await (prisma.analysis.findMany as Function)({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        clientPF: { select: { nome: true, cpf: true } },
        clientPJ: { select: { razaoSocial: true, cnpj: true } },
      },
    }) as Array<{
      id: string;
      type: string;
      score: number;
      decision: string;
      limiteSugerido: number | null;
      createdAt: Date;
      clientPF: { nome: string; cpf: string } | null;
      clientPJ: { razaoSocial: string; cnpj: string } | null;
    }>;

    const formatted = analyses.map((a) => ({
      id: a.id,
      type: a.type,
      score: a.score,
      decision: a.decision,
      limiteSugerido: a.limiteSugerido,
      createdAt: a.createdAt,
      client:
        a.type === "PF"
          ? {
              nome: a.clientPF?.nome ?? "—",
              documento: a.clientPF?.cpf
                ? `***.***.${a.clientPF.cpf.slice(6, 9)}-**`
                : "—",
            }
          : {
              nome: a.clientPJ?.razaoSocial ?? "—",
              documento: a.clientPJ?.cnpj
                ? `**.***.***/****-${a.clientPJ.cnpj.slice(12)}`
                : "—",
            },
    }));

    return NextResponse.json({
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[API/historico] Erro:", err);
    return NextResponse.json(
      { error: "Erro ao carregar histórico." },
      { status: 500 }
    );
  }
}
