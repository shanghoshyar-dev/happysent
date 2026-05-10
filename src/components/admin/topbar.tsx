import { SignOutButton } from "./sign-out-button";

interface TopBarProps {
  email?: string | null;
}

export function AdminTopBar({ email }: TopBarProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-candy-100 bg-white px-6">
      <div className="text-sm text-slate-500">Admin</div>
      <div className="flex items-center gap-4">
        {email ? (
          <span className="text-sm text-slate-600">{email}</span>
        ) : null}
        <SignOutButton />
      </div>
    </div>
  );
}
