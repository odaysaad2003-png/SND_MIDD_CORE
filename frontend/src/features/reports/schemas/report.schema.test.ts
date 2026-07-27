import {describe, expect, it} from "vitest";

import {reportInputSchema, reportReasonSchema} from "./report.schema";

describe("report contracts", () => {
    it("accepts every verified reason", () => {
        for (const reason of ["spam", "harassment", "hate_speech", "violence", "scam", "sexual_content", "misinformation", "other"]) {
            expect(reportReasonSchema.safeParse(reason).success).toBe(true);
        }
    });

    it("normalizes optional details and rejects internal fields", () => {
        expect(reportInputSchema.parse({reason: "spam", details: "  تفاصيل  "})).toEqual({reason: "spam", details: "تفاصيل"});
        expect(() => reportInputSchema.parse({reason: "spam", status: "actioned"})).toThrow();
    });

    it("enforces the verified 1000 character limit", () => {
        expect(reportInputSchema.safeParse({reason: "other", details: "أ".repeat(1000)}).success).toBe(true);
        expect(reportInputSchema.safeParse({reason: "other", details: "أ".repeat(1001)}).success).toBe(false);
    });
});
