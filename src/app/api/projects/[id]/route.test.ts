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
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import { DELETE } from "@/app/api/projects/[id]/route";

describe("DELETE /api/projects/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if unauthorized", async () => {
    authMock.mockResolvedValueOnce(null);

    const request = new Request("http://localhost/api/projects/proj-1", {
      method: "DELETE",
    });
    const context = { params: Promise.resolve({ id: "proj-1" }) };

    const response = await DELETE(request, context);
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 404 if project not found", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    findFirst.mockResolvedValueOnce(null);

    const request = new Request("http://localhost/api/projects/proj-1", {
      method: "DELETE",
    });
    const context = { params: Promise.resolve({ id: "proj-1" }) };

    const response = await DELETE(request, context);
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe("Project not found");
  });

  it("deletes project, cascades data, and returns 200 on success", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    findFirst.mockResolvedValueOnce({ id: "proj-1", name: "RepoLens" });

    const request = new Request("http://localhost/api/projects/proj-1", {
      method: "DELETE",
    });
    const context = { params: Promise.resolve({ id: "proj-1" }) };

    const response = await DELETE(request, context);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.ok).toBe(true);

    expect(deleteProjectFilesMock).toHaveBeenCalledWith("proj-1");
    expect(transactionMock).toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
  });
});
