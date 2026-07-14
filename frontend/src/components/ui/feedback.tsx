import {CircleAlert, CircleCheck, CircleX, Info} from "lucide-react";
import type {ComponentProps, ReactNode} from "react";

import {cn} from "@/lib/utils/cn";

const feedbackStyles = {
    danger: "border-danger/35 bg-danger/10 text-danger",
    info: "border-info/35 bg-info/10 text-info",
    success: "border-success/35 bg-success/10 text-success",
    warning: "border-warning/40 bg-warning/10 text-foreground",
} as const;

const feedbackIcons = {
    danger: CircleX,
    info: Info,
    success: CircleCheck,
    warning: CircleAlert,
} as const;

type FeedbackProps = Omit<ComponentProps<"div">, "title"> &
    Readonly<{
        description?: ReactNode;
        title: ReactNode;
        variant?: keyof typeof feedbackStyles;
    }>;

export function Feedback({className, description, title, variant = "info", ...props}: FeedbackProps) {
    const Icon = feedbackIcons[variant];
    const role = variant === "danger" ? "alert" : "status";

    return (
        <div
            role={role}
            className={cn("flex gap-3 rounded-2xl border p-5", feedbackStyles[variant], className)}
            {...props}
        >
            <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div className="grid gap-1">
                <p className="font-semibold">{title}</p>
                {description ? <div className="text-sm leading-6 text-foreground">{description}</div> : null}
            </div>
        </div>
    );
}
