import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/github-control-tower-audit`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/github-control-tower-audit/operations`,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/github-control-tower-audit/reconciliation`,
      changeFrequency: "daily",
      priority: 0.82,
    },
    {
      url: `${siteUrl}/github-control-tower-audit/canonicalization-preview`,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
