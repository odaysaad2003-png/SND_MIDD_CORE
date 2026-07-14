import type {Metadata} from "next";
import {notFound} from "next/navigation";

import {getPublicPostForRoute} from "../api/get-public-post-for-route";
import {isPublicPostUnavailableError} from "../api/get-public-post";
import type {PublicPostPageProps} from "../types/public-post-route";

function buildMetadataDescription(content: string): string {
    const normalizedContent = content.replace(/\s+/g, " ").trim();

    if (normalizedContent.length <= 160) {
        return normalizedContent;
    }

    return `${normalizedContent.slice(0, 157).trimEnd()}…`;
}

export async function generatePublicPostMetadata({
    params,
}: PublicPostPageProps): Promise<Metadata> {
    const {postId} = await params;

    try {
        const post = await getPublicPostForRoute(postId);
        const description = buildMetadataDescription(post.content);

        return {
            title: post.title,
            description,
            openGraph: {
                type: "article",
                title: post.title,
                description,
                publishedTime: post.createdAt,
                modifiedTime: post.updatedAt,
                ...(post.images[0]
                    ? {
                        images: [
                            {
                                url: post.images[0],
                                alt: `صورة مرفقة بالمنشور: ${post.title}`,
                            },
                        ],
                    }
                    : {}),
            },
        };
    } catch (error) {
        if (isPublicPostUnavailableError(error)) {
            notFound();
        }

        return {
            title: "منشور من سند",
            description: "اقرأ منشورًا عامًا وتعليقاته على منصة سند.",
            robots: {
                index: false,
                follow: false,
            },
        };
    }
}
