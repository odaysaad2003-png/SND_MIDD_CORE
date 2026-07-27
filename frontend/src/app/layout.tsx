import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";

import type {Metadata} from "next";
import type {ReactNode} from "react";

import {siteConfig} from "@/lib/seo/site-config";
import {AppProviders} from "@/providers/app-providers";

import "../styles/globals.css";

const defaultTitle = `${siteConfig.name} | منصة مجتمعية عربية`;

export const metadata: Metadata = {
    metadataBase: siteConfig.url,

    title: {
        default: defaultTitle,
        template: `%s | ${siteConfig.name}`,
    },

    description: siteConfig.description,

    applicationName: siteConfig.name,
    authors: [{name: siteConfig.name}],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "community",

    formatDetection: {
        address: false,
        email: false,
        telephone: false,
    },

    robots: {
        index: true,
        follow: true,

        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },

    openGraph: {
        type: "website",
        locale: siteConfig.locale,
        siteName: siteConfig.name,
        title: defaultTitle,
        description: siteConfig.description,
    },

    twitter: {
        card: "summary",
        title: defaultTitle,
        description: siteConfig.description,
    },
};

type RootLayoutProps = Readonly<{
    children: ReactNode;
}>;

export default function RootLayout({children}: RootLayoutProps) {
    return (
        <html lang={siteConfig.language} dir="rtl" suppressHydrationWarning>
            <body>
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    );
}
