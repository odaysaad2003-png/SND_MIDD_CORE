import {authorizedApiRequest} from "@/features/auth/api/authorized-api-client";
import {ApiError} from "@/lib/api/api-error";

import {avatarFileSchema, type AvatarFile} from "../schemas/avatar-file.schema";
import {myProfileResultSchema, type MyProfile} from "../schemas/my-profile.schema";

type UpdateMyAvatarOptions = Readonly<{
    signal?: AbortSignal;
}>;

function invalidAvatarResponse(): ApiError {
    return new ApiError({
        kind: "invalid-response",
        message: "The updated avatar response does not match the verified API contract",
    });
}

export async function updateMyAvatar(
    selectedFile: AvatarFile,
    options: UpdateMyAvatarOptions = {}
): Promise<MyProfile> {
    const avatarFile = avatarFileSchema.parse(selectedFile);

    const formData = new FormData();

    formData.append("avatar", avatarFile, avatarFile.name);

    const result = await authorizedApiRequest<unknown>("users/me/avatar", {
        method: "PATCH",
        body: formData,
        signal: options.signal,
    });

    const parsedResult = myProfileResultSchema.safeParse(result);

    if (!parsedResult.success) {
        throw invalidAvatarResponse();
    }

    return parsedResult.data.data;
}
