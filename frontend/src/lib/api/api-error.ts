export type ApiErrorKind = "http" | "network" | "invalid-response";

type ApiErrorOptions = Readonly<{
    kind: ApiErrorKind;
    message: string;
    status?: number | null;
    code?: string | null;
    details?: unknown;
    requestId?: string | null;
}>;

export class ApiError extends Error {
    readonly kind: ApiErrorKind;
    readonly status: number | null;
    readonly code: string | null;
    readonly details: unknown;
    readonly requestId: string | null;

    constructor(options: ApiErrorOptions) {
        super(options.message);

        this.name = "ApiError";
        this.kind = options.kind;
        this.status = options.status ?? null;
        this.code = options.code ?? null;
        this.details = options.details;
        this.requestId = options.requestId ?? null;
    }
}
