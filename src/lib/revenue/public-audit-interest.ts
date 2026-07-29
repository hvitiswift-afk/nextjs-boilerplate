const repositoryIssuesApi =
  "https://api.github.com/repos/hvitiswift-afk/nextjs-boilerplate/issues?state=open&per_page=100";

export const publicAuditRequestsUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues?q=is%3Aissue+is%3Aopen+in%3Atitle+%22%5BAudit+request%5D%22";

const auditRequestTitlePrefix = "[Audit request]:";

interface GitHubIssueRow {
  title?: unknown;
  pull_request?: unknown;
}

export interface PublicAuditInterest {
  publicRequestCount: number | null;
  sourceState: "AVAILABLE" | "UNAVAILABLE";
  sourceUrl: string;
  countedAsOrders: false;
  reservesCapacity: false;
}

export async function getPublicAuditInterest(): Promise<PublicAuditInterest> {
  try {
    const response = await fetch(repositoryIssuesApi, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "jp-systems-audit-product-surface",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      return unavailableInterest();
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      return unavailableInterest();
    }

    const publicRequestCount = payload.reduce((count, row) => {
      const issue = row as GitHubIssueRow;
      const isIssue = issue.pull_request === undefined;
      const isAuditRequest =
        typeof issue.title === "string" &&
        issue.title.startsWith(auditRequestTitlePrefix);

      return isIssue && isAuditRequest ? count + 1 : count;
    }, 0);

    return {
      publicRequestCount,
      sourceState: "AVAILABLE",
      sourceUrl: publicAuditRequestsUrl,
      countedAsOrders: false,
      reservesCapacity: false,
    };
  } catch {
    return unavailableInterest();
  }
}

function unavailableInterest(): PublicAuditInterest {
  return {
    publicRequestCount: null,
    sourceState: "UNAVAILABLE",
    sourceUrl: publicAuditRequestsUrl,
    countedAsOrders: false,
    reservesCapacity: false,
  };
}
