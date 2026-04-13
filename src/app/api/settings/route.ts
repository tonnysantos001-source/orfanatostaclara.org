import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, maskValue } from "@/lib/crypto";

// ─── GET: List all settings (values masked) ───────────────────────────────────
export async function GET() {
  try {
    const settings = await prisma.apiSetting.findMany({
      orderBy: { createdAt: "desc" },
    });

    const masked = settings.map((s: { value: string; [key: string]: unknown }) => ({
      ...s,
      value: maskValue(s.value), // never send encrypted or raw value
    }));

    return NextResponse.json({ data: masked });
  } catch (err) {
    console.error("[API/settings] GET Erro:", err);
    return NextResponse.json(
      { error: "Erro ao carregar configurações." },
      { status: 500 }
    );
  }
}

// ─── POST: Create or update a setting ────────────────────────────────────────
const SettingSchema = z.object({
  key: z.string().min(2, "Chave deve ter pelo menos 2 caracteres"),
  value: z.string().min(1, "Valor não pode ser vazio"),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SettingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { key, value, description, isActive } = parsed.data;
    const encryptedValue = encrypt(value);

    const setting = await prisma.apiSetting.upsert({
      where: { key },
      update: {
        value: encryptedValue,
        description,
        isActive: isActive ?? true,
      },
      create: {
        key,
        value: encryptedValue,
        description,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { ...setting, value: maskValue(setting.value) },
    });
  } catch (err) {
    console.error("[API/settings] POST Erro:", err);
    return NextResponse.json(
      { error: "Erro ao salvar configuração." },
      { status: 500 }
    );
  }
}

// ─── DELETE: Remove a setting ─────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key) {
      return NextResponse.json({ error: "Parâmetro 'key' obrigatório." }, { status: 400 });
    }

    await prisma.apiSetting.delete({ where: { key } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API/settings] DELETE Erro:", err);
    return NextResponse.json(
      { error: "Erro ao remover configuração." },
      { status: 500 }
    );
  }
}

// ─── Internal helper (server-side only) ──────────────────────────────────────
export async function getSettingValue(key: string): Promise<string | null> {
  try {
    const setting = await prisma.apiSetting.findUnique({ where: { key } });
    if (!setting || !setting.isActive) return null;
    return decrypt(setting.value);
  } catch {
    return null;
  }
}
