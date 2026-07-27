import {z} from "zod";

import {publicPostSchema} from "./public-posts.schema";

export const POST_TITLE_MIN_LENGTH = 3;
export const POST_TITLE_MAX_LENGTH = 100;
export const POST_CONTENT_MAX_LENGTH = 5000;

export const MAX_POST_IMAGES = 5;
export const MAX_POST_IMAGE_SIZE_MB = 5;
export const MAX_POST_IMAGE_SIZE_BYTES = MAX_POST_IMAGE_SIZE_MB * 1024 * 1024;

export const POST_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

export const postAuthoringFormSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(POST_TITLE_MIN_LENGTH, `العنوان يجب ألا يقل عن ${POST_TITLE_MIN_LENGTH} أحرف`)
            .max(POST_TITLE_MAX_LENGTH, `العنوان يجب ألا يتجاوز ${POST_TITLE_MAX_LENGTH} حرفًا`),
        content: z
            .string()
            .trim()
            .min(1, "اكتب محتوى المنشور قبل النشر")
            .max(POST_CONTENT_MAX_LENGTH, `المحتوى يجب ألا يتجاوز ${POST_CONTENT_MAX_LENGTH} حرفًا`),
    })
    .strict();

export const postMutationResultSchema = z
    .object({
        data: publicPostSchema,
    })
    .strict();

export type PostAuthoringFormValues = z.infer<typeof postAuthoringFormSchema>;
export type PostMutationResult = z.infer<typeof postMutationResultSchema>;
