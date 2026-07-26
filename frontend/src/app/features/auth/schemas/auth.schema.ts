import {z} from "zod";

const apiDateTimeSchema = z.string().datetime();
const csrfTokenSchema = z.string().min(1).max(256);

export const authUserSchema = z
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

export const authSessionDataSchema = z
.object({
    user: authUserSchema,
    accessToken: z.string().min(1),
    csrfToken: csrfTokenSchema,
})
.strict();

export const authSessionResultSchema = z
.object({
    data: authSessionDataSchema,
})
.strict();

export const csrfResultSchema = z
.object({
    data: z
    .object({
        csrfToken: csrfTokenSchema,
    })
    .strict(),
})
.strict();

export const logoutResultSchema = z
.object({
    data: z
    .object({
        message: z.string().min(1),
    })
    .strict(),
})
.strict();

export const registerInputSchema = z
.object({
    name: z.string().trim().min(2, "الاسم يجب أن يحتوي على حرفين على الأقل").max(100, "الاسم يجب ألا يتجاوز 100 حرف"),
    email: z
    .string()
    .trim()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("أدخل بريدًا إلكترونيًا صحيحًا")
    .transform((email) => email.toLowerCase()),
    password: z
    .string()
    .min(8, "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل")
    .max(72, "كلمة المرور يجب ألا تتجاوز 72 حرفًا"),
})
.strict();

export const loginInputSchema = z
.object({
    email: z
    .string()
    .trim()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("أدخل بريدًا إلكترونيًا صحيحًا")
    .transform((email) => email.toLowerCase()),
    password: z.string().min(1, "كلمة المرور مطلوبة"),
})
.strict();

export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthSessionData = z.infer<typeof authSessionDataSchema>;

export type RegisterFormValues = z.input<typeof registerInputSchema>;
export type RegisterPayload = z.output<typeof registerInputSchema>;

export type LoginFormValues = z.input<typeof loginInputSchema>;
export type LoginPayload = z.output<typeof loginInputSchema>;
