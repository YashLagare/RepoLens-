import { HashIcon } from "lucide-react";

const CustomChannelPreview = ({ channel, setActiveChannel, activeChannel }) => {
    const isActive = activeChannel && activeChannel.id === channel.id;
    const isDM = channel.data.member_count === 2 && channel.data.id.includes("user_");

    if (isDM) return null;

    const unreadCount = channel.countUnread();

    return (
        <button
            onClick={() => setActiveChannel(channel)}
            className={`str-chat__channel-preview-messenger group relative transition-all
        ${isActive
                    ? '!bg-gradient-to-r !from-purple-500/20 !to-purple-700/20 dark:!from-purple-500/20 dark:!to-purple-700/20 !border !border-purple-500/30 !shadow-md'
                    : 'hover:!bg-purple-50 dark:hover:!bg-white/5'
                }`}
        >
            <div className="flex items-center gap-3 w-full">
                {/* Channel Icon with background */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors
          ${isActive
                        ? 'bg-purple-600/20 text-purple-700 dark:text-purple-300 font-bold'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 group-hover:bg-purple-100 dark:group-hover:bg-white/10 group-hover:text-purple-700 dark:group-hover:text-white/60'
                    }`}
                >
                    <HashIcon className="w-4 h-4" />
                </div>

                {/* Channel Info */}
                <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate block
              ${isActive
                                ? 'text-purple-900 dark:text-white'
                                : 'text-gray-800 dark:text-white/80 group-hover:text-purple-900 dark:group-hover:text-white'
                            }
            `}>
                            {channel.data?.name || channel.data?.id || 'Unnamed Channel'}
                        </span>

                        {/* Member count badge */}
                        {channel.data?.member_count > 0 && (
                            <span className="flex-shrink-0 text-[10px] text-gray-500 dark:text-white/40 bg-gray-200/60 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono">
                                {channel.data.member_count}
                            </span>
                        )}
                    </div>

                    {/* Last message preview */}
                    {channel.state?.messages?.[channel.state.messages.length - 1]?.text && (
                        <p className="text-xs text-gray-500 dark:text-white/50 truncate mt-0.5 font-medium">
                            {channel.state.messages[channel.state.messages.length - 1].text}
                        </p>
                    )}
                </div>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="flex-shrink-0 min-w-[20px] h-5 flex items-center justify-center 
                         text-[10px] font-bold rounded-full bg-purple-600 text-white px-1.5
                         shadow-lg shadow-purple-500/25">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </div>
        </button>
    );
};

export default CustomChannelPreview;