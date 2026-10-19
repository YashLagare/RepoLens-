"use client";

import useScreenSize from "@/hooks/useScreenSize";
import { motion } from "framer-motion";
import { Monitor, Smartphone } from "lucide-react";

export default function ScreenTooSmallGuard() {
    const isSmallScreen = useScreenSize();

    if (!isSmallScreen) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl px-4 py-6"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 to-slate-900 opacity-90" />
            <div className="absolute top-8 left-8 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-8 right-8 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

            <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 180, damping: 16 }}
                className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-[#0b0b13]/95 p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl"
            >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/40 to-transparent" />
                <div className="relative z-10 flex flex-col items-center text-center gap-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900/80 ring-1 ring-white/10 shadow-lg shadow-slate-950/30">
                        <Monitor className="h-8 w-8 text-sky-300" />
                    </div>

                    <div>
                        <h2 className="text-3xl font-semibold text-white">Screen Too Small</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                            DevCanvas is built for a wider coding workspace. Switch to a laptop or desktop for the best experience.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-inner shadow-white/5">
                        <Smartphone className="h-10 w-10 text-white/80" />
                        <span className="text-sm font-medium text-slate-200">Use a larger screen to continue</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
