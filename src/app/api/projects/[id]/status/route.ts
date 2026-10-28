import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/** Lightweight status endpoint for the analysis progress page. */
export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      name: true,
      status: true,
      progressStep: true,
      progressPercent: true,
      errorMessage: true,
      framework: true,
      fileCount: true,
      updatedAt: true,
      _count: { select: { chunks: true } },
      report: { select: { healthScore: true } },
    },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  // Detect if a serverless background worker timed out (no updates for > 50s while processing)
  const isStalled =
    project.status === "processing" &&
    Date.now() - project.updatedAt.getTime() > 50 * 1000;

  return Response.json({
    id: project.id,
    name: project.name,
    status: project.status,
    progressStep: project.progressStep,
    progressPercent: project.progressPercent,
    errorMessage: project.errorMessage,
    framework: project.framework,
    fileCount: project.fileCount,
    report: project.report,
    isStalled,
    chunksReady: project._count.chunks > 0,
  });
}
