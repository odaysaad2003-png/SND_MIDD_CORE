import type {MetadataRoute} from "next";

import {siteConfig} from "@/lib/seo/site-config";

const PRIVATE_ROUTES = ["/login", "/register", "/profile", "/my-posts", "/saved"] as const;

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [...PRIVATE_ROUTES],
            },
        ],

        host: siteConfig.url.origin,
    };
}
