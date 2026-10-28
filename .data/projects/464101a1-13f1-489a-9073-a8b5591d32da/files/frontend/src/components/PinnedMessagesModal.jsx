import { MessageSquareIcon, PinIcon, XIcon } from "lucide-react";

function PinnedMessagesModal({ pinnedMessages, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col animate-scaleIn">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <PinIcon className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Pinned Messages</h2>
                            <p className="text-sm text-gray-500">{pinnedMessages.length} pinned message{pinnedMessages.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto">
                    {pinnedMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <MessageSquareIcon className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">No pinned messages</p>
                            <p className="text-gray-400 text-sm mt-1">
                                Pin important messages to find them easily
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {pinnedMessages.map((msg, index) => (
                                <div key={msg.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        {/* User Avatar */}
                                        <img
                                            src={msg.user?.image || '/default-avatar.png'}
                                            alt={msg.user?.name || 'User'}
                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
                                        />

                                        <div className="flex-1 min-w-0">
                                            {/* User Name & Time */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900 text-sm">
                                                    {msg.user?.name || 'Unknown User'}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : ''}
                                                </span>
                                                {index === 0 && (
                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                                                        LATEST
                                                    </span>
                                                )}
                                            </div>

                                            {/* Message Content */}
                                            <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
                                                {msg.text}
                                            </p>

                                            {/* Message Attachments */}
                                            {msg.attachments?.length > 0 && (
                                                <div className="mt-2 flex gap-2">
                                                    {msg.attachments.map((attachment, i) => (
                                                        <div key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                            📎 {attachment.title || 'Attachment'}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium 
                     rounded-lg transition-colors text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PinnedMessagesModal;