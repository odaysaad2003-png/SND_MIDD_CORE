import "client-only";

import type {AuthSessionData, AuthUser} from "../schemas/auth.schema";

export type AuthSessionStatus = "checking" | "authenticated" | "anonymous";

export type AuthSessionSnapshot = Readonly<{
    status: AuthSessionStatus;
    user: AuthUser | null;
}>;

type AuthSessionListener = () => void;

const checkingSnapshot: AuthSessionSnapshot = {
    status: "checking",
    user: null,
};

const anonymousSnapshot: AuthSessionSnapshot = {
    status: "anonymous",
    user: null,
};

let snapshot = checkingSnapshot;
let accessToken: string | null = null;
let csrfToken: string | null = null;

const listeners = new Set<AuthSessionListener>();

function publish(nextSnapshot: AuthSessionSnapshot): void {
    snapshot = nextSnapshot;

    listeners.forEach((listener) => {
        listener();
    });
}

export const authSessionStore = {
    subscribe(listener: AuthSessionListener): () => void {
        listeners.add(listener);

        return () => {
            listeners.delete(listener);
        };
    },

    getSnapshot(): AuthSessionSnapshot {
        return snapshot;
    },

    getServerSnapshot(): AuthSessionSnapshot {
        return checkingSnapshot;
    },

    getAccessToken(): string | null {
        return accessToken;
    },

    getCsrfToken(): string | null {
        return csrfToken;
    },

    markChecking(): void {
        accessToken = null;
        csrfToken = null;
        publish(checkingSnapshot);
    },

    setCsrfToken(nextCsrfToken: string): void {
        csrfToken = nextCsrfToken;
    },

    setSession(session: AuthSessionData): void {
        accessToken = session.accessToken;
        csrfToken = session.csrfToken;

        publish({
            status: "authenticated",
            user: session.user,
        });
    },

    clearSession(): void {
        accessToken = null;
        csrfToken = null;
        publish(anonymousSnapshot);
    },
};
