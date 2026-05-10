import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BloggAdminPage() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, author, is_published, published_at")
    .order("published_at", { ascending: false, nullsFirst: false });

  return (
    <div>
      <PageHeader
        title="Blogg"
        description="Administrera publicerade och utkastade inlägg."
        action={
          <Link href="/admin/blogg/nytt">
            <Button>Nytt inlägg</Button>
          </Link>
        }
      />

      {!posts || posts.length === 0 ? (
        <EmptyState
          title="Inga inlägg ännu"
          description="Skriv första inlägget om vad det innebär att fira på jobbet."
          action={
            <Link href="/admin/blogg/nytt">
              <Button>Skriv inlägg</Button>
            </Link>
          }
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Titel</TH>
              <TH>Författare</TH>
              <TH>Publicerad</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {posts.map((p) => (
              <TR key={p.id}>
                <TD className="font-medium text-slate-900">
                  <Link
                    href={`/admin/blogg/${p.id}`}
                    className="hover:underline"
                  >
                    {p.title}
                  </Link>
                </TD>
                <TD>{p.author}</TD>
                <TD>
                  {p.published_at
                    ? formatDate(p.published_at.slice(0, 10))
                    : "—"}
                </TD>
                <TD>
                  <Badge tone={p.is_published ? "success" : "neutral"}>
                    {p.is_published ? "Publicerad" : "Utkast"}
                  </Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
