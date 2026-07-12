import {Types} from "mongoose";
import {connectDB, disconnectDB} from "../config/db";
import {LikeModel} from "../modules/likes/like.model";
import {PostModel} from "../modules/posts/post.model";
import {SaveModel} from "../modules/saves/save.model";
import {logger} from "../utils/logger";

const APPLY_FLAG = "--apply";
const BULK_BATCH_SIZE = 500;

interface ActiveRelationCountRow {
    _id: Types.ObjectId;
    count: number;
}

interface LikesCountUpdateOperation {
    updateOne: {
        filter: Record<string, unknown>;
        update: {
            $set: {
                likesCount: number;
            };
        };
    };
}

function buildCurrentCounterFilter(
    postId: Types.ObjectId,
    currentCount: number
): Record<string, unknown> {
    if (currentCount !== 0) {
        return {
            _id: postId,
            likesCount: currentCount,
        };
    }

    return {
        _id: postId,
        $or: [
            {likesCount: 0},
            {likesCount: null},
            {likesCount: {$exists: false}},
        ],
    };
}

async function readActiveRelationCounts(
    model: typeof LikeModel | typeof SaveModel
): Promise<ActiveRelationCountRow[]> {
    return model.aggregate<ActiveRelationCountRow>([
        {
            $match: {
                status: "active",
            },
        },
        {
            $group: {
                _id: "$post",
                count: {$sum: 1},
            },
        },
    ]);
}

async function reconcileEngagement(applyChanges: boolean): Promise<void> {
    const [legacyActiveLikes, legacyActiveSaves] = await Promise.all([
        LikeModel.countDocuments({
            status: "active",
            deletedAt: {$ne: null},
        }),
        SaveModel.countDocuments({
            status: "active",
            deletedAt: {$ne: null},
        }),
    ]);

    if (applyChanges) {
        await Promise.all([
            LikeModel.updateMany(
                {
                    status: "active",
                    deletedAt: {$ne: null},
                },
                {
                    $set: {
                        deletedAt: null,
                    },
                }
            ),
            SaveModel.updateMany(
                {
                    status: "active",
                    deletedAt: {$ne: null},
                },
                {
                    $set: {
                        deletedAt: null,
                    },
                }
            ),
        ]);
    }

    const [activeLikeCounts, activeSaveCounts] = await Promise.all([
        readActiveRelationCounts(LikeModel),
        readActiveRelationCounts(SaveModel),
    ]);

    const expectedLikesByPost = new Map(
        activeLikeCounts.map((row) => [row._id.toString(), row.count])
    );
    const activeSavesByPost = new Map(
        activeSaveCounts.map((row) => [row._id.toString(), row.count])
    );

    let scannedPosts = 0;
    let mismatchedPosts = 0;
    let requestedUpdates = 0;
    let appliedUpdates = 0;
    const pendingOperations: LikesCountUpdateOperation[] = [];

    const flushUpdates = async (): Promise<void> => {
        if (!applyChanges || pendingOperations.length === 0) {
            return;
        }

        const operations = pendingOperations.splice(0, pendingOperations.length);
        const result = await PostModel.bulkWrite(operations, {ordered: false});

        requestedUpdates += operations.length;
        appliedUpdates += result.modifiedCount;
    };

    const cursor = PostModel.find({}).select("_id likesCount").cursor();

    for await (const post of cursor) {
        scannedPosts += 1;

        const postId = post._id.toString();
        const expectedCount = expectedLikesByPost.get(postId) ?? 0;
        const currentCount = post.likesCount ?? 0;

        expectedLikesByPost.delete(postId);
        activeSavesByPost.delete(postId);

        if (currentCount === expectedCount) {
            continue;
        }

        mismatchedPosts += 1;

        if (!applyChanges) {
            continue;
        }

        pendingOperations.push({
            updateOne: {
                filter: buildCurrentCounterFilter(post._id, currentCount),
                update: {
                    $set: {
                        likesCount: expectedCount,
                    },
                },
            },
        });

        if (pendingOperations.length >= BULK_BATCH_SIZE) {
            await flushUpdates();
        }
    }

    await flushUpdates();

    const orphanedLikePostGroups = expectedLikesByPost.size;
    const orphanedActiveLikes = Array.from(expectedLikesByPost.values()).reduce(
        (sum, count) => sum + count,
        0
    );
    const orphanedSavePostGroups = activeSavesByPost.size;
    const orphanedActiveSaves = Array.from(activeSavesByPost.values()).reduce(
        (sum, count) => sum + count,
        0
    );

    logger.info("Engagement reconciliation completed", {
        mode: applyChanges ? "apply" : "dry-run",
        scannedPosts,
        mismatchedPosts,
        legacyActiveLikes,
        legacyActiveSaves,
        requestedUpdates,
        appliedUpdates,
        concurrentUpdatesSkipped: Math.max(requestedUpdates - appliedUpdates, 0),
        orphanedLikePostGroups,
        orphanedActiveLikes,
        orphanedSavePostGroups,
        orphanedActiveSaves,
    });

    if (orphanedActiveLikes > 0 || orphanedActiveSaves > 0) {
        logger.warn("Active engagement relations reference missing Post documents", {
            orphanedLikePostGroups,
            orphanedActiveLikes,
            orphanedSavePostGroups,
            orphanedActiveSaves,
        });
    }
}

async function main(): Promise<void> {
    const applyChanges = process.argv.includes(APPLY_FLAG);

    await connectDB();

    try {
        await reconcileEngagement(applyChanges);
    } finally {
        await disconnectDB();
    }
}

main().catch((error) => {
    logger.error("Engagement reconciliation failed", {
        error,
    });
    process.exitCode = 1;
});
