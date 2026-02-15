import React, { useCallback, useState } from "react";

type Status = "idle" | "uploading" | "analyzing" | "done" | "error";

export const UploadArea: React.FC = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setStatus("uploading");
    setProgress(10);

    // TODO: wire to /api/analyze/image or /api/analyze/video
    setTimeout(() => {
      setStatus("analyzing");
      setProgress(60);
      setTimeout(() => {
        setStatus("done");
        setProgress(100);
      }, 800);
    }, 800);
  }, []);

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const onSelect: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    handleFiles(e.target.files);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="border border-dashed rounded-xl border-slate-700/80 bg-slate-900/60 p-6 flex flex-col items-center justify-center gap-3 text-sm text-slate-300"
    >
      <p className="font-medium">Drag &amp; drop images or videos here</p>
      <p className="text-xs text-slate-500">Supported: JPG, PNG, MP4, AVI, MOV</p>
      <label className="mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-sky-500 text-xs font-semibold cursor-pointer hover:bg-sky-400 transition">
        Browse files
        <input type="file" className="hidden" multiple onChange={onSelect} />
      </label>
      {status !== "idle" && (
        <div className="w-full mt-4 space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>
              {status === "uploading" && "Uploading..."}
              {status === "analyzing" && "Analyzing..."}
              {status === "done" && "Analysis complete"}
              {status === "error" && "Error"}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
};

