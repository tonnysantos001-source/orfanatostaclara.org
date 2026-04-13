import { prisma } from "./prisma";

export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";
export type LogCategory =
  | "AUTH"
  | "ANALISE_PF"
  | "ANALISE_PJ"
  | "SCORE"
  | "API"
  | "SYSTEM"
  | "SETTINGS";

interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  analysisId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Persists a log entry to the score_logs table (when analysisId is provided)
 * and always writes to console.
 */
export async function log(entry: LogEntry): Promise<void> {
  const { level, category, message, analysisId } = entry;

  // Always log to console
  const timestamp = new Date().toISOString();
  console[level === "ERROR" ? "error" : level === "WARN" ? "warn" : "log"](
    `[${timestamp}] [${level}] [${category}] ${message}`
  );

  // If we have an analysisId, also persist to DB
  if (analysisId) {
    try {
      await prisma.scoreLog.create({
        data: {
          analysisId,
          category,
          points: 0,
          reason: `[${level}] ${message}`,
        },
      });
    } catch (err) {
      console.error("[LOGGER] Falha ao persistir log no banco:", err);
    }
  }
}

export function logSync(level: LogLevel, category: LogCategory, message: string): void {
  const timestamp = new Date().toISOString();
  console[level === "ERROR" ? "error" : level === "WARN" ? "warn" : "log"](
    `[${timestamp}] [${level}] [${category}] ${message}`
  );
}
