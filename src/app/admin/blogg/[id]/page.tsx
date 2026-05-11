import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { deleteBlogPost } from "../actions";
import { DeleteBlogPostForm } from "../delete-blog-post-form";
import { BlogPostForm } from "../post-form";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function EditBlogPostPage({ params }: Props) {
  const supabase = createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!post) notFound();

  const remove = deleteBlogPost.bind(null, post.id);

  return (
    <div>
      <PageHeader
        title="Redigera inlägg"
        description={post.title}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Blogg", href: "/admin/blogg" },
          { label: post.title },
        ]}
        action={
          <Link href="/admin/blogg">
            <Button variant="secondary">Tillbaka</Button>
          </Link>
        }
      />
      <Card className="max-w-3xl">
        <BlogPostForm post={post} submitLabel="Spara ändringar" />
      </Card>

      <div className="mt-8 max-w-3xl rounded-2xl border border-red-100 bg-red-50/50 p-6">
        <h3 className="font-semibold text-red-800">Ta bort inlägg</h3>
        <DeleteBlogPostForm action={remove} />
      </div>
    </div>
  );
}
