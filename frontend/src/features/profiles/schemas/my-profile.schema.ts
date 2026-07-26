import {z} from "zod";

import {authUserSchema, type AuthUser} from "@/features/auth/client";

export const myProfileResultSchema = z
.object({
    data: authUserSchema,
})
.strict();

export type MyProfile = AuthUser;
