import type { ReactNode } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { getNeighborhoods } from "@/lib/queries/properties";
import { getPublicSettings } from "@/lib/queries/settings";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getPublicSettings();

  // The footer's neighborhood column is a nice-to-have: if the catalogue query
  // fails (or the database is not configured yet) the site still renders.
  let neighborhoods: Array<{ slug: string; label: string }> = [];
  try {
    neighborhoods = (await getNeighborhoods(6)).map((item) => ({
      slug: item.slug,
      label: item.label,
    }));
  } catch {
    neighborhoods = [];
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} neighborhoods={neighborhoods} />
    </div>
  );
}
