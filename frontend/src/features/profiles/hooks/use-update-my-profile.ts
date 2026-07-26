"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";

import {updateMyProfile} from "../api/update-my-profile";
import {myProfileKeys} from "../queries/my-profile.query";
import type {MyProfile, UpdateMyProfileFormValues} from "../schemas/my-profile.schema";

type UseUpdateMyProfileOptions = Readonly<{
    onIdentityUpdated?: (profile: MyProfile) => void;
}>;

export function useUpdateMyProfile(options: UseUpdateMyProfileOptions = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: [...myProfileKeys.me(), "update-name"] as const,

        mutationFn: (values: UpdateMyProfileFormValues) => updateMyProfile(values),

        retry: false,

        /*
         * النتيجة الخاصة لا نريد الاحتفاظ بها داخل Mutation Cache
         * بعد اختفاء الـMutation Observer.
         */
        gcTime: 0,

        onSuccess: (profile) => {
            /*
             * السيرفر أعاد النسخة النهائية الموثوقة، لذلك نضعها مباشرة
             * في Cache بدل تنفيذ GET /users/me إضافية.
             */
            queryClient.setQueryData(myProfileKeys.me(), profile);

            /*
             * Header يقرأ المستخدم من Auth Session Store وليس من
             * Profile Query Cache، لذلك تحتاج الدفعة التالية لمزامنة
             * Auth identity كذلك.
             *
             * نستخدم Callback بدل استيراد Auth Store مباشرة حتى لا
             * تتجاوز Profile Feature حدود Auth Provider.
             */
            options.onIdentityUpdated?.(profile);
        },
    });
}
