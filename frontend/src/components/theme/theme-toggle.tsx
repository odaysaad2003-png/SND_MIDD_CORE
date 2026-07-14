/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {Monitor, Moon, Sun} from "lucide-react";
import {useTheme} from "next-themes";
import {useEffect, useState} from "react";

import {Button} from "@/components/ui/button";

const themeOptions = [
    {icon: Sun, label: "الوضع الفاتح", value: "light"},
    {icon: Moon, label: "الوضع الداكن", value: "dark"},
    {icon: Monitor, label: "اتباع النظام", value: "system"},
] as const;

export function ThemeToggle() {
    const {setTheme, theme} = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div
            role="group"
            aria-label="اختيار مظهر الواجهة"
            aria-busy={!mounted}
            className="flex rounded-lg border border-border bg-surface p-1"
        >
            {themeOptions.map(({icon: Icon, label, value}) => (
                <Button
                    key={value}
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={label}
                    aria-pressed={mounted && theme === value}
                    className="size-10 min-h-10 aria-pressed:bg-brand aria-pressed:text-brand-foreground"
                    onClick={() => setTheme(value)}
                >
                    <Icon aria-hidden="true" />
                </Button>
            ))}
        </div>
    );
}
