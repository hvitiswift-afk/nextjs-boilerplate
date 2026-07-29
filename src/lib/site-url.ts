const fallbackSiteUrl = "https://lichburn-v0-2-8.netlify.app";

export function getSiteUrl(): string {
  const candidate =
    process.env.URL ?? process.env.DEPLOY_PRIME_URL ?? fallbackSiteUrl;

  try {
    return new URL(candidate).origin;
  } catch {
    return fallbackSiteUrl;
  }
}
