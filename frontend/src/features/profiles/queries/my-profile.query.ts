import {queryOptions} from "@tanstack/react-query";

import {getMyProfile} from "../api/get-my-profile";

export const myProfileKeys = {
    all: ["profile"] as const,

    me: () => [...myProfileKeys.all, "me"] as const,
};

export function myProfileQueryOptions() {
    return queryOptions({
        queryKey: myProfileKeys.me(),

        queryFn: ({signal}) => {
            return getMyProfile({signal});
        },

        staleTime: 60_000,

        retry: false,

        meta: {
            authScope: "private",
        },
    });
}
