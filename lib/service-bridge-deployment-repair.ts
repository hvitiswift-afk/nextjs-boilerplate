import type { DeploymentProviderStatus } from "@/lib/service-bridge-deployment";

export type DeploymentRepairStrategy =
  | "repair-vercel-account"
  | "repair-vercel-project"
  | "bridge-to-netlify"
  | "bridge-to-other-provider"
  | "verify-existing-deployment";

export function createDeploymentRepairPlan(input: {
  commitSha: string;
  providers: DeploymentProviderStatus[];
  preferredStrategy?: DeploymentRepairStrategy;
  confirmation: string;
}) {
  if (!input.commitSha.trim()) throw new Error("Commit SHA is required.");
  if (!Array.isArray(input.providers) || input.providers.length === 0) {
    throw new Error("At least one provider status is required.");
  }

  const expectedConfirmation = `PLAN DEPLOYMENT REPAIR ${input.commitSha}`;
  if (input.confirmation.trim() !== expectedConfirmation) {
    throw new Error(`Confirmation must exactly equal: ${expectedConfirmation}`);
  }

  const vercel = input.providers.find((provider) => provider.provider === "vercel");
  const anyVerified = input.providers.some((provider) => provider.deploymentVerified);
  const inferredStrategy: DeploymentRepairStrategy = anyVerified
    ? "verify-existing-deployment"
    : vercel?.blocked === true
      ? "bridge-to-netlify"
      : vercel?.configured
        ? "repair-vercel-project"
        : "bridge-to-other-provider";
  const strategy = input.preferredStrategy ?? inferredStrategy;

  const stepsByStrategy: Record<DeploymentRepairStrategy, string[]> = {
    "repair-vercel-account": [
      "Resolve the Vercel account-level deployment block.",
      "Confirm the account can create deployments again.",
      "Trigger a fresh production deployment for the exact commit.",
      "Verify the public URL and health endpoint.",
    ],
    "repair-vercel-project": [
      "Inspect the Vercel project linkage and build settings.",
      "Confirm repository, branch, framework, and environment configuration.",
      "Trigger a fresh deployment for the exact commit.",
      "Verify the deployment URL and Service Bridge health endpoint.",
    ],
    "bridge-to-netlify": [
      "Create or repair an alternate Netlify project linked to the repository.",
      "Use the Next.js runtime adapter supported by the provider.",
      "Configure required environment variables without copying secrets into source control.",
      "Deploy the exact commit and verify the public URL.",
    ],
    "bridge-to-other-provider": [
      "Select a provider that supports the current Next.js runtime and API routes.",
      "Link the repository and exact production branch.",
      "Configure environment values through provider-managed secrets.",
      "Deploy the exact commit and verify the public URL.",
    ],
    "verify-existing-deployment": [
      "Fetch the reported deployment URL.",
      "Verify the Service Bridge health, manifest, and OpenAPI endpoints.",
      "Record the provider deployment ID and commit SHA.",
      "Mark public deployment verified only after successful checks.",
    ],
  };

  return {
    schema: "jp-hviti-service-bridge-deployment-repair-plan/v1",
    plannedAt: new Date().toISOString(),
    commitSha: input.commitSha,
    expectedConfirmation,
    strategy,
    inferredStrategy,
    steps: stepsByStrategy[strategy],
    providerSnapshot: input.providers,
    execution: {
      automaticDeploymentAllowed: false as const,
      requiresProviderAuthorization: true as const,
      requiresIndependentUrlVerification: true as const,
      repairApplied: false as const,
      deploymentCompleted: false as const,
    },
    boundaries: {
      repositoryMutationApplied: false as const,
      providerMutationApplied: false as const,
      externalActionCompleted: false as const,
    },
    externalActionCompleted: false as const,
  };
}
