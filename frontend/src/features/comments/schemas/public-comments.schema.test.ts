import {describe, expect, it} from "vitest";

import {commentMutationInputSchema, commentMutationResultSchema} from "./public-comments.schema";

describe("comment mutation contracts", () => {
    it("trims valid content and rejects extra fields", () => {
        expect(commentMutationInputSchema.parse({content: "  أهلًا  "})).toEqual({content: "أهلًا"});
        expect(() => commentMutationInputSchema.parse({content: "تعليق", author: "forged"})).toThrow();
    });

    it("enforces the verified 1000 character limit", () => {
        expect(commentMutationInputSchema.safeParse({content: "أ".repeat(1000)}).success).toBe(true);
        expect(commentMutationInputSchema.safeParse({content: "أ".repeat(1001)}).success).toBe(false);
    });

    it("rejects unexpected response fields", () => {
        expect(() => commentMutationResultSchema.parse({
            data: {
                id: "c1",
                content: "تعليق",
                post: "p1",
                author: {id: "u1", name: "مستخدم", avatar: null},
                createdAt: "2026-07-27T10:00:00.000Z",
                updatedAt: "2026-07-27T10:00:00.000Z",
                isOwner: true,
            },
        })).toThrow();
    });
});
