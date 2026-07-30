const repository = "hvitiswift-afk/nextjs-boilerplate";
const apiUrl = "https://api.github.com/search/issues";

export type PublicCanonicalizationPreviewCounts = {
  sourceState: "AVAILABLE" | "UNAVAILABLE";
  fetchedAt: string;
  openPreviewRequests: number | null;
  previewReady: number | null;
  blocked: number | null;
  needsReview: number | null;
  sourceUrls: Record<string, string>;
  countsAreCanonicalEvidence: false;
  countsAreCommercialEvidence: false;
};

const queries = {
  openPreviewRequests: `repo:${repository} is:issue is:open in:title "[FD preview]:"`,
  previewReady: `repo:${repository} is:issue is:open label:"fd-preview-ready"`,
  blocked: `repo:${repository} is:issue is:open label:"fd-preview-blocked"`,
  needsReview: `repo:${repository} is:issue is:open in:title "[FD preview]:" label:"needs-jp-review"`,
} as const;

const searchUrl = (query: string) => `${apiUrl}?q=${encodeURIComponent(query)}&per_page=1`;

async function fetchCount(query: string): Promise<number> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "fardarter-drive-canonicalization-preview-v6-4",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_PUBLIC_READ_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_PUBLIC_READ_TOKEN}`;
  }

  const response = await fetch(searchUrl(query), {
    headers,
    next: { revalidate: 900 },
  });
  if (!response.ok) throw new Error(`GitHub search failed with ${response.status}`);
  const payload = (await response.json()) as { total_count?: unknown };
  if (!Number.isInteger(payload.total_count) || Number(payload.total_count) < 0) {
    throw new Error("GitHub search returned an invalid total_count");
  }
  return Number(payload.total_count);
}

export async function getPublicCanonicalizationPreviewCounts(): Promise<PublicCanonicalizationPreviewCounts> {
  const sourceUrls = Object.fromEntries(
    Object.entries(queries).map(([key, query]) => [
      key,
      `https://github.com/${repository}/issues?q=${encodeURIComponent(query.replace(`repo:${repository} `, ""))}`,
    ]),
  );

  try {
    const [openPreviewRequests, previewReady, blocked, needsReview] = await Promise.all([
      fetchCount(queries.openPreviewRequests),
      fetchCount(queries.previewReady),
      fetchCount(queries.blocked),
      fetchCount(queries.needsReview),
    ]);
    return {
      sourceState: "AVAILABLE",
      fetchedAt: new Date().toISOString(),
      openPreviewRequests,
      previewReady,
      blocked,
      needsReview,
      sourceUrls,
      countsAreCanonicalEvidence: false,
      countsAreCommercialEvidence: false,
    };
  } catch {
    return {
      sourceState: "UNAVAILABLE",
      fetchedAt: new Date().toISOString(),
      openPreviewRequests: null,
      previewReady: null,
      blocked: null,
      needsReview: null,
      sourceUrls,
      countsAreCanonicalEvidence: false,
      countsAreCommercialEvidence: false,
    };
  }
}
