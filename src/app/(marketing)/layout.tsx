import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNav } from "@/components/marketing/nav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <MarketingNav />
      <main className="min-w-0 flex-1 overflow-x-clip scroll-pt-28">{children}</main>
      <MarketingFooter />
    </div>
  );
}
