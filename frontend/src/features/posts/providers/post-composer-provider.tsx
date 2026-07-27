"use client";

import {createContext, useContext, useEffect, useMemo, useState, type ReactNode} from "react";

import {useAuth} from "@/features/auth/providers/auth-provider";

import {PostComposerDialog} from "../components/post-composer-dialog";

type PostComposerContextValue = Readonly<{
    openComposer: () => void;
}>;

const PostComposerContext = createContext<PostComposerContextValue | null>(null);

type PostComposerProviderProps = Readonly<{
    children: ReactNode;
}>;

export function PostComposerProvider({children}: PostComposerProviderProps) {
    const {status} = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (status !== "authenticated") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsOpen(false);
        }
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
