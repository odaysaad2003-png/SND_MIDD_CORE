"use client";

import {SquarePen} from "lucide-react";
import type {ComponentProps} from "react";

import {Button} from "@/components/ui/button";

import {usePostComposer} from "../providers/post-composer-provider";

type PostComposerTriggerProps = Omit<ComponentProps<typeof Button>, "onClick" | "type"> &
    Readonly<{
        label?: string;
        onBeforeOpen?: () => void;
    }>;

export function PostComposerTrigger({label = "إنشاء منشور", onBeforeOpen, children, ...props}: PostComposerTriggerProps) {
    const {openComposer} = usePostComposer();

    return (
        <Button
            type="button"
            onClick={() => {
                onBeforeOpen?.();
                openComposer();
            }}
            {...props}
        >
            {children ?? (
                <>
                    <SquarePen aria-hidden="true" />
                    {label}
                </>
            )}
        </Button>
    );
}
