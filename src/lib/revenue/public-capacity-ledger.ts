const repository = "hvitiswift-afk/nextjs-boilerplate";
const apiUrl = "https://api.github.com/search/issues";

export type PublicCapacityCounts = {
  sourceState: "AVAILABLE" | "UNAVAILABLE";
  fetchedAt: string;
  openFitChecks: number | null;
  fitApprovedRequests: number | null;
  activeDeliveryIssues: number | null;
  capacityOverrideRequests: number | null;
  sourceUrls: Record<string, string>;
  countsAreCommercialEvidence: false;
};

const queries = {
  openFitChecks: `repo:${repository} is:issue is:open in:title "[Audit request]:"`,
  fitApprovedRequests: `repo:${repository} is:issue is:open label:"fit-approved-for-scope-draft"`,
  activeDeliveryIssues: `repo:${repository} is:issue is:open label:"fd-active-delivery"`,
  capacityOverrideRequests: `repo:${repository} is:issue is:open in:title "[FD capacity override]:"`,
} as const;

const searchUrl = (query: string) => `${apiUrl}?q=${encodeURIComponent(query)}&per_page=1`;

async function fetchCount(query: string): Promise<number> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "fardarter-drive-capacity-ledger-v6-1",
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

export async function getPublicCapacityCounts(): Promise<PublicCapacityCounts> {
  const sourceUrls = Object.fromEntries(
    Object.entries(queries).map(([key, query]) => [
      key,
      `https://github.com/${repository}/issues?q=${encodeURIComponent(query.replace(`repo:${repository} `, ""))}`,
    ]),
  );

  try {
    const [openFitChecks, fitApprovedRequests, activeDeliveryIssues, capacityOverrideRequests] =
      await Promise.all([
        fetchCount(queries.openFitChecks),
        fetchCount(queries.fitApprovedRequests),
        fetchCount(queries.activeDeliveryIssues),
        fetchCount(queries.capacityOverrideRequests),
      ]);

    return {
      sourceState: "AVAILABLE",
      fetchedAt: new Date().toISOString(),
      openFitChecks,
      fitApprovedRequests,
      activeDeliveryIssues,
      capacityOverrideRequests,
      sourceUrls,
      countsAreCommercialEvidence: false,
    };
  } catch {
    return {
      sourceState: "UNAVAILABLE",
      fetchedAt: new Date().toISOString(),
      openFitChecks: null,
      fitApprovedRequests: null,
      activeDeliveryIssues: null,
      capacityOverrideRequests: null,
      sourceUrls,
      countsAreCommercialEvidence: false,
    };
  }
}
