import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";

const ChannelListError = ({ onRetry }) => {
    return (
        <div className="mx-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <AlertCircleIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-300 text-sm mb-3">Failed to load channels</p>
            <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors"
            >
                <RefreshCwIcon className="w-3 h-3" />
                Retry
            </button>
        </div>
    );
};

export default ChannelListError;