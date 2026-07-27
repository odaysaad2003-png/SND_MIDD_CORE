import {keepPreviousData, queryOptions} from "@tanstack/react-query";

import {getMyActivePosts} from "../api/get-my-active-posts";
import {
    myActivePostsQuerySchema,
    type MyActivePostsQuery,
    type MyActivePostsQueryInput,
} from "../schemas/my-posts.schema";

export const myPostKeys = {
    all: ["posts", "private", "current-user"] as const,

    lists: () => [...myPostKeys.all, "list"] as const,

    activeList: (query: MyActivePostsQuery) => [...myPostKeys.lists(), "active", query] as const,
};

export function myActivePostsQueryOptions(input: MyActivePostsQueryInput = {}) {
    const query = myActivePostsQuerySchema.parse(input);

    return queryOptions({
        queryKey: myPostKeys.activeList(query),

        queryFn: ({signal}) =>
            getMyActivePosts({
                query,
                signal,
            }),

        /*
         * أثناء الانتقال بين الصفحات نحافظ مؤقتًا على الصفحة
         * السابقة بدل تحويل المنطقة كاملة إلى Skeleton.
         *
         * الواجهة الأخيرة ستوضح أن بيانات الصفحة الجديدة
         * قيد الجلب باستخدام isPlaceholderData/isFetching.
         */
        placeholderData: keepPreviousData,

        /*
         * منشورات المستخدم قد تتغير، لكنها لا تحتاج
         * Refetch مع كل Re-render.
         */
        staleTime: 30_000,

        /*
         * Authorized Client تملك محاولة Refresh عند 401.
         * لا نكرر Protected Query تلقائيًا فوق ذلك.
         */
        retry: false,

        /*
         * علامة ضرورية حتى يحذف AuthProvider هذه البيانات
         * عند Logout أو Session Expiry.
         */
        meta: {
            authScope: "private",
        },
    });
}
