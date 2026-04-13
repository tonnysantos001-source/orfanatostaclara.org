import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));
    const category = searchParams.get("category");

    const where = category ? { category } : {};

    const [total, logs] = await Promise.all([
      prisma.scoreLog.count({ where }),
      prisma.scoreLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          analysis: {
            select: { type: true, decision: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[API/logs] Erro:", err);
    return NextResponse.json(
      { error: "Erro ao carregar logs." },
      { status: 500 }
    );
  }
}
