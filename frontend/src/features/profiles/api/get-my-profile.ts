import "client-only";

import {authorizedApiRequest} from "@/features/auth/client";
import {ApiError} from "@/lib/api/api-error";

import {myProfileResultSchema, type MyProfile} from "../schemas/my-profile.schema";

type GetMyProfileOptions = Readonly<{
    signal?: AbortSignal;
}>;

export async function getMyProfile(options: GetMyProfileOptions = {}): Promise<MyProfile> {
    const result = await authorizedApiRequest<unknown>("users/me", {
        method: "GET",
        signal: options.signal,
    });

    const parsedResult = myProfileResultSchema.safeParse(result);

    if (!parsedResult.success) {
        throw new ApiError({
            kind: "invalid-response",
            message: "The profile response does not match the verified API contract",
        });
    }

    return parsedResult.data.data;
}
