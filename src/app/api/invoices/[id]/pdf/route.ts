import { NextResponse } from "next/server";

import { isAdminUser } from "@/lib/auth/session";
import { generateInvoicePdf } from "@/lib/invoices/generate-invoice-pdf";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdminUser(user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await generateInvoicePdf(params.id);
  if (!result) {
    return NextResponse.json({ error: "Faktura hittades inte" }, { status: 404 });
  }

  const admin = createAdminClient();
  await admin
    .from("invoices")
    .update({ pdf_downloaded_at: new Date().toISOString() })
    .eq("id", params.id);

  return new NextResponse(new Uint8Array(result.buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
