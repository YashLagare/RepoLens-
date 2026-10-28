import * as Sentry from "@sentry/react";
import {
    AlertCircleIcon,
    CheckIcon,
    HashIcon,
    Loader2Icon,
    LockIcon,
    SearchIcon,
    UsersIcon,
    XIcon
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router";
import { useChatContext } from "stream-chat-react";

const CreateChannelModal = ({ onClose }) => {
    const [channelName, setChannelName] = useState("");
    const [channelType, setChannelType] = useState("public");
    const [description, setDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");
    const [_, setSearchParams] = useSearchParams();

    const { client, setActiveChannel } = useChatContext();

    // Fetch users for member selection
    useEffect(() => {
        const fetchUsers = async () => {
            if (!client?.user) return;
            setLoadingUsers(true);

            try {
                const response = await client.queryUsers(
                    { id: { $ne: client.user.id } },
                    { name: 1 },
                    { limit: 100 }
                );

                const usersOnly = response.users.filter(
                    (user) => !user.id.startsWith("recording-")
                );

                setUsers(usersOnly || []);
            } catch (error) {
                console.log("Error fetching users");
                Sentry.captureException(error, {
                    tags: { component: "CreateChannelModal" },
                    extra: { context: "fetch_users_for_channel" },
                });
                setUsers([]);
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [client]);

    // Auto-select all users for public channels
    useEffect(() => {
        if (channelType === "public") {
            setSelectedMembers(users.map((u) => u.id));
        } else {
            setSelectedMembers([]);
        }
    }, [channelType, users]);

    // Filter users based on search
    const filteredUsers = useMemo(() => {
        if (!memberSearch.trim()) return users;
        const search = memberSearch.toLowerCase();
        return users.filter(
            (user) =>
                (user.name || user.id).toLowerCase().includes(search)
        );
    }, [users, memberSearch]);

    // Generate channel ID preview
    const channelIdPreview = useMemo(() => {
        if (!channelName) return "";
        return channelName
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-_]/g, "")
            .slice(0, 20);
    }, [channelName]);

    const validateChannelName = (name) => {
        if (!name.trim()) return "Channel name is required";
        if (name.length < 3) return "Channel name must be at least 3 characters";
        if (name.length > 22) return "Channel name must be less than 22 characters";
        return "";
    };

    const handleChannelNameChange = (e) => {
        const value = e.target.value;
        setChannelName(value);
        setError(validateChannelName(value));
    };

    const handleMemberToggle = (id) => {
        setSelectedMembers((prev) =>
            prev.includes(id)
                ? prev.filter((uid) => uid !== id)
                : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedMembers.length === filteredUsers.length) {
            // Deselect all filtered users
            setSelectedMembers((prev) =>
                prev.filter((id) => !filteredUsers.find((u) => u.id === id))
            );
        } else {
            // Select all filtered users
            const filteredIds = filteredUsers.map((u) => u.id);
            setSelectedMembers((prev) => [...new Set([...prev, ...filteredIds])]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateChannelName(channelName);
        if (validationError) {
            setError(validationError);
            return;
        }

        if (isCreating || !client?.user) return;

        setIsCreating(true);
        setError("");

        try {
            const channelId = channelIdPreview;

            const channelData = {
                name: channelName.trim(),
                created_by_id: client.user.id,
                members: [client.user.id, ...selectedMembers],
            };

            if (description) channelData.description = description;

            if (channelType === "private") {
                channelData.private = true;
                channelData.visibility = "private";
            } else {
                channelData.visibility = "public";
                channelData.discoverable = true;
            }

            const channel = client.channel("messaging", channelId, channelData);
            await channel.watch();

            setActiveChannel(channel);
            setSearchParams({ channel: channelId });

            toast.success(`Channel "${channelName}" created successfully!`);
            onClose();
        } catch (error) {
            console.log("Error creating the channel", error);
            Sentry.captureException(error, {
                tags: { component: "CreateChannelModal" },
                extra: { context: "create_channel" },
            });
            setError("Failed to create channel. Please try again.");
            toast.error("Failed to create channel");
        } finally {
            setIsCreating(false);
        }
    };

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && !isCreating) onClose();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose, isCreating]);

    return (
        <div
            className="create-channel-modal-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isCreating) onClose();
            }}
        >
            <div className="create-channel-modal">
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white/95 tracking-tight">
                            Create a channel
                        </h2>
                        <p className="text-sm text-white/60 mt-1">
                            Channels are where your team communicates
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white 
                       transition-all duration-200 hover:scale-105 disabled:opacity-50"
                        disabled={isCreating}
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6 overflow-y-auto max-h-[calc(85vh-180px)]">

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl 
                          text-red-300 animate-shake">
                            <AlertCircleIcon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Channel Name */}
                    <div className="space-y-2">
                        <label htmlFor="channelName" className="block text-sm font-semibold text-white/90 uppercase tracking-wider">
                            Channel name
                        </label>
                        <div className="relative">
                            <HashIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                                id="channelName"
                                type="text"
                                value={channelName}
                                onChange={handleChannelNameChange}
                                placeholder="e.g. marketing-team"
                                className={`w-full pl-11 pr-4 py-3.5 bg-white/8 border rounded-xl text-white/95 
                          placeholder:text-white/40 transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/12
                          ${error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/15 hover:border-white/25'}`}
                                autoFocus
                                maxLength={22}
                            />
                            {channelName && !error && (
                                <CheckIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                            )}
                        </div>

                        {/* Channel ID Preview */}
                        {channelName && (
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg">
                                <span className="text-xs text-white/50 font-mono">Channel ID:</span>
                                <code className="text-xs text-purple-300 font-mono font-semibold">
                                    #{channelIdPreview || '...'}
                                </code>
                            </div>
                        )}

                        {/* Character count */}
                        <div className="flex justify-end">
                            <span className={`text-xs ${channelName.length > 22 ? 'text-red-400' : 'text-white/40'}`}>
                                {channelName.length}/22
                            </span>
                        </div>
                    </div>

                    {/* Channel Type */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-white/90 uppercase tracking-wider">
                            Channel type
                        </label>

                        <div className="grid gap-3">
                            {/* Public Option */}
                            <label
                                className={`radio-option cursor-pointer ${channelType === 'public' ? 'ring-2 ring-purple-500/50' : ''}`}
                            >
                                <input
                                    type="radio"
                                    value="public"
                                    checked={channelType === "public"}
                                    onChange={(e) => setChannelType(e.target.value)}
                                    className="sr-only"
                                />
                                <div className="flex items-start gap-4">
                                    <div className={`p-2.5 rounded-xl transition-colors ${channelType === 'public' ? 'bg-purple-500/20' : 'bg-white/5'
                                        }`}>
                                        <HashIcon className={`w-5 h-5 ${channelType === 'public' ? 'text-purple-400' : 'text-white/50'
                                            }`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-white/95 text-sm">Public Channel</div>
                                        <div className="text-xs text-white/60 mt-0.5">
                                            Anyone in your workspace can join and view messages
                                        </div>
                                    </div>
                                    {channelType === 'public' && (
                                        <CheckIcon className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                    )}
                                </div>
                            </label>

                            {/* Private Option */}
                            <label
                                className={`radio-option cursor-pointer ${channelType === 'private' ? 'ring-2 ring-purple-500/50' : ''}`}
                            >
                                <input
                                    type="radio"
                                    value="private"
                                    checked={channelType === "private"}
                                    onChange={(e) => setChannelType(e.target.value)}
                                    className="sr-only"
                                />
                                <div className="flex items-start gap-4">
                                    <div className={`p-2.5 rounded-xl transition-colors ${channelType === 'private' ? 'bg-purple-500/20' : 'bg-white/5'
                                        }`}>
                                        <LockIcon className={`w-5 h-5 ${channelType === 'private' ? 'text-purple-400' : 'text-white/50'
                                            }`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-white/95 text-sm">Private Channel</div>
                                        <div className="text-xs text-white/60 mt-0.5">
                                            Only invited members can access and view messages
                                        </div>
                                    </div>
                                    {channelType === 'private' && (
                                        <CheckIcon className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Member Selection - Only for Private Channels */}
                    {channelType === "private" && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                                    Add members
                                </label>
                                <span className="text-xs text-white/50 bg-white/5 px-3 py-1 rounded-full">
                                    {selectedMembers.length} selected
                                </span>
                            </div>

                            {/* Member Search & Actions */}
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        type="text"
                                        placeholder="Search members..."
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg 
                             text-white/90 text-sm placeholder:text-white/30
                             focus:outline-none focus:border-purple-500/50 focus:bg-white/8"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    disabled={loadingUsers || filteredUsers.length === 0}
                                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg 
                           text-white/70 text-sm font-medium transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    {selectedMembers.length === filteredUsers.length && filteredUsers.length > 0
                                        ? 'Deselect All'
                                        : 'Select All'}
                                </button>
                            </div>

                            {/* Members List */}
                            <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
                                <div className="max-h-56 overflow-y-auto custom-scrollbar">
                                    {loadingUsers ? (
                                        <div className="p-8 text-center">
                                            <Loader2Icon className="w-6 h-6 text-white/40 mx-auto animate-spin" />
                                            <p className="text-sm text-white/50 mt-3">Loading team members...</p>
                                        </div>
                                    ) : filteredUsers.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <UsersIcon className="w-8 h-8 text-white/20 mx-auto" />
                                            <p className="text-sm text-white/50 mt-3">
                                                {memberSearch ? 'No members found' : 'No other members in workspace'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-white/5">
                                            {filteredUsers.map((user) => {
                                                const isSelected = selectedMembers.includes(user.id);
                                                return (
                                                    <label
                                                        key={user.id}
                                                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150
                                      hover:bg-white/5 ${isSelected ? 'bg-purple-500/10' : ''}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleMemberToggle(user.id)}
                                                            className="w-4 h-4 rounded border-white/20 bg-white/5 
                                       checked:bg-purple-600 checked:border-purple-600
                                       focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                                                        />
                                                        {user.image ? (
                                                            <img
                                                                src={user.image}
                                                                alt={user.name || user.id}
                                                                className="w-8 h-8 rounded-full border-2 border-white/10 object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 
                                            flex items-center justify-center text-white text-sm font-semibold
                                            border-2 border-white/10">
                                                                {(user.name || user.id).charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-sm text-white/90 font-medium truncate block">
                                                                {user.name || user.id}
                                                            </span>
                                                            {user.online && (
                                                                <span className="text-xs text-green-400">Online</span>
                                                            )}
                                                        </div>
                                                        {isSelected && (
                                                            <CheckIcon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                                        )}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-semibold text-white/90 uppercase tracking-wider">
                            Description <span className="text-white/40 font-normal normal-case">(optional)</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this channel about? Add a description to help others understand the purpose."
                            className="w-full px-4 py-3.5 bg-white/8 border border-white/15 rounded-xl text-white/95 
                       placeholder:text-white/40 transition-all duration-200 resize-none
                       focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/12
                       hover:border-white/25"
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl
                       text-white/80 font-semibold text-sm transition-all duration-200
                       hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            disabled={isCreating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!channelName.trim() || isCreating}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 
                       rounded-xl text-white font-semibold text-sm
                       hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed 
                       disabled:hover:scale-100 disabled:hover:shadow-none
                       flex items-center gap-2 min-w-[140px] justify-center"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2Icon className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <HashIcon className="w-4 h-4" />
                                    Create Channel
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateChannelModal;