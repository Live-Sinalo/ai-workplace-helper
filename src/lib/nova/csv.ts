export type CsvRow = Record<string, string | number | null>;

export type NumericStats = {
  column: string;
  count: number;
  total: number;
  average: number;
  min: number;
  max: number;
  median: number;
};

export type CsvProfile = {
  fileName: string;
  rows: CsvRow[];
  columns: string[];
  rowCount: number;
  columnCount: number;
  missingValues: number;
  numericColumns: string[];
  textColumns: string[];
  stats: NumericStats[];
};

const isMissing = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v !== "string") return null;
  const cleaned = v.replace(/[,\s$£€%]/g, "");
  if (!cleaned || Number.isNaN(Number(cleaned))) return null;
  return Number(cleaned);
}

export function buildProfile(fileName: string, rows: CsvRow[], columns: string[]): CsvProfile {
  let missingValues = 0;
  const numericColumns: string[] = [];
  const textColumns: string[] = [];
  const stats: NumericStats[] = [];

  for (const col of columns) {
    const values = rows.map((r) => r[col]);
    missingValues += values.filter(isMissing).length;
    const nums = values.map(toNumber).filter((n): n is number => n !== null);
    const filled = values.filter((v) => !isMissing(v)).length;

    if (filled > 0 && nums.length / filled >= 0.8) {
      numericColumns.push(col);
      const sorted = [...nums].sort((a, b) => a - b);
      const total = nums.reduce((a, b) => a + b, 0);
      const mid = Math.floor(sorted.length / 2);
      const median =
        sorted.length === 0
          ? 0
          : sorted.length % 2 === 0
            ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
            : (sorted[mid] ?? 0);
      stats.push({
        column: col,
        count: nums.length,
        total,
        average: nums.length ? total / nums.length : 0,
        min: sorted[0] ?? 0,
        max: sorted[sorted.length - 1] ?? 0,
        median,
      });
    } else {
      textColumns.push(col);
    }
  }

  return {
    fileName,
    rows,
    columns,
    rowCount: rows.length,
    columnCount: columns.length,
    missingValues,
    numericColumns,
    textColumns,
    stats,
  };
}

export function formatNumber(n: number) {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const digits = abs >= 1000 || Number.isInteger(n) ? 0 : 2;
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

/** Top categories by frequency for a text column. */
export function categoryBreakdown(rows: CsvRow[], column: string, limit = 8) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = String(row[column] ?? "").trim() || "(blank)";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

/** Aggregated-only payload sent to the AI — never raw rows. */
export function buildAiPayload(profile: CsvProfile) {
  return JSON.stringify(
    {
      fileName: profile.fileName,
      rowCount: profile.rowCount,
      columnCount: profile.columnCount,
      missingValues: profile.missingValues,
      columns: profile.columns,
      numericColumns: profile.numericColumns,
      textColumns: profile.textColumns,
      statistics: profile.stats.map((s) => ({
        column: s.column,
        total: Number(s.total.toFixed(2)),
        average: Number(s.average.toFixed(2)),
        min: s.min,
        max: s.max,
        median: s.median,
      })),
      topCategories: profile.textColumns.slice(0, 3).map((c) => ({
        column: c,
        values: categoryBreakdown(profile.rows, c, 5),
      })),
    },
    null,
    2,
  );
}
