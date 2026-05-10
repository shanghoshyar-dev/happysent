import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";

import { createBlogPost } from "../actions";
import { BlogPostForm } from "../post-form";

export default function NyttBlogginlaggPage() {
  return (
    <div>
      <PageHeader
        title="Nytt inlägg"
        description="Skriv ett nytt blogginlägg."
      />
      <Card className="max-w-3xl">
        <BlogPostForm action={createBlogPost} submitLabel="Spara inlägg" />
      </Card>
    </div>
  );
}
