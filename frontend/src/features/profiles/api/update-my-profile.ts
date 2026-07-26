import {authorizedApiRequest} from "@/features/auth/api/authorized-api-client";
import {ApiError} from "@/lib/api/api-error";

import {
    myProfileResultSchema,
    updateMyProfileInputSchema,
    type MyProfile,
    type UpdateMyProfileFormValues,
} from "../schemas/my-profile.schema";

type UpdateMyProfileOptions = Readonly<{
    signal?: AbortSignal;
}>;

function invalidProfileResponse(): ApiError {
    return new ApiError({
        kind: "invalid-response",
        message: "The updated profile response does not match the verified API contract",
    });
}

export async function updateMyProfile(
    values: UpdateMyProfileFormValues,
    options: UpdateMyProfileOptions = {}
): Promise<MyProfile> {
    const payload = updateMyProfileInputSchema.parse(values);

    const result = await authorizedApiRequest<unknown>("users/me", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: options.signal,
    });

    const parsedResult = myProfileResultSchema.safeParse(result);

    if (!parsedResult.success) {
        throw invalidProfileResponse();
    }

    return parsedResult.data.data;
}
