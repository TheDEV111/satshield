export async function getAssetPrice(asset: string): Promise<bigint> {
  // Mock oracle price
  return 60000000000n; // Example: $60k scaled by 1e6
}
