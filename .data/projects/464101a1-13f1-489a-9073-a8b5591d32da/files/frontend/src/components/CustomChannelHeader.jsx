import { UserButton, useUser } from "@clerk/clerk-react";
import {
    HashIcon,
    LockIcon,
    MenuIcon,
    MoonIcon,
    PinIcon,
    SearchIcon,
    SmileIcon,
    SparklesIcon,
    SunIcon,
    UserPlusIcon,
    UsersIcon,
    VideoIcon,
    Volume2Icon,
    VolumeXIcon
} from "lucide-react";
import { useState } from "react";
import { useChannelStateContext } from "stream-chat-react";
import { useTheme } from "../context/ThemeContext";
import { soundFX } from "../lib/sounds";
import InviteModal from "./InviteModal";
import MembersModal from "./MembersModal";
import PinnedMessagesModal from "./PinnedMessagesModal";

const CustomChannelHeader = ({ onMobileMenuClick, onOpenSearch, onOpenAISummary, onOpenUserStatus, userStatus, onJoinAudioHuddle }) => {
    const { channel } = useChannelStateContext();
    const { user } = useUser();
    const { theme, toggleTheme, soundEnabled, toggleSound } = useTheme();

    const memberCount = Object.keys(channel.state.members).length;

    const [showInvite, setShowInvite] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [showPinnedMessages, setShowPinnedMessages] = useState(false);
    const [pinnedMessages, setPinnedMessages] = useState([]);

    const otherUser = Object.values(channel.state.members).find(
        (member) => member.user.id !== user.id
    );

    const isDM = channel.data?.member_count === 2 && channel.data?.id.includes("user_");

    const handleShowPinned = async () => {
        if (soundEnabled) soundFX.playClick();
        const channelState = await channel.query();
        setPinnedMessages(channelState.pinned_messages);
        setShowPinnedMessages(true);
    };

    const handleVideoCall = async () => {
        if (soundEnabled) soundFX.playJoinCall();
        if (channel) {
            const callUrl = `${window.location.origin}/call/${channel.id}`;
            await channel.sendMessage({
                text: `🎥 Video call started! Join here: ${callUrl}`,
            });
        }
    };

    return (
        <>
            <div className="h-14 border-b border-gray-200 dark:border-white/10 flex items-center px-4 justify-between bg-white/95 dark:bg-[#160d2e]/95 backdrop-blur-md transition-colors">
                <div className="flex items-center gap-3">
                    {/* Channel Info */}
                    <div className="flex items-center gap-2.5">
                        {/* Channel Type Icon */}
                        <div className={`p-1.5 rounded-lg ${channel.data?.private ? 'bg-orange-50 dark:bg-orange-950/40' : 'bg-purple-50 dark:bg-purple-950/40'
                            }`}>
                            {channel.data?.private ? (
                                <LockIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            ) : (
                                <HashIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            )}
                        </div>

                        {/* DM Avatar */}
                        {isDM && otherUser?.user?.image && (
                            <div className="relative">
                                <img
                                    src={otherUser.user.image}
                                    alt={otherUser.user.name || otherUser.user.id}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-purple-800 shadow-sm"
                                />
                                {otherUser.user.online && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 
                                 border-2 border-white dark:border-purple-800 rounded-full" />
                                )}
                            </div>
                        )}

                        {/* Channel Name */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {isDM ? otherUser?.user?.name || otherUser?.user?.id : channel.data?.name || channel.data?.id}
                                </span>
                                {channel.data?.private && (
                                    <span className="text-[10px] font-medium bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded">
                                        PRIVATE
                                    </span>
                                )}
                            </div>
                            {isDM && otherUser?.user?.online && (
                                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5">
                    {/* Command Search Button */}
                    {onOpenSearch && (
                        <button
                            onClick={() => {
                                if (soundEnabled) soundFX.playClick();
                                onOpenSearch();
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg border border-gray-200 dark:border-white/10 transition-colors"
                            title="Command Search (Cmd+K / Ctrl+K)"
                        >
                            <SearchIcon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline font-mono text-[10px] bg-gray-200 dark:bg-white/10 px-1 rounded">⌘K</span>
                        </button>
                    )}

                    {/* AI Channel Summarizer */}
                    {onOpenAISummary && (
                        <button
                            onClick={() => {
                                if (soundEnabled) soundFX.playClick();
                                onOpenAISummary();
                            }}
                            className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                            title="AI Channel Summary"
                        >
                            <SparklesIcon className="w-4 h-4" />
                        </button>
                    )}

                    {/* Custom Status Switcher */}
                    {onOpenUserStatus && (
                        <button
                            onClick={() => {
                                if (soundEnabled) soundFX.playClick();
                                onOpenUserStatus();
                            }}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
                            title="Set Custom Status"
                        >
                            {userStatus?.emoji ? (
                                <span className="text-sm">{userStatus.emoji}</span>
                            ) : (
                                <SmileIcon className="w-4 h-4" />
                            )}
                        </button>
                    )}

                    {/* Audio Huddle Join Button */}
                    {onJoinAudioHuddle && (
                        <button
                            onClick={() => {
                                if (soundEnabled) soundFX.playJoinCall();
                                onJoinAudioHuddle(channel);
                            }}
                            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                            title="Join 1-Click Audio Huddle"
                        >
                            <Volume2Icon className="w-4 h-4" />
                        </button>
                    )}

                    <div className="w-[1px] h-5 bg-gray-200 dark:bg-white/10 mx-1" />

                    {/* Theme Switcher */}
                    <button
                        onClick={() => {
                            if (soundEnabled) soundFX.playClick();
                            toggleTheme();
                        }}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-white/10 rounded-lg transition-colors"
                        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {theme === "dark" ? (
                            <SunIcon className="w-4 h-4 text-amber-400" />
                        ) : (
                            <MoonIcon className="w-4 h-4 text-purple-600" />
                        )}
                    </button>

                    {/* Sound FX Switcher */}
                    <button
                        onClick={() => {
                            toggleSound();
                            if (!soundEnabled) soundFX.playClick();
                        }}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-white/10 rounded-lg transition-colors"
                        title={soundEnabled ? "Mute UI Sounds" : "Enable UI Sounds"}
                    >
                        {soundEnabled ? (
                            <Volume2Icon className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <VolumeXIcon className="w-4 h-4 text-gray-400" />
                        )}
                    </button>

                    <div className="w-[1px] h-5 bg-gray-200 dark:bg-white/10 mx-1" />

                    {/* Members Count */}
                    <button
                        onClick={() => {
                            if (soundEnabled) soundFX.playClick();
                            setShowMembers(true);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors group"
                        title="View members"
                    >
                        <UsersIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                        <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white font-medium">
                            {memberCount}
                        </span>
                    </button>

                    {/* Video Call */}
                    <button
                        onClick={handleVideoCall}
                        className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors group"
                        title="Start Video Call"
                    >
                        <VideoIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-purple-700" />
                    </button>

                    {/* Pinned Messages */}
                    <button
                        onClick={handleShowPinned}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors group relative"
                        title="Pinned Messages"
                    >
                        <PinIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                        {pinnedMessages.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                {pinnedMessages.length}
                            </span>
                        )}
                    </button>

                    {/* Invite Button (Private Channels) */}
                    {channel.data?.private && (
                        <button
                            onClick={() => {
                                if (soundEnabled) soundFX.playClick();
                                setShowInvite(true);
                            }}
                            className="ml-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 
                       text-white text-sm font-medium rounded-lg hover:shadow-lg 
                       hover:shadow-purple-500/25 transition-all duration-200
                       flex items-center gap-1.5 hover:scale-105 active:scale-95"
                        >
                            <UserPlusIcon className="w-4 h-4" />
                            Invite
                        </button>
                    )}

                    {/* Clerk User Profile & Sign Out Button */}
                    <div className="user-button-wrapper ml-2">
                        <UserButton />
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showMembers && (
                <MembersModal
                    members={Object.values(channel.state.members)}
                    onClose={() => setShowMembers(false)}
                />
            )}

            {showPinnedMessages && (
                <PinnedMessagesModal
                    pinnedMessages={pinnedMessages}
                    onClose={() => setShowPinnedMessages(false)}
                />
            )}

            {showInvite && (
                <InviteModal
                    channel={channel}
                    onClose={() => setShowInvite(false)}
                />
            )}
        </>
    );
};

export default CustomChannelHeader;