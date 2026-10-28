import { LoaderIcon } from "lucide-react";

const PageLoader = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6"
            style={{
                background: `linear-gradient(125deg, #1a0b2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #7209b7 100%)`
            }}>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 
                      flex items-center justify-center animate-pulse">
                    <img src="/logo.png" alt="Connectify" className="w-8 h-8" />
                </div>
            </div>

            {/* Spinner */}
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-white/10" />
                <LoaderIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                              w-8 h-8 text-purple-400 animate-spin" />
            </div>

            {/* Loading Text */}
            <div className="text-center">
                <p className="text-white/80 text-lg font-medium">Loading your workspace</p>
                <p className="text-white/40 text-sm mt-1">Preparing your chat experience...</p>
            </div>

            {/* Loading Dots */}
            <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                    />
                ))}
            </div>
        </div>
    );
};

export default PageLoader;