"use client";

import {useSyncExternalStore} from "react";

function subscribe(callback: () => void): () => void {
    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);

    return () => {
        window.removeEventListener("online", callback);
        window.removeEventListener("offline", callback);
    };
}

function getSnapshot(): boolean {
    return navigator.onLine;
}

function getServerSnapshot(): boolean {
    return true;
}

/**
 * navigator.onLine is only a browser connectivity hint, not proof that the API
 * is reachable. We use it to avoid obviously impossible mutations, while the
 * HTTP layer remains the source of truth for real network failures.
 */
export function useOnlineStatus(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
