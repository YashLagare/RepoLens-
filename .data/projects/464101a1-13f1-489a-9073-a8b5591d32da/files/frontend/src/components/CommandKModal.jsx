import { HashIcon, SearchIcon, UserIcon, VideoIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

const CommandKModal = ({ isOpen, onClose, channels, users, onSelectChannel, onSelectUser, onStartCall }) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredChannels = (channels || []).filter((ch) =>
    (ch.data?.name || ch.data?.id || "").toLowerCase().includes(query.toLowerCase())
  );

  const filteredUsers = (users || []).filter((u) =>
    (u.name || u.id || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#1a0f35] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-white/10">
          <SearchIcon className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search channels, users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-base"
          />
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md font-mono mr-2">
            ESC
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {/* Quick Actions */}
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Quick Actions
          </div>
          <button
            onClick={() => {
              onStartCall();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
          >
            <VideoIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Start Instant Video Call</span>
          </button>

          {/* Channels */}
          {filteredChannels.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">
                Channels ({filteredChannels.length})
              </div>
              {filteredChannels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    onSelectChannel(ch);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-white/10 transition-colors"
                >
                  <HashIcon className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{ch.data?.name || ch.data?.id}</span>
                </button>
              ))}
            </>
          )}

          {/* Users */}
          {filteredUsers.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">
                Users ({filteredUsers.length})
              </div>
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-white/10 transition-colors"
                >
                  {u.image ? (
                    <img src={u.image} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="truncate">{u.name || u.id}</span>
                </button>
              ))}
            </>
          )}

          {filteredChannels.length === 0 && filteredUsers.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-400">
              No channels or users found matching "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandKModal;
