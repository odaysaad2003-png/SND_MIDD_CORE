"use client";

import {createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode} from "react";

import {useAuth} from "@/features/auth/providers/auth-provider";

import {PostComposerDialog} from "../components/post-composer-dialog";

type PostComposerContextValue = Readonly<{
    openComposer: () => void;
}>;

const PostComposerContext = createContext<PostComposerContextValue | null>(null);

type PostComposerProviderProps = Readonly<{
    children: ReactNode;
}>;

function removeComposeIntentFromCurrentUrl(): void {
    const url = new URL(window.location.href);

    if (url.searchParams.get("compose") !== "1") {
        return;
    }

    url.searchParams.delete("compose");

    const search = url.searchParams.toString();
    const nextUrl = `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;

    window.history.replaceState(window.history.state, "", nextUrl);
}

export function PostComposerProvider({children}: PostComposerProviderProps) {
    const {status} = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const handledComposeIntentRef = useRef(false);

    useEffect(() => {
        if (status !== "authenticated") {
            handledComposeIntentRef.current = false;

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsOpen(false);
            return;
        }

        if (handledComposeIntentRef.current) {
            return;
        }

        const url = new URL(window.location.href);

        if (url.searchParams.get("compose") !== "1") {
            return;
        }

        handledComposeIntentRef.current = true;
        removeComposeIntentFromCurrentUrl();

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOpen(true);
    }, [status]);

    const value = useMemo<PostComposerContextValue>(
        () => ({
            openComposer: () => setIsOpen(true),
        }),
        []
    );

    return (
        <PostComposerContext.Provider value={value}>
            {children}
            {isOpen ? <PostComposerDialog open onOpenChange={setIsOpen} /> : null}
        </PostComposerContext.Provider>
    );
}

export function usePostComposer(): PostComposerContextValue {
    const context = useContext(PostComposerContext);

    if (!context) {
        throw new Error("usePostComposer must be used inside PostComposerProvider");
    }

    return context;
}
