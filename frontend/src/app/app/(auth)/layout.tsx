import type {ReactNode} from "react";

import {AuthShell} from "@/features/auth/components/auth.shell";

type AuthLayoutProps = Readonly<{
    children: ReactNode;
}>;

export default function AuthLayout({children}: AuthLayoutProps) {
    return <AuthShell>{children}</AuthShell>;
}
