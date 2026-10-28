import { motion } from "framer-motion";
import { GripHorizontalIcon, MicIcon, MicOffIcon, PhoneOffIcon, Volume2Icon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { soundFX } from "../lib/sounds";

const AudioHuddleBar = ({ activeHuddleChannel, onLeaveHuddle }) => {
  const [isMuted, setIsMuted] = useState(false);

  if (!activeHuddleChannel) return null;

  const toggleMute = () => {
    soundFX.playClick();
    setIsMuted((prev) => !prev);
    toast(isMuted ? "Microphone Unmuted" : "Microphone Muted", {
      icon: isMuted ? "🎙️" : "🔇",
    });
  };

  const handleLeave = () => {
    soundFX.playClick();
    toast("Left Audio Huddle", { icon: "👋" });
    onLeaveHuddle();
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ y: 0, x: "-50%" }}
      className="fixed bottom-6 left-1/2 z-50 flex items-center justify-between gap-3 px-4 py-2.5 bg-[#180b33]/95 border border-purple-500/40 rounded-2xl shadow-2xl backdrop-blur-xl cursor-grab active:cursor-grabbing min-w-[310px] max-w-md text-white select-none transition-shadow hover:shadow-purple-500/20"
    >
      {/* Drag Grip Handle */}
      <div className="flex items-center text-purple-400/60 hover:text-purple-300 pr-1 cursor-grab" title="Drag to reposition">
        <GripHorizontalIcon className="w-5 h-5" />
      </div>

      {/* Huddle Info & Active Waveform */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center w-8 h-8 bg-purple-600/30 rounded-xl border border-purple-400/40 shrink-0">
          <Volume2Icon className="w-4 h-4 text-purple-300 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Audio Huddle</span>
            <span className="text-[9px] bg-purple-500/30 text-purple-300 px-1 py-0.2 rounded font-mono font-bold">LIVE</span>
          </div>
          <span className="text-xs font-semibold text-white/90 truncate block max-w-[130px]">
            {activeHuddleChannel.data?.name || activeHuddleChannel.id}
          </span>
        </div>
      </div>

      {/* Animated Waveform Lines */}
      <div className="flex items-center gap-1 h-4 px-1.5">
        <span className="w-1 bg-purple-400 rounded-full animate-[bounce_1s_infinite_100ms] h-2.5" />
        <span className="w-1 bg-purple-300 rounded-full animate-[bounce_1s_infinite_300ms] h-4" />
        <span className="w-1 bg-purple-400 rounded-full animate-[bounce_1s_infinite_200ms] h-3" />
        <span className="w-1 bg-purple-300 rounded-full animate-[bounce_1s_infinite_400ms] h-2" />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 ml-1">
        {/* Mute/Unmute */}
        <button
          onClick={toggleMute}
          title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          className={`p-2 rounded-xl border transition-all ${isMuted
            ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
            : "bg-white/10 border-white/10 text-white hover:bg-white/20"
            }`}
        >
          {isMuted ? <MicOffIcon className="w-4 h-4" /> : <MicIcon className="w-4 h-4" />}
        </button>

        {/* Leave Huddle */}
        <button
          onClick={handleLeave}
          title="Leave Audio Huddle"
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md shadow-red-900/30"
        >
          <PhoneOffIcon className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default AudioHuddleBar;
