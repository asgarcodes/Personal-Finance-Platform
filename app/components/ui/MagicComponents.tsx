"use client";

import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MeteorsProps {
    number?: number;
}

export function Meteors({ number = 20 }: MeteorsProps) {
    const meteors = Array.from({ length: number }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 5 + 5,
        size: Math.random() * 1 + 0.5,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {meteors.map((meteor) => (
                <span
                    key={meteor.id}
                    className="absolute top-0 left-0 rotate-[215deg] animate-[meteor_linear_infinite]"
                    style={{
                        top: `${meteor.top}%`,
                        left: `${meteor.left}%`,
                        animationDelay: `${meteor.delay}s`,
                        animationDuration: `${meteor.duration}s`,
                        width: `${meteor.size * 100}px`,
                        height: `${meteor.size}px`,
                        background: `linear-gradient(90deg, rgba(120,80,255,0.8), transparent)`,
                        borderRadius: "9999px",
                        boxShadow: `0 0 ${meteor.size * 4}px rgba(120,80,255,0.6)`,
                    }}
                />
            ))}
        </div>
    );
}

interface BorderBeamProps {
    className?: string;
    size?: number;
    duration?: number;
    colorFrom?: string;
    colorTo?: string;
}

export function BorderBeam({
    className,
    size = 200,
    duration = 15,
    colorFrom = "#7c5cfc",
    colorTo = "#60a5fa",
}: BorderBeamProps) {
    return (
        <div
            className={cn("pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden", className)}
        >
            <div
                className="absolute inset-0 rounded-[inherit]"
                style={{
                    background: `conic-gradient(from 0deg, transparent 0deg, ${colorFrom} 60deg, ${colorTo} 120deg, transparent 180deg)`,
                    animation: `border-spin ${duration}s linear infinite`,
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "xor",
                    WebkitMaskComposite: "xor",
                    padding: "1px",
                }}
            />
        </div>
    );
}

interface ShimmerButtonProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    href?: string;
}

export function ShimmerButton({ children, className, onClick, href }: ShimmerButtonProps) {
    const Tag = href ? "a" : "button";
    return (
        <Tag
            href={href}
            onClick={onClick}
            className={cn(
                "relative inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105",
                className
            )}
            style={{
                background: "linear-gradient(135deg, #7c5cfc 0%, #60a5fa 100%)",
                boxShadow: "0 0 20px rgba(124, 92, 252, 0.4)",
            }}
        >
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s linear infinite",
                }}
            />
            <span className="relative z-10">{children}</span>
        </Tag>
    );
}

interface GlowingBadgeProps {
    children: ReactNode;
    className?: string;
}

export function GlowingBadge({ children, className }: GlowingBadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium",
                className
            )}
            style={{
                background: "rgba(124, 92, 252, 0.1)",
                border: "1px solid rgba(124, 92, 252, 0.3)",
                color: "#a78bfa",
                boxShadow: "0 0 20px rgba(124, 92, 252, 0.1)",
            }}
        >
            <span
                className="w-2 h-2 rounded-full"
                style={{
                    background: "#7c5cfc",
                    boxShadow: "0 0 8px rgba(124, 92, 252, 0.8)",
                    animation: "pulse-glow 2s ease-in-out infinite",
                }}
            />
            {children}
        </div>
    );
}

interface NumberTickerProps {
    value: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}

export function NumberTicker({ value, prefix = "", suffix = "", className }: NumberTickerProps) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let start = 0;
        const end = value;
        const duration = 2000;
        const startTime = performance.now();

        const update = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * end);
            el.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
            if (progress < 1) requestAnimationFrame(update);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    requestAnimationFrame(update);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [value, prefix, suffix]);

    return (
        <span ref={ref} className={className}>
            {prefix}0{suffix}
        </span>
    );
}

interface TextRevealProps {
    text: string;
    className?: string;
}

export function TextReveal({ text, className }: TextRevealProps) {
    return (
        <span className={cn("inline-block", className)}>
            {text.split("").map((char, i) => (
                <span
                    key={i}
                    className="inline-block opacity-0"
                    style={{
                        animation: `fadeInUp 0.5s ease forwards`,
                        animationDelay: `${i * 0.03}s`,
                    }}
                >
                    {char === " " ? "\u00A0" : char}
                </span>
            ))}
        </span>
    );
}

interface GridPatternProps {
    className?: string;
}

export function GridPattern({ className }: GridPatternProps) {
    return (
        <div
            className={cn("absolute inset-0 pointer-events-none", className)}
            style={{
                backgroundImage: `
          linear-gradient(rgba(120, 80, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(120, 80, 255, 0.05) 1px, transparent 1px)
        `,
                backgroundSize: "60px 60px",
                maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
            }}
        />
    );
}
