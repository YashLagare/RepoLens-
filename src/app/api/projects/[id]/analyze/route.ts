import { runFullProjectAnalysis } from "@/lib/analysis/pipeline";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return Response.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    if (project.status === "completed") {
      return Response.json({
        ok: true,
        alreadyCompleted: true,
        status: "completed",
        progressStep: project.progressStep ?? "Complete",
        progressPercent: project.progressPercent ?? 100,
      });
    }

    // Avoid starting a second run if one is clearly in-flight.
    if (
      project.status === "processing" &&
      project.progressPercent >= 30 &&
      Date.now() - project.updatedAt.getTime() < 2 * 60 * 1000
    ) {
      return Response.json({
        ok: true,
        alreadyRunning: true,
        status: project.status,
        progressStep: project.progressStep,
        progressPercent: project.progressPercent,
      });
    }

    if (project.status === "failed" && project.fileCount === 0) {
      return Response.json(
        {
          ok: false,
          error:
            "Import failed before files were ready. Please create a new project.",
        },
        { status: 400 },
      );
    }

    await runFullProjectAnalysis(project.id);
    const updated = await prisma.project.findUnique({
      where: { id: project.id },
    });

    return Response.json({
      ok: true,
      status: updated?.status ?? "completed",
      progressStep: updated?.progressStep ?? "Complete",
      progressPercent: updated?.progressPercent ?? 100,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Analysis failed.";
    console.error("Analysis execution error:", error);

    let projectId: string | undefined;
    try {
      const resolved = await context.params;
      projectId = resolved.id;
    } catch {
      // ignore
    }

    let updated = null;
    if (projectId) {
      try {
        updated = await prisma.project.update({
          where: { id: projectId },
          data: {
            status: "failed",
            progressStep: "Analysis failed",
            errorMessage,
          },
        });
      } catch {
        // ignore fallback error
      }
    }

    return Response.json(
      {
        ok: false,
        status: "failed",
        progressStep: "Analysis failed",
        progressPercent: updated?.progressPercent ?? 0,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
