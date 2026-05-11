import ExcelJS from "exceljs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public");
const outFile = path.join(outDir, "happysent-mall.xlsx");

async function main() {
  await mkdir(outDir, { recursive: true });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Anställda", {
    views: [{ state: "frozen", ySplit: 2 }],
  });

  ws.mergeCells("A1:D1");
  const instr = ws.getCell("A1");
  instr.value =
    "Instruktion (grå rad): Fyll i en rad per person. Födelsedag i formatet ÅÅÅÅ-MM-DD (t.ex. 1992-03-15). Antal personer = hur många kollegor som ska kunna äta tårta den dagen.";
  instr.font = { color: { argb: "FF888888" }, italic: true };
  instr.alignment = { vertical: "middle", wrapText: true };
  ws.getRow(1).height = 36;

  const header = ws.getRow(2);
  header.values = ["Förnamn", "Efternamn", "Födelsedag", "Antal personer"];
  header.font = { bold: true };

  ws.addRow(["Erik", "Svensson", "1988-04-22", 12]);
  ws.addRow(["Fatima", "Al-Hassan", "1995-11-08", 8]);
  ws.addRow(["Johan", "Lindqvist", "1990-01-30", 25]);

  ws.columns = [
    { width: 14 },
    { width: 18 },
    { width: 14 },
    { width: 18 },
  ];

  const buf = await wb.xlsx.writeBuffer();
  await writeFile(outFile, buf);
  console.log("Skrev", outFile);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
