"use client";

import {useEffect, useRef, useState} from "react";

export function useNearViewport<TElement extends HTMLElement>(eager = false) {
    const elementRef = useRef<TElement | null>(null);
    const [isNearViewport, setIsNearViewport] = useState(eager);

    useEffect(() => {
        if (eager || isNearViewport) {
            return;
        }

        const element = elementRef.current;

        if (!element || typeof IntersectionObserver === "undefined") {
            setIsNearViewport(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setIsNearViewport(true);
                    observer.disconnect();
                }
            },
            {rootMargin: "240px 0px"},
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [eager, isNearViewport]);

    return {elementRef, isNearViewport};
}
