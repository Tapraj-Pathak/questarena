import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";

/**
 * Record that a verification workflow was triggered for a result. This
 * creates a `WorkflowExecution` row that can later be updated by an external
 * orchestrator (e.g. Chainlink CRE).
 */
export async function recordWorkflow(campaignId: string, resultId: string) {
  await prisma.workflowExecution.create({
    data: {
      campaignId,
      resultId,
      workflowId: "local-verifier",
      runId: randomUUID(),
      status: "QUEUED",
      triggerType: "RESULT_SUBMITTED",
    },
  });
}

/**
 * Run a local (simulated) verification. In production this would delegate to
 * independent verifier services / Chainlink CRE oracles. The local version
 * unconditionally approves the result with the required number of synthetic
 * signatures so the rest of the flow is exercisable.
 */
export async function runVerification(resultId: string) {
  const result = await prisma.gameResult.findUnique({
    where: { id: resultId },
    include: { session: { include: { campaign: true } } },
  });
  if (!result) return { status: "error" as const };

  const required = result.requiredCount;

  // Ensure we have enough verifier rows.
  const existingVerifiers = await prisma.verifier.findMany({ where: { status: "ACTIVE" }, take: required });
  const verifiers = [...existingVerifiers];
  while (verifiers.length < required) {
    const index = verifiers.length + 1;
    const verifier = await prisma.verifier.upsert({
      where: { name: `local-verifier-${index}` },
      update: {},
      create: {
        name: `local-verifier-${index}`,
        publicKey: `local-pk-${index}-${randomUUID()}`,
        status: "ACTIVE",
      },
    });
    verifiers.push(verifier);
  }

  // Create approval signatures.
  for (const verifier of verifiers.slice(0, required)) {
    await prisma.verificationSignature.upsert({
      where: { resultId_verifierId: { resultId, verifierId: verifier.id } },
      update: {},
      create: {
        resultId,
        verifierId: verifier.id,
        signature: `local-sig-${randomUUID()}`,
        decision: "APPROVE",
        reason: "Local verifier auto-approved for development.",
      },
    });
  }

  await prisma.gameResult.update({
    where: { id: resultId },
    data: { status: "VERIFIED", verifiedCount: required },
  });

  // Update the workflow row.
  await prisma.workflowExecution.updateMany({
    where: { resultId, status: "QUEUED" },
    data: { status: "SUCCEEDED", finishedAt: new Date() },
  });

  return { status: "verified" as const, signaturesCollected: required };
}

