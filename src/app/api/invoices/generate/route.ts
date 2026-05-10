import { NextResponse } from "next/server";

import { generateInvoicesForMonth } from "@/app/admin/fakturor/actions";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { month?: string }
    | null;
  const month = body?.month;
  if (!month) {
    return NextResponse.json(
      { error: "Provide { month: 'YYYY-MM' }" },
      { status: 400 },
    );
  }

  try {
    const result = await generateInvoicesForMonth(month);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
