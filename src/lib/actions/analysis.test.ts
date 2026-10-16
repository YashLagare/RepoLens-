import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findFirst,
  deleteProjectMock,
  deleteChunksMock,
  deleteReportMock,
  deleteProjectFilesMock,
  revalidatePathMock,
  authMock,
  transactionMock,
} = vi.hoisted(() => ({
  findFirst: vi.fn(),
  deleteProjectMock: vi.fn(),
  deleteChunksMock: vi.fn(),
  deleteReportMock: vi.fn(),
  deleteProjectFilesMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  authMock: vi.fn(),
  transactionMock: vi.fn((ops) => Promise.all(ops)),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    $transaction: transactionMock,
    project: {
      findFirst,
      delete: deleteProjectMock,
    },
    codeChunk: {
      deleteMany: deleteChunksMock,
    },
    report: {
      deleteMany: deleteReportMock,
    },
  },
}));

vi.mock("@/lib/files/storage", () => ({
  deleteProjectFiles: deleteProjectFilesMock,
  persistProjectFiles: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { deleteProject } from "@/lib/actions/analysis";

describe("deleteProject action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if projectId is empty", async () => {
    const result = await deleteProject("");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Missing project id.");
  });

  it("fails if user is not authenticated or project does not exist", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-123" } });
    findFirst.mockResolvedValueOnce(null);

    const result = await deleteProject("proj-abc");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Project not found or unauthorized.");
  });

  it("successfully deletes project files and DB record when owned", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-123" } });
    findFirst.mockResolvedValueOnce({
      id: "proj-abc",
      userId: "user-123",
      name: "TestRepo",
    });
    deleteProjectMock.mockResolvedValueOnce({ id: "proj-abc" });
    deleteProjectFilesMock.mockResolvedValueOnce(undefined);

    const result = await deleteProject("proj-abc");
    expect(result.success).toBe(true);
    expect(deleteProjectFilesMock).toHaveBeenCalledWith("proj-abc");
    expect(transactionMock).toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
  });
});
