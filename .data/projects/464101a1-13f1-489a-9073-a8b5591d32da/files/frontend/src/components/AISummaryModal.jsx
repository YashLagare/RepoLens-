import { BotIcon, CheckCircle2Icon, CopyIcon, SparklesIcon, XIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { summarizeChannel } from "../lib/api";

const AISummaryModal = ({ isOpen, onClose, channelName, messages }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setSummary("");
    setActionItems([]);
    setError("");

    try {
      const simplifiedMessages = (messages || [])
        .filter((m) => m?.text)
        .slice(-25)
        .map((m) => ({
          userName: m.user?.name || m.user?.id || "Unknown",
          text: m.text,
        }));

      const data = await summarizeChannel({
        channelName,
        messages: simplifiedMessages,
      });

      setSummary(data.summary || "No summary was generated.");
      setActionItems(data.actionItems || []);
    } catch (err) {
      console.error("Error generating summary:", err);
      const backendMessage = err?.response?.data?.error || err?.message;
      setError(
        backendMessage
          ? `Unable to generate summary. ${backendMessage}`
          : "Unable to generate summary right now. Please try again."
      );
      setSummary("");
      setActionItems([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = `${summary}\n\nKey Action Items:\n` + actionItems.map((item) => `• ${item}`).join("\n");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Summary copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1a0f35] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
              <SparklesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Channel Summary</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Summarize discussions for #{channelName || "channel"}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {error && !isGenerating && (
          <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {!summary && !isGenerating && (
          <div className="py-8 text-center">
            <BotIcon className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-bounce" />
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 max-w-xs mx-auto">
              Get an instant AI-generated summary of key discussion points and action items from this channel.
            </p>
            <button
              onClick={handleGenerateSummary}
              className="px-6 py-2.5 bg-linear-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all flex items-center gap-2 mx-auto text-sm"
            >
              <SparklesIcon className="w-4 h-4" />
              Generate Summary
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="py-12 text-center">
            <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Analyzing channel messages with AI...</p>
          </div>
        )}

        {summary && !isGenerating && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 rounded-xl text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
              {summary}
            </div>

            {actionItems.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Action Items</h4>
                <div className="space-y-2">
                  {actionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-700 dark:text-gray-300"
                    >
                      <CheckCircle2Icon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={handleGenerateSummary}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-medium"
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                Regenerate
              </button>
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 rounded-xl transition-colors flex items-center gap-1.5"
              >
                {copied ? <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-500" /> : <CopyIcon className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Summary"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISummaryModal;
