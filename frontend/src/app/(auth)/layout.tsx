import type {Metadata} from "next";
import type {ReactNode} from "react";

import {AuthShell} from "@/features/auth/components/auth.shell";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,

        googleBot: {
            index: false,
            follow: false,
        },
    },
};

type AuthLayoutProps = Readonly<{
    children: ReactNode;
}>;

export default function AuthLayout({children}: AuthLayoutProps) {
    return <AuthShell>{children}</AuthShell>;
}
