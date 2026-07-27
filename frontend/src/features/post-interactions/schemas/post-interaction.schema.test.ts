import {describe, expect, it} from "vitest";

import {likeStatusResultSchema, saveStatusResultSchema} from "./post-interaction.schema";

describe("post interaction response schemas", () => {
    it("accepts the verified like response envelope", () => {
        expect(
            likeStatusResultSchema.parse({
                data: {likedByMe: true, likesCount: 7},
            }),
        ).toEqual({
            data: {likedByMe: true, likesCount: 7},
        });
    });

    it("rejects invented like fields and invalid counts", () => {
        expect(() =>
            likeStatusResultSchema.parse({
                data: {likedByMe: false, likesCount: -1, savedByMe: false},
            }),
        ).toThrow();
    });

    it("accepts save status without inventing a save count", () => {
        expect(
            saveStatusResultSchema.parse({
                data: {savedByMe: false},
            }),
        ).toEqual({
            data: {savedByMe: false},
        });
    });

    it("rejects a save count that is absent from the backend contract", () => {
        expect(() =>
            saveStatusResultSchema.parse({
                data: {savedByMe: true, savesCount: 3},
            }),
        ).toThrow();
    });
});
