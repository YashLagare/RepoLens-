import { HashIcon, PlusIcon, UsersIcon, XIcon } from "lucide-react";
import { ChannelList } from "stream-chat-react";
import { useTheme } from "../context/ThemeContext";
import { soundFX } from "../lib/sounds";
import ChannelListError from "./ChannelListError";
import ChannelListLoading from "./ChannelListLoading";
import CustomChannelPreview from "./CustomChannelPreview";
import EmptyChannelState from "./EmptyChannelState";
import UsersList from "./UsersList";

const WorkspaceSidebar = ({
  chatClient,
  activeChannel,
  onChannelSelect,
  onCreateChannelClick,
  onCloseMobile,
  isMobile = false,
}) => {
  const { soundEnabled } = useTheme();

  const handleCreateChannel = () => {
    if (soundEnabled) soundFX.playClick();
    if (isMobile && onCloseMobile) onCloseMobile();
    onCreateChannelClick();
  };

  const handleSelect = (channel) => {
    if (soundEnabled) soundFX.playClick();
    if (isMobile && onCloseMobile) onCloseMobile();
    onChannelSelect(channel);
  };

  return (
    <div className={`team-channel-list h-full flex flex-col ${isMobile ? "mobile-channel-list bg-[#160d2e] dark:bg-[#160d2e]" : ""}`}>
      {/* Sidebar Header */}
      <div className="team-channel-list__header flex items-center justify-between gap-4 p-4 border-b border-gray-200 dark:border-white/10 shrink-0">
        <div className="brand-container flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="brand-logo w-8 h-8 rounded-lg" />
          <span className="brand-name font-bold text-lg text-gray-900 dark:text-white">Connectify</span>
        </div>

        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg text-gray-600 dark:text-white/80 transition-colors"
            title="Close Sidebar"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="team-channel-list__content flex-1 overflow-y-auto pb-12">
        {/* Create Channel Action */}
        <div className="create-channel-section p-4">
          <button
            onClick={handleCreateChannel}
            className="create-channel-btn w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl font-bold shadow-md hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Channel</span>
          </button>
        </div>

        {/* Unified Stream Chat Channel List */}
        <ChannelList
          filters={{ members: { $in: [chatClient?.user?.id] } }}
          options={{ state: true, watch: true, subscribe: true }}
          Preview={({ channel }) => (
            <CustomChannelPreview
              channel={channel}
              activeChannel={activeChannel}
              setActiveChannel={handleSelect}
            />
          )}
          List={({ children, loading, error }) => (
            <div className="channel-sections">
              {/* Channels Header */}
              <div className="section-header px-4 pt-3 pb-1">
                <div className="section-title flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <HashIcon className="w-4 h-4" />
                  <span>Channels</span>
                </div>
              </div>

              {/* Loading & Error States */}
              {loading && <ChannelListLoading />}
              {error && <ChannelListError onRetry={() => window.location.reload()} />}

              {/* Channel Items */}
              <div className="channels-list">
                {!loading && !error && (!children || children.length === 0) ? (
                  <EmptyChannelState
                    type="channels"
                    onCreateClick={handleCreateChannel}
                  />
                ) : (
                  children
                )}
              </div>

              {/* Direct Messages Section */}
              <div className="section-header direct-messages px-4 pt-4 pb-1">
                <div className="section-title flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <UsersIcon className="w-4 h-4" />
                  <span>Direct Messages</span>
                </div>
              </div>
              <UsersList activeChannel={activeChannel} />
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default WorkspaceSidebar;
