export type ShirtLayer =
  | "source"
  | "legal"
  | "finance"
  | "production"
  | "director"
  | "crew"
  | "cast"
  | "music"
  | "vfx"
  | "post"
  | "distribution"
  | "house"
  | "logistics"
  | "credits"
  | "audience";

export type BeamStatus =
  | "REJECTED"
  | "CANDIDATE"
  | "CLEAR"
  | "STRONG"
  | "CORE"
  | "ANOMALY";

export type GoblinSeverity = "LOW" | "MEDIUM" | "HIGH";

export interface Credit {
  id: string;
  productionId: string;
  personOrEntity: string;
  role: string;
  department?: string;
  layer: ShirtLayer;
  sourceUrl?: string;
  verified: boolean;
}

export interface Beam {
  id: string;
  people: [string, string];
  sharedProductions: string[];
  repeatCount: number;
  layer: ShirtLayer;
  confidence: number;
  status?: BeamStatus;
}

export interface GoblinFlag {
  type: string;
  severity: GoblinSeverity;
  message: string;
}

export interface BlackletterDecision {
  status: "APPROVED" | "CAUTION" | "BLOCKED";
  reason?: string;
  note?: string;
}
