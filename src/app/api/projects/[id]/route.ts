import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteProjectFiles } from "@/lib/files/storage";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    if (!id) {
      return Response.json(
        { ok: false, error: "Missing project id" },
        { status: 400 },
      );
    }

    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, name: true },
    });

    if (!project) {
      return Response.json(
        { ok: false, error: "Project not found" },
        { status: 404 },
      );
    }

    // Safely delete on disk/temp storage
    try {
      await deleteProjectFiles(project.id);
    } catch (storageError) {
      console.warn("Storage files cleanup skipped/failed:", storageError);
    }

    // Transactional database cleanup: delete chunks and reports first to prevent foreign key errors
    await prisma.$transaction([
      prisma.codeChunk.deleteMany({ where: { projectId: project.id } }),
      prisma.report.deleteMany({ where: { projectId: project.id } }),
      prisma.project.delete({ where: { id: project.id } }),
    ]);

    revalidatePath("/dashboard");

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Failed to delete project",
      },
      { status: 500 },
    );
  }
}
