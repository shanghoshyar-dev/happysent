export interface InvoiceLineItem {
  deliveryDate: string;
  employeeName: string;
  description?: string;
  amount: number;
}

export interface InvoicePdfData {
  id: string;
  month: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  sentAt: string | null;
  company: {
    name: string;
    address: string;
    city: string;
    billingEmail: string;
  };
  lineItems: InvoiceLineItem[];
}
