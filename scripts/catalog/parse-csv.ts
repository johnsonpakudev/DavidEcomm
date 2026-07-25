import { readFileSync } from "node:fs";

import { parse } from "csv-parse/sync";

import type { CsvProductRow } from "@/scripts/catalog/types";

const CSV_PATH = "public/data/BDKSUPPLY All Products.csv";

export function parseCatalogCsv(filePath = CSV_PATH): CsvProductRow[] {
  const content = readFileSync(filePath, "utf8");
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as CsvProductRow[];

  return rows.filter((row) => row.Status?.toLowerCase() === "active");
}
