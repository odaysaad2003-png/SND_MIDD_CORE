"use client";

import type {ReactNode} from "react";

import {SndToastProvider} from "@/components/feedback/toast/snd-toast-provider";
import {AuthProvider} from "@/features/auth/providers/auth-provider";

import {QueryProvider} from "./query-provider";
import {ThemeProvider} from "./theme-provider";

type AppProvidersProps = Readonly<{
    children: ReactNode;
}>;

export function AppProviders({children}: AppProvidersProps) {
    return (
        <ThemeProvider>
            <SndToastProvider>
                <QueryProvider>
                    <AuthProvider>{children}</AuthProvider>
                </QueryProvider>
            </SndToastProvider>
        </ThemeProvider>
    );
}
