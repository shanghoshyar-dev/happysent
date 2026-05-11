"use client";

import { Button } from "@/components/ui/button";

interface Props {
  action: () => void | Promise<void>;
}

export function DeleteBlogPostForm({ action }: Props) {
  return (
    <form
      action={action}
      className="mt-4"
      onSubmit={(e) => {
        if (
          !globalThis.confirm(
            "Ta bort inlägget permanent? Publik länk och sökresultat uppdateras. Detta går inte att ångra.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="danger">
        Ta bort
      </Button>
    </form>
  );
}
