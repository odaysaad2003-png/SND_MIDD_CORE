// @vitest-environment jsdom

import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";

const authMocks = vi.hoisted(() => ({
    getContext: vi.fn(),
    logout: vi.fn(),
    retrySession: vi.fn(),
}));

const toastMocks = vi.hoisted(() => ({
    success: vi.fn(),
    warning: vi.fn(),
}));

vi.mock("../providers/auth-provider", () => ({
    useAuth: () => authMocks.getContext(),
}));

vi.mock("@/components/feedback/toast/snd-toast-store", () => ({
    sndToast: toastMocks,
}));

import {PostComposerProvider} from "@/features/posts/providers/post-composer-provider";

import {AuthHeaderActions} from "./auth-header-actions";


function renderHeaderActions() {
    return render(
        <PostComposerProvider>
            <AuthHeaderActions />
        </PostComposerProvider>
    );
}

const user = {
    id: "user-1",
    name: "مستخدم سند",
    email: "user@example.com",
    role: "user" as const,
    avatar: null,
    isActive: true,
    createdAt: "2026-07-26T10:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
};

beforeEach(() => {
    authMocks.logout.mockReset();
    authMocks.retrySession.mockReset();
    authMocks.getContext.mockReset();

    toastMocks.success.mockReset();
    toastMocks.warning.mockReset();
});

describe("AuthHeaderActions", () => {
    it("shows login and registration actions for an anonymous visitor", () => {
        authMocks.getContext.mockReturnValue({
            status: "anonymous",
            user: null,
            sessionError: null,
            logout: authMocks.logout,
            retrySession: authMocks.retrySession,
        });

        renderHeaderActions();

        expect(
            screen.getByRole("link", {
                name: "تسجيل الدخول",
            })
        ).toHaveAttribute("href", "/login");

        expect(
            screen.getByRole("link", {
                name: "إنشاء حساب",
            })
        ).toHaveAttribute("href", "/register");
    });

    it("does not flash anonymous actions while the session is resolving", () => {
        authMocks.getContext.mockReturnValue({
            status: "checking",
            user: null,
            sessionError: null,
            logout: authMocks.logout,
            retrySession: authMocks.retrySession,
        });

        renderHeaderActions();

        expect(
            screen.getByRole("status", {
                name: "جار التحقق من الجلسة",
            })
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("link", {
                name: "تسجيل الدخول",
            })
        ).not.toBeInTheDocument();
    });

    it("offers session retry instead of showing guest actions after a bootstrap network failure", async () => {
        authMocks.retrySession.mockResolvedValue(undefined);

        authMocks.getContext.mockReturnValue({
            status: "checking",
            user: null,
            sessionError: new Error("Network unavailable"),
            logout: authMocks.logout,
            retrySession: authMocks.retrySession,
        });

        renderHeaderActions();

        expect(
            screen.queryByRole("link", {
                name: "تسجيل الدخول",
            })
        ).not.toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", {
                name: "إعادة محاولة التحقق من الجلسة",
            })
        );

        expect(authMocks.retrySession).toHaveBeenCalledTimes(1);
    });

    it("shows the authenticated identity and profile-management actions", async () => {
        authMocks.getContext.mockReturnValue({
            status: "authenticated",
            user,
            sessionError: null,
            logout: authMocks.logout,
            retrySession: authMocks.retrySession,
        });

        renderHeaderActions();

        const accountButton = screen.getByRole("button", {
            name: "فتح قائمة حساب مستخدم سند",
        });

        await userEvent.click(accountButton);

        expect(
            screen.getByRole("link", {
                name: /منشوراتي/,
            })
        ).toHaveAttribute("href", "/my-posts");

        expect(
            screen.getByRole("link", {
                name: /المحفوظات/,
            })
        ).toHaveAttribute("href", "/saved");

        expect(
            screen.getByRole("link", {
                name: /الملف الشخصي والإعدادات/,
            })
        ).toHaveAttribute("href", "/profile");
    });

    it("closes the account panel with Escape and returns focus to its trigger", async () => {
        authMocks.getContext.mockReturnValue({
            status: "authenticated",
            user,
            sessionError: null,
            logout: authMocks.logout,
            retrySession: authMocks.retrySession,
        });

        renderHeaderActions();

        const accountButton = screen.getByRole("button", {
            name: "فتح قائمة حساب مستخدم سند",
        });

        await userEvent.click(accountButton);

        expect(
            screen.getByRole("link", {
                name: /الملف الشخصي والإعدادات/,
            })
        ).toBeInTheDocument();

        await userEvent.keyboard("{Escape}");

        expect(
            screen.queryByRole("link", {
                name: /الملف الشخصي والإعدادات/,
            })
        ).not.toBeInTheDocument();

        expect(accountButton).toHaveFocus();
    });

    it("logs out an authenticated user and confirms remote cleanup", async () => {
        authMocks.getContext.mockReturnValue({
            status: "authenticated",
            user,
            sessionError: null,
            logout: authMocks.logout,
            retrySession: authMocks.retrySession,
        });

        authMocks.logout.mockResolvedValue(undefined);

        renderHeaderActions();

        await userEvent.click(
            screen.getByRole("button", {
                name: "فتح قائمة حساب مستخدم سند",
            })
        );

        await userEvent.click(
            screen.getByRole("button", {
                name: "تسجيل الخروج",
            })
        );

        await waitFor(() => {
            expect(authMocks.logout).toHaveBeenCalledTimes(1);

            expect(toastMocks.success).toHaveBeenCalledTimes(1);
        });

        expect(toastMocks.warning).not.toHaveBeenCalled();
    });

    it("keeps local logout final and warns when remote cleanup fails", async () => {
        authMocks.getContext.mockReturnValue({
            status: "authenticated",
            user,
            sessionError: null,
            logout: authMocks.logout,
            retrySession: authMocks.retrySession,
        });

        authMocks.logout.mockRejectedValue(new TypeError("Network unavailable"));

        renderHeaderActions();

        await userEvent.click(
            screen.getByRole("button", {
                name: "فتح قائمة حساب مستخدم سند",
            })
        );

        await userEvent.click(
            screen.getByRole("button", {
                name: "تسجيل الخروج",
            })
        );

        await waitFor(() => {
            expect(toastMocks.warning).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "تم الخروج محليًا",
                    durationMs: 0,
                })
            );
        });

        expect(toastMocks.success).not.toHaveBeenCalled();
    });
});
