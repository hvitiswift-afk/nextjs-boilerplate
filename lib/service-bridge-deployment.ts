export type DeploymentProviderStatus = {
  provider: "vercel" | "netlify" | "other";
  configured: boolean;
  deploymentVerified: boolean;
  blocked: boolean | null;
  detail: string;
};

export function createDeploymentReadinessReport(input?: {
  providers?: DeploymentProviderStatus[];
  commitSha?: string | null;
}) {
  const providers = input?.providers ?? [
    {
      provider: "vercel" as const,
      configured: true,
      deploymentVerified: false,
      blocked: null,
      detail:
        "A deployment integration may exist, but this application runtime has not independently verified a successful public deployment.",
    },
    {
      provider: "netlify" as const,
      configured: false,
      deploymentVerified: false,
      blocked: null,
      detail: "No verified Netlify deployment is recorded by this local readiness report.",
    },
  ];

  const verifiedProviders = providers.filter((provider) => provider.deploymentVerified);
  const blockedProviders = providers.filter((provider) => provider.blocked === true);

  return {
    schema: "jp-hviti-service-bridge-deployment-readiness/v1",
    generatedAt: new Date().toISOString(),
    commitSha: input?.commitSha ?? null,
    providers,
    summary: {
      providerCount: providers.length,
      verifiedProviderCount: verifiedProviders.length,
      blockedProviderCount: blockedProviders.length,
      publicDeploymentVerified: verifiedProviders.length > 0,
      productionUrlVerified: false,
    },
    boundaries: {
      buildSuccessEqualsDeploymentSuccess: false,
      ciSuccessEqualsDeploymentSuccess: false,
      repositoryCommitEqualsDeploymentSuccess: false,
      providerStatusRequiresIndependentVerification: true,
      externalActionCompleted: false,
    },
    nextAction:
      verifiedProviders.length > 0
        ? "Review the verified provider URL and deployment receipt."
        : "Resolve provider account or configuration issues, deploy, then independently verify the public URL.",
    externalActionCompleted: false as const,
  };
}
