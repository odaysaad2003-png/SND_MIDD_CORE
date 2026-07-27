import type {Metadata} from "next";

import {SavedPostsPage} from "@/features/saves/pages/saved-posts-page";

export const metadata: Metadata = {
    title: "المحفوظات",
    description: "المنشورات التي حفظتها في سند.",
    robots: {
        index: false,
        follow: false,
    },
};

export default SavedPostsPage;
