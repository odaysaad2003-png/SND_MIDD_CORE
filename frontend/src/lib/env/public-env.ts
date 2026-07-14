import {z} from "zod";

function isValidApiBaseUrl(value: string): boolean {
    try {
        const url = new URL(value);
        const normalizedPath = url.pathname.replace(/\/+$/, "");
        const hasAllowedProtocol =
            url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.protocol === "http:");

        return (
            hasAllowedProtocol &&
            normalizedPath === "/api/v1" &&
            url.search === "" &&
            url.hash === "" &&
            url.username === "" &&
            url.password === ""
        );
    } catch {
        return false;
    }
}

const publicEnvSchema = z.object({
    NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .trim()
    .min(1, "NEXT_PUBLIC_API_BASE_URL is required")
    .refine(
        isValidApiBaseUrl,
        "NEXT_PUBLIC_API_BASE_URL must use HTTPS in production, may use HTTP only outside production, and must end with /api/v1"
    )
    .transform((value) => value.replace(/\/+$/, "")),
});

export function getPublicEnv() {
    const parsedPublicEnv = publicEnvSchema.safeParse({
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    });

    if (!parsedPublicEnv.success) {
        const issues = parsedPublicEnv.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

        throw new Error(`Invalid public environment: ${issues}`);
    }

    return Object.freeze(parsedPublicEnv.data);
}
