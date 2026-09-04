export interface VaultConfig {
  owner: string;
  triggerLtvBps: number;
  targetLtvBps: number;
  maxSlippageBps: number;
  isActive: boolean;
}

export interface PositionHealth {
  debt: bigint;
  collateral: bigint;
  price: bigint;
}

export interface UnwindCalculation {
  currentLtvBps: number;
  collateralToUnwind: bigint;
  debtToRepay: bigint;
  postUnwindLtvBps: number;
}
