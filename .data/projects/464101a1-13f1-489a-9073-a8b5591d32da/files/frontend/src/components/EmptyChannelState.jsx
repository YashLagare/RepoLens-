
import { HashIcon, MessageSquareIcon, PlusIcon } from "lucide-react";

const EmptyChannelState = ({ type = "channels", onCreateClick }) => {
    return (
        <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                {type === "channels" ? (
                    <HashIcon className="w-6 h-6 text-white/40" />
                ) : (
                    <MessageSquareIcon className="w-6 h-6 text-white/40" />
                )}
            </div>
            <p className="text-white/60 text-sm mb-1">
                {type === "channels" ? "No channels yet" : "No direct messages"}
            </p>
            <p className="text-white/40 text-xs mb-4">
                {type === "channels"
                    ? "Create a channel to start collaborating"
                    : "Start a conversation with your team"}
            </p>
            {type === "channels" && (
                <button
                    onClick={onCreateClick}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm font-medium transition-colors"
                >
                    <PlusIcon className="w-3 h-3" />
                    Create Channel
                </button>
            )}
        </div>
    );
};

export default EmptyChannelState;