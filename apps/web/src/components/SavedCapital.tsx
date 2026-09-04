"use client";
export function SavedCapital({ savedAmount }: { savedAmount: string }) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 border-l-4 border-l-emerald-500">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Capital Saved from Penalties</h3>
      <div className="mt-2 text-3xl font-bold text-emerald-400">
        {savedAmount}
      </div>
      <p className="mt-1 text-sm text-slate-500">12.5% Liquidation Penalty Avoided</p>
    </div>
  );
}
