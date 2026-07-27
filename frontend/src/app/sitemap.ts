import type {MetadataRoute} from "next";

import {getPublicPosts} from "@/features/posts/api/get-public-posts";
import {siteConfig} from "@/lib/seo/site-config";

export const revalidate = 21_600;

const POSTS_PAGE_SIZE = 50;
const MAX_SITEMAP_URLS = 50_000;

const staticEntries: MetadataRoute.Sitemap = [
    {
        url: new URL("/", siteConfig.url).toString(),
        changeFrequency: "daily",
        priority: 1,
    },
    {
        url: new URL("/posts", siteConfig.url).toString(),
        changeFrequency: "hourly",
        priority: 0.9,
    },
    {
        url: new URL("/privacy", siteConfig.url).toString(),
        changeFrequency: "monthly",
        priority: 0.4,
    },
    {
        url: new URL("/community-guidelines", siteConfig.url).toString(),
        changeFrequency: "monthly",
        priority: 0.5,
    },
];

const maxPublicPostEntries = MAX_SITEMAP_URLS - staticEntries.length;

async function getPublicPostEntries(): Promise<MetadataRoute.Sitemap> {
    const entries: MetadataRoute.Sitemap = [];

    let page = 1;
    let totalPages = 1;

    while (page <= totalPages && entries.length < maxPublicPostEntries) {
        const result = await getPublicPosts({
            cache: "force-cache",

            query: {
                page,
                limit: POSTS_PAGE_SIZE,
                sort: "latest",
            },
        });

        totalPages = result.meta.totalPages;

        for (const post of result.data) {
            if (entries.length >= maxPublicPostEntries) {
                break;
            }

            entries.push({
                url: new URL(`/posts/${encodeURIComponent(post.id)}`, siteConfig.url).toString(),

                lastModified: post.updatedAt,
                changeFrequency: "weekly",
                priority: 0.7,
            });
        }

        page += 1;
    }

    return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        const publicPostEntries = await getPublicPostEntries();

        return [...staticEntries, ...publicPostEntries];
    } catch (error) {
        console.error("[seo:sitemap] Failed to include public post URLs", error);

        return staticEntries;
    }
}
