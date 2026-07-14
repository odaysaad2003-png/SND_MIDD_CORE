import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";

import type {Metadata} from "next";
import type {ReactNode} from "react";

import {AppProviders} from "@/providers/app-providers";

import "../styles/globals.css";

export const metadata: Metadata = {
    title: {
        default: "سند",
        template: "%s | سند",
    },
    description: "منصة مجتمعية عربية لمشاركة المنشورات والتفاعل معها.",
};

type RootLayoutProps = Readonly<{
    children: ReactNode;
}>;

export default function RootLayout({children}: RootLayoutProps) {
    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <body>
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    );
}
