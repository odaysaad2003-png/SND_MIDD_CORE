/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {Monitor, Moon, Sun} from "lucide-react";
import {useTheme} from "next-themes";
import {useEffect, useRef, useState} from "react";

import {cn} from "@/lib/utils/cn";

const themeOptions = [
    {icon: Sun, label: "الوضع الفاتح", value: "light"},
    {icon: Moon, label: "الوضع الداكن", value: "dark"},
    {icon: Monitor, label: "اتباع النظام", value: "system"},
] as const;

export function ThemeToggle() {
    const {setTheme, theme} = useTheme();
    const [mounted, setMounted] = useState(false);
    const detailsRef = useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeOption = themeOptions.find((option) => option.value === theme) ?? themeOptions[2];
    const ActiveIcon = activeOption.icon;

    return (
        <details ref={detailsRef} className="group relative">
            <summary
                aria-label={`المظهر الحالي: ${mounted ? activeOption.label : "جار التحميل"}`}
                className="flex size-11 cursor-pointer list-none items-center justify-center rounded-xl border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted [&::-webkit-details-marker]:hidden"
            >
                <ActiveIcon aria-hidden="true" className="size-4.5" />
            </summary>
            <div className="absolute end-0 top-[calc(100%+0.75rem)] z-50 grid min-w-44 gap-1 rounded-2xl border border-border bg-surface-raised p-2 shadow-2xl">
                {themeOptions.map(({icon: Icon, label, value}) => (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={mounted && theme === value}
                        className={cn(
                            "flex min-h-11 items-center gap-3 rounded-xl px-3 text-start text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground",
                            mounted && theme === value && "bg-brand/10 text-brand",
                        )}
                        onClick={() => {
                            setTheme(value);
                            if (detailsRef.current) detailsRef.current.open = false;
                        }}
                    >
                        <Icon aria-hidden="true" className="size-4" />
                        {label}
                    </button>
                ))}
            </div>
        </details>
    );
}
