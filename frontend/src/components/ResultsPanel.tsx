import React from "react";

export const ResultsPanel: React.FC = () => {
  // TODO: bind to real API responses and history
  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-4 text-sm space-y-3">
      <p className="text-slate-400 text-xs">
        Run an analysis to see overall authenticity score, model breakdowns, and heatmaps here.
      </p>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="border border-slate-800 rounded-lg p-3">
          <p className="text-slate-400 mb-1">Authenticity score</p>
          <p className="text-2xl font-semibold text-emerald-400">—</p>
        </div>
        <div className="border border-slate-800 rounded-lg p-3">
          <p className="text-slate-400 mb-1">Confidence</p>
          <p className="text-2xl font-semibold text-sky-400">—</p>
        </div>
      </div>
      <div className="border border-slate-800 rounded-lg p-3 min-h-[120px] text-xs text-slate-400">
        <p className="font-medium mb-1 text-slate-200">Model breakdown</p>
        <p>EfficientNet-B4, ResNet50-Attn, Xception, 3D CNN, ViT scores will appear here.</p>
      </div>
    </div>
  );
};

