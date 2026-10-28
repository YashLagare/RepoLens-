import * as Sentry from "@sentry/react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircleIcon, CircleIcon, UsersIcon } from "lucide-react";
import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { useChatContext } from "stream-chat-react";

const UsersList = ({ activeChannel }) => {
    const { client } = useChatContext();
    const [_, setSearchParams] = useSearchParams();

    const fetchUsers = useCallback(async () => {
        if (!client?.user) return;

        const response = await client.queryUsers(
            { id: { $ne: client.user.id } },
            { name: 1 },
            { limit: 20 }
        );

        const usersOnly = response.users.filter(
            (user) => !user.id.startsWith("recording-")
        );

        return usersOnly;
    }, [client]);

    const {
        data: users = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["users-list", client?.user?.id],
        queryFn: fetchUsers,
        enabled: !!client?.user,
        staleTime: 1000 * 60 * 5,
    });

    const startDirectMessage = async (targetUser) => {
        if (!targetUser || !client?.user) return;

        try {
            const channelId = [client.user.id, targetUser.id]
                .sort()
                .join("-")
                .slice(0, 64);

            const channel = client.channel("messaging", channelId, {
                members: [client.user.id, targetUser.id],
            });

            await channel.watch();
            setSearchParams({ channel: channel.id });
        } catch (error) {
            console.log("Error creating DM", error);
            Sentry.captureException(error, {
                tags: { component: "UsersList" },
                extra: {
                    context: "create_direct_message",
                    targetUserId: targetUser?.id,
                },
            });
        }
    };

    // Loading State
    if (isLoading) {
        return (
            <div className="px-4 py-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                        <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-white/10" />
                        <div className="flex-1 h-3 bg-gray-200 dark:bg-white/10 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    // Error State
    if (isError) {
        return (
            <div className="px-4 py-6 text-center">
                <AlertCircleIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600 dark:text-red-300">Failed to load users</p>
            </div>
        );
    }

    // Empty State
    if (!users.length) {
        return (
            <div className="px-4 py-6 text-center">
                <UsersIcon className="w-8 h-8 text-gray-400 dark:text-white/20 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-white/40">No other users found</p>
            </div>
        );
    }

    return (
        <div className="team-channel-list__users pb-10">
            {users.map((user) => {
                const channelId = [client.user.id, user.id].sort().join("-").slice(0, 64);
                const channel = client.channel("messaging", channelId, {
                    members: [client.user.id, user.id],
                });
                const unreadCount = channel.countUnread();
                const isActive = activeChannel && activeChannel.id === channelId;

                return (
                    <button
                        key={user.id}
                        onClick={() => startDirectMessage(user)}
                        className={`str-chat__channel-preview-messenger group transition-all
              ${isActive
                                ? '!bg-gradient-to-r !from-purple-500/20 !to-purple-700/20 dark:!from-purple-500/20 dark:!to-purple-700/20 !border !border-purple-500/30 !shadow-md'
                                : 'hover:!bg-purple-50 dark:hover:!bg-white/5'
                            }`}
                    >
                        <div className="flex items-center gap-3 w-full">
                            {/* User Avatar with Online Indicator */}
                            <div className="relative flex-shrink-0">
                                {user.image ? (
                                    <img
                                        src={user.image}
                                        alt={user.name || user.id}
                                        className="w-5 h-5 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white
                    ${isActive
                                            ? 'bg-purple-600'
                                            : 'bg-gray-400 dark:bg-gray-500 group-hover:bg-purple-600'
                                        }`}
                                    >
                                        {(user.name || user.id).charAt(0).toUpperCase()}
                                    </div>
                                )}

                                {/* Online Status */}
                                <CircleIcon
                                    className={`w-2 h-2 absolute -bottom-0.5 -right-0.5 
                    ${user.online
                                            ? 'text-green-500 fill-green-500'
                                            : 'text-gray-400 fill-gray-400'
                                        }`}
                                />
                            </div>

                            {/* User Name */}
                            <div className="flex-1 min-w-0 text-left">
                                <span className={`text-sm truncate block font-medium
                  ${isActive
                                        ? 'text-purple-900 dark:text-white font-bold'
                                        : 'text-gray-800 dark:text-white/80 group-hover:text-purple-900 dark:group-hover:text-white'
                                    }
                `}>
                                    {user.name || user.id}
                                </span>
                                {user.online && (
                                    <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Online</span>
                                )}
                            </div>

                            {/* Unread Badge */}
                            {unreadCount > 0 && (
                                <span className="flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center 
                               text-[10px] font-bold rounded-full bg-purple-600 text-white px-1
                               shadow-lg shadow-purple-500/25">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default UsersList;