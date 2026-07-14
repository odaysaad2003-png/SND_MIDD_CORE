import {cache} from "react";

import {getPublicPost} from "./get-public-post";

export const getPublicPostForRoute = cache((postId: string) => getPublicPost(postId));
