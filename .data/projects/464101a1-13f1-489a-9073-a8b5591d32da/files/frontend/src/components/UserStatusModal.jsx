import { CheckIcon, SmileIcon, XIcon } from "lucide-react";
import { useState } from "react";

const PRESET_STATUSES = [
  { emoji: "📅", text: "In a meeting" },
  { emoji: "🎧", text: "Focusing" },
  { emoji: "☕", text: "Taking a coffee break" },
  { emoji: "🏡", text: "Working remotely" },
  { emoji: "🌴", text: "Out of office" },
  { emoji: "🚀", text: "Shipping code" },
];

const UserStatusModal = ({ isOpen, onClose, currentStatus, onSaveStatus }) => {
  const [selectedEmoji, setSelectedEmoji] = useState(currentStatus?.emoji || "💬");
  const [statusText, setStatusText] = useState(currentStatus?.text || "");

  if (!isOpen) return null;

  const handlePresetSelect = (preset) => {
    setSelectedEmoji(preset.emoji);
    setStatusText(preset.text);
  };

  const handleSave = () => {
    onSaveStatus({ emoji: selectedEmoji, text: statusText });
    onClose();
  };

  const handleClear = () => {
    onSaveStatus({ emoji: "", text: "" });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#1a0f35] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <SmileIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Set Your Custom Status</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Input Field */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl mb-4">
          <input
            type="text"
            value={selectedEmoji}
            onChange={(e) => setSelectedEmoji(e.target.value)}
            className="w-8 text-center text-xl bg-transparent focus:outline-none"
            maxLength={2}
          />
          <input
            type="text"
            placeholder="What's your status?"
            value={statusText}
            onChange={(e) => setStatusText(e.target.value)}
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-sm"
          />
        </div>

        {/* Preset Chips */}
        <div className="space-y-2 mb-6">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Presets</span>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_STATUSES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetSelect(preset)}
                className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-xs text-gray-700 dark:text-gray-200 transition-all text-left"
              >
                <span className="text-base">{preset.emoji}</span>
                <span className="truncate">{preset.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
          >
            Clear Status
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/25 flex items-center gap-1.5"
            >
              <CheckIcon className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatusModal;
