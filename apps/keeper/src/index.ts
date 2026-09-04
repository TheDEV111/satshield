import dotenv from "dotenv";
import { checkVault } from "./monitor";

dotenv.config();

const POLL_INTERVAL = 5000;

async function main() {
  console.log("Starting Sentinel Keeper...");
  
  setInterval(async () => {
    try {
      await checkVault("ST_MOCK_VAULT_ADDR");
    } catch (e) {
      console.error("Error checking vault:", e);
    }
  }, POLL_INTERVAL);
}

main().catch(console.error);
