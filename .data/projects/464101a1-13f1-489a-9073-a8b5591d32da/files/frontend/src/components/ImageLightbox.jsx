import { DownloadIcon, Maximize2Icon, MinusIcon, PlusIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

const ImageLightbox = ({ src, alt, onClose }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = (e) => {
    e.stopPropagation();
    setScale(1);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = src;
    link.download = alt || "connectify-image";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      {/* Lightbox Header Bar */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-white/10 shadow-xl backdrop-blur-lg">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <MinusIcon className="w-5 h-5" />
        </button>
        <button
          onClick={handleReset}
          title="Reset Zoom"
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <RotateCcwIcon className="w-5 h-5" />
        </button>
        <div className="w-[1px] h-6 bg-white/20 my-auto" />
        <button
          onClick={handleDownload}
          title="Download Image"
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <DownloadIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          title="Close (Esc)"
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] overflow-auto flex items-center justify-center p-4 transition-transform duration-200 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt || "Lightbox Image"}
          style={{ transform: `scale(${scale})` }}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl transition-transform duration-200"
        />
      </div>
    </div>
  );
};

export default ImageLightbox;
