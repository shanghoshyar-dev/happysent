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

  ws.mergeCells("A1:F1");
  const instr = ws.getCell("A1");
  instr.value =
    "Instruktion: Fyll i en rad per person. Födelsedag ÅÅÅÅ-MM-DD. Firande (valfritt): varje år | halvår | 10-år. Gåva (valfritt): tårta | blommor.";
  instr.font = { color: { argb: "FF888888" }, italic: true };
  instr.alignment = { vertical: "middle", wrapText: true };
  ws.getRow(1).height = 40;

  const header = ws.getRow(2);
  header.values = [
    "Förnamn",
    "Efternamn",
    "Födelsedag",
    "Antal personer",
    "Firande",
    "Gåva",
  ];
  header.font = { bold: true };

  ws.addRow(["Erik", "Svensson", "1988-04-22", 12, "varje år", "tårta"]);
  ws.addRow(["Fatima", "Al-Hassan", "1995-11-08", 8, "halvår", "blommor"]);
  ws.addRow(["Johan", "Lindqvist", "1990-01-30", 25, "10-år", "tårta"]);

  ws.columns = [
    { width: 14 },
    { width: 18 },
    { width: 14 },
    { width: 18 },
    { width: 14 },
    { width: 12 },
  ];

  const buf = await wb.xlsx.writeBuffer();
  await writeFile(outFile, buf);
  console.log("Skrev", outFile);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
