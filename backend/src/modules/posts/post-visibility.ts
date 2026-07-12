import {FilterQuery, PipelineStage} from "mongoose";
import {AppError} from "../../utils/app-error";
import {IPost, PostModerationStatus} from "./post.model";

/**
 * Existing Post documents created before Sprint 7C may not physically have
 * `moderationStatus`. Only the explicit allowlisted `visible` value and that
 * one legacy-missing case are publicly visible. Unknown/corrupt values fail
 * closed instead of being treated as visible.
 */
export function buildVisibleOrLegacyModerationFilter(): FilterQuery<IPost> {
    return {
        $or: [
            {moderationStatus: "visible"},
            {moderationStatus: {$exists: false}},
        ],
    };
}

/**
 * Canonical public Post availability rule. Additional conditions are composed
 * as separate $and clauses so a caller's search $or cannot overwrite the
 * legacy-compatibility $or above.
 */
export function buildPublicPostVisibilityFilter(
    additionalClauses: FilterQuery<IPost>[] = []
): FilterQuery<IPost> {
    return {
        $and: [
            {
                status: "active",
                deletedAt: null,
            },
            buildVisibleOrLegacyModerationFilter(),
            ...additionalClauses,
        ],
    };
}

/**
 * Same canonical rule for aggregation rows after a Post has been joined under
 * a path such as `post` by $lookup/$unwind.
 */
export function buildJoinedPublicPostVisibilityMatch(
    postPath = "post"
): PipelineStage.Match["$match"] {
    const statusPath = `${postPath}.status`;
    const deletedAtPath = `${postPath}.deletedAt`;
    const moderationStatusPath = `${postPath}.moderationStatus`;

    return {
        $and: [
            {
                [statusPath]: "active",
                [deletedAtPath]: null,
            },
            {
                $or: [
                    {[moderationStatusPath]: "visible"},
                    {[moderationStatusPath]: {$exists: false}},
                ],
            },
        ],
    };
}

/**
 * Normalizes the effective moderation state for hydrated legacy Posts and
 * admin presenters/state-machine checks. Only a physically missing field is
 * treated as the legacy `visible` state; invalid persisted values are an
 * internal data-integrity failure.
 */
export function resolveEffectivePostModerationStatus(value: unknown): PostModerationStatus {
    if (value === undefined || value === "visible") {
        return "visible";
    }

    if (value === "hidden") {
        return "hidden";
    }

    throw AppError.internal("Post has an invalid moderation state");
}
