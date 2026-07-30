const repository = "hvitiswift-afk/nextjs-boilerplate";
const apiUrl = "https://api.github.com/search/issues";

export const fardarterStateIds = [
  "REQUESTED",
  "FIT_APPROVED_FOR_SCOPE_DRAFT",
  "SCOPE_DRAFTED",
  "HUMAN_ACCEPTED",
  "PAID_PENDING",
  "PAID_SETTLED",
  "WORK_START_APPROVED",
  "ACTIVE",
  "DELIVERED",
  "ACCEPTED",
  "CANCELLED",
  "REFUNDED",
  "DISPUTED",
] as const;

export type FardarterStateId = (typeof fardarterStateIds)[number];

export type PublicStateLedger = {
  sourceState: "AVAILABLE" | "UNAVAILABLE";
  fetchedAt: string;
  counts: Record<FardarterStateId, number | null>;
  sourceUrls: Record<FardarterStateId, string>;
  countsAreCanonicalEvidence: false;
  countsAreCommercialEvidence: false;
};

const labelForState = (state: FardarterStateId) =>
  `fd-state-${state.toLowerCase().replaceAll("_", "-")}`;

const queryForState = (state: FardarterStateId) =>
  `repo:${repository} is:issue is:open label:"${labelForState(state)}"`;

const searchUrl = (query: string) =>
  `${apiUrl}?q=${encodeURIComponent(query)}&per_page=1`;

async function fetchCount(query: string): Promise<number> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "fardarter-drive-state-ledger-v6-2",
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

export async function getPublicStateLedger(): Promise<PublicStateLedger> {
  const sourceUrls = Object.fromEntries(
    fardarterStateIds.map((state) => {
      const query = queryForState(state);
      return [
        state,
        `https://github.com/${repository}/issues?q=${encodeURIComponent(
          query.replace(`repo:${repository} `, ""),
        )}`,
      ];
    }),
  ) as Record<FardarterStateId, string>;

  try {
    const values = await Promise.all(
      fardarterStateIds.map((state) => fetchCount(queryForState(state))),
    );
    const counts = Object.fromEntries(
      fardarterStateIds.map((state, index) => [state, values[index]]),
    ) as Record<FardarterStateId, number>;

    return {
      sourceState: "AVAILABLE",
      fetchedAt: new Date().toISOString(),
      counts,
      sourceUrls,
      countsAreCanonicalEvidence: false,
      countsAreCommercialEvidence: false,
    };
  } catch {
    const counts = Object.fromEntries(
      fardarterStateIds.map((state) => [state, null]),
    ) as Record<FardarterStateId, null>;
    return {
      sourceState: "UNAVAILABLE",
      fetchedAt: new Date().toISOString(),
      counts,
      sourceUrls,
      countsAreCanonicalEvidence: false,
      countsAreCommercialEvidence: false,
    };
  }
}
