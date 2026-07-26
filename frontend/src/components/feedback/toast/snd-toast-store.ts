import "client-only";

export type SndToastVariant = "loading" | "success" | "error" | "warning" | "info";

export type SndToastAction = Readonly<{
    label: string;
    onClick: () => void;
    dismissOnClick?: boolean;
}>;

export type SndToastContent = Readonly<{
    title: string;
    description?: string;
    action?: SndToastAction;
    dismissible?: boolean;
    durationMs?: number;
}>;

export type SndToastInput = SndToastContent &
    Readonly<{
        id?: string;
    }>;

export type SndToastItem = Readonly<{
    id: string;
    variant: SndToastVariant;
    title: string;
    description?: string;
    action?: SndToastAction;
    dismissible: boolean;
    durationMs: number;
    createdAt: number;
    version: number;
}>;

type ToastListener = () => void;

type ToastPromiseMessages<TData> = Readonly<{
    loading: SndToastContent;
    success: SndToastContent | ((data: TData) => SndToastContent);
    error: SndToastContent | ((error: unknown) => SndToastContent);
}>;

const emptySnapshot: readonly SndToastItem[] = [];

const defaultDurations: Record<SndToastVariant, number> = {
    loading: 0,
    success: 4200,
    error: 7000,
    warning: 6000,
    info: 5000,
};

// Keep the viewport bounded on narrow screens. Newer feedback replaces the
// oldest visible item instead of allowing the stack to cover the interface.
const maximumVisibleToasts = 4;

let toastSequence = 0;
let snapshot: readonly SndToastItem[] = emptySnapshot;

const listeners = new Set<ToastListener>();

const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();

function createToastId(): string {
    toastSequence += 1;

    return `snd-toast-${Date.now()}-${toastSequence}`;
}

function publish(nextSnapshot: readonly SndToastItem[]): void {
    snapshot = nextSnapshot;

    listeners.forEach((listener) => {
        listener();
    });
}

function clearDismissTimer(id: string): void {
    const timer = dismissTimers.get(id);

    if (!timer) {
        return;
    }

    clearTimeout(timer);
    dismissTimers.delete(id);
}

function removeToast(id: string): void {
    clearDismissTimer(id);

    const nextSnapshot = snapshot.filter((toast) => toast.id !== id);

    if (nextSnapshot.length === snapshot.length) {
        return;
    }

    publish(nextSnapshot);
}

function scheduleDismiss(toast: SndToastItem): void {
    clearDismissTimer(toast.id);

    if (toast.durationMs <= 0) {
        return;
    }

    const timer = setTimeout(() => {
        removeToast(toast.id);
    }, toast.durationMs);

    dismissTimers.set(toast.id, timer);
}

function enforceToastLimit(items: readonly SndToastItem[]): readonly SndToastItem[] {
    const visibleItems = items.slice(0, maximumVisibleToasts);

    const removedItems = items.slice(maximumVisibleToasts);

    removedItems.forEach((toast) => {
        clearDismissTimer(toast.id);
    });

    return visibleItems;
}

function upsertToast(variant: SndToastVariant, input: SndToastInput): string {
    const id = input.id ?? createToastId();

    const existingToast = snapshot.find((toast) => toast.id === id);

    const toast: SndToastItem = {
        id,
        variant,
        title: input.title,
        description: input.description,
        action: input.action,
        dismissible: input.dismissible ?? true,
        durationMs: input.durationMs ?? defaultDurations[variant],
        createdAt: existingToast?.createdAt ?? Date.now(),
        version: (existingToast?.version ?? 0) + 1,
    };

    const withoutCurrentToast = snapshot.filter((currentToast) => currentToast.id !== id);

    const nextSnapshot = enforceToastLimit([toast, ...withoutCurrentToast]);

    publish(nextSnapshot);
    scheduleDismiss(toast);

    return id;
}

async function trackPromise<TData>(
    operation: Promise<TData> | (() => Promise<TData>),
    messages: ToastPromiseMessages<TData>
): Promise<TData> {
    const toastId = upsertToast("loading", {
        ...messages.loading,
        durationMs: 0,
    });

    try {
        const promise = typeof operation === "function" ? operation() : operation;

        const result = await promise;

        const successContent = typeof messages.success === "function" ? messages.success(result) : messages.success;

        upsertToast("success", {
            ...successContent,
            id: toastId,
        });

        return result;
    } catch (error) {
        const errorContent = typeof messages.error === "function" ? messages.error(error) : messages.error;

        upsertToast("error", {
            ...errorContent,
            id: toastId,
        });

        throw error;
    }
}

export const sndToastStore = {
    subscribe(listener: ToastListener): () => void {
        listeners.add(listener);

        return () => {
            listeners.delete(listener);
        };
    },

    getSnapshot(): readonly SndToastItem[] {
        return snapshot;
    },

    getServerSnapshot(): readonly SndToastItem[] {
        return emptySnapshot;
    },
};

export const sndToast = {
    loading(input: SndToastInput): string {
        return upsertToast("loading", {
            ...input,
            durationMs: 0,
        });
    },

    success(input: SndToastInput): string {
        return upsertToast("success", input);
    },

    error(input: SndToastInput): string {
        return upsertToast("error", input);
    },

    warning(input: SndToastInput): string {
        return upsertToast("warning", input);
    },

    info(input: SndToastInput): string {
        return upsertToast("info", input);
    },

    dismiss(id: string): void {
        removeToast(id);
    },

    clear(): void {
        dismissTimers.forEach((timer) => {
            clearTimeout(timer);
        });

        dismissTimers.clear();
        publish(emptySnapshot);
    },

    track<TData>(
        operation: Promise<TData> | (() => Promise<TData>),
        messages: ToastPromiseMessages<TData>
    ): Promise<TData> {
        return trackPromise(operation, messages);
    },
};
