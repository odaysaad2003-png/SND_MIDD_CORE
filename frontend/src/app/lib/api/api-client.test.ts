import {afterAll, afterEach, beforeAll, describe, expect, it, vi} from "vitest";

import {ApiError} from "./api-error";

let apiRequest: typeof import("./api-client").apiRequest;

beforeAll(async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com/api/v1");
    ({apiRequest} = await import("./api-client"));
});

afterAll(() => {
    vi.unstubAllEnvs();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("apiRequest", () => {
    it("returns data and meta from a valid success envelope", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(
                new Response(JSON.stringify({success: true, data: ["post"], meta: {page: 1}}), {
                    status: 200,
                    headers: {"content-type": "application/json"},
                })
            )
        );

        await expect(apiRequest<string[], {page: number}>("posts")).resolves.toEqual({
            data: ["post"],
            meta: {page: 1},
        });
    });

    it("adds Accept without inventing Content-Type", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({success: true, data: []}), {
                status: 200,
                headers: {"content-type": "application/json"},
            })
        );
        vi.stubGlobal("fetch", fetchMock);

        await apiRequest<unknown[]>("posts");

        const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
        const headers = init.headers as Headers;
        expect(headers.get("Accept")).toBe("application/json");
        expect(headers.has("Content-Type")).toBe(false);
    });

    it("returns void data for 204 without parsing JSON", async () => {
        const json = vi.fn();
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                status: 204,
                ok: true,
                headers: new Headers(),
                json,
            } satisfies Partial<Response>)
        );

        await expect(apiRequest<void>("posts/123", {method: "DELETE"})).resolves.toEqual({
            data: undefined,
        });
        expect(json).not.toHaveBeenCalled();
    });

    it("creates a typed HTTP error and retains the request id", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(
                new Response(
                    JSON.stringify({
                        success: false,
                        error: {code: "NOT_FOUND", message: "Post not found", details: []},
                    }),
                    {
                        status: 404,
                        headers: {"content-type": "application/json", "x-request-id": "req-404"},
                    }
                )
            )
        );

        const error = await apiRequest("posts/123").catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
            kind: "http",
            status: 404,
            code: "NOT_FOUND",
            requestId: "req-404",
        });
    });

    it("classifies a fetch rejection as a network error", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

        await expect(apiRequest("posts")).rejects.toMatchObject({
            kind: "network",
            status: null,
        });
    });

    it("preserves AbortError from fetch", async () => {
        const abortError = new DOMException("The operation was aborted", "AbortError");
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

        await expect(apiRequest("posts")).rejects.toBe(abortError);
    });

    it("preserves AbortError while parsing the response body", async () => {
        const abortError = new DOMException("The operation was aborted", "AbortError");
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                status: 200,
                ok: true,
                headers: new Headers(),
                json: vi.fn().mockRejectedValue(abortError),
            } satisfies Partial<Response>)
        );

        await expect(apiRequest("posts")).rejects.toBe(abortError);
    });

    it("classifies malformed JSON as an invalid response", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                status: 200,
                ok: true,
                headers: new Headers({"x-request-id": "req-json"}),
                json: vi.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
            } satisfies Partial<Response>)
        );

        await expect(apiRequest("posts")).rejects.toMatchObject({
            kind: "invalid-response",
            status: 200,
            requestId: "req-json",
        });
    });

    it("rejects a successful response with an invalid envelope", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(
                new Response(JSON.stringify({data: []}), {
                    status: 200,
                    headers: {"content-type": "application/json"},
                })
            )
        );

        await expect(apiRequest("posts")).rejects.toMatchObject({
            kind: "invalid-response",
            status: 200,
        });
    });
});
