import { UserButton } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";
import { MenuIcon, MessageCircleHeart, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window
} from "stream-chat-react";
import AISummaryModal from "../components/AISummaryModal";
import AudioHuddleBar from "../components/AudioHuddleBar";
import CommandKModal from "../components/CommandKModal";
import CreateChannelModal from "../components/CreateChannelModal";
import CustomChannelHeader from "../components/CustomChannelHeader";
import ImageLightbox from "../components/ImageLightbox";
import MobileSidebar from "../components/MobileSidebar";
import PageLoader from "../components/PageLoader";
import UserStatusModal from "../components/UserStatusModal";
import WorkspaceSidebar from "../components/WorkspaceSidebar";
import { useTheme } from "../context/ThemeContext";
import { useStreamChat } from "../hooks/useStreamChat";
import { soundFX } from "../lib/sounds";
import "../styles/stream-chat-theme.css";

const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [lightboxImage, setLightboxImage] = useState(null);

  // Modals & Feature State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);
  const [isUserStatusOpen, setIsUserStatusOpen] = useState(false);
  const [userStatus, setUserStatus] = useState({ emoji: "", text: "" });
  const [activeHuddleChannel, setActiveHuddleChannel] = useState(null);

  const { chatClient, error, isLoading } = useStreamChat();
  const { theme, soundEnabled } = useTheme();

  // Lock body scrolling when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen]);

  // Keyboard Escape listener to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileSidebarOpen]);

  // Keyboard Cmd+K / Ctrl+K search listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen to new message sound effects
  useEffect(() => {
    if (!chatClient) return;

    const handleNewMessage = (event) => {
      if (!soundEnabled) return;
      if (event.user?.id === chatClient.user?.id) {
        soundFX.playSend();
      } else {
        soundFX.playReceive();
      }
    };

    chatClient.on("message.new", handleNewMessage);
    return () => chatClient.off("message.new", handleNewMessage);
  }, [chatClient, soundEnabled]);

  // Handle Image Lightbox clicks on chat images
  useEffect(() => {
    const handleImageClick = (e) => {
      const target = e.target;
      if (target.tagName === "IMG" && target.closest(".str-chat__message")) {
        e.preventDefault();
        setLightboxImage(target.src);
      }
    };

    document.addEventListener("click", handleImageClick);
    return () => document.removeEventListener("click", handleImageClick);
  }, []);

  // Set active channel from URL params
  useEffect(() => {
    if (chatClient) {
      const channelId = searchParams.get("channel");
      if (channelId) {
        const channel = chatClient.channel("messaging", channelId);
        setActiveChannel(channel);
      }
    }
  }, [chatClient, searchParams]);

  // Handle channel selection
  const handleChannelSelect = (channel) => {
    if (soundEnabled) soundFX.playClick();
    setActiveChannel(channel);
    setSearchParams({ channel: channel.id });
    setIsMobileSidebarOpen(false);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0b2e] to-[#7209b7]">
        <div className="text-center p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 max-w-md">
          <XIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-white/70 mb-6">Something went wrong. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !chatClient) return <PageLoader />;

  return (
    <div className="chat-wrapper overflow-x-hidden">
      <Chat client={chatClient} theme={theme === "light" ? "str-chat__theme-light" : "str-chat__theme-dark"}>
        <div className="chat-container">

          {/* Single Global Mobile Top Header */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#4a154b] to-[#350d36] border-b border-white/10 sticky top-0 z-40">
            <button
              onClick={() => {
                if (soundEnabled) soundFX.playClick();
                setIsMobileSidebarOpen(true);
              }}
              className="p-2 bg-white/10 rounded-lg text-white/80 hover:bg-white/20 transition-colors"
              title="Open Workspace Navigation"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Connectify" className="w-7 h-7 rounded-md" />
              <span className="font-semibold text-white">Connectify</span>
            </div>
            <UserButton />
          </div>

          {/* Mobile Sidebar Off-Screen Drawer */}
          <AnimatePresence>
            {isMobileSidebarOpen && (
              <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
                {/* Dark Backdrop Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                  onClick={() => setIsMobileSidebarOpen(false)}
                />

                {/* Sliding Drawer Container */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-sm h-full shadow-2xl z-50 bg-[#160d2e] dark:bg-[#160d2e]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MobileSidebar
                    chatClient={chatClient}
                    activeChannel={activeChannel}
                    onChannelSelect={handleChannelSelect}
                    onClose={() => setIsMobileSidebarOpen(false)}
                    onCreateChannel={() => {
                      setIsMobileSidebarOpen(false);
                      setIsCreateModalOpen(true);
                    }}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* LEFT SIDEBAR - Desktop Only */}
          <div className="desktop-sidebar-container hidden lg:block w-80 shrink-0 h-full">
            <WorkspaceSidebar
              chatClient={chatClient}
              activeChannel={activeChannel}
              onChannelSelect={handleChannelSelect}
              onCreateChannelClick={() => setIsCreateModalOpen(true)}
              isMobile={false}
            />
          </div>

          {/* RIGHT CONTAINER */}
          <div className="chat-main">
            {activeChannel ? (
              <Channel channel={activeChannel}>
                <Window>
                  <CustomChannelHeader
                    onOpenSearch={() => setIsSearchOpen(true)}
                    onOpenAISummary={() => setIsAISummaryOpen(true)}
                    onOpenUserStatus={() => setIsUserStatusOpen(true)}
                    userStatus={userStatus}
                    onJoinAudioHuddle={(ch) => setActiveHuddleChannel(ch)}
                  />
                  <MessageList />
                  <MessageInput />
                </Window>
                <Thread />
              </Channel>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#160d2e] via-[#120826] to-[#0c051a] dark:from-[#160d2e] dark:to-[#0c051a] text-white">
                <div className="text-center max-w-lg px-8 py-12 rounded-3xl bg-white/5 dark:bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl animate-fadeIn">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500/30 to-purple-800/40 flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-900/30">
                    <MessageCircleHeart className="w-12 h-12 text-purple-400 animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-white dark:text-white mb-3 tracking-tight">Welcome to Connectify</h2>
                  <p className="text-gray-300 dark:text-gray-300 mb-8 text-base leading-relaxed">
                    Select a channel or start a conversation from the sidebar to begin real-time messaging and video calls with your team.
                  </p>
                  <button
                    onClick={() => {
                      if (soundEnabled) soundFX.playClick();
                      setIsCreateModalOpen(true);
                    }}
                    className="px-8 py-3.5 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 text-white rounded-2xl font-bold shadow-xl shadow-purple-900/40 hover:shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    + Create Your First Channel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {isCreateModalOpen && (
          <CreateChannelModal onClose={() => setIsCreateModalOpen(false)} />
        )}

        {/* Lightbox Modal */}
        {lightboxImage && (
          <ImageLightbox
            src={lightboxImage}
            onClose={() => setLightboxImage(null)}
          />
        )}

        {/* Command Search Palette Modal */}
        <CommandKModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          channels={chatClient ? Object.values(chatClient.activeChannels || {}) : []}
          users={[]}
          onSelectChannel={(ch) => handleChannelSelect(ch)}
          onSelectUser={() => { }}
          onStartCall={() => {
            if (activeChannel) {
              window.open(`/call/${activeChannel.id}`, "_blank");
            }
          }}
        />

        {/* User Custom Status Modal */}
        <UserStatusModal
          isOpen={isUserStatusOpen}
          onClose={() => setIsUserStatusOpen(false)}
          currentStatus={userStatus}
          onSaveStatus={(status) => setUserStatus(status)}
        />

        {/* AI Channel Summary Modal */}
        <AISummaryModal
          isOpen={isAISummaryOpen}
          onClose={() => setIsAISummaryOpen(false)}
          channelName={activeChannel?.data?.name || activeChannel?.id}
          messages={activeChannel ? activeChannel.state?.messages || [] : []}
        />

        {/* Discord-Style Audio Huddle Bar */}
        <AudioHuddleBar
          activeHuddleChannel={activeHuddleChannel}
          onLeaveHuddle={() => setActiveHuddleChannel(null)}
        />
      </Chat>
    </div>
  );
};

export default HomePage;