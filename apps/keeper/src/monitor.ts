import { getAssetPrice } from "./oracle";
import { calculateLTV } from "@satshield/shared";

export async function checkVault(vaultAddress: string): Promise<void> {
  // Mock on-chain state fetch
  const debt = 40000n; 
  const collateral = 1n; // 1 BTC
  const price = await getAssetPrice("BTC");
  
  const currentLtvBps = calculateLTV(debt, collateral, price, 1000000n);
  
  console.log(`Vault ${vaultAddress} LTV: ${currentLtvBps / 100}%`);
  
  if (currentLtvBps >= 7200) {
    console.log("Triggering micro-unwind!");
    // logic to unwind
  }
}
