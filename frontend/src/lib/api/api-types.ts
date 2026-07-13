export type ApiSuccessEnvelope<TData, TMeta = never> = {
    success: true;
    data: TData;
    meta?: TMeta;
};

export type ApiErrorPayload = {
    code: string;
    message: string;
    details?: unknown;
};

export type ApiErrorEnvelope = {
    success: false;
    error: ApiErrorPayload;
};

export type ApiResult<TData, TMeta = never> = {
    data: TData;
    meta?: TMeta;
};
