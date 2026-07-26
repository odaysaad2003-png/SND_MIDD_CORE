"use client";

import {motion, useReducedMotion} from "motion/react";
import type {ReactNode} from "react";

type LandingRevealProps = Readonly<{
    children: ReactNode;
    className?: string;
}>;

export function LandingReveal({children, className}: LandingRevealProps) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            className={className}
            initial={reduceMotion ? false : {opacity: 0, y: 28}}
            whileInView={reduceMotion ? undefined : {opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.19}}
            transition={{duration: 0.85, ease: [0.32, 1, 0.39, 1]}}
        >
            {children}
        </motion.div>
    );
}
