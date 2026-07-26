import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {sndToast, sndToastStore} from "./snd-toast-store";

beforeEach(() => {
    vi.useFakeTimers();
    sndToast.clear();
});

afterEach(() => {
    sndToast.clear();
    vi.useRealTimers();
});

describe("sndToastStore", () => {
    it("updates one toast in place when the same id moves from loading to success", () => {
        vi.setSystemTime(new Date("2026-07-26T10:00:00.000Z"));

        const toastId = sndToast.loading({
            title: "جار الحفظ",
        });

        const loadingToast = sndToastStore.getSnapshot()[0];

        sndToast.success({
            id: toastId,
            title: "تم الحفظ",
        });

        expect(sndToastStore.getSnapshot()).toHaveLength(1);
        expect(sndToastStore.getSnapshot()[0]).toMatchObject({
            id: toastId,
            variant: "success",
            title: "تم الحفظ",
            createdAt: loadingToast?.createdAt,
            version: 2,
        });
    });

    it("keeps the visible stack bounded to the four newest notifications", () => {
        const ids = Array.from({length: 5}, (_, index) =>
            sndToast.info({
                title: `إشعار ${index + 1}`,
                durationMs: 0,
            })
        );

        expect(sndToastStore.getSnapshot().map((toast) => toast.id)).toEqual(ids.slice(1).reverse());
    });

    it("dismisses a timed toast after its configured duration", () => {
        const toastId = sndToast.success({
            title: "تم",
            durationMs: 1_000,
        });

        expect(sndToastStore.getSnapshot().some((toast) => toast.id === toastId)).toBe(true);

        vi.advanceTimersByTime(1_000);

        expect(sndToastStore.getSnapshot().some((toast) => toast.id === toastId)).toBe(false);
    });

    it("tracks a promise through loading and success using one toast id", async () => {
        const resultPromise = sndToast.track(Promise.resolve("saved"), {
            loading: {
                title: "جار التنفيذ",
            },
            success: (value) => ({
                title: `تم ${value}`,
            }),
            error: {
                title: "فشل التنفيذ",
            },
        });

        expect(sndToastStore.getSnapshot()[0]).toMatchObject({
            variant: "loading",
            title: "جار التنفيذ",
        });

        await expect(resultPromise).resolves.toBe("saved");

        expect(sndToastStore.getSnapshot()).toHaveLength(1);
        expect(sndToastStore.getSnapshot()[0]).toMatchObject({
            variant: "success",
            title: "تم saved",
            version: 2,
        });
    });
});
