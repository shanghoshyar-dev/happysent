"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

import { getPostLoginRedirectPath } from "../../login/actions";

type Mode = "password" | "magic";
type Status = "idle" | "sending" | "sent" | "error";

export function KundLoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    const supabase = createClient();

    if (mode === "password") {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        setStatus("error");
        setError(err.message);
        return;
      }
      const path = await getPostLoginRedirectPath();
      if (path.includes("no_access") || path.startsWith("/admin")) {
        await supabase.auth.signOut();
        setStatus("error");
        setError(
          "Inget kundkonto hittades. Öppna inbjudan från HappySent eller kontakta oss.",
        );
        return;
      }
      router.push(path);
      router.refresh();
      return;
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/kund`,
        shouldCreateUser: false,
      },
    });

    if (err) {
      setStatus("error");
      setError(err.message);
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl bg-emerald-50 p-6 text-sm text-emerald-800">
        <p className="font-semibold">Kolla din inkorg!</p>
        <p className="mt-1">
          Vi har skickat en inloggningslänk till <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex rounded-full bg-candy-50 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => {
            setMode("password");
            setError(null);
          }}
          className={`flex-1 rounded-full px-4 py-2 transition-colors ${
            mode === "password"
              ? "bg-white text-candy-700 shadow-sm"
              : "text-slate-500 hover:text-candy-700"
          }`}
        >
          Lösenord
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("magic");
            setError(null);
          }}
          className={`flex-1 rounded-full px-4 py-2 transition-colors ${
            mode === "magic"
              ? "bg-white text-candy-700 shadow-sm"
              : "text-slate-500 hover:text-candy-700"
          }`}
        >
          Magisk länk
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">E-postadress</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {mode === "password" ? (
          <div>
            <Label htmlFor="password">Lösenord</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        ) : null}
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={status === "sending"}>
          {status === "sending"
            ? "Skickar…"
            : mode === "password"
              ? "Logga in"
              : "Skicka inloggningslänk"}
        </Button>
      </form>
    </div>
  );
}
