"use client";
export function HealthGauge({ currentLtv, triggerLtv, hardLtv }: { currentLtv: number, triggerLtv: number, hardLtv: number }) {
  // Simple visual representation
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h3 className="text-xl font-semibold mb-4 text-slate-200">Position Health</h3>
      <div className="w-full bg-slate-700 rounded-full h-4 mb-2 overflow-hidden flex">
        <div className="bg-emerald-500 h-4" style={{ width: `${currentLtv}%` }}></div>
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>Current: {currentLtv}%</span>
        <span>Trigger: {triggerLtv}%</span>
        <span className="text-rose-400">Hard: {hardLtv}%</span>
      </div>
    </div>
  );
}
