const repository = "hvitiswift-afk/nextjs-boilerplate";
const apiUrl = "https://api.github.com/search/issues";

export type PublicReconciliationSignals = {
  sourceState: "AVAILABLE" | "UNAVAILABLE";
  fetchedAt: string;
  openProposalRequests: number | null;
  readyForReview: number | null;
  quarantined: number | null;
  transitionConflicts: number | null;
  needsJpReview: number | null;
  sourceUrls: Record<string, string>;
  countsAreCanonicalEvidence: false;
  countsAreCommercialEvidence: false;
};

const queries = {
  openProposalRequests: `repo:${repository} is:issue is:open in:title "[FD event proposal]:"`,
  readyForReview: `repo:${repository} is:issue is:open label:"fd-proposal-ready-for-review"`,
  quarantined: `repo:${repository} is:issue is:open label:"fd-proposal-quarantined"`,
  transitionConflicts: `repo:${repository} is:issue is:open label:"fd-transition-conflict-v6-2"`,
  needsJpReview: `repo:${repository} is:issue is:open label:"needs-jp-review"`,
} as const;

const searchUrl = (query: string) =>
  `${apiUrl}?q=${encodeURIComponent(query)}&per_page=1`;

async function fetchCount(query: string): Promise<number> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "fardarter-drive-reconciliation-v6-3",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_PUBLIC_READ_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_PUBLIC_READ_TOKEN}`;
  }

  const response = await fetch(searchUrl(query), {
    headers,
    next: { revalidate: 900 },
  });
  if (!response.ok) {
    throw new Error(`GitHub search failed with ${response.status}`);
  }
  const payload = (await response.json()) as { total_count?: unknown };
  if (!Number.isInteger(payload.total_count) || Number(payload.total_count) < 0) {
    throw new Error("GitHub search returned an invalid total_count");
  }
  return Number(payload.total_count);
}

export async function getPublicReconciliationSignals(): Promise<PublicReconciliationSignals> {
  const sourceUrls = Object.fromEntries(
    Object.entries(queries).map(([key, query]) => [
      key,
      `https://github.com/${repository}/issues?q=${encodeURIComponent(
        query.replace(`repo:${repository} `, ""),
      )}`,
    ]),
  );

  try {
    const [
      openProposalRequests,
      readyForReview,
      quarantined,
      transitionConflicts,
      needsJpReview,
    ] = await Promise.all([
      fetchCount(queries.openProposalRequests),
      fetchCount(queries.readyForReview),
      fetchCount(queries.quarantined),
      fetchCount(queries.transitionConflicts),
      fetchCount(queries.needsJpReview),
    ]);

    return {
      sourceState: "AVAILABLE",
      fetchedAt: new Date().toISOString(),
      openProposalRequests,
      readyForReview,
      quarantined,
      transitionConflicts,
      needsJpReview,
      sourceUrls,
      countsAreCanonicalEvidence: false,
      countsAreCommercialEvidence: false,
    };
  } catch {
    return {
      sourceState: "UNAVAILABLE",
      fetchedAt: new Date().toISOString(),
      openProposalRequests: null,
      readyForReview: null,
      quarantined: null,
      transitionConflicts: null,
      needsJpReview: null,
      sourceUrls,
      countsAreCanonicalEvidence: false,
      countsAreCommercialEvidence: false,
    };
  }
}
