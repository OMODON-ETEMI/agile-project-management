// components/AnimatedWrapper.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type AnimatedWrapperProps = {
    children: ReactNode;
    className?: string;
    direction: "FromLeft" | "FromRight" | "FromBottom" | "FromTop";
};

export const AnimatedWrapper = ({ children, className = "", direction }: AnimatedWrapperProps) => {
    const getMotionProps = () => {
        switch (direction) {
            case "FromLeft":
                return { initial: { opacity: 0, x: -100 }, animate: { opacity: 1, x: 0 } };
            case "FromRight":
                return { initial: { opacity: 0, x: 100 }, animate: { opacity: 1, x: 0 } };
            case "FromBottom":
                return { initial: { opacity: 0, y: 100 }, animate: { opacity: 1, y: 0 } };
            case "FromTop":
                return { initial: { opacity: 0, y: -100 }, animate: { opacity: 1, y: 0 } };
            default:
                return { initial: { opacity: 0 }, animate: { opacity: 1 } };
        }
    };

    const motionProps = getMotionProps();

    return (
        <motion.div
            className={className}
            {...motionProps}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
};