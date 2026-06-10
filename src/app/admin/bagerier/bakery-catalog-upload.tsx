"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getBakeryCatalogPdfUrl } from "@/lib/cake-selection/catalog-url";

import { clearBakeryCatalog, uploadBakeryCatalog } from "./actions";

interface Props {
  bakeryId: string;
  bakeryName: string;
  catalogPdfPath: string | null;
}

export function BakeryCatalogUpload({
  bakeryId,
  bakeryName,
  catalogPdfPath,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const catalogUrl = getBakeryCatalogPdfUrl(catalogPdfPath);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-slate-900">Tårtkatalog (PDF)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Katalogen visas för företag kopplade till {bakeryName}. Utan egen PDF
          används standardkatalogen.
        </p>
        <p className="mt-3 text-sm">
          <a
            href={catalogUrl}
            className="font-medium text-coral-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {catalogPdfPath ? "Öppna bageriets katalog" : "Öppna standardkatalog"}
          </a>
        </p>
      </div>

      {message ? (
        <p
          className={`text-sm ${isError ? "text-red-600" : "text-emerald-800"}`}
          role="alert"
        >
          {message}
        </p>
      ) : null}

      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          setMessage(null);
          startTransition(async () => {
            const result = await uploadBakeryCatalog(bakeryId, formData);
            if (result.ok) {
              setIsError(false);
              setMessage("Katalog uppladdad.");
              router.refresh();
            } else {
              setIsError(true);
              setMessage(result.error);
            }
          });
        }}
      >
        <div>
          <Label htmlFor="catalog_pdf">Ladda upp ny PDF</Label>
          <input
            id="catalog_pdf"
            name="catalog_pdf"
            type="file"
            accept="application/pdf,.pdf"
            required
            className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-candy-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-candy-800"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Laddar upp…" : "Spara katalog"}
        </Button>
      </form>

      {catalogPdfPath ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setMessage(null);
            startTransition(async () => {
              const result = await clearBakeryCatalog(bakeryId);
              if (result.ok) {
                setIsError(false);
                setMessage("Egen katalog borttagen — standardkatalog används.");
                router.refresh();
              } else {
                setIsError(true);
                setMessage(result.error);
              }
            });
          }}
        >
          <Button type="submit" variant="secondary" disabled={pending}>
            Återställ till standardkatalog
          </Button>
        </form>
      ) : null}
    </div>
  );
}
