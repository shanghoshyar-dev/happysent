import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/types/database";

interface PostFormProps {
  post?: Tables<"blog_posts"> | null;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}

export function BlogPostForm({ post, action, submitLabel }: PostFormProps) {
  return (
    <form action={action} className="space-y-5">
      <div>
        <Label htmlFor="title">Titel</Label>
        <Input id="title" name="title" required defaultValue={post?.title} />
      </div>
      <div>
        <Label htmlFor="author">Författare</Label>
        <Input
          id="author"
          name="author"
          defaultValue={post?.author ?? "Happysent"}
        />
      </div>
      <div>
        <Label htmlFor="content">Innehåll</Label>
        <Textarea
          id="content"
          name="content"
          required
          rows={14}
          defaultValue={post?.content}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="is_published"
          name="is_published"
          type="checkbox"
          defaultChecked={post?.is_published ?? false}
          className="h-4 w-4 rounded border-candy-300 text-candy-500 focus:ring-candy-300"
        />
        <Label htmlFor="is_published" className="mb-0">
          Publicera direkt
        </Label>
      </div>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
