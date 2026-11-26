import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The dashboard is never linked publicly, but keep crawlers out of it
        // regardless. Access is enforced on the server, not by obscurity.
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
