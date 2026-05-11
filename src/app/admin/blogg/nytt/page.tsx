import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";

import { BlogPostForm } from "../post-form";

export const dynamic = "force-dynamic";

export default function NyttBlogginlaggPage() {
  return (
    <div>
      <PageHeader
        title="Nytt inlägg"
        description="Skriv ett nytt blogginlägg."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Blogg", href: "/admin/blogg" },
          { label: "Nytt inlägg" },
        ]}
      />
      <Card className="max-w-3xl">
        <BlogPostForm submitLabel="Spara inlägg" />
      </Card>
    </div>
  );
}
