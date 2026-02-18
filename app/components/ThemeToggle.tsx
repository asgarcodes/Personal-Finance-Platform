"use client";

import { useTheme } from "./ThemeProvider";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/10 dark:border-white/5 flex items-center justify-center text-foreground shadow-2xl transition-colors duration-500 overflow-hidden group"
            aria-label="Toggle Dark Mode"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={theme}
                    initial={{ y: 20, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: -20, opacity: 0, rotate: 45 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    {theme === "light" ? (
                        <Moon className="w-5 h-5 text-indigo-600 group-hover:text-indigo-500 transition-colors" />
                    ) : (
                        <Sun className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
    );
};

export default ThemeToggle;
