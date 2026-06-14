import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { IssuerProfile } from "./billing-profile";
import {
  VAT_RATE,
  addDaysIso,
  exclVatFromIncl,
  formatInvoiceSek,
  formatIsoDateSv,
  formatMonthLabel,
  invoiceNumber,
  totalInclFromLineItems,
  vatFromIncl,
} from "./format";
import type { InvoicePdfData } from "./types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  brand: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#e85d4c",
  },
  brandSub: {
    marginTop: 4,
    fontSize: 9,
    color: "#64748b",
  },
  metaBlock: {
    textAlign: "right",
    fontSize: 9,
    color: "#475569",
  },
  metaTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: "#0f172a",
    marginBottom: 6,
  },
  section: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  twoCol: {
    flexDirection: "row",
    gap: 24,
  },
  col: {
    flex: 1,
  },
  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  colDate: { width: "28%" },
  colName: { width: "44%" },
  colAmount: { width: "28%", textAlign: "right" },
  headText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#475569",
  },
  totals: {
    marginTop: 16,
    alignSelf: "flex-end",
    width: 220,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalGrand: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  footer: {
    marginTop: 28,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    fontSize: 9,
    color: "#64748b",
    lineHeight: 1.5,
  },
});

interface Props {
  invoice: InvoicePdfData;
  issuer: IssuerProfile;
}

export function InvoicePdfDocument({ invoice, issuer }: Props) {
  const invoiceDate = invoice.createdAt.slice(0, 10);
  const dueDate = addDaysIso(invoiceDate, 30);
  const totalIncl = totalInclFromLineItems(
    invoice.lineItems.map((row) => row.amount),
  );
  const subtotalExcl = exclVatFromIncl(totalIncl);
  const vat = vatFromIncl(totalIncl);
  const number = invoiceNumber(invoice.id, invoice.month);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{issuer.name}</Text>
            <Text style={styles.brandSub}>{issuer.addressLine}</Text>
            {issuer.orgNumber ? (
              <Text style={styles.brandSub}>Org.nr {issuer.orgNumber}</Text>
            ) : null}
            {issuer.vatNumber ? (
              <Text style={styles.brandSub}>Momsreg.nr {issuer.vatNumber}</Text>
            ) : null}
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaTitle}>FAKTURA</Text>
            <Text>Fakturanr: {number}</Text>
            <Text>Fakturadatum: {formatIsoDateSv(invoiceDate)}</Text>
            <Text>Förfallodatum: {formatIsoDateSv(dueDate)}</Text>
            <Text>Period: {formatMonthLabel(invoice.month)}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.twoCol]}>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Faktureras till</Text>
            <Text>{invoice.company.name}</Text>
            <Text>{invoice.company.address}</Text>
            <Text>{invoice.company.city}</Text>
            <Text>{invoice.company.billingEmail}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Betalning</Text>
            {issuer.bankgiro ? (
              <Text>Bankgiro: {issuer.bankgiro}</Text>
            ) : (
              <Text>Bankgiro: (ange HAPPYSENT_BANKGIRO)</Text>
            )}
            <Text>Betalningsvillkor: 30 dagar</Text>
            <Text>OCR/referens: {number}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Specifikation</Text>
          <Text style={{ fontSize: 9, color: "#64748b", marginBottom: 4 }}>
            Födelsedagsleveranser enligt avtal — {formatMonthLabel(invoice.month)}
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <Text style={[styles.headText, styles.colDate]}>Leveransdatum</Text>
              <Text style={[styles.headText, styles.colName]}>Anställd</Text>
              <Text style={[styles.headText, styles.colAmount]}>Belopp inkl. moms</Text>
            </View>
            {invoice.lineItems.map((row, i) => (
              <View key={`${row.deliveryDate}-${i}`} style={styles.tableRow}>
                <Text style={styles.colDate}>
                  {formatIsoDateSv(row.deliveryDate)}
                </Text>
                <Text style={styles.colName}>
                  {row.description ?? row.employeeName}
                </Text>
                <Text style={styles.colAmount}>
                  {formatInvoiceSek(row.amount)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Summa exkl. moms</Text>
            <Text>{formatInvoiceSek(subtotalExcl)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Moms ({Math.round(VAT_RATE * 100)} %)</Text>
            <Text>{formatInvoiceSek(vat)}</Text>
          </View>
          <View style={styles.totalGrand}>
            <Text>Att betala</Text>
            <Text>{formatInvoiceSek(totalIncl)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Tack för att ni använder HappySent. Vid frågor om fakturan, kontakta{" "}
            {issuer.email ?? "info@happysent.com"}.
          </Text>
          <Text style={{ marginTop: 6 }}>
            Priserna är angivna inklusive 6 % moms. Vid försenad betalning
            debiteras påminnelseavgift enligt gällande villkor.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
