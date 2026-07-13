export const missionStates = [
  "draft",
  "preflight",
  "awaiting-approval",
  "ready",
  "verified",
  "closed",
] as const;

export type MissionState = (typeof missionStates)[number];

export type ServiceKind =
  | "public-launcher"
  | "connected-tool"
  | "jp-hviti-route"
  | "manual-workflow";

export type ServiceDefinition = {
  id: string;
  name: string;
  kind: ServiceKind;
  capabilities: string[];
  baseUrl: string;
  externalAction: boolean;
  notes: string;
};

export type ServiceMission = {
  id: string;
  title: string;
  service: string;
  target: string;
  action: string;
  owner: string;
  state: MissionState;
  priority: number;
  budget: string;
  permission: string;
  evidence: string;
  fallback: string;
  next: string;
  query: string;
  location: string;
  updatedAt: string;
};

export type MissionValidation = {
  valid: boolean;
  readiness: number;
  verdict: "hold" | "ready-for-user-action" | "verified" | "closed";
  missing: string[];
  warnings: string[];
  launchUrl: string;
  externalActionCompleted: false;
};

export const serviceRegistry: ServiceDefinition[] = [
  {
    id: "indeed",
    name: "Indeed",
    kind: "public-launcher",
    capabilities: ["job-search", "employer-research", "application-preparation"],
    baseUrl: "https://www.indeed.com/",
    externalAction: true,
    notes: "Search launcher only; application submission remains user-controlled.",
  },
  {
    id: "uber",
    name: "Uber",
    kind: "public-launcher",
    capabilities: ["ride-planning", "mobility"],
    baseUrl: "https://www.uber.com/",
    externalAction: true,
    notes: "Ride booking and payment remain user-controlled.",
  },
  {
    id: "grubhub",
    name: "Grubhub",
    kind: "public-launcher",
    capabilities: ["food-search", "delivery-planning"],
    baseUrl: "https://www.grubhub.com/",
    externalAction: true,
    notes: "Order placement and payment remain user-controlled.",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    kind: "public-launcher",
    capabilities: ["job-search", "professional-research"],
    baseUrl: "https://www.linkedin.com/jobs/",
    externalAction: true,
    notes: "Search launcher only; messages and applications remain user-controlled.",
  },
  {
    id: "gmail",
    name: "Gmail",
    kind: "connected-tool",
    capabilities: ["draft", "review", "send"],
    baseUrl: "https://mail.google.com/",
    externalAction: true,
    notes: "Sending requires explicit instruction and tool confirmation.",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    kind: "connected-tool",
    capabilities: ["schedule", "update", "invite"],
    baseUrl: "https://calendar.google.com/",
    externalAction: true,
    notes: "Calendar changes require explicit instruction.",
  },
  {
    id: "github",
    name: "GitHub",
    kind: "connected-tool",
    capabilities: ["code", "version", "issue", "receipt"],
    baseUrl: "https://github.com/hvitiswift-afk/nextjs-boilerplate",
    externalAction: true,
    notes: "Repository writes require an explicit task and produce a commit receipt.",
  },
  {
    id: "norstein",
    name: "Norstein",
    kind: "jp-hviti-route",
    capabilities: ["preview", "test", "supporter-workflow"],
    baseUrl: "/norstein-preview/index.html",
    externalAction: false,
    notes: "Internal JP / Hviti preview route; readiness must be stated truthfully.",
  },
  {
    id: "v-main",
    name: "V# MAIN",
    kind: "jp-hviti-route",
    capabilities: ["visual-preparation", "interface", "diagram"],
    baseUrl: "/jp-hviti-work-nexus/index.html",
    externalAction: false,
    notes: "Direct visual-work preparation route.",
  },
];

const requiredFields: Array<keyof ServiceMission> = [
  "title",
  "target",
  "action",
  "owner",
  "permission",
  "evidence",
  "fallback",
];

export function getService(name: string) {
  return serviceRegistry.find((service) => service.name === name) ?? null;
}

export function calculateReadiness(mission: ServiceMission) {
  const complete = requiredFields.filter((field) => String(mission[field] ?? "").trim()).length;
  return Math.round((complete / requiredFields.length) * 100);
}

export function getLaunchUrl(mission: ServiceMission) {
  const query = encodeURIComponent(mission.query || mission.target);
  const location = encodeURIComponent(mission.location);

  switch (mission.service) {
    case "Indeed":
      return `https://www.indeed.com/jobs?q=${query}&l=${location}`;
    case "LinkedIn":
      return `https://www.linkedin.com/jobs/search/?keywords=${query}&location=${location}`;
    case "Grubhub":
      return `https://www.grubhub.com/search?queryText=${query}`;
    case "GitHub":
      return `https://github.com/search?q=${query}&type=repositories`;
    default:
      return getService(mission.service)?.baseUrl ?? "#";
  }
}

export function validateMission(mission: ServiceMission): MissionValidation {
  const missing = requiredFields.filter((field) => !String(mission[field] ?? "").trim());
  const warnings: string[] = [];
  const service = getService(mission.service);

  if (!service) warnings.push("Unknown service adapter.");
  if (service?.externalAction && mission.state === "ready" && !mission.permission.trim()) {
    warnings.push("External action cannot be ready without explicit permission.");
  }
  if (mission.priority < 1 || mission.priority > 10) {
    warnings.push("Priority must remain between 1 and 10.");
  }
  if (!mission.updatedAt) warnings.push("No update timestamp recorded.");

  const readiness = calculateReadiness(mission);
  let verdict: MissionValidation["verdict"] = "hold";
  if (mission.state === "verified") verdict = "verified";
  else if (mission.state === "closed") verdict = "closed";
  else if (readiness === 100 && missing.length === 0) verdict = "ready-for-user-action";

  return {
    valid: missing.length === 0 && warnings.length === 0,
    readiness,
    verdict,
    missing,
    warnings,
    launchUrl: getLaunchUrl(mission),
    externalActionCompleted: false,
  };
}

export function advanceMissionState(state: MissionState): MissionState {
  const index = missionStates.indexOf(state);
  return missionStates[Math.min(index + 1, missionStates.length - 1)];
}
