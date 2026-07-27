"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";

import {updateMyAvatar} from "../api/update-my-avatar";
import {myProfileKeys} from "../queries/my-profile.query";
import type {AvatarFile} from "../schemas/avatar-file.schema";
import type {MyProfile} from "../schemas/my-profile.schema";

type UseUpdateMyAvatarOptions = Readonly<{
    onIdentityUpdated?: (profile: MyProfile) => void;
}>;

export function useUpdateMyAvatar(options: UseUpdateMyAvatarOptions = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: [...myProfileKeys.me(), "update-avatar"] as const,

        mutationFn: (avatarFile: AvatarFile) => updateMyAvatar(avatarFile),

        retry: false,

        /*
         * لا نحتاج الاحتفاظ بنتيجة Mutation الخاصة داخل
         * Mutation Cache بعد اختفاء المستهلك.
         */
        gcTime: 0,

        onSuccess: (profile) => {
            /*
             * PATCH أعادت النسخة النهائية من المستخدم بعد حفظ
             * رابط Cloudinary، لذلك لا نحتاج GET /users/me إضافية.
             */
            queryClient.setQueryData(myProfileKeys.me(), profile);

            /*
             * Header يعتمد على Auth Session Store، بينما صفحة
             * Profile تعتمد على Query Cache.
             */
            options.onIdentityUpdated?.(profile);
        },
    });
}
