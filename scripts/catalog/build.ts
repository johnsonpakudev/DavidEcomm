import { exportCatalogJson } from "@/scripts/catalog/export-json";
import { parseCatalogCsv } from "@/scripts/catalog/parse-csv";
import { buildCatalogFromRows } from "@/scripts/catalog/transform";
import { validateCatalog } from "@/scripts/catalog/validate";

const validateOnly = process.argv.includes("--validate-only");

const rows = parseCatalogCsv();
const catalog = buildCatalogFromRows(rows);

validateCatalog(catalog);

if (!validateOnly) {
  exportCatalogJson(catalog);
}

console.log(catalog.report);
