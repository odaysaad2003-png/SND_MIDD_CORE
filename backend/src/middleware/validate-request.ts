import {NextFunction, Request, Response} from "express";
import {ZodTypeAny, ZodError} from "zod";
import {AppError} from "../utils/app-error";

export function validateRequest(schema: ZodTypeAny) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        if (!result.success) {
            const details = (result.error as ZodError).issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            }));

            next(AppError.validation("Validation failed", details));
            return;
        }

        if (result.data.body !== undefined) req.body = result.data.body;
        if (result.data.query !== undefined) req.query = result.data.query;
        if (result.data.params !== undefined) req.params = result.data.params;

        next();
    };
}
