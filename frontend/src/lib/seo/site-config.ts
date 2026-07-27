const LOCAL_SITE_URL = "http://localhost:3000";

function parseSiteUrl(value: string): URL {
    const candidate = value.includes("://") ? value : `https://${value}`;
    const url = new URL(candidate);

    const isLocalHost = url.hostname === "localhost" || url.hostname === "127.0.0.1";

    const hasAllowedProtocol = url.protocol === "https:" || (isLocalHost && url.protocol === "http:");

    if (
        !hasAllowedProtocol ||
        url.username !== "" ||
        url.password !== "" ||
        url.pathname !== "/" ||
        url.search !== "" ||
        url.hash !== ""
    ) {
        throw new Error(
            "SITE_URL must be an HTTPS origin without credentials, path, query, or hash. HTTP is allowed only for localhost."
        );
    }

    return new URL(url.origin);
}

function resolveSiteUrl(): URL {
    const explicitSiteUrl = process.env.SITE_URL?.trim();

    if (explicitSiteUrl) {
        return parseSiteUrl(explicitSiteUrl);
    }

    const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

    if (vercelProductionHost) {
        return parseSiteUrl(vercelProductionHost);
    }

    return parseSiteUrl(LOCAL_SITE_URL);
}

export const siteConfig = Object.freeze({
    name: "سند",
    latinName: "SND",
    description:
        "سند منصة مجتمعية عربية لسكان غزة لتصفح المنشورات العامة ومشاركة التحديثات والاحتياجات المجتمعية والتفاعل معها.",
    locale: "ar_PS",
    language: "ar",
    url: resolveSiteUrl(),
});
