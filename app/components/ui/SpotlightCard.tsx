"use client";

import { useRef, useState, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
    children: ReactNode;
    className?: string;
    spotlightColor?: string;
}

export function SpotlightCard({
    children,
    className,
    spotlightColor = "rgba(120, 80, 255, 0.15)",
}: SpotlightCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn("glow-card relative", className)}
            style={{
                "--mouse-x": `${position.x}px`,
                "--mouse-y": `${position.y}px`,
            } as React.CSSProperties}
        >
            {isHovered && (
                <div
                    className="pointer-events-none absolute inset-0 z-10 rounded-[16px] transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(circle 200px at ${position.x}px ${position.y}px, ${spotlightColor}, transparent)`,
                    }}
                />
            )}
            {children}
        </div>
    );
}
