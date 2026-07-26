export function isSupportedRemoteImage(value: string | null | undefined): value is string {
    if (!value) {
        return false;
    }

    try {
        const url = new URL(value);

        return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
    } catch {
        return false;
    }
}
