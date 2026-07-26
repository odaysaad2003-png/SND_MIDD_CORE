import {z} from "zod";

const apiDateTimeSchema = z.string().datetime();

export const myProfileSchema = z
.object({
    id: z.string().min(1),
    name: z.string().min(2).max(100),
    email: z.string().email(),
    role: z.enum(["user", "admin"]),
    avatar: z.string().min(1).nullable(),
    isActive: z.boolean(),
    createdAt: apiDateTimeSchema,
    updatedAt: apiDateTimeSchema,
})
.strict();

export const myProfileResultSchema = z
.object({
    data: myProfileSchema,
})
.strict();

export const updateMyProfileInputSchema = z
.object({
    name: z.string().trim().min(2, "الاسم يجب أن يحتوي على حرفين على الأقل").max(100, "الاسم يجب ألا يتجاوز 100 حرف"),
})
.strict();

export type MyProfile = z.infer<typeof myProfileSchema>;
export type MyProfileResult = z.infer<typeof myProfileResultSchema>;

export type UpdateMyProfileFormValues = z.input<typeof updateMyProfileInputSchema>;

export type UpdateMyProfilePayload = z.output<typeof updateMyProfileInputSchema>;
