import { ConnectWallet } from "@/components/ConnectWallet";
import { HealthGauge } from "@/components/HealthGauge";
import { SavedCapital } from "@/components/SavedCapital";
import { Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <Shield className="text-emerald-500 w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight">SatShield</h1>
        </div>
        <ConnectWallet />
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <HealthGauge currentLtv={68} triggerLtv={72} hardLtv={75} />
        <SavedCapital savedAmount="+0.125 sBTC" />
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 md:col-span-2">
          <h3 className="text-xl font-semibold mb-4">Vault Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Trigger LTV (%)</label>
              <input type="range" min="65" max="74" defaultValue="72" className="w-full accent-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Target LTV (%)</label>
              <input type="range" min="50" max="65" defaultValue="65" className="w-full accent-emerald-500" />
            </div>
            <button className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-md transition-colors">
              Deploy / Configure Vault
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
