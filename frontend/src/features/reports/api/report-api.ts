import {authorizedApiRequest} from "@/features/auth/api/authorized-api-client";
import {ApiError} from "@/lib/api/api-error";

import {reportInputSchema, reportResultSchema, type ReportInput, type ReportTarget} from "../schemas/report.schema";

export async function createReport(target: ReportTarget, input: ReportInput): Promise<void> {
    const payload = reportInputSchema.parse(input);
    const resource = target.type === "post" ? "posts" : "comments";
    const result = await authorizedApiRequest<unknown>(
        `${resource}/${encodeURIComponent(target.id)}/reports`,
        {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload)},
    );
    const parsed = reportResultSchema.safeParse(result);

    if (!parsed.success || parsed.data.data.targetType !== target.type || parsed.data.data.targetId !== target.id) {
        throw new ApiError({kind: "invalid-response", message: "The report response does not match the verified API contract"});
    }
}
