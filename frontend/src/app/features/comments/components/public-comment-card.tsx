import {Avatar} from "@/components/ui/avatar";

import type {PublicComment} from "../schemas/public-comments.schema";

const commentDateTimeFormatter = new Intl.DateTimeFormat("ar-PS", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Gaza",
});

type PublicCommentCardProps = Readonly<{
    comment: PublicComment;
}>;

export function PublicCommentCard({comment}: PublicCommentCardProps) {
    const authorId = `public-comment-author-${comment.id}`;
    const wasEdited = comment.updatedAt !== comment.createdAt;

    return (
        <article
            aria-labelledby={authorId}
            className="grid gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5"
        >
            <header className="flex items-start gap-3">
                <Avatar imageUrl={comment.author.avatar} name={comment.author.name} className="size-10" sizes="40px" />

                <div className="min-w-0">
                    <h3 id={authorId} className="truncate text-sm font-semibold text-foreground">
                        {comment.author.name}
                    </h3>

                    <div className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                        <time dateTime={comment.createdAt}>
                            {commentDateTimeFormatter.format(new Date(comment.createdAt))}
                        </time>
                        {wasEdited ? <span>· تم التعديل</span> : null}
                    </div>
                </div>
            </header>

            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground">
                {comment.content}
            </p>
        </article>
    );
}
