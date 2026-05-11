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
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          placeholder="lämnas tom för att genereras från titeln"
          defaultValue={post?.slug}
          className="font-mono text-sm"
        />
        <p className="mt-1 text-xs text-slate-500">
          Adressen till inlägget blir{" "}
          <span className="font-mono text-slate-700">
            /blogg/
            {post?.slug ?? "din-slug-här"}
          </span>
          . Endast små bokstäver, siffror och bindestreck.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          SEO (Google och delning)
        </p>
        <div>
          <Label htmlFor="meta_title">Meta title</Label>
          <Input
            id="meta_title"
            name="meta_title"
            placeholder="Titel i sökresultat och i fliken – lämna tom för att använda sidans titel"
            defaultValue={post?.meta_title ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="meta_description">Meta description</Label>
          <Textarea
            id="meta_description"
            name="meta_description"
            rows={3}
            placeholder="Kort beskrivning under länken i Google, ca 150–160 tecken"
            defaultValue={post?.meta_description ?? ""}
          />
        </div>
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
        <Label htmlFor="excerpt">Ingress / utdrag</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          placeholder="Kort sammanfattning som visas på blogglistan och i delningar."
          defaultValue={post?.excerpt ?? ""}
        />
      </div>

      <div>
        <Label htmlFor="og_image_url">Open Graph-bild (URL, valfritt)</Label>
        <Input
          id="og_image_url"
          name="og_image_url"
          type="url"
          placeholder="https://…"
          defaultValue={post?.og_image_url ?? ""}
        />
      </div>

      <div>
        <Label htmlFor="content">Innehåll (Markdown)</Label>
        <Textarea
          id="content"
          name="content"
          required
          rows={18}
          defaultValue={post?.content}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_published"
          name="is_published"
          type="checkbox"
          defaultChecked={post?.is_published ?? false}
          className="h-4 w-4 rounded border-candy-300 text-candy-500 transition-colors focus:ring-2 focus:ring-coral-300"
        />
        <Label htmlFor="is_published" className="mb-0">
          Publicerad
        </Label>
      </div>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
