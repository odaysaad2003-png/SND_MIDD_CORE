import { connectDB, disconnectDB } from "../config/db";
import { AuditEventModel } from "../modules/audit/audit-event.model";
import { CommentModel } from "../modules/comments/comment.model";
import { LikeModel } from "../modules/likes/like.model";
import { PostModel } from "../modules/posts/post.model";
import { ReportModel } from "../modules/reports/report.model";
import { SaveModel } from "../modules/saves/save.model";
import { UserModel } from "../modules/users/user.model";
import { logger } from "../utils/logger";

interface IndexableModel {
  createIndexes(): Promise<void>;
  schema: {
    indexes(): unknown[];
  };
}

const models: Array<{ name: string; model: IndexableModel }> = [
  { name: "User", model: UserModel },
  { name: "Post", model: PostModel },
  { name: "Comment", model: CommentModel },
  { name: "Like", model: LikeModel },
  { name: "Save", model: SaveModel },
  { name: "Report", model: ReportModel },
  { name: "AuditEvent", model: AuditEventModel },
];

async function createDeclaredIndexes(): Promise<void> {
  await connectDB();

  try {
    for (const entry of models) {
      await entry.model.createIndexes();

      logger.info("Model indexes ensured", {
        model: entry.name,
        declaredIndexCount: entry.model.schema.indexes().length,
      });
    }
  } finally {
    await disconnectDB();
  }
}

void createDeclaredIndexes().catch((error) => {
  logger.error("Index creation failed", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
