import { PositionHealth } from './types';

export const BPS_BASE = 10000n;

export function calculateLTV(debt: bigint, collateral: bigint, price: bigint, priceScale: bigint = 100000000n): number {
  if (collateral === 0n || price === 0n) return 0;
  
  const collateralValue = (collateral * price) / priceScale;
  if (collateralValue === 0n) return 0;

  const ltvBps = (debt * BPS_BASE) / collateralValue;
  return Number(ltvBps);
}

export function calculateUnwindAmount(
  debt: bigint, 
  collateral: bigint, 
  price: bigint, 
  targetLtvBps: number,
  priceScale: bigint = 100000000n
): bigint {
  const targetLtv = BigInt(targetLtvBps);
  const collateralValue = (collateral * price) / priceScale;
  
  const requiredDebtReductionValue = debt * BPS_BASE - targetLtv * collateralValue;
  
  if (requiredDebtReductionValue <= 0n) return 0n; 

  const denominator = BPS_BASE - targetLtv;
  if (denominator <= 0n) return 0n;

  const dV = requiredDebtReductionValue / denominator;
  
  const dC = (dV * priceScale) / price;
  
  return dC;
}
