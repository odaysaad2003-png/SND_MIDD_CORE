import {z} from "zod";

import {paginationMetaSchema, publicPostSchema} from "./public-posts.schema";

export const MY_ACTIVE_POSTS_PAGE_SIZE = 5;

/*
 * GET /posts/me?status=active يعيد حاليًا نفس الشكل المعقم
 * الذي تعيده Public Posts:
 *
 * id, title, content, author, images, status,
 * likesCount, createdAt, updatedAt
 *
 * نعيد استخدام العقد بدل نسخه يدويًا.
 *
 * publicPostSchema تفرض status = "active"، وهذا يتوافق مع
 * نطاق هذه الميزة ويمنع مرور منشور deleted بالخطأ.
 */
export const myActivePostSchema = publicPostSchema;

export const myActivePostsQuerySchema = z
.object({
    page: z.number().int().positive().default(1),

    limit: z.number().int().positive().max(50).default(MY_ACTIVE_POSTS_PAGE_SIZE),

    q: z.string().trim().max(100, "البحث يجب ألا يتجاوز 100 حرف").optional(),

    sort: z.enum(["createdAt", "-createdAt", "updatedAt", "-updatedAt"]).default("-createdAt"),
})
.strict();

export const myActivePostsResultSchema = z
.object({
    data: z.array(myActivePostSchema),
    meta: paginationMetaSchema,
})
.strict();

export type MyActivePost = z.infer<typeof myActivePostSchema>;

export type MyActivePostsQueryInput = z.input<typeof myActivePostsQuerySchema>;

export type MyActivePostsQuery = z.output<typeof myActivePostsQuerySchema>;

export type MyActivePostsResult = z.infer<typeof myActivePostsResultSchema>;
